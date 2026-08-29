---
title: Proof that the relational investigation store persists and reads back an evidence item's snapshotted semantics
summary: Unit-level write/read tests over the two new columns, a schema-replay pair against a real,
  disposable database proving the legacy-row degradation and additivity, plus fixes to four
  pre-existing tests this task's own change to evidenceStatement()'s param shape made stale.
implementation: sha256:70745cc189d768f06c413c6184aaa84c847c785f6e0f136dc1373952a578c70f
run: run/pinned-evidence-semantics-full-suite-final-2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
tests:
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: sends the evidence item's own fields, JSON-serialized, and its own concept_description as
      the evidence insert's own thirteenth and fourteenth params, when the given evidence carries
      non-empty values for both
    proves: The relational investigation store persists an evidence item's fields and
      concept_description and reads them back unchanged. (write half)
    fails_when: evidenceStatement() stops including fields/concept_description among the evidence
      insert's own params, sends fields un-serialized (as a raw array rather than JSON text), or
      sends a value other than the given Evidence item's own
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: assembles the read evidence item's own fields and concept_description straight from the
      stored row's own two columns, carried through unchanged rather than a literal placeholder
    proves: The relational investigation store persists an evidence item's fields and
      concept_description and reads them back unchanged. (read half)
    fails_when: evidenceOf(row) stops reading row.fields/row.concept_description directly, answers
      a literal empty pair regardless of the row, or reads either value from the wrong column
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: reads back a whole investigation exactly as written — root, subject attribute-values,
      evidence with its capability pin, evaluations with their citations, assessment, cost and
      durations — through one transaction
    proves: The relational investigation store persists an evidence item's fields and
      concept_description and reads them back unchanged, against a real database rather than a
      fake connection. anIntegrationEvidence()'s own fixture default was changed from the empty
      placeholder pair (fields:[], concept_description:'') to real, non-empty values so this
      pre-existing whole-object round trip actually exercises node-postgres' own jsonb
      serialize/parse pair, rather than trivially equating two empty defaults on both sides.
    fails_when: node-postgres round-trips evidence.fields or evidence.concept_description into
      anything other than exactly what was written against a real database — the driver's own
      jsonb parse/serialize pair losing or reordering content in a way toEqual would catch, or the
      store's own write/read path silently dropping either column
  - file: src/__tests__/integration/persistence/investigation-evidence-semantics-snapshot-schema.spec.ts
    name: reads an investigation_evidence row stored before this migration back with its own
      honest-empty snapshot — fields as an empty array, concept_description as the empty string,
      never a read failure — while every column it already carried (concept, capability pin,
      elapsed_ms) survives unchanged
    proves: An investigation stored before this migration still reads back whole, its evidence's
      fields and concept_description degrading to their own honest empty values rather than a read
      failure.
    fails_when: applying migrations/0013 against a schema holding a pre-existing investigation_evidence
      row (inserted with none of its own two new columns) raises rather than backfilling, or the
      backfilled row answers anything other than fields:[] and concept_description:'', or the row's
      own pre-existing concept/capability_name/capability_version/elapsed_ms columns come back
      altered
  - file: src/__tests__/integration/persistence/investigation-evidence-semantics-snapshot-schema.spec.ts
    name: adds fields as a jsonb column and concept_description as a text column to
      investigation_evidence, both NOT NULL
    proves: the implementation's own recorded inference that fields is stored as one JSONB column
      holding the whole snapshotted array, rather than a child table decomposing each
      field-semantics entry into named columns of its own
    fails_when: fields is not a jsonb column, concept_description is not a text column, or either
      column is nullable, after migrations/0013 runs against a fresh (pre-0013) schema
  - file: src/__tests__/integration/persistence/investigation-evidence-semantics-snapshot-schema.spec.ts
    name: leaves every pre-existing row of four other tables exactly as it was, altering and
      removing nothing outside the two new columns this migration adds to investigation_evidence
    proves: 'The migration adding these columns is additive: no existing row of any other table is
      altered or removed.'
    fails_when: any of concepts, capabilities, case_versions or investigations' own pre-existing row
      (snapshotted via SELECT * before migrations/0013 runs) differs after it runs, or a row goes
      missing
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: carries each evidence item's capability_name and capability_version pin into its own
      insert row, not only the eight fields criterion 6 names explicitly
    proves: task/relational-stores/investigation-store's own pre-existing capability-pin assertion,
      kept accurate against the fourteen-param evidence insert this task's own migration adds —
      not a new proof of this task's own criteria, but a fix this task's own change to
      evidenceStatement() made necessary, since the pre-existing 12-item expected params array would
      otherwise fail on an unrelated ground (array length) rather than because the capability pin
      itself stopped traveling
    fails_when: the evidence insert's own params stop matching the fourteen values this test now
      expects, in order — including the trailing '[]' and '' this task's own two new columns add
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: sends the evidence item's own elapsed_ms as the evidence insert's own twelfth param, not
      silently dropped from the row this store persists — ahead of fields and concept_description,
      which migrations/0013 added after it
    proves: task/investigation-telemetry/evidence-collection-measures-elapsed-ms's own pre-existing
      elapsed_ms-position assertion, kept accurate against the fourteen-param evidence insert this
      task's own migration adds (elapsed_ms is no longer the insert's own last param once fields
      and concept_description follow it) — not a new proof of this task's own criteria, but a fix
      this task's own change made necessary
    fails_when: the evidence insert's own thirteenth param (index 11) stops being the given
      evidence item's own elapsed_ms
