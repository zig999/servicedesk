---
title: pinned-evidence-semantics, first review
summary: 'What four passes found over the source and tests delivering pinned-evidence-semantics''s ten
  tasks: concept description (persistence, registration refusal, read), fixture-maintenance verification,
  the migration-runner comment-hang corrective, the evidence-semantics snapshot (collection and persistence),
  and judgment reading that snapshot instead of the live capability registry.'
reviewed:
- .env
- migrations/0012-glossary-concept-description.sql
- migrations/0013-investigation-evidence-semantics-snapshot.sql
- src/__tests__/integration/glossary/glossary-query.port.spec.ts
- src/__tests__/integration/persistence/glossary-concept-description-schema.spec.ts
- src/__tests__/integration/persistence/investigation-evidence-semantics-snapshot-schema.spec.ts
- src/__tests__/integration/persistence/migration-runner.spec.ts
- src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/integration/persistence/schema-migrations.spec.ts
- src/__tests__/integration/vitest-global-setup.spec.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/__tests__/unit/case/validate-case-coherence.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/glossary/glossary-query.port.spec.ts
- src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
- src/__tests__/unit/glossary/glossary.service.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/list-concepts.routes.spec.ts
- src/__tests__/unit/http/read-concept.routes.spec.ts
- src/__tests__/unit/http/register-concept.routes.spec.ts
- src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
- src/__tests__/unit/investigation/citation-validation.spec.ts
- src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
- src/__tests__/unit/investigation/field-semantics.spec.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
- src/__tests__/unit/persistence/migration-runner.spec.ts
- src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
- src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/unit/vitest-config-migration-replay-headroom.spec.ts
- src/errors/concept-description-required.error.ts
- src/errors/status-map.ts
- src/factories/production-simulate-hypothesis.factory.ts
- src/factories/simulate.factory.ts
- src/glossary/glossary.service.ts
- src/glossary/terms.ts
- src/http/dto/read-concept.dto.ts
- src/http/dto/register-concept.dto.ts
- src/http/read-concept.controller.ts
- src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- src/investigation/citation-validation.ts
- src/investigation/evidence-collection-stage.ts
- src/investigation/evidence.ts
- src/investigation/field-semantics.ts
- src/investigation/hypothesis-evaluator.port.ts
- src/investigation/investigation-pipeline.ts
- src/investigation/judgment-stage.ts
- src/investigation/run-diagnosis.ts
- src/investigation/simulate-hypothesis-pipeline.ts
- src/persistence/migration-runner.ts
- src/persistence/relational-glossary-store.repository.ts
- src/persistence/relational-investigation-store.repository.ts
- vitest.config.ts
tasks:
- task/concept-description/concept-persistence-carries-description
- task/concept-description/concept-registration-requires-a-description
- task/concept-description/read-concept-returns-description
- task/concept-literal-fixture-maintenance/concept-assertion-description-repair
- task/concept-literal-fixture-maintenance/concept-literal-typecheck-repair
- task/evidence-semantics-snapshot/evidence-collection-snapshots-concept-and-field-semantics
- task/evidence-semantics-snapshot/investigation-store-persists-the-snapshot
- task/judgment-reads-the-snapshot/evaluator-port-and-prompt-carry-snapshotted-semantics
- task/judgment-reads-the-snapshot/judgment-stops-re-reading-the-registry
- task/migration-runner-comment-hang-corrective/strip-leading-comments-before-applying
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/pinned-evidence-semantics-full-suite-final-2) passed every step; there
    was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: The relational glossary store persists a concept's description and reads it back unchanged.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: answers each concept with its name, the subject types it accepts, its ttl and its description,
      exactly as the real tables hold them
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: inserts each given concept's own name, ttl and description into concepts, and no concept_accepts
      row where it accepts nothing
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: answers each concept with its name, the subject types it accepts, its ttl and its description
- criterion: A concept row stored before this migration reads back with an honest empty description, never
    a read failure.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/glossary-concept-description-schema.spec.ts
    name: reads a concepts row stored before this migration back with an honest empty description, never
      a read failure — the row's own name, ttl and concept_accepts entries all survive the same way
