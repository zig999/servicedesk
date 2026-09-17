---
target: backend
title: Capability declares its payload notes -- registration, contract-completeness
  tolerance and store round trip
summary: Eight new tests prove that payload_notes is accepted at the HTTP boundary,
  carried through registration and the domain model's Responsibility without being
  required, normalized from an empty string, overwritten (not merged) on whole re-registration,
  read back safely from a pre-existing column-less row, and paired 1:1 with its own
  migration-created column.
implementation: sha256:813b0ef02565318f3ed5b2311fb973d080e30da1175e389261d52d4047d08d28
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-payload-notes-capability-declares-payload-notes-suite-2
tests:
- file: __tests__/unit/http/register-capability.routes.spec.ts
  name: passes a stated payload_notes through to registerCapability unchanged
  proves: 'Criterion: a register-capability submission carrying payload_notes is accepted
    -- its HTTP/DTO half, that the body schema admits the field and forwards it into
    the registration object rather than stripping it.'
  fails_when: registerCapabilityBodySchema stops admitting payload_notes, or the route
    stops merging the parsed body's payload_notes into the object passed to registerCapability,
    so a submitted value never reaches the service.
- file: __tests__/unit/http/register-capability.routes.spec.ts
  name: answers 200, without refusing at the request-body boundary, for a registration
    whose payload_notes is an empty string
  proves: 'Criterion: a registration whose payload_notes is an empty string yields
    a capability holding no payload notes -- its DTO-boundary half, that an empty
    string is accepted (not refused with 400) so it can reach the service''s own undeclared-normalization.'
  fails_when: the body schema refuses an empty-string payload_notes with a 400 validation
    error instead of forwarding it to registerCapability unchanged.
- file: __tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: declares payload notes exactly where the operator supplies them, and treats
    an absent declaration as a capability that simply has none, never refusing it
    as an incomplete contract
  proves: 'Criterion: a register-capability submission carrying no payload_notes is
    not refused for that absence by the contract-completeness check; and, whole, domain/integration/capability''s
    own Responsibility that payload notes are declared where the operator supplies
    them and that an absent declaration is a capability that simply has none, never
    an incomplete one.'
  fails_when: heldCapability() stops carrying a supplied payload_notes value through
    to the returned Capability, or any contract-completeness path (REQUIRED_REGISTRATION_ATTRIBUTES
    or otherwise) starts treating an absent payload_notes as grounds for IncompleteCapabilityContractError.
  demonstrates: domain/integration/capability
- file: __tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: treats a registration whose payload_notes is an empty string the same as one
    that states none at all -- a capability holding no payload notes, not an empty
    string
  proves: 'Criterion: a registration whose payload_notes is an empty string yields
    a capability holding no payload notes, the same as one stating none at all --
    the service-level normalization.'
  fails_when: a registration whose payload_notes is the empty string is held or returned
    differently from one that states none at all -- e.g. as an empty string rather
    than an omitted key.
- file: __tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: persists a registration's payload_notes exactly as given, holding the same
    text at the identity it was registered under
  proves: 'Criterion: a register-capability submission carrying payload_notes is accepted
    and the capability standing at that name and version holds the same payload_notes
    text -- the storage round-trip half, against the real store.'
  fails_when: any of the store's three separate enumerations of a capability's attributes
    (row shape, SELECT column list, INSERT/ON CONFLICT column list) omits payload_notes,
    so the round trip through the real database loses the text.
- file: __tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: reads back a capability row stored before payload_notes existed as one holding
    no payload notes, never as a read failure
  proves: 'Criterion: a capability row stored before that column existed reads back
    as a capability holding no payload notes, never as a read failure.'
  fails_when: toCapability() throws, or answers something other than an object carrying
    no payload_notes property, for a row whose payload_notes column is SQL NULL.
- file: __tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: holds no payload_notes after a whole re-registration at the same identity
    omits it, never the text an earlier registration carried
  proves: 'Criterion: a capability re-registered whole at the same name and version
    without payload_notes holds none afterwards, never the text an earlier registration
    carried.'
  fails_when: the upsert's ON CONFLICT clause leaves the previously-stored payload_notes
    text in place instead of overwriting it to NULL when the new registration declares
    none -- e.g. a merge instead of a plain overwrite.
- file: __tests__/integration/persistence/schema-migrations.spec.ts
  name: gives capabilities exactly one column per attribute domain/integration/capability
    declares, payload_notes included, and no column pairing with none of them, after
    every migration script replays in numbered order on an empty database
  proves: 'Criteria: the relation holding a registered capability has one column pairing
    with payload_notes and no column pairing with no declared attribute; and applying
    the numbered migration scripts in order to an empty database produces that column
    with no step performed by hand.'
  fails_when: the capabilities table's column set, once every migration script replays
    on an empty database, is missing payload_notes, carries an extra column no attribute
    declares, or otherwise differs from the domain model's declared attribute set.