not_applicable:
  - edge_case: an upper bound on how many entries fields may hold
    why: no criterion or bound node states a ceiling on the array's own size, and fields is stored
      as one JSONB value with no length constraint at any layer
  - edge_case: a duplicate field name within one evidence item's own fields array
    why: fields carries no declared uniqueness constraint at any layer; the array is a snapshot of
      whatever fieldSemanticsOf already produced, and that shape is this task's own sibling task's
      concern, not this one's
  - edge_case: two concurrent writes or reads of the same evidence row
    why: write-once at the investigation level (rules/investigation/an-investigation-is-written-once)
      already governs concurrent writes and is proven by task/relational-stores/investigation-store's
      own pre-existing tests; this task adds two columns to one existing INSERT/SELECT pair and
      changes no transaction boundary or concurrency behavior
  - edge_case: an operation attempted against state that forbids it
    why: persisting/reading fields and concept_description gates no operation and has no state
      machine of its own to be attempted against
  - edge_case: absent fields or concept_description on a freshly-constructed Evidence item
    why: Evidence.fields and Evidence.concept_description are both required (non-optional) at the
      type level, so no caller in this tree can construct one omitting either — the compiler
      refuses that construction before any test could observe a runtime absence
untested:
  - "IEvidenceRow.fields being typed readonly FieldSemantics[] directly, rather than unknown
    narrowed at the boundary, is a type-level trust decision the implementation record discloses
    as an inference: node-postgres already parses a jsonb column into a plain JS value at runtime
    regardless of how the row interface types it, so no runtime test can distinguish the two typings
    — this is decided by the typecheck step (TYP-01/TYP-02), not by a reading a test-author writes,
    the same class of untestable inference case-simulation-backend's own
    evidence-collection-measures-elapsed-ms proof already recorded for a parallel typing decision."
  - "That migrations/0013 is named and numbered 0013-investigation-evidence-semantics-snapshot.sql
    rather than any other name is a filename/ordering convention with no independently observable
    runtime behavior distinct from what schema-migrations.spec.ts's own pre-existing, untouched
    tests (migration files apply in their zero-padded numeric order) already prove by construction
    — no test below re-asserts the name itself."
  - "A real Postgres round trip of a fields array holding more than one entry, or an entry using
    every optional attribute FieldSemantics declares (name, type, description all present) is not
    separately exercised against the real database beyond the single one-entry, all-three-attributes
    fixture the integration-level roundtrip test and the schema-replay tests both use; the unit-level
    write/read tests do exercise an object shape, but only the real-database round trip actually
    forces the JSONB serialize/parse pair FieldSemantics goes through, and that is proven for exactly
    one shape rather than several."
