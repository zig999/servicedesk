---
target: backend
title: Migration 0023 drops subject_attributes and its foreign key, with the schema and row-survival proof
  to match
summary: Adds a filename-order check, a structural probe that the attribute-to-vocabulary foreign key
  is gone while the investigations foreign key and the composite primary key still enforce, and a replay-across-the-migration
  check that an already-stored row survives; adjusts the existing full-investigation round-trip assertion
  to read the attribute name back too, so it also demonstrates the value-object's own free-text pairing.
implementation: sha256:ad503dc272fe5555bd0d7daa1cbf63f0b3cb0f355607f50aebeac9c620ad61a5
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/subject-attribute-vocabulary-removal-drop-table-suite
tests:
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: places the subject_attributes-dropping migration immediately after 0022-case-version-authored-at-default.sql
    in filename order
  proves: The new migration is the next file in filename order after 0022-case-version-authored-at-default.sql.
  fails_when: 0023-drop-subject-attributes.sql is not the very next entry after 0022 once every .sql file
    under src/migrations is sorted by name.
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: applies every migration script, in the order their file names number them, to a fresh empty database
    and produces every relation the model needs and none it does not
  proves: Applying every migration in filename order leaves no subject_attributes table in the schema,
    and schema-migrations.spec.ts's expected table list omits subject_attributes.
  fails_when: the set of tables a fully-replayed, empty-to-current schema actually holds differs from
    EXPECTED_TABLES.
  demonstrates: constraints/the-schema-replays-from-its-scripts
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: removes investigation_subject_attribute_values' own foreign key on attribute, so no constraint
    still ties it to a vocabulary table
  proves: Applying every migration in filename order leaves investigation_subject_attribute_values with
    no foreign key referencing subject_attributes, and schema-migrations.spec.ts's foreign-key probe asserts
    the dropped constraint rather than the enforced one.
  fails_when: a foreign-key constraint on investigation_subject_attribute_values.attribute still exists
    in the fully-migrated schema, read structurally rather than inferred from an insert's success.
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: still refuses a subject-attribute-value row whose investigation_id names no stored investigation,
    through investigation_subject_attribute_values' own foreign key to investigations
  proves: investigation_subject_attribute_values' foreign key to investigations (id) is unchanged by the
    migration.
  fails_when: inserting a subject-attribute-value row under an investigation_id nothing stored no longer
    raises a foreign-key violation.
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: refuses a second subject-attribute-value row sharing one investigation, attribute and value already
    stored, through investigation_subject_attribute_values' own unchanged primary key
  proves: investigation_subject_attribute_values' primary key over (investigation_id, attribute, value)
    is unchanged by the migration.
  fails_when: a second row sharing the same (investigation_id, attribute, value) is accepted instead of
    rejected.
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: preserves an already-stored subject-attribute-value row when migration 0023 runs on top of every
    migration before it
  proves: Rows present in investigation_subject_attribute_values before the migration are all present
    after it.
  fails_when: a subject-attribute-value row stored under the schema as it stood immediately before 0023
    is missing, or its attribute/value differ, once 0023 has run on top of it.
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: persists and reads back a full investigation together with its evidence, evaluation, citation
    and subject-attribute-value
  proves: A row whose attribute is a name no glossary table holds can be inserted into investigation_subject_attribute_values
    after the migration.
  fails_when: inserting a subject-attribute-value row keyed by a name no glossary table holds is refused,
    or the stored (attribute, value) pair does not read back exactly as written.
  demonstrates: domain/investigation/subject-attribute-value
not_applicable:
- edge_case: Concurrent writes to the same subject-attribute-value row
  why: No criterion of this task addresses concurrency for this table; this is a DDL-only migration, and
    any concurrent-write behavior for investigation_subject_attribute_values was established (or not)
    by whichever task first created it, not by this one.
- edge_case: A dependency that is unavailable, slow, or answers in an unexpected shape
  why: This task ships a schema migration and edits to test fixtures; it introduces or touches no external
    dependency for any criterion to reach.
- edge_case: Absent or empty input at a validation boundary
  why: No HTTP or service boundary is touched by this task; the subject under test is a SQL migration's
    effect on the schema, not a request payload.
- edge_case: An operation attempted against state that forbids it
  why: No lifecycle or state-machine rule is affected by dropping a vocabulary table and the foreign key
    that named it.
untested:
- 'constraints/the-stored-schema-mirrors-the-declared-model: its fact is a totality over every column
  of every relation the migrations create, matched against every Domain Model element. No finite test
  enumerates every column against its declared element; this task''s own tests only verify that its own
  removal leaves no orphaned relation or unpaired column behind, a fragment of the whole property.'
- Criterion 'No test in src/ reads from or writes to the subject_attributes table' is confirmed by direct
  reading rather than by an automated test; glossary-concept-description-schema.spec.ts's own two references
  stand legitimately, since both its tests build their own scratch schema and replay migrations only through
  0012, never reaching 0023.
- Criterion 'src's test suite passes' is established by the whole-suite run this proof cites, not by any
  single test.
- UNDERDETERMINED, from the specification — domain/investigation/subject-attribute-value backs the criterion
  admitting an unregistered attribute name; nothing in this migration's own criteria excludes application
  code elsewhere still refusing such a name against a registry on a path no test in src/ exercises. The
  absence is recorded here as the binder's own finding, unresolved by this task, since it names this task's
  own dependency chain (not its own criteria) as what actually excludes it.
---

## What it is

Seven tests in schema-migrations.spec.ts — one new filename-order check, three new structural probes (the dropped FK, the surviving investigations FK, the surviving composite primary key), one new row-survival check across the migration, and the existing full-investigation round-trip test extended to read the attribute name back — proving every testable criterion of task/subject-attribute-vocabulary-removal/drop-the-subject-attributes-table-and-its-foreign-key.

## Notes

None.