- criterion: 'The migration adding the description column is additive: no existing row of any other table
    is altered or removed.'
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/glossary-concept-description-schema.spec.ts
    name: leaves every pre-existing row of six other tables exactly as it was, altering and removing nothing
      outside the new column this migration adds to concepts
- criterion: A concept registration naming no description is refused with an HTTP 422 response reporting
    ConceptDescriptionRequiredError.
  state: partial
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses a concept registration naming no description, with a typed ConceptDescriptionRequiredError
      (criterion 1)
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses a concept registration naming an empty-string description exactly as it refuses an absent
      one (criterion 1)
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ConceptDescriptionRequiredError to 422
  why: The throw and the status-map mapping are each proven separately, but nothing in this set sends
    an actual HTTP request through the real register-concept route/error-handler wired to a real (unstubbed)
    GlossaryService and asserts the response is an HTTP 422 body naming ConceptDescriptionRequiredError.
    register-concept.routes.spec.ts's own tests stub registerConcept entirely and never exercise this
    refusal; the file that would wire the three together (error-handler.middleware.spec.ts) is not in
    this review's test set.
- criterion: A concept registration refused for naming no description leaves the glossary's held concepts
    unchanged.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: leaves the glossary's held concepts unchanged when a registration naming no description is refused
      (criterion 2)
- criterion: A concept registration naming a description succeeds, and the glossary's held concept for
    that name carries exactly that description.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: succeeds for a concept registration naming a description, and the glossary's held concept for
      that name carries exactly that description (criterion 3)
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: 'does not treat a whitespace-only description as naming none: it is stored exactly as given,
      with no trimming and no refusal'
- criterion: Reading a held concept by name answers its description alongside its name, accepts and ttl.
  state: partial
  tests:
  - file: src/__tests__/unit/glossary/glossary-query.port.spec.ts
    name: answers a held concept with its accepted subject types and its ttl
  - file: src/__tests__/unit/http/read-concept.routes.spec.ts
    name: answers 200 with the concept currently held by the glossary, including its accepted subject
      types and its ttl
  why: accepts and ttl are proven with real, populated values through GlossaryService.readConcept and
    through the wire; description is only exercised through readConcept with the default empty value (the
    fixture in glossary-query.port.spec.ts registers no description at all). No test calls GlossaryService.readConcept
    against a store holding a concept with a real, non-empty description and asserts the resolution carries
    it; the HTTP test with a non-empty description stubs readConcept entirely, so it proves only wire
    pass-through, not the domain mapping this criterion names.
- criterion: Reading a held concept with no stored description answers the empty string for description,
    never a refusal.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary-query.port.spec.ts
    name: answers a held concept with its accepted subject types and its ttl
  - file: src/__tests__/unit/http/read-concept.routes.spec.ts
    name: answers 200 with the empty string for description, when the glossary holds a legacy concept
      with no stored description, never a refusal
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: answers a concept with an empty accepts array when it currently accepts no subject type
- criterion: The .toEqual assertions in src/src/__tests__/unit/glossary/glossary-query.port.spec.ts pass
    against GlossaryService's description-populated read-back.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary-query.port.spec.ts
    name: answers a held concept with its accepted subject types and its ttl
- criterion: The .toEqual assertions in src/src/__tests__/integration/glossary/glossary-query.port.spec.ts
    pass against GlossaryService's description-populated read-back.
  state: covered
  tests:
  - file: src/__tests__/integration/glossary/glossary-query.port.spec.ts
    name: answers a concept's ttl as the data now states it, not as it stood at the previous read
- criterion: The .toEqual assertions in src/src/__tests__/unit/glossary/glossary.service.spec.ts pass
    against GlossaryService's description-populated read-back.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: answers a concept with its name, its accepted subject types and its ttl in seconds
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: holds the default of sixty seconds for a concept whose registration states no ttl
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: creates a concept with its accepted subject types and its ttl, at a name the glossary does not
      yet hold
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: replaces a concept in place at a name the glossary already holds, rather than creating a second
      entry for it
- criterion: The .toEqual assertions in src/src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
    pass against GlossaryService's description-populated read-back.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
    name: answers a page of the registered concepts with the full pagination envelope, its page count
      computed from the total and the limit (API-03)
  - file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
    name: answers a page from the middle of a larger concept list, windowed by offset and limit rather
      than always starting at the first concept
  - file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
    name: holds the default of sixty seconds, read through listConcepts, for a concept whose registration
      states no ttl
