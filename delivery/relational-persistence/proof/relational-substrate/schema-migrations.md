---
title: Proof for the schema built by numbered scripts under migrations/
summary: Twenty-three tests, run against a real PostgreSQL database, that replay the six scripts onto
  an empty schema, round-trip every aggregate's required attributes, hold exactly the five nullable columns
  nullable, enforce each of the five enumerations, enforce the four unique keys, and hold a stored case
  version immutable under an ordinary UPDATE.
implementation: sha256:a6fb2f1684ba2316f894902ba869496f5275ce58c276e6a5f96f01ae015606ab
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-substrate-schema-migrations-suite-4
tests:
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: applies the five scripts, in the order their file names number them, to a fresh empty database
    and produces every relation the model needs and none it does not
  proves: criterion 1 (replay produces the whole schema with no hand step)
  fails_when: any script errors when applied in numbered order to an empty schema, or the resulting table
    set differs from the tables the six files declare
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: persists and reads back a full case, hypothesis, resolution, referral and its collects
  proves: criteria 2-3 for case/hypothesis/resolution/referral — the required attributes these elements
    declare round-trip through the schema
  fails_when: the insert is refused, or any of title/consolidation_register/criterion/position/collects
    is not read back exactly as written
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: persists and reads back a full investigation together with its evidence, evaluation, citation
    and subject-attribute-value
  proves: criterion 3 for investigation/evidence/evaluation/assessment/cost/durations/subject/subject-attribute-value/citation
  fails_when: the insert is refused, or any of observation/verdict/field/value is not read back exactly
    as written
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: persists and reads back concept, subject-type, subject-attribute, action, outcome, recipient and
    capability rows the suite seeded once
  proves: criterion 4 — the required attributes of the discovered/global vocabularies and capability round-trip
  fails_when: ttl, accepts, nature, timeout or connector is not read back exactly as seeded
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: holds every domain column NOT NULL except exactly the five columns the model declares optional
  proves: criteria 3, 4 and 5 together, as the stated totality — every required attribute's column admits
    no absent value, and exactly ticket_ref/result_detail/reason/assessment_determining_hypothesis/consolidation_register
    admit one
  fails_when: any column besides these five is nullable, or any of these five is not
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: refuses storing a case version whose title is absent
  proves: criterion 3 (a representative required column) as an actual insert refusal, not only a metadata
    reading
  fails_when: inserting title = NULL succeeds, or fails with anything other than a not-null violation
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: accepts and stores an investigation with no ticket_ref, one of the five attributes the model declares
    optional
  proves: criterion 5 as an actual insert/round-trip, not only a metadata reading
  fails_when: the insert is refused, or ticket_ref reads back as anything other than absent
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: accepts exactly the three values verdict declares and refuses one it does not
  proves: criterion 6 for verdict (domain/investigation/verdict)
  fails_when: any of confirmed/refuted/inconclusive is refused, or an out-of-enumeration value is accepted
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: accepts exactly the four values evidence-result declares and refuses one it does not
  proves: criterion 6 for evidence-result
  fails_when: any of ok/unavailable/denied/timeout is refused, or an out-of-enumeration value is accepted
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: accepts exactly the three values evaluation-reason declares and refuses one it does not
  proves: criterion 6 for evaluation-reason
  fails_when: any of no-data/judgment-failure/deadline-exceeded is refused, or an out-of-enumeration value
    is accepted
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: accepts exactly the two values capability-nature declares and refuses one it does not
  proves: criterion 6 for capability-nature
  fails_when: read-only or mutating is refused, or an out-of-enumeration value is accepted
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: accepts exactly the two values consolidation-register declares, besides its own absence, and refuses
    one it does not
  proves: criterion 6 for consolidation-register, together with its own optionality
  fails_when: formal or plain is refused, or an out-of-enumeration value is accepted
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: declares each of the five enumeration columns as plain text, not a native Postgres enum type
  proves: the implementation's own stated inference — CHECK-restricted TEXT rather than a native ENUM
    or a lookup table
  fails_when: any of the five columns reports a data_type other than text
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: refuses a case version whose subject names a subject type the glossary does not hold
  proves: the implementation's own stated inference — a typed reference to another Domain Model element
    is a real foreign key, not free text
  fails_when: the insert succeeds, or fails with anything other than a foreign-key violation
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: refuses a non-numeric value for a case version's integer-typed version column
  proves: the implementation's own stated inference — integer-typed attributes are realized as INTEGER,
    not TEXT
  fails_when: the insert succeeds, or fails with anything other than an invalid-text-representation error
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: shapes schema_migrations as exactly filename and applied_at, the one relation the model exempts
  proves: the implementation's own stated inference about schema_migrations' shape, and criterion 2's
    exemption
  fails_when: the table carries any column other than exactly filename and applied_at
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: refuses a second evidence row for one investigation under a concept it already collected
  proves: the implementation's own stated inference that evidence is identified by (investigation, concept),
    per evidence.md's own Description
  fails_when: the second insert succeeds, or fails with anything other than a unique violation
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: refuses a second evaluation row for one investigation under a hypothesis already judged
  proves: the implementation's own stated inference that evaluation is identified by (investigation, hypothesis),
    per evaluation.md's own Description
  fails_when: the second insert succeeds, or fails with anything other than a unique violation
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: refuses a second case stored under a slug already in use
  proves: criterion 7 / rules/knowledge/a-slug-identifies-one-case
  fails_when: the second insert succeeds, or fails with anything other than a unique violation
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: refuses storing the same case version a second time under its own slug and version
  proves: criterion 8's "written once" half / rules/knowledge/a-case-version-is-written-once
  fails_when: the second insert succeeds, or fails with anything other than a unique violation
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: refuses a second hypothesis of one case sharing an already-used position
  proves: criterion 9 / rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  fails_when: the second insert succeeds, or fails with anything other than a unique violation
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: refuses a second hypothesis of one case sharing an already-used name
  proves: criterion 10 / rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  fails_when: the second insert succeeds, or fails with anything other than a unique violation
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: leaves an already-stored case version's own columns unchanged after an ordinary UPDATE attempts
    to alter them
  proves: 'rules/knowledge/a-case-version-is-written-once''s "never altered" half, per the task''s own
    UNDERDETERMINED note — excludes exactly the candidate it names: a case_versions relation whose unique
    key answers "written once" but leaves an already-stored row''s own columns open to ordinary UPDATE.
    Observes state (the title after the attempt) rather than one enforcement mechanism, via a SAVEPOINT,
    so it passes equally against a trigger-based, a rule-based or a revoked-privilege enforcement'
  fails_when: an already-stored case_versions row's title (or any other column) reads back changed after
    an ordinary UPDATE attempts to alter it. This test ran red on this delivery's first pass — no trigger,
    rule or REVOKE existed anywhere in 0001-0005 — and the correction that closed the gap is migrations/0006-case-version-immutability.sql,
    added to the implementation after this test surfaced the gap
