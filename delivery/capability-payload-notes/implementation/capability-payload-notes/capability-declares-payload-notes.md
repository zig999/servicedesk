---
target: backend
title: Capability holds its optional payload notes at registration and storage
summary: payload_notes becomes a declarable, optional attribute on Capability, carried
  through registration, contract-completeness, and the relational capability store,
  with a new additive migration column.
task: sha256:3d2b400c2efddd41a00c9bc47db1a67d38e87ab2fab5a110b6912c7353aa28d7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-payload-notes-capability-declares-payload-notes-build-2
files:
- path: src/capability-registry/capability.ts
  effect: 'Declares payload_notes as an optional (?:) readonly attribute on both Capability
    and CapabilityRegistration, matching the zod .optional()/TypeScript ?: pairing
    every other currently-optional registration field already uses. REQUIRED_REGISTRATION_ATTRIBUTES
    is left unchanged, so payload_notes is never treated as required by the contract-completeness
    check.'
- path: src/capability-registry/capability-registry.service.ts
  effect: heldCapability() now includes payload_notes in the returned Capability only
    when it is declared -- reusing the module's own isUndeclared() (undefined or empty
    string) to omit the key entirely otherwise, rather than persisting an empty-string
    value. A whole re-registration without payload_notes yields a Capability carrying
    none, never a value merged in from what was previously stored.
- path: src/http/dto/register-capability.dto.ts
  effect: registerCapabilityBodySchema gains payload_notes as z.string().optional()
    (no .min(1), since an empty string must be accepted rather than rejected at the
    boundary), following the file's own existing optional-field convention.
- path: src/persistence/relational-capability-store.repository.ts
  effect: ICapabilityRow gains payload_notes as string | null; the SELECT, INSERT/ON
    CONFLICT column lists and params array all name it; toCapability() spreads it
    in only when the row's own payload_notes is not null (the same conditional-spread
    shape relational-investigation-store.repository.ts's evidenceOf() already uses
    for result_detail), so a legacy row with SQL NULL reads back as a Capability with
    no payload_notes property, not a read failure and not an empty string.
- path: migrations/0024-capability-payload-notes.sql
  effect: New additive migration -- ALTER TABLE capabilities ADD COLUMN payload_notes
    TEXT, nullable and without a DEFAULT -- pairing the newly-declared optional attribute
    with its own column without altering any migration already applied, and without
    backfilling any value into rows that predate the column.
- path: __tests__/unit/persistence/relational-capability-store.repository.spec.ts
  effect: Updated the pre-existing upsert test's two hardcoded params-array assertions
    to include the new trailing payload_notes parameter (null), so the assertion still
    verifies identity-keyed upsert, single transaction and no DELETE without staying
    stale against this legitimate new column.
criteria:
- criterion: A register-capability submission carrying payload_notes is accepted and
    the capability standing at that name and version holds the same payload_notes
    text.
  met: true
  how: registerCapabilityBodySchema admits payload_notes; heldCapability() carries
    the declared text straight into the returned Capability; RelationalCapabilityStore.writeCapabilities()
    persists it via the new payload_notes column and readCapabilities()/toCapability()
    reads the same text back.
- criterion: A register-capability submission carrying no payload_notes is not refused
    for that absence by the contract-completeness check.
  met: true
  how: REQUIRED_REGISTRATION_ATTRIBUTES was left unchanged -- payload_notes is not
    in it -- so contractProblems() never reports it as undeclared, and refuseContractDepartures()
    never refuses on it.
- criterion: A registration whose payload_notes is an empty string yields a capability
    holding no payload notes, the same as one stating none at all.
  met: true
  how: heldCapability() runs registration.payload_notes through isUndeclared() (undefined
    or '' -> true) and omits the payload_notes key from the returned object in either
    case.
- criterion: A capability re-registered whole at the same name and version without
    payload_notes holds none afterwards, never the text an earlier registration carried.
  met: true
  how: heldCapability() builds the Capability strictly from the incoming registration
    with no merge, and the upsert's ON CONFLICT DO UPDATE SET payload_notes = EXCLUDED.payload_notes
    overwrites the stored column with NULL when the new registration declares none.
- criterion: The relation holding a registered capability has one column pairing with
    payload_notes and no column pairing with no declared attribute.
  met: true
  how: migrations/0024-capability-payload-notes.sql adds exactly one column, payload_notes,
    on the capabilities table, pairing 1:1 with domain/integration/capability's own
    payload_notes attribute.
- criterion: Applying the numbered migration scripts in order to an empty database
    produces that column with no step performed by hand.
  met: true
  how: 0024-capability-payload-notes.sql is a plain numbered .sql file, the next number
    after 0023, applied by the same replay mechanism as every sibling script, with
    no manual step.
- criterion: A capability row stored before that column existed reads back as a capability
    holding no payload notes, never as a read failure.
  met: true
  how: The migration adds payload_notes as a nullable column with no NOT NULL constraint;
    toCapability() treats row.payload_notes === null by omitting the key from the
    returned Capability rather than throwing.
nodes:
- node: domain/integration/capability
  encoded_at:
  - src/capability-registry/capability.ts
  - src/capability-registry/capability-registry.service.ts
  - src/persistence/relational-capability-store.repository.ts
  - migrations/0024-capability-payload-notes.sql
  how: payload_notes is added as the domain node's own optional (required false) string
    attribute on both Capability and CapabilityRegistration, carried through registration,
    the held object, and the store's row/read/write shapes, with the empty string
    and absence normalized to the same undeclared state per the node's Description.