- criterion: No assertion in these four files changes in outcome beyond the added description key and
    its placeholder value.
  state: uncovered
  why: This is a claim about a diff against these files' own prior versions. Nothing in the current test
    file set — which only shows the files as they stand today — can assert about what changed relative
    to before; no runtime test can observe a historical diff.
- criterion: The suite step covering these four files passes.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary-query.port.spec.ts
    name: answers a held concept with its accepted subject types and its ttl
  - file: src/__tests__/integration/glossary/glossary-query.port.spec.ts
    name: answers a concept's ttl as the data now states it, not as it stood at the previous read
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: creates a concept with its accepted subject types and its ttl, at a name the glossary does not
      yet hold
  - file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
    name: answers a page of the registered concepts with the full pagination envelope, its page count
      computed from the total and the limit (API-03)
- criterion: npm run typecheck completes without error against the Concept literal(s) in src/src/__tests__/unit/case/case-query.service.spec.ts.
  state: uncovered
  why: No file in this review's test set runs or asserts on npm run typecheck's exit status; typecheck
    is a build-time check that no vitest spec in this set exercises. Proven instead by the captured run's
    own passing typecheck step.
- criterion: npm run typecheck completes without error against the Concept literal(s) in src/src/__tests__/unit/case/validate-case-coherence.spec.ts.
  state: uncovered
  why: No vitest spec asserts on typecheck's exit status. Proven instead by the captured run's own passing
    typecheck step.
- criterion: npm run typecheck completes without error against the stubGlossaryQuery() and stubRegisterConcept()
    helpers in src/src/__tests__/unit/http/build-app.spec.ts.
  state: uncovered
  why: No vitest spec asserts on typecheck's exit status. Proven instead by the captured run's own passing
    typecheck step.
- criterion: npm run typecheck completes without error against both writeConcepts call sites in src/src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts.
  state: uncovered
  why: No vitest spec asserts on typecheck's exit status. Proven instead by the captured run's own passing
    typecheck step.
- criterion: npm run typecheck completes without error against the heldConcept() fixture builder in src/src/__tests__/unit/http/read-concept.routes.spec.ts.
  state: uncovered
  why: No vitest spec asserts on typecheck's exit status. Proven instead by the captured run's own passing
    typecheck step.
- criterion: npm run typecheck completes without error against the heldConcept() fixture builder in src/src/__tests__/unit/http/register-concept.routes.spec.ts.
  state: uncovered
  why: No vitest spec asserts on typecheck's exit status. Proven instead by the captured run's own passing
    typecheck step.
- criterion: npm run typecheck completes without error against the heldConcept() fixture builder in src/src/__tests__/unit/http/list-concepts.routes.spec.ts.
  state: uncovered
  why: No vitest spec asserts on typecheck's exit status. Proven instead by the captured run's own passing
    typecheck step.
- criterion: None of the seven files' existing test assertions changes in value or outcome.
  state: uncovered
  why: A diff-only claim against these files' own prior versions; nothing in the current test set can
    observe a historical diff at runtime.
- criterion: npm run typecheck exits 0 for the whole backend target source root.
  state: uncovered
  why: No vitest spec exercises this; it is a build-step fact proven by the captured run's own passing
    typecheck step, not by any test in this set.
- criterion: Evidence for a concept whose capability currently resolves records fields — one entry per
    key its output schema's own top-level properties declares, each carrying that key's own type and description
    where the schema states them.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records fields as one entry per top-level property the resolved capability's own output schema
      declares, carrying each key's own type and description exactly where the schema states them as strings
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: answers one entry per top-level property key the schema declares, in the order the schema states
      them
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: carries a key's own type and description together when the schema states both as strings
- criterion: Evidence for a collected concept records concept_description exactly as the glossary held
    that concept's description at the moment of collection.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records concept_description exactly as the glossary held that concept's description at the moment
      of collection
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records concept_description on a denied ending too, not only where the observation itself answers
      ok — the description is snapshotted from resolving the concept, not from how the observation itself
      ended
