---
title: The relational capability store, and the concept column its schema had been missing
summary: Adds RelationalCapabilityStore, the database-backed implementation of ICapabilityStore, and the
  migration that gives capabilities the concept column domain/integration/capability now declares required.
task: sha256:994e79a4eaec5d3992a50037b0eeda7355217d27dae72656357292080f26b6ec
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-stores-capability-store-build
files:
- path: migrations/0007-capability-concept.sql
  effect: adds capabilities.concept (TEXT NOT NULL REFERENCES concepts (name)), the one column migrations/0003-capability-registry.sql
    (unmodified) shipped without because the specification's own capability node did not yet declare the
    attribute when that script was written; closes constraints/the-stored-schema-mirrors-the-declared-model's
    own gap for this element. Ships with no reverse script, since capabilities is a table no migration
    or seed script in this project populates
- path: src/persistence/relational-capability-store.repository.ts
  effect: 'new module — RelationalCapabilityStore implements ICapabilityStore against the shared database-access.ts/database-connection.ts
    seam. readCapabilities() runs one live SELECT over every column on every call, narrowing each row''s
    nature through a Set-backed guard before mapping it to a Capability. writeCapabilities() replaces
    the table''s whole content inside one transaction: a DELETE, then one INSERT per given capability.
    Every driver failure is wrapped into CapabilityStoreError, carrying the failure as its cause'
criteria:
- criterion: A read answers each registration with its name, version, nature, input schema, output schema,
    timeout and connector.
  met: true
  how: readCapabilities()'s SELECT names all seven columns explicitly and toCapability() maps every one
    of them onto the returned Capability, unchanged
- criterion: A read answers the registration as the database holds it at that call, never a value held
    from an earlier call.
  met: true
  how: readCapabilities() issues a fresh SELECT on every call — nothing memoizes a prior result — and
    writeCapabilities()'s own replace runs inside one transaction
- criterion: A registration whose nature is not read-only does not enter the store.
  met: true
  how: the only caller, CapabilityRegistryService.registerCapability (unmodified), refuses a non-read-only
    registration before it ever calls writeCapabilities()
- criterion: A registration whose nature is read-only is not refused on that ground.
  met: true
  how: nothing in this store refuses a read-only nature; a read-only registration reaches writeCapabilities()
    unrefused and is persisted exactly as given
- criterion: A registration that states no timeout is held with the default of sixty seconds.
  met: true
  how: the default is applied above the store, in CapabilityRegistryService.heldCapability (unmodified);
    writeCapabilities() persists whatever numeric timeout that already-defaulted Capability carries
- criterion: The store resolves each concept to exactly one capability as currently registered.
  met: true
  how: readCapabilities() answers every currently-held registration, each carrying its own concept, read
    fresh; CapabilityRegistryService.readCapability (unmodified) filters that live set by concept
nodes:
- node: domain/integration/capability
  encoded_at:
  - migrations/0007-capability-concept.sql
  - src/persistence/relational-capability-store.repository.ts
  how: every declared attribute — name, version, nature, input_schema, output_schema, timeout, connector
    and now concept — has a column and a corresponding read/write in RelationalCapabilityStore
- node: domain/integration/capability-registry
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
  how: resolve-concept's own "as currently registered" half is what readCapabilities()'s live, uncached
    read makes possible; the refusal half is answered by the unmodified service
- node: domain/integration/capability-nature
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
  how: this store reuses capability.ts's own CAPABILITY_NATURES without duplicating the values, and re-narrows
    a read row's nature to this enumeration via isCapabilityNature before returning it
- node: rules/integration/a-capability-declares-its-contract
  how: the timeout-default half is answered upstream (unmodified service); the schema/connector-required
    half is enforced by the unmodified NOT NULL columns and the unmodified contract check; this task adds
    no enforcement of its own
- node: rules/integration/a-capability-is-read-only
  how: honored, not newly encoded — the refusal already lives, unmodified, in the service; this store
    persists faithfully whatever nature it is given