- node: rules/integration/a-capability-declares-its-contract
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/http/dto/register-capability.dto.ts
  how: REQUIRED_REGISTRATION_ATTRIBUTES and the DTO's schema are left exactly as they
    were for the rule's own required attributes; payload_notes is added to neither,
    so the rule's contract-completeness refusal never fires for its absence.
- node: constraints/the-stored-schema-mirrors-the-declared-model
  encoded_at:
  - migrations/0024-capability-payload-notes.sql
  - src/persistence/relational-capability-store.repository.ts
  how: The new payload_notes column pairs 1:1 with the domain node's own newly-declared
    optional attribute.
- node: constraints/the-schema-replays-from-its-scripts
  encoded_at:
  - migrations/0024-capability-payload-notes.sql
  how: The new column arrives as the next plain numbered script (0024) rather than
    an edit to any applied script.
inferences:
- inferred: The column is TEXT, nullable, with no DEFAULT, and the read side omits
    the payload_notes key from the returned Capability when the column is NULL rather
    than exposing it as an empty string.
  from: The task's own Notes rule out the DEFAULT ''-TEXT-NOT-NULL shape used for
    a required-but-possibly-empty attribute; the nullable-column-plus-conditional-spread
    shape is inferred from result_detail's own IEvidenceRow/evidenceOf() pairing in
    relational-investigation-store.repository.ts, the only optional-attribute-with-persistence
    precedent the codebase actually holds.
- inferred: payload_notes is normalized to absent (property omitted) rather than stored/held
    as an empty string when a registration declares an empty string, by reusing capability-registry.service.ts's
    own existing isUndeclared() helper.
  from: Criterion 3's own wording and reuse of logic that already exists rather than
    duplicating it -- isUndeclared() already expresses exactly the undeclared-if-absent-or-empty
    test the criterion needs.
- inferred: The register-capability body schema admits payload_notes with z.string().optional()
    and no .min(1).
  from: 'Criterion 3 requires an empty-string submission to be accepted, not refused,
    at the boundary; the .optional()/?: pairing follows the convention the inventory
    names for every other optional registration field.'
- inferred: The new migration's filename, numbering and header-comment convention
    follow the existing migrations directory's own established form.
  from: migrations/0007-capability-concept.sql and migrations/0012-glossary-concept-description.sql,
    the precedents the inventory names for the additive-migration-after-a-shipped-table
    convention.
divergences:
- from: the ordinary two-producer split (task-implementer writes source, test-author
    writes tests)
  departure: The pre-existing test __tests__/unit/persistence/relational-capability-store.repository.spec.ts,
    from the already-closed initiative capability-registry-write-upsert-hotfix, hardcoded
    the exact 8-element positional params array for the capability upsert. This delivery's
    legitimate new payload_notes column correctly adds a 9th (null) parameter, which
    falsified that assertion at the build step. The owning initiative is closed, so
    /implement-task's normal proof-only re-delivery route (a fresh test-author over
    the owning task) is unavailable, and a new corrective /plan-work increment could
    not be cut either, since no production behavior needed correcting -- only the
    stale assertion. Per the human's explicit decision in this session, the two hardcoded
    params arrays were updated directly (by the orchestrating session, not a producer
    subagent) to include the new trailing null, without touching anything the test's
    own proof actually claims (no DELETE, one transaction, correct identity-keyed
    values).
  why: The alternative (leaving the build permanently red, or re-litigating the whole
    corrective machinery for a one-line, uncontroversial fix that follows exactly
    the shape this delivery's own change requires) cost more than the departure; disclosed
    here so a reviewer sees it was a deliberate, human-approved exception, not silent
    test-weakening -- and nothing the old test actually proves was narrowed.
preserved:
- Every currently-required Capability attribute (name, version, nature, input_schema,
  output_schema, timeout, connector, concept) keeps its existing required shape, validation
  and column.
- The whole-replacement (create-or-replace) registration flow in registerCapability()
  is unchanged.
- migrations/0003-capability-registry.sql, migrations/0007-capability-concept.sql
  and every other already-applied migration script are left byte-for-byte unedited.
- read-capability-by-identity.dto.ts and read-capability-by-identity.controller.ts
  are left untouched -- presenting payload_notes on a capability read is a sibling
  task.
deferred:
- what: Admitting payload_notes as an absent-capable field on read-capability-by-identity.dto.ts's
    response schema, and any other capability presentation surface.
  why: REMAINDER, belongs to the sibling task presenting a registered capability's
    declared attributes as the read answered them.
- what: Snapshotting capability payload_notes onto Evidence at collection time and
    rendering it into the judgment prompt.
  why: REMAINDER, belongs to the sibling tasks that snapshot capability payload_notes
    onto evidence and feed them to judgment.
- what: createCapabilitiesReader() in src/factories/capability-registry.factory.ts,
    which destructures only connector/input_schema off each stored Capability.
  why: The inventory names this only as a risk a reviewer could mistake for a place
    payload_notes needs to appear; no criterion of this task touches it.
---

## What it is

payload_notes becomes a legitimate, optional attribute a capability may declare at registration -- carried from the register-capability submission through the held Capability into the relational store's row shape, its SELECT/INSERT/ON CONFLICT statements and back out on read, with a new additive migration column and no change to any attribute already required.

## Notes

A pre-existing unit test asserting a closed-arity params array for the capability upsert was updated directly, outside the ordinary two-producer split, because the initiative that delivered it is closed and no production behavior needed correcting -- disclosed above and approved by the human in this session.
Presenting payload_notes on the identity-keyed capability read, snapshotting it onto evidence, and rendering it into the judgment prompt are each a sibling task's work, not this one's.