- criterion: Evidence for a concept registered with no description records concept_description as the
    empty string, never a refusal.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records concept_description as the empty string, never a refusal, for a concept the glossary
      holds with none — a legacy concept registered before it declared one
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records concept_description as the empty string for a concept the glossary has never held at
      all, the same honest degradation as one registered with none
- criterion: Evidence for a concept whose capability never resolved records fields as an empty array.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: records fields as an empty array for a concept whose capability never resolved, there being
      no output schema to read
- criterion: The relational investigation store persists an evidence item's fields and concept_description
    and reads them back unchanged.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back a whole investigation exactly as written — root, subject attribute-values, evidence
      with its capability pin, evaluations with their citations, assessment, cost and durations — through
      one transaction
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: sends the evidence item's own fields, JSON-serialized, and its own concept_description as the
      evidence insert's own thirteenth and fourteenth params, when the given evidence carries non-empty
      values for both
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: assembles the read evidence item's own fields and concept_description straight from the stored
      row's own two columns, carried through unchanged rather than a literal placeholder
- criterion: An investigation stored before this migration still reads back whole, its evidence's fields
    and concept_description degrading to their own honest empty values rather than a read failure.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/investigation-evidence-semantics-snapshot-schema.spec.ts
    name: reads an investigation_evidence row stored before this migration back with its own honest-empty
      snapshot — fields as an empty array, concept_description as the empty string, never a read failure
      — while every column it already carried (concept, capability pin, elapsed_ms) survives unchanged
- criterion: 'The migration adding these columns is additive: no existing row of any other table is altered
    or removed.'
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/investigation-evidence-semantics-snapshot-schema.spec.ts
    name: leaves every pre-existing row of four other tables exactly as it was, altering and removing
      nothing outside the two new columns this migration adds to investigation_evidence
- criterion: EvidenceItem carries each item's own snapshotted field semantics (name, and type and description
    where declared) and its concept's own snapshotted description.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: carries the given criterion, evidence observation, its own concept description, its own field
      semantics, case title and case when_to_use inside one delimited block
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: passes each evidence item's own snapshotted field semantics and concept description to evaluate()
      — read straight from the evidence it was given, never resolved live — before the first call is ever
      made, never only after a decided answer
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: accepts a citation naming a concept in the hypothesis's collects and a field present among that
      same evidence item's own snapshotted fields
- criterion: The judgment prompt's evidence block names, for each item, its own field semantics and its
    concept's own description, inside the closed data block.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: carries the given criterion, evidence observation, its own concept description, its own field
      semantics, case title and case when_to_use inside one delimited block
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: renders each evidence item's own field semantics as its own <field> elements inside its own
      <fields>, each carrying its own name plus its own type attribute and description text exactly where
      the snapshot declared them, and never invented where it declared neither
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: renders each evidence item's own concept description as its own <concept_description>, and the
      closed <evidence> block carries it alongside the item's own fields and observation
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: escapes reserved XML characters in an item's own concept_description and field name/type/description,
      so none of them can break out of the closed data block
- criterion: The judgment prompt's evidence block for an item whose concept_description is empty names
    that item by its concept alone, with no stated meaning.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: omits the <concept_description> tag entirely for an item whose concept_description is the empty
      string, naming that item by its concept alone with no stated meaning, while still carrying its own
      fields and observation
- criterion: Prompt assembly remains a pure function of exactly the criterion, the evidence's own snapshotted
    semantics, and the pinned case's title and when_to_use.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: sends byte-identical prompt content across two calls carrying the same criterion, evidence (including
      its own field semantics and concept description) and case context
- criterion: The project's configured PROMPT_VERSION value for judgment differs from its value before
    this change.
  state: uncovered
  why: No file in this review's test set reads or asserts on PROMPT_VERSION; every spec that does sits
    outside the supplied test file set. The value itself is set in src/.env, a gitignored, untracked file
    — the implementation record's own disclosure is the only record of this criterion, and it cannot be
    a git diff's or a test's to confirm.