- node: rules/integration/one-capability-answers-one-concept
  how: this store adds no UNIQUE constraint on concept and no independent per-concept uniqueness check,
    per the rule's own deferred-multiplicity Description and the task's own dropped criterion; the live,
    whole-replace read/write keeps "currently registered" meaningful for the service's own filter-by-concept
- node: contracts/integration/capability-registry
  how: the read-capability operation this contract publishes is unchanged; this store is what a relational
    deployment of that already-published contract now reads its answer through
- node: constraints/the-system-persists-to-one-relational-database
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
  how: reads and writes exclusively through the shared DatabaseConnection/database-access.ts seam — no
    file write, no second store
- node: constraints/the-stored-schema-mirrors-the-declared-model
  encoded_at:
  - migrations/0007-capability-concept.sql
  how: closes the one gap this constraint's own fitness function named for capability — concept now has
    a column pairing with the declared attribute
inferences:
- inferred: capabilities.concept is spelled bare ("concept"), not "concept_name", and foreign-keyed to
    concepts(name)
  from: migrations/0002 and 0005's own established convention that a single, literally-named reference
    attribute is spelled bare
- inferred: migrations/0007-capability-concept.sql ships with no reverse script
  from: precedent and MIG-03's own stated condition not being met — capabilities is a table no migration
    or seed script in this project populates
- inferred: RelationalCapabilityStore adds no UNIQUE constraint on capabilities.concept and no independent
    per-concept uniqueness check of its own
  from: the rule's own deferred-multiplicity Description and this task's own Notes explicitly dropping
    the criterion that would have required refusing a second registration
- inferred: readCapabilities()/writeCapabilities() include and require concept on every Capability even
    though criterion 1's own enumeration does not name it
  from: domain/integration/capability's own corrected attribute list marking concept required, criterion
    6's own dependence on it, and the pre-existing Capability type itself already declaring it required
- inferred: isCapabilityNature is a locally-declared, non-exported, Set-backed guard reusing CAPABILITY_NATURES,
    rather than a zod schema
  from: no shared, exported schema exists to reuse; a plain guard narrows the one field a generic row
    type would otherwise leave as an unchecked assertion, without re-listing the enumeration's values
preserved:
- persistence/file-capability-store.repository.ts and its own proof keep behaving exactly as before —
  untouched; the production factory still wires FileCapabilityStore, unaffected by this task.
- capability-registry.service.ts's own contract validation, read-only refusal, default-timeout application,
  per-concept resolution and duplicate-answer refusal (all unmodified) keep deciding exactly what they
  decided before.
- migrations/0001 through 0006 are untouched; 0007 only adds one column to one existing table.
- no-network-persistence.spec.ts and dependency-manifest.spec.ts keep passing as written.
deferred:
- what: wiring RelationalCapabilityStore into src/factories/capability-registry.factory.ts in place of
    FileCapabilityStore.
  why: no task in this plan names that cutover yet, and this task's own objective is the store's behavior
    against the database, not which store production uses
- what: src/__tests__/integration/persistence/schema-migrations.spec.ts (another task's already-delivered
    proof) inserts capability rows through three raw INSERT statements naming no concept column; against
    the new NOT NULL column, each will fail with a not-null violation.
  why: this task writes no tests and does not reach that file, which belongs to a different task's already-delivered
    record
---

## What it is

The relational adapter behind the capability registry's store port, and the one column the
schema had been missing since before the specification named it: every registration lives in one
row, read fresh on every call and replaced whole on every write.

## Notes

migrations/0003-capability-registry.sql is left untouched (a script already applied is never
edited); the concept column arrives as migrations/0007, closing the gap /analyse found and fixed.
schema-migrations.spec.ts (a sibling, already-delivered proof) inserts capability rows with no
concept column and will now fail a NOT NULL check — flagged here, not fixed, since this task
writes no tests and does not reach that file.
