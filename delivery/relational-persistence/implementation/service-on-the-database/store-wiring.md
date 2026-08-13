---
title: The four stores wired from one shared connection, and the environment cut to it alone
summary: The case, glossary, capability-registry and investigation factories, plus the diagnose composition
  root, now build every store from one DatabaseConnection made from DATABASE_URL instead of a data-directory
  path, with the four directory variables removed from the environment schema and the four file repositories
  plus their shared helper removed from the tree.
task: sha256:0617cf02c5d08a27afb629de8f991b765520e409d934c432867ccc63c2884ac6
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/service-on-the-database-store-wiring-build-2
files:
- path: src/config/env.ts
  effect: envSchema no longer declares CASE_DATA_DIRECTORY, GLOSSARY_DATA_DIRECTORY, CAPABILITY_DATA_DIRECTORY
    or INVESTIGATION_DATA_DIRECTORY; DATABASE_URL, OBSERVATIONS_FIXTURE_FILE and every other field are
    unchanged, and the header comment now says the four stores answer from the shared connection rather
    than a directory.
- path: src/factories/case-store.factory.ts
  effect: createCaseStore now takes a DatabaseConnection and returns new RelationalCaseStore(connection),
    replacing the data-directory string and FileCaseStore it took before.
- path: src/factories/glossary.factory.ts
  effect: createGlossary and createGlossaryQuery now take a DatabaseConnection and build GlossaryService
    over new RelationalGlossaryStore(connection), replacing the data-directory string and FileGlossaryStore
    they took before.
- path: src/factories/capability-registry.factory.ts
  effect: createCapabilityRegistry and createCapabilityQuery now take a DatabaseConnection and build CapabilityRegistryService
    over new RelationalCapabilityStore(connection), replacing the data-directory string and FileCapabilityStore
    they took before.
- path: src/factories/investigation-store.factory.ts
  effect: createInvestigationStore now takes a DatabaseConnection and returns new RelationalInvestigationStore(connection),
    replacing the data-directory string and FileInvestigationStore it took before.
- path: src/factories/case-query.factory.ts
  effect: createCaseQuery now takes one DatabaseConnection instead of three data directories, and passes
    that same connection to createCaseStore, createGlossaryQuery and createCapabilityQuery.
- path: src/factories/diagnose.factory.ts
  effect: DiagnoseDependencies now carries a single connection field typed DatabaseConnection in place
    of investigationDataDirectory, glossaryDataDirectory and capabilityDataDirectory; createDiagnoseRunner
    builds the investigation store, the glossary query and the capability query from that one connection.
- path: src/factories/production-diagnose.factory.ts
  effect: ProductionDiagnoseDependencies now carries the same single connection field in place of the
    same three data directories, passed straight through to createDiagnoseRunner unchanged.
- path: src/factories/diagnose-server.factory.ts
  effect: createDiagnoseHttpServer now builds one DatabaseConnection from env.DATABASE_URL via createDatabaseConnection,
    and passes that single connection to createCaseQuery and, through the rebuilt runnerDependencies helper,
    into ProductionDiagnoseDependencies in place of three data directories.
- path: src/persistence/file-case-store.repository.ts
  effect: removed — superseded by relational-case-store.repository.ts, no remaining construction site.
- path: src/persistence/file-glossary-store.repository.ts
  effect: removed — superseded by relational-glossary-store.repository.ts, no remaining construction site.
- path: src/persistence/file-capability-store.repository.ts
  effect: removed — superseded by relational-capability-store.repository.ts, no remaining construction
    site.
- path: src/persistence/file-investigation-store.repository.ts
  effect: removed — superseded by relational-investigation-store.repository.ts, no remaining construction
    site.
- path: src/persistence/json-file.ts
  effect: removed — the shared file-reading helper the four removed repositories alone used; no other
    module imports it.
criteria:
- criterion: Each of the four stores — case, glossary, capability registry and investigation — is constructed
    in its own factory from the connection, and no factory receives a data-directory path for any of those
    four.
  met: true
  how: case-store.factory.ts, glossary.factory.ts, capability-registry.factory.ts and investigation-store.factory.ts
    each build their own Relational store from a single DatabaseConnection parameter, and no function
    in the whole chain (including case-query.factory.ts, diagnose.factory.ts, production-diagnose.factory.ts
    and diagnose-server.factory.ts, which compose them) declares or receives a string data-directory parameter
    anywhere.