not_applicable:
- edge_case: A boundary at each end of a stated range for payload_notes
  why: payload_notes is a free-text, optional string with no declared length bound
    (no .min/.max beyond optionality); no criterion or node states a range for it.
- edge_case: An empty collection returned where one comes back
  why: No criterion of this task changes listCapabilities or any other listing/pagination
    behavior; payload_notes is carried on individual capability records only.
- edge_case: A duplicate where uniqueness is claimed
  why: payload_notes carries no uniqueness constraint in any node or criterion; the
    identity uniqueness (name, version) is unchanged by this task and already covered
    by pre-existing tests.
- edge_case: An operation attempted against state that forbids it
  why: Registration remains a plain create-or-replace by identity; this task introduces
    no new forbidden-state transition for payload_notes beyond the whole-replacement
    behavior criterion 4 already covers.
- edge_case: A dependency that fails or answers slowly
  why: payload_notes introduces no new dependency or failure path; the store's read/write
    failure handling (CapabilityStoreError, rollback) is unchanged by this task and
    already proven generically by pre-existing tests untouched here.
- edge_case: Two operations against one subject at once
  why: No criterion of this task addresses concurrent registration of one identity;
    concurrency for the capability store is unrelated to payload_notes specifically
    and outside this task's own criteria.
untested:
- 'rules/integration/a-capability-declares-its-contract: its statement spans input-schema
  and output-schema declaration, the sixty-second timeout default, and the HTTP 422
  IncompleteCapabilityContractError refusal for a required attribute -- all already
  decided by the sibling, already-delivered capability-registration task, per this
  task''s own Notes (REMAINDER). This task''s criteria reach only the absent-or-empty-string-is-undeclared
  clause as it applies to the new optional payload_notes attribute; the two DTO/service
  tests above evidence that fragment, but no test of this task decides the node''s
  statement whole, so it carries no demonstrates.'
- 'constraints/the-stored-schema-mirrors-the-declared-model: its statement is system-scope
  -- every column of every relation pairs with a declared attribute. The schema-migrations
  test above decides that pairing whole for the capabilities relation, which is what
  this task''s own migration touches, but not for every relation in the system; that
  totality is not this task''s own files to establish and no single spec file enumerates
  it.'
- 'constraints/the-schema-replays-from-its-scripts: its statement is likewise whole-schema,
  whole-migration-set scope -- applying every script in order produces the schema
  the current tree expects. The schema-migrations test above decides that migration
  0024 itself replays cleanly and produces exactly the intended column on a schema
  built from the full ordered replay of every script in the tree with no manual step,
  but deciding the fact whole would require enumerating every table''s every column
  against every domain element across the whole tree, which this task''s own evidence
  does not do.'
divergences:
- from: the ordinary two-producer split (task-implementer writes source, test-author
    writes tests)
  departure: 'src/__tests__/integration/persistence/schema-migrations.spec.ts''s pre-existing
    whole-schema test "holds every domain column NOT NULL except exactly the twelve
    columns the model declares optional" hardcoded a closed enumeration of every nullable
    column across the whole schema. It is owned by the already-closed initiative relational-persistence
    (its own title has been incrementally edited this same way, in place, across several
    closed initiatives since -- "five columns" originally). This delivery''s legitimate
    new nullable payload_notes column falsified it at the suite step; a failure-diagnostician
    confirmed cause: test (the migration correctly adds a nullable column with no
    NOT NULL, matching domain/integration/capability''s required: false). Per the
    human''s explicit decision, and consistent with this exact test''s own established
    history of being updated directly by whichever delivery adds the next optional
    column, the orchestrating session added the payload_notes row to the expected
    list and renamed "twelve" to "thirteen", without touching what the test otherwise
    proves.'
  why: Routing this one-line, uncontroversial update through a corrective /plan-work
    increment or a proof-only re-delivery over a closed initiative would cost more
    than the departure, and the codebase's own history already treats this exact test
    as maintained in place by each delivery that legitimately changes the schema's
    nullable-column set.
---

## What it is

Eight tests prove payload_notes end to end: accepted and forwarded at the HTTP boundary, declared without being required by the domain model's own Responsibility, normalized from an empty string to no-payload-notes at the service, overwritten (never merged) on a whole re-registration, round-tripped through the real relational store, read back safely from a column-less legacy row, and paired 1:1 with its own migration-created column across a full ordered replay.

## Notes

None.