divergences:
  - cites: STK-08
    file: src/__tests__/integration/persistence/investigation-evidence-semantics-snapshot-schema.spec.ts
    departure: DATABASE_URL is read directly from process.env rather than through config/env.ts's
      loadEnv.
    why: loadEnv refuses unless every other application variable is configured too, which this
      schema-only suite has no use for — the same departure glossary-concept-description-schema.spec.ts,
      case-version-lifecycle-schema.spec.ts and protect-released-hypothesis-revision-collects-schema.spec.ts
      already disclose for themselves.
  - cites: TST-04
    file: src/__tests__/integration/persistence/investigation-evidence-semantics-snapshot-schema.spec.ts
    departure: the file is named for the migration artifact it replays rather than mirroring a single
      TypeScript path.
    why: the unit under test is migrations/0013-investigation-evidence-semantics-snapshot.sql, a file
      sitting outside src/src entirely with no single TypeScript path to mirror — the same departure
      schema-migrations.spec.ts, case-version-lifecycle-schema.spec.ts,
      protect-released-hypothesis-revision-collects-schema.spec.ts and
      glossary-concept-description-schema.spec.ts already disclose for themselves.
---

## What it is

Two new unit tests over RelationalInvestigationStore's write path (evidenceStatement()) and read path (evidenceOf(row)), proving fields and concept_description round-trip through the store's own params/assembly for real, replacing the two tests the sibling task left isolating the now-superseded compile-preserving placeholder. A new schema-focused integration spec, investigation-evidence-semantics-snapshot-schema.spec.ts, replays every migration up to (and excluding) migrations/0013 against a private, disposable schema, proving the legacy-row honest-empty degradation, the jsonb/text column shape, and additivity over four other tables. The pre-existing whole-store integration spec's own round-trip test is strengthened by changing its shared evidence fixture from an empty placeholder pair to real, non-empty values, so it now genuinely exercises node-postgres' own jsonb serialize/parse pair rather than trivially equating two empty defaults. Two more pre-existing unit tests (the capability-pin params assertion and the elapsed_ms-position assertion) are corrected to match the new fourteen-param evidence insert this task's own migration causes — not proof of this task's own criteria, but fixes this task's own change to evidenceStatement() made necessary to keep the suite green.

## Notes

I have no shell/Bash tool available in this delegated context (only Read, Write, Edit, Grep, Glob), so I could not run `npx tsc --noEmit` or vitest myself as asked. I instead statically verified every edit against the exact param positions and column list evidenceStatement()/evidenceOf() now carry (fourteen positional params, fields at index 12, concept_description at index 13), and mirrored the new schema-replay file's fixture chain (subject_types, outcomes, actions, recipients, concepts, capabilities, cases, case_versions, investigations, investigation_evidence) directly against the already-passing analogous fixture in relational-investigation-store.repository.spec.ts's own integration-level sibling and against migrations/0001 through 0012's own table definitions, rather than against an executed run. The caller's own captured run is what should confirm these statically-reasoned edits before this record is finalized.

Beyond the two tests the task's own brief named as needing correction (the OLD-placeholder-observing tests, now replaced), I found and fixed two more pre-existing unit tests this task's own evidenceStatement() change also breaks at runtime despite typechecking cleanly: the capability-pin params assertion (expected a twelve-item array; the insert now sends fourteen) and the elapsed_ms-position assertion (asserted `.at(-1)`; elapsed_ms is now the insert's own twelfth param, not its last, since fields and concept_description now follow it). Both are disclosed above as fixes rather than new proof of this task's own criteria.