not_applicable:
- edge_case: absent vs. empty-string input
  why: No criterion or specification node states a minimum length for any TEXT column — "admits no absent
    value" is answered by NOT NULL, which is about NULL, not about the empty string. No CHECK constrains
    string length anywhere in the delivered schema, so there is nothing to falsify here beyond what the
    NOT-NULL tests already cover.
- edge_case: '"at least one" cardinality for hypothesis.collects, case.hypotheses, concept.accepts etc.'
  why: rules/knowledge/a-case-has-at-least-one-hypothesis, a-hypothesis-collects-at-least-one-concept
    and similar cardinality rules are not named in this task's own implements list, so this task does
    not claim to enforce them at the schema level. Testing for their enforcement here would assert a totality
    this task's own criteria never claimed.
- edge_case: concurrent duplicate inserts racing for the same unique key
  why: A single serialized duplicate-insert test already demonstrates each constraint exists; exercising
    two connections racing for the same key would test PostgreSQL's own MVCC/locking implementation, not
    this schema, and this task ships no code of its own to be the subject of a race.
- edge_case: a slow or failing dependency
  why: This task ships SQL schema only; there is no dependency call, timeout or retry logic here to exercise.
- edge_case: numeric range boundaries (e.g. position = 0 or negative)
  why: No criterion or specification node states a minimum, maximum or sign for position, version, ttl,
    timeout or any other integer attribute; there is no boundary to test.
