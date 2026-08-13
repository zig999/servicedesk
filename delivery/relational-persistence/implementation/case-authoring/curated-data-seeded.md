---
title: The curated fixture data is seeded into the database through the authoring command
summary: A new seed.ts script writes the fixture-era glossary vocabularies, concepts and capability registrations,
  then authors the one curated case version exclusively through the published author-case-version command
  and self-checks it by reading it back.
task: sha256:f13cb4f274cf03068f6e04730734531e1880ac409ff71116d7518733eb423ea8
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-authoring-curated-data-seeded-suite-3
files:
- path: src/seed.ts
  effect: 'a short-lived whole-process script, following migrate.ts''s own convention exactly (loadEnv()
    for DATABASE_URL, one DatabaseConnection, work in a try, connection.end() in a finally): checks first
    whether the curated case already stands (alreadySeeded), and only if it does not, writes the outcome
    vocabulary merged with the two non-conclusion outcomes, then subject-type/subject-attribute/action/recipient,
    then seeds ''concepts'' and ''concept_accepts'' by raw parameterized SQL, then registers the fixture''s
    two capabilities through the validated registry write path, then authors the one curated case version
    through createAuthorCaseVersion(...).authorCaseVersion(document) and by no other write, catching only
    CaseVersionAlreadyStoredError as a defensive fallback; finally self-checks the seeded version by calling
    createCaseQuery(...).readCase(slug, version) uncaught, whether this run seeded it or an earlier one did'
- path: package.json
  effect: 'adds the "seed": "node dist/seed.js" entry to scripts, mirroring "migrate": "node dist/migrate.js"
    exactly, so `npm run seed` runs the built seed script; every other script and every dependency section
    is unchanged'
criteria:
- criterion: The glossary holds the two non-conclusion outcomes, inconclusive-no-data and inconclusive-hypotheses-exhausted,
    before any case version is authored against it.
  met: true
  how: seedOutcomes merges NON_CONCLUSION_OUTCOMES (glossary/terms.ts) into the fixture's own outcome.json
    names and writes the outcome vocabulary through IGlossaryStore.writeTerms; it is the first call in
    the top-level sequence, run before seedRemainingVocabularies, seedConcepts, seedCapabilities and seedCase.
- criterion: The glossary holds every subject type, subject attribute, outcome, action and recipient the
    curated case names.
  met: true
  how: seedOutcomes and seedRemainingVocabularies write all five term vocabularies from their fixture
    files before seedCase runs. The fixture's subject-type ('contract'), actions and recipients are exactly
    the names the curated case's two hypotheses and its fallback resolution declare, and the outcome vocabulary
    carries the case's own two outcomes plus both non-conclusion outcomes. The subject-attribute vocabulary
    is also written from its own fixture even though the curated case document names no subject attribute
    at all (see inferences).
- criterion: The glossary holds every concept the curated case collects, each with the subject types it
    accepts and its ttl.
  met: true
  how: seedConcepts inserts both concepts the curated case's two hypotheses collect — equipment-status
    (ttl 300) and network-outage-flag (ttl 60) — into public.concepts with the fixture's own ttl, and
    inserts 'contract' into public.concept_accepts for each, before seedCase runs.
- criterion: The registry holds one read-only capability, with its declared contract, for every concept
    the curated case collects.
  met: true
  how: seedCapabilities registers, through createCapabilityRegistry(connection).registerCapability, the
    fixture's two registrations — one per concept — each declaring nature read-only and every attribute
    REQUIRED_REGISTRATION_ATTRIBUTES lists, before seedCase runs; the registry's own registerCapability
    refuses anything less complete or not read-only.
- criterion: The curated case version enters through the authoring command and by no other write.
  met: true
  how: seedCase's only write into the case store is createAuthorCaseVersion(connection).authorCaseVersion(document);
    no function in seed.ts constructs createCaseStore or calls writeVersion directly.
- criterion: The seeded case version reads back whole and holds against every validator rule at that read.
  met: true
  how: verifySeededCase calls createCaseQuery(connection).readCase(CASE_SLUG, CASE_VERSION) after seedCase,
    with no surrounding catch, so any structural or coherence refusal that read would raise propagates
    out of the script's own try, and the script only completes successfully once that read runs to completion.
nodes:
- node: contracts/knowledge/author-case-version
  encoded_at:
  - src/seed.ts
  how: seedCase's one and only write into the case store is createAuthorCaseVersion(connection).authorCaseVersion(document)
    — the fact that the curated case enters exactly through this published command, and no other write,
    lives in this file's own control flow.
- node: contracts/knowledge/vocabulary-terms
  how: 'Honored rather than encoded: seedOutcomes, seedRemainingVocabularies and seedConcepts populate
    every vocabulary term and concept the curated case needs before seedCase runs, so this contract''s
    operations answer ''held'' rather than ''absent'' both at authoring and at the self-check read.'
- node: contracts/knowledge/capability-check
  how: 'Honored rather than encoded: seedCapabilities registers one read-only capability per concept the
    curated case collects before seedCase runs, so this contract''s read-capability operation answers
    ''held'' with a complete contract when authorCaseVersion''s own coherence check reads it.'
- node: rules/knowledge/validation-runs-at-every-read
  how: 'Honored rather than encoded: verifySeededCase calls the published read-case a second time after
    authoring and never catches its rejection, exercising the ''runs at every read'' half this task''s
    criterion 6 asks for. The replay-without-revalidation clause reaches no criterion of this task (REMAINDER)
    and is not answered here.'