- criterion: A citation's field is accepted only where it exists among its own cited evidence item's own
    snapshotted fields, never resolved through a live capability-registry read.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: refuses a citation naming a field absent from its own cited evidence item's snapshotted fields,
      even though its concept is collected
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: accepts a citation naming a concept in the hypothesis's collects and a field present among that
      same evidence item's own snapshotted fields
  - file: src/__tests__/unit/investigation/citation-validation.spec.ts
    name: declares no outputSchemas field, no capabilityOutputSchemaKey helper and no CapabilityOutputSchemas
      type — the field-existence check has no live-resolved capability output-schema map left to build
      or read
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: accepts a citation naming a field the evidence item's own snapshot declared at collection, even
      though a capability now re-registered at that same name and version would declare a different set
      of fields entirely
- criterion: judgeHypotheses judges a hypothesis without taking a capability-registry dependency.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: imports no ICapabilityQuery and reads no capability-registry port at all — judgeHypotheses takes
      only evidence already collected, never a registry to resolve live
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: answers exactly one evaluation per required hypothesis, in the case's declared order, none omitted
      or duplicated
- criterion: A capability re-registered at the same name and version after an evidence item was collected
    against it does not change what a judgment already computed against that item sees.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: accepts a citation naming a field the evidence item's own snapshot declared at collection, even
      though a capability now re-registered at that same name and version would declare a different set
      of fields entirely
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: refuses a citation naming a field only a capability re-registered after collection would declare
      — a field absent from the evidence item's own snapshot taken at collection — never letting a live-resolved
      schema leak into an already-collected item's judgment
- criterion: Applying a migration file whose text is entirely comments and blank lines above one real
    statement executes that statement, never sending the comment lines to the connection.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/migration-runner.spec.ts
    name: executes the real statement in a file whose text is entirely comment lines and blank lines above
      it, never sending any comment line to the connection
- criterion: Applying a migration file with no comments at all behaves exactly as it did before this change.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/migration-runner.spec.ts
    name: sends a migration file holding no comment line and no blank line to the connection completely
      unchanged
