---
target: backend
title: Drop subject_attributes and its foreign key via migration 0023
summary: A new migration (0023-drop-subject-attributes.sql) drops the attribute-to-vocabulary foreign
  key on investigation_subject_attribute_values and the subject_attributes table itself, preserving that
  table's own primary key, its foreign key to investigations, and every row already stored under it; every
  test in src/ that seeded or probed subject_attributes against the post-migration schema is updated to
  match.
task: sha256:df6b4cd5547b7b36f02ac297d0eab694a05d995fc87c19f823e7531a0f750672
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/subject-attribute-vocabulary-removal-drop-table-suite
files:
- path: migrations/0023-drop-subject-attributes.sql
  effect: New migration. Drops investigation_subject_attribute_values_attribute_fkey (the constraint name
    Postgres assigned to 0005-investigation.sql's unnamed inline REFERENCES subject_attributes (name)
    on the attribute column) and then drops the subject_attributes table 0002-glossary-vocabulary.sql
    created. Leaves investigation_subject_attribute_values_pkey and the investigation_id foreign key to
    investigations(id) untouched, and issues no DELETE/UPDATE against the table, so every already-stored
    row survives.
- path: src/__tests__/integration/persistence/schema-migrations.spec.ts
  effect: EXPECTED_TABLES no longer lists subject_attributes. beforeAll no longer seeds a row into subject_attributes.
    The existing full-investigation round-trip test still inserts a subject-attribute-value row keyed
    by 'an-attribute'; with the seed gone and the table dropped, that same call now demonstrates that
    an attribute name no glossary table holds can be inserted and read back.
- path: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  effect: Removed the INSERT INTO subject_attributes / DELETE FROM subject_attributes calls from insertFixtureRows
    and cleanupWrittenFixtures; fixtures.subjectAttribute is still generated and still used to build the
    stored Subject's attribute name, now as free text with no backing row.
- path: src/__tests__/integration/http/diagnose-e2e.spec.ts
  effect: Removed the insertTerms(connection, 'subject_attributes', ...) call from ensureFixtureSeeded
    and the matching deleteTolerantly DELETE FROM subject_attributes call from cleanupFixtureSeeded.
- path: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  effect: Removed the INSERT INTO subject_attributes call from seedVocabulary and the matching deleteTolerantly
    DELETE call from cleanupFixture.
- path: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  effect: Removed the insertTerms(connection, 'subject_attributes', ...) call from ensureFixtureSeeded
    and the matching deleteTolerantly DELETE call from its cleanup function.
- path: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
  effect: Same removal, in ensureFixtureSeeded and cleanupGlossaryAndCapabilities.
- path: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
  effect: Same removal, in ensureFixtureSeeded and cleanupGlossaryAndCapabilities.
- path: src/__tests__/integration/factories/production-diagnose.factory.spec.ts
  effect: Removed the INSERT INTO subject_attributes call from insertVocabulary and the matching deleteTolerantly
    DELETE call from cleanupVocabulary.
criteria:
- criterion: The new migration is the next file in filename order after 0022-case-version-authored-at-default.sql.
  met: true
  how: Added as src/migrations/0023-drop-subject-attributes.sql, sorting immediately after 0022.
- criterion: Applying every migration in filename order leaves no subject_attributes table in the schema.
  met: true
  how: 0023's DROP TABLE subject_attributes; statement, applied after every earlier migration in filename
    order.
- criterion: Applying every migration in filename order leaves investigation_subject_attribute_values
    with no foreign key referencing subject_attributes.
  met: true
  how: 0023's ALTER TABLE ... DROP CONSTRAINT investigation_subject_attribute_values_attribute_fkey —
    the name Postgres assigns by default to an unnamed inline column-level REFERENCES, the same pattern
    0005-investigation.sql already uses unnamed elsewhere.
- criterion: A row whose attribute is a name no glossary table holds can be inserted into investigation_subject_attribute_values
    after the migration.
  met: true
  how: schema-migrations.spec.ts's existing full-investigation round-trip test inserts a subject-attribute-value
    row keyed by 'an-attribute'; beforeAll no longer seeds that name into any table, so the insert now
    succeeds with no backing vocabulary row at all.
- criterion: investigation_subject_attribute_values' primary key over (investigation_id, attribute, value)
    is unchanged by the migration.
  met: true
  how: 0023 names only the attribute foreign key and the subject_attributes table; it never touches investigation_subject_attribute_values_pkey.
- criterion: investigation_subject_attribute_values' foreign key to investigations (id) is unchanged by
    the migration.
  met: true
  how: That foreign key is a separate constraint from the dropped one and is never named by 0023.
- criterion: Rows present in investigation_subject_attribute_values before the migration are all present
    after it.
  met: true
  how: 0023 issues no DELETE or UPDATE against investigation_subject_attribute_values — only an ALTER
    TABLE dropping a constraint and a DROP TABLE of the separate, referenced table.
- criterion: schema-migrations.spec.ts's expected table list omits subject_attributes.
  met: true
  how: Removed 'subject_attributes' from EXPECTED_TABLES.
