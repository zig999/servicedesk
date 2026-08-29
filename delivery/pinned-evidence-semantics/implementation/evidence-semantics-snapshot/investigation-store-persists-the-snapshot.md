---
title: The investigation store persists and reads back an evidence item's snapshotted
  semantics
summary: A new additive migration gives investigation_evidence a fields (JSONB) and
  a concept_description (TEXT) column, and the relational investigation store's write
  and read paths carry both for real, replacing the sibling task's disclosed placeholder.
task: sha256:67d07a4c5631e041d17bc45ab91fb68976bf11590b92b6e149308efee681a5e1
files:
  - path: migrations/0013-investigation-evidence-semantics-snapshot.sql
    effect: >-
      New file. Adds two columns to investigation_evidence, additively: fields
      (JSONB NOT NULL DEFAULT '[]'::jsonb) and concept_description (TEXT NOT
      NULL DEFAULT ''). No other table's column, and no existing row of any
      table, is touched. The DEFAULT on each column backfills every row this
      script finds already stored and stays on the column afterward, since
      every write this store performs from here forward always supplies both
      values explicitly.
  - path: src/persistence/relational-investigation-store.repository.ts
    effect: >-
      evidenceStatement() (the write path) now inserts fields and
      concept_description alongside every column it already wrote:
      concept_description travels as the plain string it already is,
      and fields is serialized explicitly (JSON.stringify) before being sent,
      since it is a real array of FieldSemantics objects rather than
      already-held JSON text. evidenceOf() (the read path) now answers
      row.fields and row.concept_description directly — replacing the sibling
      task's disclosed, compile-preserving placeholder (fields: [],
      concept_description: '') with the real round-trip. IEvidenceRow gains
      both columns, fields typed readonly FieldSemantics[] directly (node-postgres
      already parses a jsonb column into a plain JS value on read, the same
      driver auto-conversion IConnectorConfigurationRow.configuration already
      documents for a different jsonb column). The module's own header comment
      and evidenceOf()'s own docstring are updated to describe this column
      pair and the honest-empty legacy-row degradation it answers to, in place
      of the sibling task's own now-resolved "no migration exists yet" note.
criteria:
  - criterion: >-
      The relational investigation store persists an evidence item's fields
      and concept_description and reads them back unchanged.
    met: true
    how: >-
      evidenceStatement() now includes fields and concept_description in
      investigation_evidence's own INSERT (JSON.stringify(evidence.fields) and
      evidence.concept_description as its own two new positional parameters),
      and evidenceOf() answers row.fields and row.concept_description straight
      from the two new columns the SELECT in readEvidence() now names. Because
      node-postgres parses a jsonb column back into a plain JS value on read,
      what evidenceOf() answers for fields is structurally identical to what
      evidenceStatement() serialized, and concept_description is a plain
      string column carried through unchanged in both directions — an item
      written and then read back in the same test carries the same fields
      array and the same concept_description string it was given.
  - criterion: >-
      An investigation stored before this migration still reads back whole,
      its evidence's fields and concept_description degrading to their own
      honest empty values rather than a read failure.
    met: true
    how: >-
      migrations/0013's own fields column carries DEFAULT '[]'::jsonb and its
      own concept_description column carries DEFAULT '', so every
      investigation_evidence row already stored before this migration ran
      answers both columns with those defaults rather than SQL NULL or a
      missing column — readEvidence()'s own SELECT and evidenceOf()'s own
      assembly read every row the identical way regardless of when it was
      written, so a legacy row's evidence is assembled with fields: [] and
      concept_description: '' exactly as domain/investigation/evidence's own
      "a concept collected before it declared a description snapshots an
      empty one" and "a concept whose capability never resolved snapshots no
      fields at all" already sanction, never a thrown error and never a
      partial read.
  - criterion: >-
      The migration adding these columns is additive: no existing row of any
      other table is altered or removed.
    met: true
    how: >-
      migrations/0013-investigation-evidence-semantics-snapshot.sql contains
      exactly two ALTER TABLE ... ADD COLUMN statements against
      investigation_evidence and nothing else — no DELETE, no UPDATE, no DROP,
      no statement naming any other relation. Both new columns carry a
      DEFAULT, so the ADD COLUMN itself backfills every already-stored
      investigation_evidence row without rewriting any of its other columns
      and without touching investigations, investigation_evaluations,
      investigation_evaluation_citations, investigation_subject_attribute_values
      or any table this migration does not name.
nodes:
  - node: domain/investigation/evidence
    encoded_at:
      - migrations/0013-investigation-evidence-semantics-snapshot.sql
      - src/persistence/relational-investigation-store.repository.ts
    how: >-
      The node's own fields and concept_description attributes now round-trip
      through investigation_evidence's own two new columns: evidenceStatement()
      writes both on every insert and evidenceOf() reads both back on every
      select, in place of the sibling task's own disclosed placeholder. The
      node's own honest-degradation language ("a concept collected before it
      declared a description snapshots an empty one," "a concept whose
      capability never resolved snapshots no fields at all") is what
      migrations/0013's own DEFAULT '[]'::jsonb and DEFAULT '' encode for a
      row stored before this migration ran, so a legacy investigation's
      evidence degrades exactly as the node already sanctions rather than
      failing to read.
  - node: domain/investigation/field-semantics
    encoded_at:
      - migrations/0013-investigation-evidence-semantics-snapshot.sql
      - src/persistence/relational-investigation-store.repository.ts
    how: >-
      This task adds no new reading of a capability's output schema and
      changes nothing about how one FieldSemantics entry's own name, type and
      description are produced — field-semantics.ts's own fieldSemanticsOf,
      delivered by the sibling task, is untouched. What this task adds is
      purely persistence: the array fieldSemanticsOf already produces travels
      through investigation_evidence's own new fields column exactly as
      field-semantics.ts already shapes it (serialized, then parsed back by
      the driver), so the node's own three declared attributes reach a stored
      row and come back unchanged, without this task deciding or validating
      any further content of that shape itself.