untested:
- 'Criterion 2''s full claim that every column pairs with one specific Domain Model attribute (and only
  schema_migrations pairs with none) is not tested as a column-by-column identity audit against each element''s
  own attribute list — that pairing is a mapping between a column and a sentence in the specification,
  not an observable behavior a query against the live database can check. This suite instead establishes:
  the exact table set exists and no more (the replay test); every named aggregate''s required attributes
  round-trip correctly (the three round-trip tests); and the nullable set is exactly the five named exceptions
  (the totality test). Together these are strong circumstantial evidence but not the identity audit itself,
  which belongs to the specification-conformance review''s reading pass.'
- The migration files' own grouping-by-concern and their kebab-case, zero-padded sequential naming (an
  inference the implementation record states) — a file-organization fact rather than a database behavior,
  which MIG-01 and the standard-conformance review check instead.
- A dedicated type-rejection probe for every TIMESTAMPTZ column (one exists only for the INTEGER inference,
  on case_versions.version) — every round trip already stores and reads back datetime-shaped values successfully
  across roughly ten TIMESTAMPTZ columns, exercising the inference implicitly.
- Whether migrations/ genuinely sits at the target source root (sibling to package.json) rather than elsewhere
  — exercised only implicitly, since every test in this file would fail with ENOENT outright if the migrations
  directory resolved incorrectly.
- Whether a real, reachable PostgreSQL instance is actually provisioned via DATABASE_URL in whatever environment
  later runs this suite — every test here requires one, throwing plainly if DATABASE_URL is absent, but
  the provisioning itself is the runner's fact to supply, not this proof's to establish.
divergences:
- cites: STK-08
  file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than through config/env.ts's Zod-validated
    loadEnv.
  why: loadEnv refuses unless every other application environment variable is also configured, which would
    couple this schema-only integration suite to the whole application's environment schema for a value
    it reads once, verbatim, with no typed caller downstream of it.
- cites: TST-04
  file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  departure: The file does not mirror a single TypeScript unit's path.
  why: The unit under test is migrations/*.sql — files sitting outside src/src, which this task's own
    rationale explicitly frames as "one artifact" precisely so it is never split across files or tasks.
    There is no single TypeScript path for a mirroring rule to produce, so the file is named for the artifact
    as a whole instead.
---

## What it is

Twenty-three integration tests against a real PostgreSQL database, proving the six migration
scripts replay cleanly onto an empty schema, that every aggregate's required attributes round-trip,
that exactly the five declared-optional columns are nullable, that each enumeration column refuses
a value outside its declared set, that the four unique keys refuse their own duplicate, and that a
stored case version cannot be altered once written.

## Notes

The last test proving rules/knowledge/a-case-version-is-written-once's "never altered" half ran red
on this delivery's first pass: no trigger, rule or REVOKE existed anywhere in the original five
scripts to stop an ordinary UPDATE against an already-stored case_versions row. That is a disagreement
between what the proof required and what the implementation had written, not a defect in the test —
this proof was written by reading the specification node directly rather than the implementation's own
account of itself, per this framework's separation of the two producers. The implementation was
corrected (migrations/0006-case-version-immutability.sql) rather than the test, and the suite now
passes in full.
