---
target: backend
title: Evidence snapshots the capability's payload notes -- proof
summary: New tests demonstrate that collection snapshots the producing capability's
  payload_notes onto Evidence (present, absent, and unresolved-capability cases),
  that the snapshot survives a later re-registration untouched, that the DTO accepts
  a real value, and that migration 0025 pairs exactly one column with the new attribute
  and backfills a pre-existing row honestly; the Evidence value-object's whole declared
  shape is pinned by a type-level check.
implementation: sha256:57dc246a9e35401cb824d2fba0996b611d35316759503e731a6a6bf191c0c2ae
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-payload-notes-evidence-snapshots-capability-payload-notes-suite-3
tests:
- file: __tests__/unit/investigation/evidence.spec.ts
  name: declares every attribute domain/investigation/evidence names, each with its
    own required-or-optional shape, capability_payload_notes included as a required
    string
  proves: domain/investigation/evidence's whole declared attribute shape, including
    the newly required capability_payload_notes
  fails_when: Evidence's TS type stops matching every attribute and required/optional
    flag domain/investigation/evidence declares.
  demonstrates: domain/investigation/evidence
- file: __tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: carries the resolved capability's own declared payload_notes text onto the
    produced evidence item's capability_payload_notes, unchanged
  proves: An evidence item collected from a capability declaring payload notes carries
    capability_payload_notes holding that same text.
  fails_when: resolvedBaseOf() or evidenceOf() stops reading the resolved capability's
    own payload_notes onto capability_payload_notes, or alters the text on the way.
- file: __tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: records capability_payload_notes as the empty string for a capability that
    declares none, the same honest degradation concept_description already carries
    for a concept with none
  proves: An evidence item collected from a capability declaring no payload notes
    carries capability_payload_notes as the empty string.
  fails_when: a capability with no declared payload_notes stops defaulting to the
    empty string.
- file: __tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: records capability_payload_notes as the empty string for an observation whose
    capability never resolved, ending exactly as the result itself already records
    it
  proves: An evidence item recorded for an observation whose capability never resolved
    carries capability_payload_notes as the empty string rather than ending the collection
    differently than it already ends.
  fails_when: an unresolved-capability evidence item stops carrying capability_payload_notes
    as the empty string, or its unavailable ending changes.
- file: __tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: leaves an already-produced evidence item's capability_payload_notes unaffected
    by a later re-registration of the same producing capability, since the value is
    snapshotted once at collection rather than read again
  proves: Re-registering the producing capability after collection leaves an already-collected
    evidence item's capability_payload_notes unchanged.
  fails_when: collecting evidence and then re-registering the producing capability
    under the same concept changes the already-returned evidence item's capability_payload_notes.
- file: __tests__/unit/http/dto/evidence.dto.spec.ts
  name: validates an evidence item whose capability_payload_notes carries the producing
    capability's own free-text account, not only the empty string
  proves: The evidence representation's own validation does not refuse an evidence
    item carrying capability_payload_notes.
  fails_when: evidenceSchema refuses an evidence item carrying a non-empty capability_payload_notes.
- file: __tests__/integration/persistence/schema-migrations.spec.ts
  name: adds investigation_evidence exactly one new column, capability_payload_notes,
    when migration 0025 runs on top of every migration before it
  proves: The relation holding a collected evidence item has one column pairing with
    capability_payload_notes and no column pairing with no declared attribute; and
    applying the numbered migration scripts in order to an empty database produces
    that column with no step performed by hand.
  fails_when: migration 0025 fails to apply cleanly, or applying it adds any column
    set other than exactly [capability_payload_notes].
- file: __tests__/integration/persistence/schema-migrations.spec.ts
  name: reads an investigation_evidence row inserted before migration 0025 back with
    capability_payload_notes as the empty string once that migration runs, never a
    read failure
  proves: An evidence row stored before that column existed reads capability_payload_notes
    as the empty string, never as a read failure.
  fails_when: a pre-existing investigation_evidence row fails to read after migration
    0025 runs, or reads capability_payload_notes as anything other than the empty
    string.
not_applicable:
- edge_case: A capability re-registered with the identical payload_notes text (no
    actual change) after collection
  why: criterion 4 concerns whether re-registration of any kind changes an already-collected
    item; the written test re-registers with a genuinely different text, the stronger
    case.
- edge_case: Two evidence items collected from the same capability within one collection
    run, one snapshotting mid-way through a concurrent re-registration
  why: no criterion or node this task implements states any concurrency behavior for
    the capability registry during collection.
