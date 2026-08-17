---
title: withNonConclusionOutcomes ensures the two non-conclusion outcomes through an additive insert, never
  a whole-table replace
summary: Adds insertMissingTerms to the glossary store port and its relational adapter, and switches withNonConclusionOutcomes
  to it, so ensuring the two non-conclusion outcomes exist never deletes or rewrites an outcome a released
  case version or hypothesis revision now permanently references.
task: sha256:d5ee7f07b0f200adf44ed831018184cd34fb596a1aedec4560baa351f30615d1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/ensure-non-conclusion-outcomes-hotfix-tolerate-permanent-outcome-suite
files:
- path: src/glossary/glossary-store.port.ts
  effect: declares insertMissingTerms alongside writeTerms on IGlossaryStore — an additive primitive that
    adds only the terms a vocabulary does not already hold and touches no already-held row, documented
    as writeTerms's narrower sibling for a caller that only needs to ensure a term exists.
- path: src/glossary/glossary.service.ts
  effect: withNonConclusionOutcomes now calls this.store.insertMissingTerms('outcome', missing) instead
    of this.store.writeTerms('outcome', seeded) once it has computed which of the two non-conclusion outcomes
    are absent, and returns [...held, ...missing] directly.
- path: src/persistence/relational-glossary-store.repository.ts
  effect: implements insertMissingTerms — for the named vocabulary's table, runs one INSERT INTO <table>
    (name) VALUES ($1) ON CONFLICT DO NOTHING per given term, inside one runInTransaction call, issuing
    no DELETE at all.
- path: src/__tests__/unit/glossary/glossary.service.spec.ts
  effect: InMemoryGlossaryStore gains insertMissingTerms and a blockWriteTerms simulation of the real
    foreign-key violation a whole-table replace would raise against a permanently referenced row; three
    new tests prove the task's own three criteria.
- path: src/__tests__/unit/glossary/glossary-query.port.spec.ts
  effect: MutableGlossaryStore gains insertMissingTerms so the file still typechecks against the widened
    IGlossaryStore interface — a build fix only, this file's own existing tests never exercise the outcome-seeding
    path.
- path: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  effect: One new integration test proves RelationalGlossaryStore.insertMissingTerms adds only the terms
    the outcomes table does not already hold and leaves an already-held row untouched, even though the
    table already holds rows permanently referenced by released fixtures.
criteria:
- criterion: Calling GlossaryService.readVocabularyTerm (or any path that reaches withNonConclusionOutcomes)
    against a database where some outcome other than the two non-conclusion ones is permanently referenced
    by a released case version's fallback_outcome or a released hypothesis-revision's resolution_outcome
    does not throw, and both non-conclusion outcomes are present among the held outcomes afterward.
  met: true
  how: withNonConclusionOutcomes no longer calls store.writeTerms('outcome', seeded) — a whole-replace
    that DELETEs every outcome row first and fails with a foreign-key violation the instant any currently-held
    outcome is permanently referenced. It now calls this.store.insertMissingTerms('outcome', missing),
    whose relational implementation issues only INSERT ... ON CONFLICT DO NOTHING statements per given
    term, with no DELETE statement anywhere in the call.
- criterion: Calling it against a database where both non-conclusion outcomes are already present and
    every outcome remains freely removable behaves exactly as it does today — no outcome row's own name
    changes.
  met: true
  how: The NON_CONCLUSION_OUTCOMES.filter computation that produces missing is unchanged; when both are
    already held, missing is empty and withNonConclusionOutcomes returns held unchanged without calling
    the store at all.
- criterion: Calling it against a database where one or both non-conclusion outcomes are missing, and
    every currently-held outcome remains freely removable, still seeds exactly the missing one(s), leaving
    every other currently-held outcome's own name unchanged.
  met: true
  how: missing still names exactly the absent non-conclusion outcome(s); insertMissingTerms is called
    with exactly that list, and its relational implementation only ever inserts the rows it is given (each
    guarded by ON CONFLICT DO NOTHING) — it runs no DELETE and touches no row not named in missing.
nodes:
- node: domain/glossary/outcome
  how: an outcome is a value held by name, exactly once per vocabulary — this fix keeps that identity
    stable under the 'ensure these two exist' operation by never rewriting or deleting an outcome's own
    row that already exists; only a genuinely absent name is ever inserted.
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  how: withNonConclusionOutcomes still ensures the glossary holds both non-conclusion outcomes on every
    outcome read that finds either missing, exactly as before — what changes is the write primitive it
    ensures them through, so this guarantee now holds unconditionally rather than failing once some other
    outcome becomes permanently referenced elsewhere.
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/glossary/glossary-store.port.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/knowledge/a-case-version-is-written-once
  how: this task writes no case-version source; it honors the rule by treating what that immutability
    produces — a released version's own permanent fallback_outcome reference — as a fact this glossary
    operation must never require undoing. Ensuring the two non-conclusion outcomes exist no longer needs
    to delete an outcome row at all.
- node: domain/knowledge/hypothesis-revision
  how: this task writes no hypothesis-revision source; it honors the node by treating a released revision's
    own permanent resolution_outcome reference the same way — as a fact insertMissingTerms's own no-DELETE
    shape can never come into conflict with.
inferences:
- inferred: the additive primitive is named insertMissingTerms on IGlossaryStore, and its relational implementation
    runs one INSERT INTO <table> (name) VALUES ($1) ON CONFLICT DO NOTHING per given term inside a single
    runInTransaction call.
  from: this codebase's already-established 'add if missing, never touch what's there' convention (vitest-global-setup.ts's
    own repairFixtureManifestCollects) and migrations/0002-glossary-vocabulary.sql, which gives every
    one of the five vocabulary tables a primary key on name — the exact column ON CONFLICT DO NOTHING
    needs to resolve against unambiguously.
- inferred: insertMissingTerms wraps its inserts in one transaction (runInTransaction) even though today's
    only caller passes at most the two non-conclusion outcomes.
  from: EDG-05 of standards/backend-node-service.yaml ("A write spanning more than one statement runs
    in a transaction that rolls back as a whole"), which scopes to every .repository.ts file and is what
    writeTerms's own existing transactional wrapping already answers to for the same reason.
preserved:
- IGlossaryStore.writeTerms's own whole-replace semantics and its existing callers — seed.ts's seedOutcomes
  and seedRemainingVocabularies (as they stood before work/seed-already-seeded-guard-hotfix's own later
  delivery), and every existing test exercising writeTerms directly — were untouched by this task.
- GlossaryService.terms() for every vocabulary other than 'outcome', and readVocabularyTerm/readConcept/concepts,
  are unchanged.
---

## What it is

Fixes GlossaryService.withNonConclusionOutcomes crashing with a GlossaryStoreError whenever writeTerms's own whole-table replace hits an outcome release-immutability elsewhere in this database has already made permanent — writeTerms's own whole-replace semantics stay correct for genuine vocabulary authoring; this task adds an additive sibling for a caller that only ever needs to ensure a term exists.

## Notes

None.