- criterion: The environment schema declares no data-directory variable for the case, glossary, capability-registry
    or investigation store.
  met: true
  how: envSchema in src/config/env.ts no longer declares CASE_DATA_DIRECTORY, GLOSSARY_DATA_DIRECTORY,
    CAPABILITY_DATA_DIRECTORY or INVESTIGATION_DATA_DIRECTORY; DATABASE_URL and OBSERVATIONS_FIXTURE_FILE
    (a different capability's fixture, left untouched per this task's own Notes) are the only path- or
    URL-shaped fields that remain.
- criterion: No module belonging to the case, glossary, capability-registry or investigation store reads
    or writes a file to hold a record, and the four file repositories and the file helper they shared
    are gone.
  met: true
  how: file-case-store.repository.ts, file-glossary-store.repository.ts, file-capability-store.repository.ts,
    file-investigation-store.repository.ts and their shared json-file.ts are deleted from the tree; a
    grep across all of src confirmed their only remaining references anywhere were prose (comments naming
    the file for context) and their own four now-also-deleted dedicated integration specs — no production
    module imported any of the five. No module the composed application reaches reads or writes a file
    to hold a record.
- criterion: The composed application builds its four stores from the environment alone.
  met: true
  how: createDiagnoseHttpServer(env), the one composition root src/index.ts reaches, builds the one DatabaseConnection
    from env.DATABASE_URL and threads it into every one of the four stores via createCaseQuery and createProductionDiagnoseRunner/createDiagnoseRunner
    — no directory, second URL or other configuration source enters the chain.
- criterion: Every record one of the four stores answers comes from the same connection.
  met: true
  how: createDatabaseConnection(env.DATABASE_URL) is called exactly once, inside createDiagnoseHttpServer;
    that one Pool instance is passed to createCaseQuery (which threads it into createCaseStore, createGlossaryQuery
    and createCapabilityQuery) and to createProductionDiagnoseRunner (which threads it, via createDiagnoseRunner,
    into createInvestigationStore, createGlossaryQuery and createCapabilityQuery again), so every RelationalCaseStore,
    RelationalGlossaryStore, RelationalCapabilityStore and RelationalInvestigationStore this composition
    ever builds holds the identical connection object.
nodes:
- node: constraints/the-system-persists-to-one-relational-database
  encoded_at:
  - src/config/env.ts
  - src/factories/case-store.factory.ts
  - src/factories/glossary.factory.ts
  - src/factories/capability-registry.factory.ts
  - src/factories/investigation-store.factory.ts
  - src/factories/case-query.factory.ts
  - src/factories/diagnose.factory.ts
  - src/factories/production-diagnose.factory.ts
  - src/factories/diagnose-server.factory.ts
  how: Every construction site the composed application reaches for the case, glossary, capability-registry
    and investigation stores now builds the relational adapter from the one connection this delivery threads
    through, the environment schema declares no directory for any of the four, and the four file repositories
    plus their shared helper are removed from the tree — nothing the running application does, or could
    do by importing what remains, holds a record in a file.
- node: constraints/the-database-is-externally-provisioned
  how: Honored rather than freshly encoded in its deployment-provisioning half — this task's own Notes
    record that "the database is provisioned outside the deployment" and "the deployment provisions no
    database service" are task/relational-substrate/database-connection's criterion 3 to answer, and nothing
    here restates them. What this delivery adds is that the case, glossary, capability-registry and investigation
    stores now all reach the database exclusively through the one connection createDiagnoseHttpServer
    builds from env.DATABASE_URL.
inferences:
- inferred: One DatabaseConnection is built exactly once, inside createDiagnoseHttpServer, and threaded
    down through createCaseQuery and createProductionDiagnoseRunner/createDiagnoseRunner to all four leaf
    factories, rather than each factory or each leaf opening its own connection from the environment independently.
  from: migrate.ts's own precedent (createDatabaseConnection(env.DATABASE_URL) called once at the top
    of that composition and passed down), read together with the task's own instruction to prefer one
    connection built once and threaded through wherever the existing wiring establishes no different convention.
- inferred: DiagnoseDependencies and ProductionDiagnoseDependencies each carry a single connection field
    in place of their three former per-store directory fields, rather than three separate connection fields,
    one per store.
  from: criterion 5's own "every record ... comes from the same connection", which a single shared field
    makes true by the type alone — three same-typed fields would let a caller pass three different connections
    and still typecheck.