- edge_case: capability_payload_notes holding especially long text, non-ASCII characters,
    or characters significant to SQL
  why: the domain declares it a plain string with no length or character constraint,
    and every statement this store issues is already parameterized.
- edge_case: capability_payload_notes explicitly declared as the empty string by the
    operator, distinct from never declaring it at all
  why: both reach capability.payload_notes ?? '' through the identical code path and
    produce the identical result.
untested:
- 'domain/integration/capability: its full fact spans the whole capability contract
  -- both schemas, timeout, connector, refusal on an incomplete declaration, internal
  derivation -- almost none of which this task touches or tests; this task reads only
  the already-registered payload_notes attribute at collection time. The full node
  is decided by the capability registration task''s own tests.'
- 'constraints/the-stored-schema-mirrors-the-declared-model: its fact is scoped to
  the whole system. The new schema-migrations.spec.ts test decides only this task''s
  own scoped criterion -- this one column pairing with this one newly-declared attribute
  -- never the system-wide totality.'
- 'constraints/the-schema-replays-from-its-scripts: its fact is that the whole schema
  is reconstructible on an empty database by applying every script in order, system-wide.
  The new test decides only that migration 0025 itself, layered on every migration
  before it, replays cleanly -- not the whole-system claim.'
- 'The implementation''s inference that evidenceSchema treats capability_payload_notes
  as a required (non-optional), string-typed field, mirroring concept_description''s
  own shape: no criterion or node states what the evidence representation must do
  with an item that omits this attribute or supplies a non-string value -- criterion
  8 only requires that validation not refuse an item that carries it. This choice
  is recorded as an inference and deliberately not pinned by any test in this proof.'
divergences:
- from: the ordinary two-producer split (task-implementer writes source, test-author
    writes tests)
  departure: 'Making capability_payload_notes a required attribute on Evidence broke
    TypeScript compilation and several exact-shape runtime assertions across seventeen
    pre-existing test files that construct or compare raw Evidence-shaped literals.
    A general-purpose agent added capability_payload_notes: '''' to each affected
    fixture/assertion, mirroring exactly how concept_description already appears beside
    it in the same literals, and corrected two assertions in relational-investigation-store.repository.spec.ts
    (the exact INSERT params array, and a slice-window offset) to account for the
    new trailing column. No assertion was weakened; only the missing field and the
    shifted offsets were added/corrected. Disclosed on the implementation record.'
  why: Recorded here as well since two of this proof's own tests sit in files (evidence-collection-stage.spec.ts,
    relational-investigation-store's own sibling assertions) that also received this
    sweep.
- from: the ordinary two-producer split (task-implementer writes source, test-author
    writes tests)
  departure: The new migration-0025 test the test-author wrote in schema-migrations.spec.ts's
    own async arrow function exceeded the project's max-lines-per-function lint rule
    (35 lines, limit 30). The orchestrating session extracted a shared applyMigrationsBefore(client,
    targetPrefix) helper (mirroring the existing repeated apply-then-target pattern
    already used by the sibling 0020/0023 tests) and rewrote the test to use it, cutting
    it under the limit without removing any assertion.
  why: A mechanical extraction of an already-repeated pattern in the same file costs
    less than sending the whole test back to be rewritten from scratch.
- from: the ordinary two-producer split (task-implementer writes source, test-author
    writes tests)
  departure: The same new test also reused seedMinimalPreMigrationVocabulary(), a
    helper that inserts into subject_attributes -- a table migration 0023 (applied
    before 0025) already dropped -- causing a runtime 'relation "subject_attributes"
    does not exist' failure. The orchestrating session added a new seedMinimalVocabulary(client,
    concept) helper (mirroring the main beforeAll's own post-0023 seeding, without
    the dropped table) and pointed the test at it instead.
  why: 'The pre-0023 helper''s own field (concept: ''unused-before-0023'') already
    documents it as scoped to schemas before that drop; reusing it past 0023 was the
    wrong helper for the wrong schema stage, and the fix is choosing the already-correct
    pattern used elsewhere in the same file, not a new invention.'
---

## What it is

New tests prove Evidence's own capability_payload_notes shape, its snapshot from the producing capability at collection (present, absent, and unresolved-capability cases), its immunity to a later re-registration, its acceptance at the DTO boundary, and migration 0025's single-column addition and honest backfill on pre-existing rows.

## Notes

None.
