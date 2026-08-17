---
title: Narrow seed.ts's alreadySeeded() gate to seedCase alone; make vocabulary reseeding additive
summary: seedOutcomes and seedRemainingVocabularies now write through the additive insertMissingTerms
  instead of the whole-replace writeTerms, and alreadySeeded()'s own gate wraps only seedCase, so vocabularies,
  concepts and capabilities reseed on every run regardless of the case's own permanent-released state.
task: sha256:eb5d68c50a0868f28a75aa9235dec8c2fb0ca289fd539774e063609eae32569c
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/seed-already-seeded-guard-hotfix-narrow-the-guard-suite
files:
- path: src/seed.ts
  effect: seedOutcomes and seedRemainingVocabularies call IGlossaryStore.insertMissingTerms (additive,
    ON CONFLICT DO NOTHING per term) instead of writeTerms (whole-table DELETE then INSERT). The top-level
    sequence no longer wraps seedOutcomes, seedRemainingVocabularies, seedConcepts and seedCapabilities
    inside the alreadySeeded() check — those four now run unconditionally, in the same order, on every
    execution — and alreadySeeded() now gates only the call to seedCase.
- path: src/__tests__/integration/seed.spec.ts
  effect: 'One new it() block added, proving alreadySeeded()''s narrowed gate never lets seedCase run
    twice: after a second run, only the one case_versions row for this slug still exists.'
criteria:
- criterion: Running seed.ts against a database where the case already stands released, and concept_accepts
    and capabilities for the fixture's own concepts are currently absent, reseeds both before verifySeededCase
    runs, and verifySeededCase does not throw.
  met: true
  how: seedConcepts and seedCapabilities now run unconditionally, before the narrowed alreadySeeded()
    check (which now gates only seedCase) and before verifySeededCase — so a database where the case exists
    but those rows were wiped by a sibling test file's cleanup still has them reseeded on this run.
- criterion: Running seed.ts against a database where the case already stands released and every vocabulary,
    concept, concept_accepts and capability row it needs is already present behaves exactly as it does
    today — no write occurs, and verifySeededCase does not throw.
  met: true
  how: insertMissingTerms issues one INSERT ... ON CONFLICT DO NOTHING per term, seedConcepts's own inserts
    are already ON CONFLICT DO NOTHING, and seedCapabilities' registerCapability replaces an already-held
    identity with an identical record — none of the three changes any row when the database already holds
    everything (see this delivery's own proof for the literal-statement-level disagreement recorded on
    this criterion).
- criterion: Running seed.ts against a database holding none of this fixture's data at all still seeds
    everything and succeeds exactly as it does today, including originating and releasing the case exactly
    once.
  met: true
  how: The four vocabulary/concept/capability calls run unconditionally in their original order, alreadySeeded()
    answers false (assembleVersion finds nothing), so seedCase runs exactly once and verifySeededCase
    reads the result back.
- criterion: Running seed.ts a second time in a row against a database it just finished seeding does not
    attempt to re-draft or re-release the case, and does not throw.
  met: true
  how: alreadySeeded() answers true on the second run (the case now exists), so seedCase is skipped; the
    four unconditional calls are additive/replace-safe and throw nothing, and verifySeededCase reads the
    already-released case back without error. Proven directly by a new it() confirming no second case_versions
    row exists after the second run.
nodes:
- node: domain/glossary/outcome
  how: This task changed only the write path and the condition under which seedOutcomes runs; the outcome
    rows it writes still carry exactly this value-object's declared shape, unchanged by this delivery
    — honored, not newly encoded.
  encoded_at:
  - src/seed.ts
- node: domain/glossary/concept
  how: seedConcepts is unmodified (already idempotent via ON CONFLICT DO NOTHING) and now simply runs
    on every execution instead of only before the case exists.
- node: domain/integration/capability-registry
  how: seedCapabilities is unmodified and still calls registerCapability; confirmed that re-registering
    an already-held name+version replaces its record rather than refusing, which is what makes running
    it unconditionally on every seed run safe.
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  how: seedOutcomes still merges the two non-conclusion outcomes into the outcome vocabulary and still
    runs before seedCase authors the case — the ordering this rule requires is unchanged — but now via
    insertMissingTerms and unconditionally on every execution.
  encoded_at:
  - src/seed.ts
- node: rules/knowledge/a-case-version-is-written-once
  how: alreadySeeded()'s gate, narrowed to wrap only the call to seedCase, is this script's enforcement
    point for the rule — once assembleVersion finds the released version, seedCase is never invoked again.
  encoded_at:
  - src/seed.ts
inferences:
- inferred: '''No write occurs'' in criterion 2 is read as no data-level change (no row added, modified
    or deleted), not as a literal absence of any SQL statement.'
  from: insertMissingTerms's own contract (INSERT ... ON CONFLICT DO NOTHING per term, run unconditionally)
    does not provide a presence-check-first shape, and this codebase's established precedent (vitest-global-setup.ts's
    own seedNonConclusionOutcomes) already calls the equivalent primitive unconditionally on every test
    run.
- inferred: Kept alreadySeeded() as one function with an unchanged body, narrowing only what the caller
    wraps in it.
  from: The function's own question did not change; only which calls its answer gates did.
preserved:
- The ordering guarantee that the outcome vocabulary, the remaining four vocabularies, every concept and
  every capability registration are seeded before seedCase authors the curated case.
- 'seedCase''s own write-once behavior: no case already answering alreadySeeded() ever reaches seedCase.'
- verifySeededCase always runs after the gated block, unconditionally, with its own rejection never caught.
- seedConcepts's and seedCapabilities' own already-idempotent write paths, confirmed unchanged by this
  task.
---

## What it is

Fixes seed.ts skipping concept_accepts and capability reseeding forever once the case it gates on becomes permanently released — alreadySeeded()'s own all-or-nothing gate made sense while the case's existence implied every vocabulary/concept/capability row it needs still existed too, a premise release-immutability elsewhere in this database has since made false.

## Notes

None.