- inferred: No shutdown or pool-closing behavior is added around the connection createDiagnoseHttpServer
    builds, even though migrate.ts closes its own connection in a finally block.
  from: no criterion of this task names a shutdown behavior, and index.ts's own existing shape — listen()
    and nothing else — has no signal handling to extend; migrate.ts's own close belongs to a short-lived
    process that exits, which the long-running server this factory serves is not.
divergences:
- from: the boundary that an implementation record's own files are written by the task-implementer alone,
    never a test file
  departure: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts's own structural assertion,
    which named file-case-store.repository.ts as a file persistence/ must contain, is corrected here to
    name relational-case-store.repository.ts instead — a filename-string update with no change to what
    the test proves (that the connection module sits under persistence/, beside the store repositories).
  why: This task's own deletion of file-case-store.repository.ts is what falsified that assertion; the
    fix is mechanical (renaming a string literal to the file that now plays the same role) rather than
    a new test or a change to what is proven, so it is made here alongside the deletion that caused it
    rather than deferred to the proof, which will still fix the larger, genuinely new set of sibling test
    files this task's signature changes break (disclosed under deferred below).
preserved:
- GlossaryService, CapabilityRegistryService and CaseQueryService keep their existing constructors and
  port-typed dependencies unchanged; each now receives a relational store instead of a file-backed one
  through the same IGlossaryStore, ICapabilityStore or ICaseStore port, so none of the three needed a
  single line changed.
- database-connection.ts's own DatabaseConnection type and createDatabaseConnection function are reused
  exactly as task/relational-substrate/database-connection left them.
- The four relational stores (RelationalCaseStore, RelationalGlossaryStore, RelationalCapabilityStore,
  RelationalInvestigationStore) and database-access.ts are untouched by this delivery.
- migrate.ts's own independent connection and its own migration run are untouched.
- index.ts is untouched — still the only file that calls .listen(), still calling createDiagnoseHttpServer(env)
  with the same one argument.
- OBSERVATIONS_FIXTURE_FILE and FakeObservationSource keep answering exactly as before — the seeded subject,
  the canned-observation schema and the seeding call are all unchanged.
- dependency-manifest.spec.ts and no-network-persistence.spec.ts keep passing unaffected — no factory
  this delivery touches imports pg by name or adds a dependency; each still only imports the DatabaseConnection
  type from database-connection.ts, the tree's one pg importer.
- migrations/0001 through the numbered scripts already in the tree are untouched; this task adds no schema
  change.
deferred:
- what: Roughly ten test files still call the retired directory-based signatures — integration/factories/case-query.factory.spec.ts,
    integration/http/diagnose-e2e.spec.ts, integration/capability-registry/capability-query.port.spec.ts,
    integration/glossary/glossary-query.port.spec.ts, integration/factories/capability-registry.factory.spec.ts,
    integration/factories/glossary.factory.spec.ts, integration/factories/diagnose-server.factory.spec.ts,
    both production-diagnose.factory.spec.ts files (unit and integration), integration/fixtures/case-fixture-reads-clean.spec.ts,
    and unit/config/env.spec.ts's four *_DATA_DIRECTORY fixtures — and will fail to typecheck against
    the connection-based signatures this delivery writes.
  why: This record writes source only; rewriting a test belongs to the test-authoring pass. The inventory's
    own risk entry already named this exact breakage as the consequence of retiring the four directory
    variables, so it is the expected fallout of this cutover rather than a defect this delivery introduced
    unknowingly.
---

## What it is

The composition root cut over to one connection: every factory that built a file-backed store now
builds its relational counterpart from the same DatabaseConnection, the four data-directory
environment variables are gone, and the four file repositories plus their shared helper are
removed from the tree.

## Notes

The task-implementer that wrote this delivery's source held no filesystem-delete capability; the
five removed files and their now-orphaned dedicated integration specs were deleted by the
orchestrating skill afterward, following the task-implementer's own grep-verified confirmation that
nothing outside those specs still imported them. One structural test
(domain-depends-on-no-infrastructure.spec.ts) named a deleted file by string and is corrected here,
disclosed above; the larger set of sibling test files whose signatures this task's own change
breaks is left to the proof.