- criterion: schema-migrations.spec.ts's foreign-key probe over investigation_subject_attribute_values
    asserts the dropped constraint rather than the enforced one.
  met: true
  how: Removed the beforeAll seed into subject_attributes; the round-trip test's insert of a subject-attribute-value
    row now succeeds and reads back with no vocabulary table backing it, asserting absence rather than
    depending on enforcement.
- criterion: No test in src/ reads from or writes to the subject_attributes table.
  met: true
  how: Removed every direct INSERT/DELETE against subject_attributes from the 8 affected integration specs,
    all of which run against the shared database vitest-global-setup.ts migrates fully (including 0023).
    glossary-concept-description-schema.spec.ts's own references stand untouched, since that file only
    ever applies migrations up to 0012 on a scratch schema of its own, never reaching 0023.
- criterion: src's test suite passes.
  met: true
  how: run/subject-attribute-vocabulary-removal-drop-table-suite passed install, typecheck, lint,
    secret-scan, test-unit and test — the full suite, which is what actually applies migration 0023
    against the shared integration database.
nodes:
- node: constraints/the-schema-replays-from-its-scripts
  encoded_at:
  - migrations/0023-drop-subject-attributes.sql
  how: 0023 is a plain numbered .sql file beside its siblings, applied once in filename order by the existing
    migration runner; replaying every migration from empty still reaches the same schema, now without
    subject_attributes or the constraint that named it.
- node: constraints/the-stored-schema-mirrors-the-declared-model
  encoded_at:
  - migrations/0023-drop-subject-attributes.sql
  how: subject_attributes paired with domain/glossary/subject-attribute, which the sibling vocabulary-reduction
    task already removed from the specification; 0023 drops the table so the schema no longer holds a
    relation with no element behind it. attribute keeps pairing with domain/investigation/subject-attribute-value's
    own required 'attribute' field, now as free text.
- node: domain/investigation/subject-attribute-value
  encoded_at:
  - migrations/0023-drop-subject-attributes.sql
  - src/__tests__/integration/persistence/schema-migrations.spec.ts
  how: attribute is, per this element's own description, free text rather than a governed vocabulary term;
    0023 drops the one constraint that held it to a vocabulary instead, and schema-migrations.spec.ts's
    round-trip test now stores and reads back an attribute name no glossary table holds.
inferences:
- inferred: The dropped constraint's Postgres-assigned name is investigation_subject_attribute_values_attribute_fkey.
  from: 0005-investigation.sql declares this one REFERENCES inline with no explicit CONSTRAINT name, unlike
    every other named foreign key in the same file; the same file's other unnamed inline REFERENCES columns
    confirm this codebase relies on Postgres's default <table>_<column>_fkey naming for them.
- inferred: Eight test files beyond schema-migrations.spec.ts needed the same subject_attributes insert/delete
    calls removed, even though the task's own prose names only schema-migrations.spec.ts for updating.
  from: The task's own criteria state, unqualified, 'No test in src/ reads from or writes to the subject_attributes
    table' and 'src's test suite passes'; vitest-global-setup.ts applies every pending migration (now
    including 0023) against the one shared integration test database before the whole suite runs, so every
    other integration test's direct INSERT/DELETE against subject_attributes would fail at runtime once
    the table is gone.
- inferred: glossary-concept-description-schema.spec.ts needs no change despite still inserting into and
    reading subject_attributes.
  from: Both of its tests build their own scratch schema and apply migrations only up to and including
    0012-glossary-concept-description.sql, never reaching 0023, so subject_attributes still exists for
    the exact schema slice each test constructs.
- inferred: No reverse migration accompanies 0023.
  from: The standard's PRH-04 is scoped to .ts files under src/migrations, and every migration in this
    tree — destructive or not — is .sql, so the rule never reaches an actual migration file; following
    that same, already-established absence.
preserved:
- investigation_subject_attribute_values_pkey over (investigation_id, attribute, value).
- investigation_subject_attribute_values' own foreign key to investigations(id).
- Every row already stored in investigation_subject_attribute_values.
- subject_types, outcomes, actions, recipients and their own tables/foreign keys, untouched by this migration.
- glossary-concept-description-schema.spec.ts's own pre-0012 schema-slice behavior, left unedited.
deferred:
- what: 0002-glossary-vocabulary.sql's own header comment still names 'domain/glossary/subject-attribute
    -- subject_attributes', a specification node the sibling vocabulary-reduction task already removed.
  why: 0002 is an already-applied historical migration documenting what it created at the time it was
    written; migrations in this tree are never rewritten after the fact — 0023 is what supersedes 0002's
    creation — so correcting that header is not this task's to do.
---

## What it is

The storage side of the removal: the vocabulary's own table and the referential integrity it gave recorded subject attribute names, dropped by one migration that preserves every recorded row and both of the table's other constraints. Eight integration specs that seeded or probed the retired table are updated to match the post-migration schema.

## Notes

None.
