---
title: Proof for the connector-configuration persistence boundary
summary: What proves task/connector-registration/connector-configuration-persistence — the relational
  read/write path against a stand-in and a real database, the never-a-file scan, the domain-layer import
  sweep, and the tests pinning every inference the implementation recorded — composed over tests that
  already existed and pass.
implementation: sha256:1b47fbb032324bdd7dd4d74e2ce24f154247c71475cf98771fa2e320b7eb65fd
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/connector-registration-connector-configuration-persistence-suite-4
tests:
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: refuses a registration that declares no connector identity
  proves: the inference "Registration validation is limited to structural well-formedness — a non-empty
    connector identity and a configuration payload that is a plain object" — the connector-identity half
    of the minimum shape
  fails_when: registerConnector accepts a registration carrying no connector identity, or refuses it without
    naming the connector as the problem
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: treats a connector identity declared as the empty string as undeclared
  proves: the empty-input edge of the same inference — an empty identity names nothing, so it is refused
    the same way an absent one is
  fails_when: an empty-string connector identity is accepted and written as a row keyed by nothing
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: refuses a registration whose configuration is not a plain object, whether undeclared, null, or
    an array
  proves: the payload half of the structural-well-formedness inference, over each non-object shape a caller
    can submit
  fails_when: a registration whose configuration is undefined, null or an array is accepted instead of
    refused with the configuration named
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: refuses an empty registration, naming both the connector and the configuration
  proves: that one refusal reports every departure together rather than the first found
  fails_when: an empty registration is accepted, or its refusal names only one of the two problems
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: writes nothing to the store when it refuses a registration
  proves: that the refusal is raised before any write — the validate-before-write half of the recorded
    replace-by-identity inference
  fails_when: a refused registration still reaches writeConnectorConfigurations and alters what the store
    held
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: accepts a configuration payload of any shape, holding it unchanged rather than reading or validating
    a key inside it
  proves: the inference "A connector's own call configuration is stored as one opaque JSON payload ...
    no check of any key inside the payload" — the opacity the task's Notes deliberately leave to technical
    design
  fails_when: registerConnector starts reading, validating or reshaping a key inside the payload — a method
    vocabulary, an address check, a mapping — reintroducing exactly what the re-cut task removed
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: persists an accepted registration through the store
  proves: criterion "The connector's call configuration is written to and read from the system's one transactional
    relational store, never a file the deployment ships or writes." — the written-through-the-store-port
    half, at the service
  fails_when: registerConnector stops writing the accepted configuration through IConnectorConfigurationStore
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: replaces the held configuration when a connector re-registers, rather than holding a second row
  proves: the inference "Re-registering under an already-held connector identity replaces that connector's
    row whole, rather than merging it, versioning it, or refusing the second registration"
  fails_when: a re-registration merges into, versions beside, or duplicates the row already held, or is
    refused
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: keeps every other connector's configuration untouched when one connector registers
  proves: that replace-by-identity replaces only its own identity — the whole-collection write the port-shape
    inference names does not wipe unrelated connectors
  fails_when: registering one connector drops or alters another connector's held configuration
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: resolves a registered connector to its currently held configuration
  proves: criterion 1's read half at the service — readConnectorConfiguration answers the configuration
    the store holds
  fails_when: readConnectorConfiguration stops answering the held configuration, or answers it reshaped
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: resolves the absence of a connector nothing has registered, as data rather than a raised error
  proves: 'the implementation''s stated behavior that absence is answered as data ({held: false, connector})
    — the error-path-as-behavior for an unregistered connector'
  fails_when: an unregistered connector raises instead of answering its absence, or the absence answer
    loses the connector it was asked about
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: resolves the connector configuration registered after an earlier resolution already answered its
    absence
  proves: that resolution reads through the store on every call rather than remembering an earlier answer
  fails_when: the service caches a resolution, so a registration landing after an absence answer stays
    invisible
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: answers a read with the connector identity and its configuration exactly as the row holds them
  proves: criterion 1's read half at the adapter — a row of connector_configurations maps onto the ConnectorConfiguration
    the port promises, unchanged
  fails_when: the row-to-value mapping drops, renames or reshapes either column
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: answers the second call's own rows, never a value the first call already answered
  proves: the adapter reads fresh from the connection on every call — the store, not a memory, is where
    the configuration lives
  fails_when: the adapter caches rows between calls
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, when a read is
    refused
  proves: the failing-dependency edge on the read path — a driver refusal surfaces as ConnectorConfigurationStoreError
    with the original as cause, never as a bare driver error
  fails_when: a driver failure escapes untyped, or the cause is dropped so nothing traces back to what
    the driver said
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: answers the empty registry when the table currently holds no row
  proves: the empty-collection edge — a table with no rows answers an empty array, never an absence or
    an error
  fails_when: an empty table makes readConnectorConfigurations raise or answer anything but []
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: deletes every existing row and inserts exactly the given configurations, in that order, inside
    one transaction
  proves: criterion 1's "transactional" word plus the whole-collection port-shape inference — BEGIN, DELETE,
    one parameterized INSERT per configuration, COMMIT, one release
  fails_when: the replace runs outside a transaction, skips the DELETE, interpolates a value into statement
    text, or leaks the checked-out client
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: issues only the DELETE and still commits, when replacing the whole table with an empty set
  proves: the empty-input edge of the whole replace — writing an empty collection is a legitimate wipe,
    not a skipped or failed write
  fails_when: an empty replace issues stray INSERTs, skips the commit, or refuses
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: raises this store's own typed error, carrying the driver failure as its cause, and rolls back,
    when the write is refused
  proves: the failing-dependency edge on the write path — a mid-replace driver failure rolls the transaction
    back and surfaces typed with its cause
  fails_when: a failed INSERT leaves the transaction uncommitted-but-unrolled-back, the client unreleased,
    or the failure untyped
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: this store and the connector-registry module it implements open no file on disk
  proves: criterion 1's "never a file the deployment ships or writes" clause, over the four modules a
    configuration actually travels through — value types, port, service, relational adapter
  fails_when: any of the four scanned modules gains a node:fs (or require('fs')) reach, moving configuration
    storage toward a file
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: persists and reads back a connector configuration exactly as given
  proves: criterion "The connector's call configuration is written to and read from the system's one transactional
    relational store, never a file the deployment ships or writes." — the real-effect half, against the
    externally provisioned PostgreSQL every other record uses
  fails_when: a write stops landing as a row of public.connector_configurations, or a read stops answering
    what the database holds
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: answers a read as the database holds it right now, never a value an earlier read already answered
  proves: read-fresh-on-every-call against the real database, after a first read has baited any cache
  fails_when: a second read answers the first read's rows after the table changed
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: leaves the table's earlier content untouched, when a later insert inside one replace violates
    a real constraint
  proves: criterion 1's "transactional" word against a real constraint — a replace that fails partway
    rolls back whole, so the table never holds a mix of the old and new sets
  fails_when: a primary-key collision mid-replace commits the DELETE or the earlier INSERTs, leaving the
    table half-replaced
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: 'excludes a write with no connector identity: the write is refused by the real database and nothing
    is stored'
  proves: migration 0008's connector NOT NULL, observed as a refusal (SQLSTATE 23502) through the store's
    typed error with nothing persisted
  fails_when: the schema stops requiring a connector identity, or a refused write leaves a row behind
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: 'excludes a write with no configuration payload: the write is refused by the real database and
    nothing is stored'
  proves: migration 0008's configuration NOT NULL, observed the same way
  fails_when: the schema stops requiring a configuration payload, or a refused write leaves a row behind
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: holds only the connector and configuration columns — no transport-specific column such as a method
    or an address
  proves: the inference "The table is named connector_configurations ... and holds no transport-specific
    column" — the opaque-payload schema the task's Notes leave to technical design, pinned so it stays
    a decision rather than an accident
  fails_when: a named column for a method, an address, a request or response mapping is added to the table,
    encoding a shape no specification node states