- criterion: Replaying every migration script in order against an empty schema still produces the schema
    the current tree expects (constraints/the-schema-replays-from-its-scripts's own fitness), with no
    script skipped and no statement altered.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: applies every migration script, in the order their file names number them, to a fresh empty
      database and produces every relation the model needs and none it does not
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: holds every domain column NOT NULL except exactly the six columns the model declares optional
  - file: src/__tests__/integration/persistence/schema-migrations.spec.ts
    name: declares each of the five enumeration columns as plain text, not a native Postgres enum type
  - file: src/__tests__/unit/persistence/migration-runner.spec.ts
    name: strips a comment block sitting between two statements, not only a comment block leading the
      whole file
  - file: src/__tests__/unit/persistence/migration-runner.spec.ts
    name: drops only the whole comment line inside a multi-line statement, leaving every other line of
      that statement exactly as the file wrote it
- criterion: The bookkeeping row applyPendingMigrations records after a file applies still names that
    file's own filename, unchanged.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/migration-runner.spec.ts
    name: still records the bookkeeping row naming this file's own filename, after its comment lines are
      stripped from the SQL that ran
- criterion: vitest.config.ts's testTimeout is raised from its current 40000ms to a value that tolerates
    a full, sequential, from-scratch replay of every migration script in migrations/ against the real
    database this suite's DATABASE_URL names.
  state: partial
  tests:
  - file: src/__tests__/unit/vitest-config-migration-replay-headroom.spec.ts
    name: declares a testTimeout raised above the prior 40000ms value
  why: The test only asserts the configured number exceeds 40000ms; it does not measure or bound against
    the actual duration of a full, sequential, from-scratch replay of every migration script, so a value
    raised only slightly (which would not tolerate the real replay this criterion names) would still pass
    this test. This session's own captured runs show the full suite (including that replay) completing
    well within the configured bound, but no test encodes that margin.
- criterion: vitest.config.ts's own code comment describing why fileParallelism is disabled no longer
    names a database provider ("Neon") that is not the database this project currently uses.
  state: covered
  tests:
  - file: src/__tests__/unit/vitest-config-migration-replay-headroom.spec.ts
    name: explains why fileParallelism is disabled without naming any database provider ("Neon")
findings:
- pass: standard
  file: src/__tests__/integration/glossary/glossary-query.port.spec.ts
  where: requireDatabaseUrl(), and the file's own header comment
  cites: STK-08
  evidence: (STK-08) DATABASE_URL is read directly from process.env below rather than through config/env.ts's
    loadEnv, because loadEnv refuses unless every other application variable is configured too, which
    this file has no use for.
  cost: config/env.ts's loadEnv is the one Zod-schema boundary this project's own rule requires every
    environment read to pass through; here DATABASE_URL is taken as a raw, unvalidated string, so a shape
    loadEnv would refuse (or a validation loadEnv gains later, e.g. a required scheme) never gets exercised
    on the path this suite actually takes to reach the real database.
  correction: read DATABASE_URL through config/env.ts's own schema (or a schema-only variant of it) rather
    than through process.env directly.
- pass: standard
  file: src/__tests__/integration/persistence/glossary-concept-description-schema.spec.ts
  where: requireDatabaseUrl(), and the file's own header 'Divergences from the project's standard' note
  cites: STK-08
  evidence: 'STK-08 ("boundary input ... is parsed by a Zod schema") is departed from below: DATABASE_URL
    is read directly from process.env rather than through config/env.ts''s loadEnv, because loadEnv refuses
    unless every other application variable is also configured, which this schema-only suite has no use
    for.'
  cost: the same environment value production code parses through a Zod schema is read here as a bare
    string, so a validation rule loadEnv enforces (or later gains) is silently bypassed on every run of
    this suite.
  correction: read DATABASE_URL through config/env.ts's own schema rather than through process.env directly.
- pass: standard
  file: src/__tests__/integration/persistence/investigation-evidence-semantics-snapshot-schema.spec.ts
  where: requireDatabaseUrl(), and the file's own header 'Divergences from the project's standard' note
  cites: STK-08
  evidence: 'STK-08 ("boundary input ... is parsed by a Zod schema") is departed from below: DATABASE_URL
    is read directly from process.env rather than through config/env.ts''s loadEnv, because loadEnv refuses
    unless every other application variable is also configured, which this schema-only suite has no use
    for.'
  cost: the same environment value production code parses through a Zod schema is read here as a bare
    string, so a validation rule loadEnv enforces (or later gains) is silently bypassed on every run of
    this suite.
  correction: read DATABASE_URL through config/env.ts's own schema rather than through process.env directly.
- pass: standard
  file: src/__tests__/integration/persistence/migration-runner.spec.ts
  where: requireDatabaseUrl(), and the file's own header note
  cites: STK-08
  evidence: 'Divergence disclosed here for the same reason schema-migrations.spec.ts already discloses
    it: (STK-08) DATABASE_URL is read directly from process.env below rather than through config/env.ts''s
    loadEnv, because loadEnv refuses unless every other application variable is configured too, which
    this file has no use for.'
  cost: the boundary rule that every environment read passes through a Zod schema is bypassed here, so
    a DATABASE_URL shape config/env.ts would refuse is never checked before this suite hands it straight
    to the driver.
  correction: read DATABASE_URL through config/env.ts's own schema rather than through process.env directly.
- pass: standard
  file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  where: requireDatabaseUrl(), and the file's own header note
  cites: STK-08
  evidence: 'Divergence disclosed here for the same reason every sibling integration proof already discloses
    it: (STK-08) DATABASE_URL is read directly from process.env below rather than through config/env.ts''s
    loadEnv, because loadEnv refuses unless every other application variable is configured too, which
    this file has no use for.'
  cost: the boundary rule that every environment read passes through a Zod schema is bypassed here, so
    a DATABASE_URL shape config/env.ts would refuse is never checked before this suite hands it straight
    to the driver.
  correction: read DATABASE_URL through config/env.ts's own schema rather than through process.env directly.
- pass: standard
  file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  where: requireDatabaseUrl(), and the file's own header note
  cites: STK-08
  evidence: 'Divergence disclosed here for the same reason every sibling integration proof already discloses
    it: (STK-08) DATABASE_URL is read directly from process.env below rather than through config/env.ts''s
    loadEnv, because loadEnv refuses unless every other application variable is configured too, which
    this file has no use for.'
  cost: the boundary rule that every environment read passes through a Zod schema is bypassed here, so
    a DATABASE_URL shape config/env.ts would refuse is never checked before this suite hands it straight
    to the driver.
  correction: read DATABASE_URL through config/env.ts's own schema rather than through process.env directly.
- pass: standard
  file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  where: requireDatabaseUrl(), and the file's own header 'Divergences from the project's standard' note
  cites: STK-08
  evidence: 'STK-08 ("boundary input ... is parsed by a Zod schema") is departed from below: DATABASE_URL
    is read directly from process.env rather than through config/env.ts''s loadEnv, because loadEnv refuses
    unless every other application variable is also configured, which would couple this schema-only suite
    to the whole application''s environment for a value it uses once, verbatim, with no caller downstream
    of it.'
  cost: the boundary rule that every environment read passes through a Zod schema is bypassed here, so
    a DATABASE_URL shape config/env.ts would refuse is never checked before this suite hands it straight
    to the driver.
  correction: read DATABASE_URL through config/env.ts's own schema (or a schema-only variant of it) rather
    than through process.env directly.
- pass: standard
  file: src/__tests__/integration/vitest-global-setup.spec.ts
  where: requireDatabaseUrl(), and the file's own header note
  cites: STK-08
  evidence: 'Divergence disclosed here for the same reason src/vitest-global-setup.ts itself discloses
    it (STK-08): DATABASE_URL is read directly from process.env below — exactly as the module under test
    reads it — rather than through config/env.ts''s loadEnv, so excluding a default is proven against
    the real path this task''s own code takes rather than against a second, defaulting one.'
  cost: both the module under test and its own proof bypass the Zod-schema boundary the rule requires
    for environment input, so nothing in this path exercises the validation loadEnv would otherwise apply
    to DATABASE_URL.
  correction: read DATABASE_URL through config/env.ts's own schema rather than through process.env directly,
    in both the module and its proof.
- pass: standard
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  where: function isRecord (near the end of the file)
  cites: MNT-03
  evidence: "function isRecord(value: unknown): value is Record<string, unknown> {\n  return typeof value\
    \ === 'object' && value !== null && !Array.isArray(value);\n}"
  cost: this is the same non-null/non-array-object check citation-validation.ts's own isPlainObject and
    field-semantics.ts's own isPlainObject already declare, restated a third time rather than called;
    a reader who later has to widen or narrow what counts as a "plain object" for one of these checks
    has no way to know two siblings need the identical change.
  correction: extract the shared non-null/non-array-object guard into one module the three readers (citation-validation.ts,
    field-semantics.ts, this adapter) import instead of each declaring their own.
- pass: standard
  file: src/investigation/field-semantics.ts
  where: functions parseJsonOrUndefined and isPlainObject
  cites: MNT-03
  evidence: "function parseJsonOrUndefined(text: string): unknown {\n  try {\n    return JSON.parse(text);\n\
    \  } catch {\n    return undefined;\n  }\n}\n\n... function isPlainObject(value: unknown): value is\
    \ Record<string, unknown> {\n  return typeof value === 'object' && value !== null && !Array.isArray(value);\n\
    }"
  cost: both helpers are byte-identical to citation-validation.ts's own parseJsonOrUndefined and isPlainObject,
    which already existed in this project before this file was written — the file's own header even calls
    the duplication "deliberate independence" — so the same malformed-JSON or object-shape decision now
    lives in two places, and the day one of them is corrected the reader of the other copy has no signal
    that a sibling needs the identical fix.
  correction: move parseJsonOrUndefined and isPlainObject into one shared module and have citation-validation.ts
    and field-semantics.ts both call it, rather than each keeping its own copy.
- pass: standard
  file: src/persistence/relational-glossary-store.repository.ts
  where: 'the class constructor, `public constructor(private readonly connection: DatabaseConnection)
    {}`'
  cites: ARC-01
  evidence: 'public constructor(private readonly connection: DatabaseConnection) {}'
  cost: 'DatabaseConnection is declared as `export type DatabaseConnection = Pool;` in database-connection.ts
    — the pg driver''s own concrete class, not an interface — so nothing satisfies this constructor''s
    declared type except that class. This file''s own unit-level sibling spec cannot supply a plain fake
    object honestly: it builds `{ connect } as unknown as DatabaseConnection` and `{ query } as unknown
    as DatabaseConnection`, forcing an unsafe cast past the compiler for every test, precisely because
    the constructor was never given an interface a fake could implement without one.'
  correction: declare a narrow interface covering only the .query() and .connect()-returning-a-releasable-client
    shape this store's transactions actually use, and receive that instead of the concrete Pool alias;
    database-connection.ts's own createDatabaseConnection can still hand back a real Pool wherever the
    store is wired against it.
- pass: standard
  file: src/persistence/relational-investigation-store.repository.ts
  where: 'the class constructor, `public constructor(private readonly connection: DatabaseConnection)
    {}`'
  cites: ARC-01
  evidence: 'public constructor(private readonly connection: DatabaseConnection) {}'
  cost: 'The same concrete-class binding as relational-glossary-store.repository.ts''s own constructor:
    DatabaseConnection is Pool itself, so this file''s own unit-level sibling spec must build `{ connect
    } as unknown as DatabaseConnection` to stand in for it, an unsafe cast the constructor''s declared
    type forces rather than an interface the fake could honestly satisfy.'
  correction: receive a narrow interface over the connection (covering .query() and the .connect()-returning-a-releasable-client
    shape write()/read() actually use) instead of the concrete Pool alias.
---

## What it is
Ten tasks delivered pinned evidence semantics end to end: a concept's description (persisted, refused when absent, read back), a capability's field-by-field output semantics and a concept's description snapshotted onto Evidence at collection, that snapshot persisted and read back by the investigation store, and judgment (the evaluator port, its prompt, and the citation check) reading only that snapshot rather than re-reading the glossary or the capability registry live. A corrective fixed a migration-runner hang, whose root cause a later diagnosis (disclosed in that task's own implementation record) traced to a Path MTU Discovery black hole on a developer host's own network path rather than to the connection endpoint.

Coverage found two criteria genuinely partial (the HTTP-level 422 refusal is proven only in its two component halves, never end to end through the real route; the testTimeout raise is proven only as "above the prior value," never bounded against the real replay it exists to tolerate) and one genuinely uncovered by any test (the PROMPT_VERSION change, which lives in a gitignored, untracked file no test or diff can observe). The rest of the "uncovered" states are build-time facts (`npm run typecheck exits 0`) and diff-only claims ("no assertion changes") that no vitest test can assert at runtime by their own nature; the captured run's own passing typecheck step is what actually proves the former. Conformance found no departure: every node this change encodes was read back with its own evidence, and nothing states a domain fact outside it. The standard pass found eight pre-existing STK-08 divergences, each already disclosed in the very file it sits in (a project-wide integration-test convention predating this change, not introduced by it), and three real, previously undisclosed departures: a third independent copy of the same JSON-parsing/object-shape guard in the new field-semantics.ts (MNT-03), and two persistence-store constructors bound to the concrete `Pool` class rather than an interface (ARC-01), forcing every existing unit test of those stores to cast a fake past the compiler.

## Notes
This review's standard pass reports MNT-03/ARC-01 findings against src/persistence/relational-glossary-store.repository.ts and src/persistence/relational-investigation-store.repository.ts whose underlying pattern (the concrete Pool constructor binding) predates this delivery; both files are in this review's own file set because this delivery modified them, so the finding is reported as found, though the departure itself is not new.
Eight STK-08 findings are the same disclosed divergence, restated per file — every one of this initiative's own integration spec files reads DATABASE_URL directly rather than through config/env.ts's loadEnv, for the reason each file's own header already states (loadEnv refuses unless the whole application's environment is configured). This is a project-wide convention every integration spec in this codebase already follows, not something this delivery introduced.
What this framework does not review at all: whether the underlying business scope itself was the right one to build, and whether the frontend should also expose any of this — neither is in the four passes' remit, and neither was asked of this review.
What the passes looked past, as another judgment's: the conformance pass explicitly set aside the migration-runner/vitest.config.ts network-MTU narrative and the various doc-comment/citation-hygiene text throughout the test files as operational and code-quality matters rather than domain facts; the standard pass explicitly held the two migration `.sql` files and vitest.config.ts to nothing, since no rule in this standard scopes to a `.sql` suffix or to a file outside `src/`.
All three passes ran in a subagent, each in a clean context, per the skill's own division. The failures pass did not run: the run this review captured (run/pinned-evidence-semantics-full-suite-final-2) passed every step, so there was no failure to diagnose.
