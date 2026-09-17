---
title: Drop the subject_attributes table and the foreign key holding attribute-values to it
summary: A new migration removes investigation_subject_attribute_values' reference to subject_attributes
  and then the table, preserving every recorded attribute-value row.
rationale: 'Cut as its own task because it changes the applied schema rather than the type system: it
  is falsified by running the migrations and inspecting the result, and it can be delivered on its own
  once nothing reads the table. It is one task and not two because dropping the constraint and dropping
  the table it points at are one decision recorded in one migration file, and a delivery holding only
  the first would leave a table nothing references and nothing reads.'
sources:
- work/subject-attribute-glossary-removal-backend/intake/scope.md
objective: After the full migration run the schema holds no subject_attributes table and no foreign key
  from investigation_subject_attribute_values to it, with every previously recorded attribute-value row
  still present.
criteria:
- The new migration is the next file in filename order after 0022-case-version-authored-at-default.sql.
- Applying every migration in filename order leaves no subject_attributes table in the schema.
- Applying every migration in filename order leaves investigation_subject_attribute_values with no foreign
  key referencing subject_attributes.
- A row whose attribute is a name no glossary table holds can be inserted into investigation_subject_attribute_values
  after the migration.
- investigation_subject_attribute_values' primary key over (investigation_id, attribute, value) is unchanged
  by the migration.
- investigation_subject_attribute_values' foreign key to investigations (id) is unchanged by the migration.
- Rows present in investigation_subject_attribute_values before the migration are all present after it.
- schema-migrations.spec.ts's expected table list omits subject_attributes.
- schema-migrations.spec.ts's foreign-key probe over investigation_subject_attribute_values asserts the
  dropped constraint rather than the enforced one.
- No test in src/ reads from or writes to the subject_attributes table.
- src's test suite passes.
depends_on:
- task/subject-attribute-vocabulary-removal/drop-subject-attribute-from-the-glossary-vocabularies
implements:
- constraints/the-schema-replays-from-its-scripts
- constraints/the-stored-schema-mirrors-the-declared-model
- domain/investigation/subject-attribute-value
---

## What it is
The storage side of the removal: the vocabulary's own table and the referential integrity it gave recorded subject attribute names.
Existing rows in investigation_subject_attribute_values survive untouched; only the constraint that held their attribute names to a vocabulary is lost.

## Notes
The reference is an inline REFERENCES subject_attributes (name) on investigation_subject_attribute_values.attribute declared in 0005-investigation.sql, so the constraint dropped is the one Postgres named for that column.
0002-glossary-vocabulary.sql created the table and names domain/glossary/subject-attribute in its header; this migration is what supersedes that creation, and 0022 is the sibling whose destructive-but-preserving shape it follows.
The migration file's own header follows the convention every file in src/migrations already holds.
ADVISORY, from the specification — the row-preservation criteria (primary key unchanged, FK to investigations unchanged, every prior row still present) rest on no specification-level fact; they are migration-correctness properties over one DDL script, not a domain fact, so no node states them and none should — /analyse's own exclusion of persistence mechanics keeps this out of the specification. Verified against the replayed schema and the suite, not against a node.
UNDERDETERMINED, from the specification — domain/investigation/subject-attribute-value backs the criterion admitting an unregistered attribute name; nothing in this migration's own criteria excludes application code elsewhere still refusing such a name against a registry on a path no test in src/ exercises. Passes at: this task's own dependency chain (it depends on the sibling task that removes the check), which is what actually excludes it.
REMAINDER, from the specification — rules/glossary/a-vocabulary-holds-each-name-once and rules/glossary/a-glossary-read-by-an-unheld-name-is-refused are in the epic's covers but reach no criterion of this migration; both constrain only the five surviving glossary elements and are the sibling code task's own. Belongs to: the already-delivered glossary read behavior over its five remaining vocabularies, changed (for the four-vocabulary shape) by task/subject-attribute-vocabulary-removal/drop-subject-attribute-from-the-glossary-vocabularies.