- file: src/__tests__/integration/factories/connector-configuration-registry.factory.spec.ts
  name: persists a registered connector configuration as a row RelationalConnectorConfigurationStore reads
    back, through the real factory wiring
  proves: criterion 1 end to end through the inference "A wiring factory (createConnectorConfigurationRegistry)
    was added under src/factories/" — the factory wires the service over the relational store from one
    shared DatabaseConnection, and a registration through it lands as a row
  fails_when: createConnectorConfigurationRegistry stops wiring the relational store behind the service,
    or a registration through the real wiring stops landing in the database
- file: src/__tests__/integration/factories/connector-configuration-registry.factory.spec.ts
  name: replaces the persisted configuration when the same connector registers again through the real
    wiring
  proves: the replace-on-reregister inference against the real database — one row per connector identity
    survives a second registration, holding the newer payload
  fails_when: a re-registration through the real wiring duplicates the row or keeps the older payload
- file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  name: none of these modules imports the connector-configuration store or its relational adapter, by
    any relative path
  proves: criterion "No module under the domain layer (case behavior, investigation factory, evaluation,
    vocabulary) imports the connector-configuration store, its persistence driver, or any HTTP client
    package directly." — the store-and-adapter clause, swept over every module of the case, glossary,
    capability-registry and investigation directories; the file's own header records this test as this
    task's extension
  fails_when: any module under those four directories gains an import reaching connector-configuration-store.port
    or relational-connector-configuration-store.repository by any relative path