inferences:
  - inferred: >-
      fields is stored as one JSONB column on investigation_evidence holding
      the whole snapshotted array serialized, rather than a child table
      decomposing each field-semantics entry's own name/type/description into
      named columns of its own (the shape investigation_evaluation_citations
      and investigation_subject_attribute_values already use for their own
      many:true attributes).
    from: >-
      The task's own text names "a JSON/JSONB column serializing the array"
      as its own example and asks for the decision to be disclosed "the same
      way an existing many:true or structured attribute elsewhere in this
      schema was decided" — migrations/0008-connector-configuration.sql
      already decided exactly this for a structured value this schema does
      not decompose into named columns, and
      relational-connector-configuration-store.repository.ts already
      establishes the read/write shape (explicit serialization on write,
      driver auto-parse on read) a JSONB column takes under this project's own
      driver; a child table would additionally need an ordinal or a
      name-ordered read to stay deterministic, which the node's own text gives
      no reason to require for a value nothing else in this schema orders.
  - inferred: >-
      fields is serialized with JSON.stringify(evidence.fields) before being
      sent as this INSERT's own parameter, rather than passed as the JS array
      value directly.
    from: >-
      node-postgres serializes a raw JS array parameter as a Postgres array
      literal rather than as JSON, which a jsonb column's own input function
      would then reject or misread; relational-connector-configuration-store.repository.ts's
      own insertStatementFor already documents this same distinction for its
      own jsonb column, passing its domain value through unchanged only
      because that value already holds JSON text — evidence.fields holds a
      real array instead, so the explicit JSON.stringify step this task adds
      is what the identical driver behavior requires here.
  - inferred: >-
      IEvidenceRow.fields is typed readonly FieldSemantics[] directly, trusting
      the driver's own parsed shape rather than reading it as unknown and
      narrowing it.
    from: >-
      IConnectorConfigurationRow.configuration is already typed
      Record<string, unknown> directly on the identical trust basis (node-postgres
      parses a jsonb column into a plain JS value on read), and this store's
      own existing convention (row.result, row.verdict, row.reason) narrows a
      stored value only where it is drawn from a small enumeration a CHECK
      constraint bounds — fields carries no such enumeration to narrow
      against, so trusting the column's own already-established shape follows
      the same convention rather than inventing a new one.
  - inferred: >-
      The migration file is numbered 0013 and named
      0013-investigation-evidence-semantics-snapshot.sql.
    from: >-
      migrations/0012-glossary-concept-description.sql is the latest existing
      script (MIG-01's own zero-padded, ordered numbering,
      constraints/the-schema-replays-from-its-scripts), so the next additive
      migration takes the next number; the name follows the existing
      convention of naming a migration after what it adds rather than after
      the task that added it (migrations/0011-investigation-evidence-elapsed-ms.sql,
      migrations/0012-glossary-concept-description.sql).
preserved:
  - >-
    Every other column investigation_evidence already carried (concept,
    inputs, observation, observed_at, ttl, origin, result, result_detail,
    capability_name, capability_version, elapsed_ms) is written and read
    exactly as before; fields and concept_description are additive to the
    row, never a replacement of anything already there.
  - >-
    write()'s own whole-transaction guarantee, write-once refusal through
    InvestigationAlreadyStoredError on the root row's own primary key, and
    every other child table's own write (investigation_subject_attribute_values,
    investigation_evaluations, investigation_evaluation_citations) are
    untouched — this task adds two parameters to one existing INSERT and
    changes no transaction boundary.
  - >-
    read()'s own whole-transaction guarantee, its ORDER BY concept
    determinism for evidence, and the untouched read paths for evaluations,
    citations and subject-attribute-values are unaffected — this task adds
    two columns to one existing SELECT and one existing assembly function.
  - >-
    contentHash()'s own deterministic JSON serialization of the assembled
    Investigation document is unaffected in its own mechanism: investigationOf()
    still builds its object literal in the same key order it always has:
    the only change is that evidenceOf()'s own two answered fields (fields,
    concept_description) now come from real columns instead of literal
    placeholders, so the same already-stored investigation's own hash is
    computed the same way as before, over whatever those two fields now
    honestly answer.
  - >-
    Every other table's own schema and every other table's own already-stored
    rows (investigations, investigation_evaluations,
    investigation_evaluation_citations, investigation_subject_attribute_values,
    concepts, concept_accepts, capabilities, connector_configurations, and
    every table any other migration declares) are untouched by
    migrations/0013, which names only investigation_evidence.
---

## What it is
A new additive migration (migrations/0013-investigation-evidence-semantics-snapshot.sql) gives investigation_evidence a fields (JSONB) column and a concept_description (TEXT) column, each carrying a DEFAULT that also serves as the honest-empty degradation for a row stored before this migration ran. relational-investigation-store.repository.ts's write path (evidenceStatement()) now writes both columns on every insert, and its read path (evidenceOf()) now reads both back for real, replacing the sibling task's disclosed, compile-preserving placeholder (fields: [], concept_description: '').

## Notes
None.