- node: rules/knowledge/case-terms-exist-in-the-glossary
  how: 'Honored: the seed populates every subject type, outcome, action and recipient the curated case
    names before the case is authored, so this rule holds rather than refuses at that write.'
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  how: 'Honored: seedConcepts writes concept_accepts rows naming ''contract'' for both concepts the curated
    case collects, matching the case''s own declared subject.'
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  how: 'Honored, for the clause this task''s criterion 3 reaches: both concepts the curated case collects
    are seeded with the fixture''s own explicit ttl. The defaulting clause reaches no criterion of this
    task (REMAINDER).'
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  how: 'Honored: seedCapabilities registers, for each concept the curated case collects, exactly one read-only
    capability declaring an output schema and a timeout, before the case is authored.'
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  encoded_at:
  - src/seed.ts
  how: 'Encoded directly in the script''s own top-level sequence: seedOutcomes is called before seedRemainingVocabularies,
    seedConcepts, seedCapabilities and seedCase, so the two non-conclusion outcomes stand before this
    file authors the first case.'
inferences:
- inferred: The seed writes the full subject-attribute vocabulary fixture (the one name 'contract-number'
    in subject-attribute.json) even though the curated case document names no subject attribute of its
    own.
  from: domain/knowledge/case has no subject-attribute-bearing field at all, and validate-case-coherence.ts's
    own header states a case never declares attribute-values itself — so a seed writing none would pass
    criterion 2 vacuously while leaving the glossary unable to answer a subject attribute a diagnosis
    request assembles, exactly the gap the task's own UNDERDETERMINED note requires a test to exclude.
- inferred: Fixtures are located from './fixtures' relative to seed.ts's own import.meta.url, rather than
    the literal '../fixtures' the task's own guidance stated.
  from: src/src/fixtures sits beside src/src/migrate.ts and the new src/src/seed.ts (both directly under
    src/src/); migrate.ts's own '../migrations' goes up one level because migrations/ sits at the target
    root, one level above src/src/, which is not true of fixtures/.
- inferred: A second run's authoring step catches CaseVersionAlreadyStoredError specifically and treats
    it as already seeded, silently, rather than logging it or letting it hard-fail the otherwise-idempotent
    script — kept as a defensive fallback once the sequence gate below also exists.
  from: the task's own disclosed invitation to make and record this judgment; no configured logger module
    exists anywhere in src/, and STK-09/PRH-01 forbid console output, so there is nothing to log through
    short of installing a dependency no criterion of this task calls for.
- inferred: alreadySeeded() gates the whole seeding sequence — every vocabulary write, seedConcepts,
    seedCapabilities and seedCase — on the curated case not yet standing, checked once before any write,
    rather than relying on each individual step's own idempotency guard to make a rerun safe.
  from: 'a real rerun, exercised live by this delivery''s own proof
    (src/__tests__/integration/seed.spec.ts''s own "resolves without rejecting when seed.ts is run a second
    time against a database it has already seeded" test, which reproduced the failure before this fix and
    passes after it), found that seedOutcomes'' and seedRemainingVocabularies'' own whole-table replace
    (IGlossaryStore.writeTerms'' DELETE-then-INSERT) fails on a second run: once the curated case''s own
    hypotheses hold a row naming one of those outcome/action/recipient rows by foreign key, the DELETE half
    of that replace violates it. The CaseVersionAlreadyStoredError catch around seedCase alone could not
    have prevented this, since the failure happens earlier in the sequence, at the vocabulary write, before
    seedCase is ever reached — the whole sequence needed one shared write-once gate, the same way one case
    version is the case store''s own.'
- inferred: seedConcepts runs its per-concept and per-accepted-subject-type INSERTs as separate statements
    guarded by ON CONFLICT DO NOTHING, rather than wrapped in one transaction of its own.
  from: mirroring case-fixture-reads-clean.spec.ts's own insertConcepts helper exactly; EDG-05's own applies_to
    scope does not reach a top-level script file, and the ON CONFLICT guard already makes a partial rerun
    safe to repeat.
divergences:
- cites: TYP-02
  file: src/seed.ts
  departure: fixtureTerms, seedConcepts and seedCapabilities each cast a JSON.parse result with `as` —
    to readonly GlossaryTerm[], readonly ConceptFixture[] and readonly CapabilityRegistration[] respectively
    — with no narrowing guard beside the assertion.
  why: The three shapes are this project's own committed fixture files under src/fixtures, never external
    input, and this mirrors the exact unguarded-cast convention case-fixture-reads-clean.spec.ts's own
    insertTerms/insertConcepts/insertCapabilities helpers already use for the identical JSON.parse-then-cast
    step.
preserved:
- package.json's existing scripts (typecheck, lint, secret-scan, test, build, migrate, start) and its
  existing dependencies and devDependencies sections are unchanged apart from the new seed line — no dependency
  was added.
- Every existing write path (RelationalCaseStore.writeVersion via authorCaseVersion, RelationalGlossaryStore.writeTerms,
  CapabilityRegistryService.registerCapability) is called exactly as its own task already validated it;
  this delivery adds no new store method and no new factory.
deferred:
- what: migrations/0007-capability-concept.sql's own header comment states 'capabilities is a table no
    migration or seed script in this project ever populates', which this delivery makes inaccurate.
  why: MIG-02 forbids editing an already-applied migration script, and this task's objective is the seed,
    not that comment; correcting stale prose in an applied script sits outside what this task was cut
    to do.
---

## What it is

The seed that carries the fixture-era glossary, capability registry and one curated case version
into the database — the two non-conclusion outcomes first, then the rest of the vocabulary, then
the concepts and their capabilities, and only then the curated case, through the authoring command
and no other write, self-checked by reading it back whole.

## Notes

The task's own disclosed invitation left one implementation judgment to this delivery: a rerun's
own duplicate-case write is caught specifically (CaseVersionAlreadyStoredError) and treated as
already seeded, since no logger exists in this tree and console output is forbidden by the
standard.