- file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  name: none of these modules imports an HTTP client package
  proves: the same criterion's HTTP-client clause, over the same total sweep — currently an empty intersection
    since this task introduced no HTTP client, standing as the guard should one be added to a domain module
    later; also this task's extension per the file's own header
  fails_when: any module under the four domain directories imports axios, node-fetch, got, undici, ws,
    superagent or request
- file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  name: the case, glossary, capability-registry and investigation modules import no driver and no framework
  proves: the same criterion's "its persistence driver" clause — pg and every sibling driver are in this
    sweep's forbidden list. Pre-existing, written for task/relational-substrate/database-connection; this
    proof leans on it rather than duplicating the sweep, and records the provenance here so the pairing
    can be checked
  fails_when: any module under the four domain directories imports pg or another database driver directly
- file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  name: applies the five scripts, in the order their file names number them, to a fresh empty database
    and produces every relation the model needs and none it does not
  proves: that migrations/0008-connector-configuration.sql replays as part of the one migration sequence
    — connector_configurations is in this test's expected-table totality, extended for this task per the
    file's own header comment. The file belongs to task/relational-substrate/schema-migrations; only its
    0008 bearing is claimed here
  fails_when: migration 0008 stops creating connector_configurations on a fresh database, or breaks the
    replay of the sequence around it
not_applicable:
- edge_case: a boundary at each end of a stated range
  why: no criterion and neither bound constraint states a numeric range, a length bound or a size limit
    over a connector identity or its payload — a boundary test would assert a limit nobody decided
- edge_case: two registrations of one connector at once
  why: the service's read-filter-write over the whole collection is last-write-wins under concurrency,
    but no criterion and no bound node states concurrent behavior, so a test would pin a guarantee nobody
    made; the interleaving risk is named in untested so it reads as seen rather than missed
- edge_case: a dependency that answers slowly
  why: no node and no criterion states a timeout or latency behavior for this store; what is stated —
    a dependency that fails — is tested on both the read and the write path as the typed error with its
    cause
- edge_case: a payload above a size limit
  why: registerConnector is not a published HTTP operation per the scope's own framing, no middleware
    boundary is part of this task, and nothing bound states a payload bound for the registry
untested:
- The no-filesystem source scan covers exactly the four modules a configuration travels through (value
  types, port, service, relational adapter); the factory and the two error classes this task also shipped
  sit outside it. Neither is on the read or write path, so criterion 1's "never a file" stands proven
  over the path a configuration takes — but a filesystem reach added to the factory later would fail no
  test here.
- Two concurrent registerConnector calls interleaving their whole-collection read and write can drop one
  registration (last write wins); nothing bound states concurrent behavior, so nothing proves or pins
  what happens.
- The criterion-2 sweep audits the four directories the criterion enumerates (case, glossary, capability-registry,
  investigation). A domain module landing in a new directory later would sit outside the sweep's totality,
  which is scoped by the criterion's own enumeration rather than by the whole tree.
divergences:
- cites: STK-08
  file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than parsed through config/env.ts's
    loadEnv Zod schema.
  why: loadEnv refuses unless every other application variable is also configured, which this store-only
    suite has no use for; the same departure is already disclosed by database-access.spec.ts and isolated-connection.spec.ts
    for the same reason, and the file's own header discloses it in place.
- cites: STK-08
  file: src/__tests__/integration/factories/connector-configuration-registry.factory.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than through loadEnv, the same way.
  why: same reasoning as the store integration suite — one verbatim value used once, with no caller downstream
    of it, against a schema that would couple this suite to the whole application's environment.
- cites: TST-04
  file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  departure: the two tests proving criterion 2 sit in a whole-layer sweep file whose path mirrors no single
    unit under test.
  why: the criterion is a property of every module across four directories at once, so there is no one
    unit path to mirror; the sweep already existed as the total audit of exactly the layer the criterion
    names, and a second per-task copy of it would be the duplicated, partial audit that file's own header
    exists to replace.
---

## What it is

The persistence boundary for a connector's call configuration: the opaque-payload table, the relational store, the registry service and its factory, proven against a stand-in and the real database.
The judging author changed no file: every criterion and every recorded inference already had a failing-capable test on disk.

## Notes

This proof was composed after the delivery's own suite step: at delivery time the tree's suite was red on 2 pre-existing failures outside this change's file set — the closed EXPECTED_MIGRATION_FILENAMES enumeration owned by task/relational-substrate/migration-step of the relational-persistence initiative — and a record over a run that did not pass is refused, so no proof was written then.
That assertion was re-judged whole through the proof-only re-delivery of its owning task, the suite is green, and this record cites its own passing captured run.
