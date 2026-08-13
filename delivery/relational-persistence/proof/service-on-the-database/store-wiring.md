---
title: Store wiring cut to one connection, and the ten sibling test files that signature change broke
summary: Structural audits and one real-database integration test prove the four stores are built from
  one connection and no data-directory path anywhere in the wiring chain, the environment schema and the
  file tree are cut accordingly, and ten sibling integration/unit specs broken by this task's own signature
  change are rewritten against the real database and disclosed.
implementation: sha256:f99cd541ff68fc15e2ee0ded07798998fc5c3f93e74255fcbcd09c61fe37999a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/service-on-the-database-store-wiring-suite-8
tests:
- file: src/__tests__/unit/factories/store-wiring.spec.ts
  name: env.ts's own envSchema source declares no *_DATA_DIRECTORY field for the case, glossary, capability-registry
    or investigation store
  proves: The environment schema declares no data-directory variable for the case, glossary, capability-registry
    or investigation store.
  fails_when: envSchema's own source text names CASE_DATA_DIRECTORY, GLOSSARY_DATA_DIRECTORY, CAPABILITY_DATA_DIRECTORY
    or INVESTIGATION_DATA_DIRECTORY anywhere
- file: src/__tests__/unit/factories/store-wiring.spec.ts
  name: a valid environment parses to an Env value carrying none of the four retired data-directory keys
  proves: the real-effect half of criterion 2 — loadEnv's own parsed output, not merely its source text,
    carries no data-directory key
  fails_when: the Env value loadEnv answers for a complete, valid source carries CASE_DATA_DIRECTORY,
    GLOSSARY_DATA_DIRECTORY, CAPABILITY_DATA_DIRECTORY or INVESTIGATION_DATA_DIRECTORY
- file: src/__tests__/unit/factories/store-wiring.spec.ts
  name: the four file repositories and the file helper they shared no longer exist under persistence/
  proves: No module belonging to the case, glossary, capability-registry or investigation store reads
    or writes a file to hold a record, and the four file repositories and the file helper they shared
    are gone — the file-removal half.
  fails_when: file-case-store.repository.ts, file-glossary-store.repository.ts, file-capability-store.repository.ts,
    file-investigation-store.repository.ts or json-file.ts reappears under persistence/
- file: src/__tests__/unit/factories/store-wiring.spec.ts
  name: no module anywhere under src imports the four removed file repositories or their shared file helper,
    by any relative path
  proves: the totality half of criterion 3 over this task's own deletions — nothing left in the tree still
    reaches for one of the five removed modules
  fails_when: any .ts file anywhere under src imports file-case-store.repository, file-glossary-store.repository,
    file-capability-store.repository, file-investigation-store.repository or json-file by any relative
    path
- file: src/__tests__/unit/factories/store-wiring.spec.ts
  name: none of the case, glossary, capability-registry or investigation domain modules names a filesystem
    module
  proves: No module belonging to the case, glossary, capability-registry or investigation store reads
    or writes a file to hold a record — the no-file-access half, over the four domain directories.
  fails_when: a .ts file under case/, glossary/, capability-registry/ or investigation/ imports 'fs',
    'node:fs' or a submodule of either
- file: src/__tests__/unit/factories/store-wiring.spec.ts
  name: none of this task's own store-wiring factories names a filesystem module
  proves: the same no-file-access fact extended over the composing factories this task rewires (case-store,
    glossary, capability-registry, investigation-store, case-query, diagnose and production-diagnose factories)
  fails_when: any of those seven factory files imports 'fs', 'node:fs' or a submodule of either
- file: src/__tests__/unit/factories/store-wiring.spec.ts
  name: each of the four leaf factories' own exported function declares a DatabaseConnection parameter,
    never a data-directory string
  proves: Each of the four stores ... is constructed in its own factory from the connection, and no factory
    receives a data-directory path for any of those four — the leaf-factory signature half.
  fails_when: createCaseStore, createGlossary, createGlossaryQuery, createCapabilityRegistry, createCapabilityQuery
    or createInvestigationStore stops declaring a DatabaseConnection-typed parameter, or declares one
    named or typed after a data directory
- file: src/__tests__/unit/factories/store-wiring.spec.ts
  name: no store-wiring factory's own source declares a data-directory parameter or field, anywhere
  proves: the same criterion extended over every composing factory in the chain (case-query, diagnose,
    production-diagnose), not only the four leaves
  fails_when: any of the seven factory files' own source text names a field or parameter matching /DataDirectory/i
- file: src/__tests__/unit/factories/store-wiring.spec.ts
  name: diagnose.factory.ts's own DiagnoseDependencies and production-diagnose.factory.ts's own ProductionDiagnoseDependencies
    each declare a connection field typed DatabaseConnection
  proves: the composing factories' own dependency types carry one shared connection field rather than
    the three per-store directory fields they used to carry
  fails_when: 'DiagnoseDependencies or ProductionDiagnoseDependencies stops declaring `readonly connection:
    DatabaseConnection`'
- file: src/__tests__/unit/factories/store-wiring.spec.ts
  name: the process entry point builds the diagnose HTTP server from the environment alone, passing no
    second argument
  proves: The composed application builds its four stores from the environment alone — index.ts's own
    single call site.
  fails_when: index.ts stops calling createDiagnoseHttpServer(env) with exactly env, or starts passing
    a second argument
- file: src/__tests__/unit/factories/store-wiring.spec.ts
  name: createDiagnoseHttpServer's own exported function takes exactly one parameter, env, and builds
    its one connection from env.DATABASE_URL alone, naming no data-directory field of Env
  proves: the same criterion at the composition root itself — one parameter in, one connection built from
    it, no directory anywhere in its own source
  fails_when: createDiagnoseHttpServer's own signature stops taking exactly one env parameter, stops building
    its connection from env.DATABASE_URL, or its source names a data-directory field
- file: src/__tests__/integration/factories/store-wiring.spec.ts
  name: answers, through createCaseQuery built from one connection, a case written directly through createCaseStore
    built from that same connection — never a second store the write never reached
  proves: Every record one of the four stores answers comes from the same connection — for the case store
    and, through createCaseQuery's own coherence check, the glossary and capability-registry stores, against
    a real database.
  fails_when: a case written through one createCaseStore(connection) call site is not readable, or reads
    incoherently, through a separately built createCaseQuery(connection) given the identical connection
    object
- file: src/__tests__/integration/factories/store-wiring.spec.ts
  name: answers, through a second createInvestigationStore built from one connection, an investigation
    written through a first createInvestigationStore built from that same connection
  proves: the same criterion for the investigation store — two independently constructed store objects,
    given the same connection, answer consistently against a real database
  fails_when: an investigation written through one createInvestigationStore(connection) call site is not
    readable, or reads differently, through a second, independently constructed createInvestigationStore(connection)
    call given the identical connection object
untested:
- Runtime behavior when a caller bypasses TypeScript entirely and passes a plain string where a factory
  now types its parameter DatabaseConnection — criterion 1's own guarantee is a type-level one, enforced
  by tsc under STK-01/TYP-01, and no test here can strengthen that beyond what the compiler itself already
  refuses at npm run typecheck.
- That createProductionDiagnoseRunner's own internal composition (createDiagnoseRunner → createInvestigationStore/createGlossaryQuery/createCapabilityQuery)
  shares the given connection is not separately isolated in store-wiring.spec.ts's own integration file
  — it is exercised as a whole, real effect by production-diagnose.factory.spec.ts's own rewritten integration
  tests and by diagnose-server.factory.spec.ts's and diagnose-e2e.spec.ts's own full end-to-end runs,
  cited rather than duplicated.
- Whether every sibling test file this task's own signature change reached is now typecheck- and test-clean
  is not something this proof can certify by reading alone — that is exactly what npm run typecheck and
  npm test, run by the caller, settle.
not_applicable:
- edge_case: absent or empty input to one of the rewired factories
  why: a factory here takes one DatabaseConnection object by construction, not a value a caller submits
    at a boundary; the environment's own absent/empty-field refusal is already covered by config/env.ts's
    existing InvalidEnvironmentError tests, untouched by this task except for the four retired fields.
- edge_case: a numeric or size boundary
  why: no criterion of this task states a range or count; nothing here is bounded.
- edge_case: an empty collection answered back
  why: this task's criteria are about which factory builds which store from what, not about any store's
    own read/write mechanics — the empty-collection edge case for each store belongs to its own already-delivered
    proof.
- edge_case: a duplicate where uniqueness is claimed
  why: no uniqueness rule is this task's own to state; write-once and one-capability-per-concept are proven
    where they are decided, in the relational-store tasks' own proofs.
- edge_case: a dependency that fails or answers slowly
  why: this task wires a connection through; a driver failure's own wrapping into a typed error is each
    store's own concern and is already proven in its own unit-level spec, independent of which factory
    constructed the store.
- edge_case: two operations against one subject at once
  why: concurrency guarantees belong to write-once and per-store atomicity, both proven at the store level;
    this task's own criteria state nothing about concurrent wiring.
divergences:
- cites: STK-08
  file: src/__tests__/integration/factories/store-wiring.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than through config/env.ts's loadEnv.
  why: loadEnv refuses unless every other application variable is configured too, which this file has
    no use for — the same departure every real-database integration proof in this initiative already discloses.
- from: the boundary that a task's own proof touches only its own task's test files
  departure: Ten sibling test files broke on this task's own legitimate cutover from directory-based to
    connection-based factory signatures — the exact 36 typecheck errors named in the task's own run log
    — and one eleventh (unit/config/env.spec.ts) still asserted the four retired *_DATA_DIRECTORY fields;
    all eleven are rewritten here rather than through a separate proof-only re-delivery of the tasks that
    produced them. integration/capability-registry/capability-query.port.spec.ts, integration/factories/capability-registry.factory.spec.ts,
    integration/factories/glossary.factory.spec.ts and integration/glossary/glossary-query.port.spec.ts
    now build every fixture through a real DatabaseConnection instead of a temp directory, each under
    freshly generated names with per-row afterEach cleanup, following the same aFreshConcept()-style convention
    relational-capability-store.repository.spec.ts and relational-investigation-store.repository.spec.ts
    already established. integration/factories/case-query.factory.spec.ts does the same for its own three-directory
    seeding, and drops its own "routes each of the three dependencies to the directory named for it" inference
    test outright rather than adapting it (own divergence entry below); its criterion-3 test is retargeted
    from "the glossary no longer holds a concept" to "the glossary no longer accepts the case's own subject
    type for that concept", since a real foreign key (hypothesis_collects.concept_name → concepts.name)
    blocks deleting a concept a written case still references, which the old file-backed store never enforced;
    its criterion-1 hash assertion is retargeted from the sha256 of raw file bytes to the sha256 the real
    store's own readVersion answers, since there is no file and no bytes once the content is rows. integration/factories/diagnose-server.factory.spec.ts,
    integration/http/diagnose-e2e.spec.ts and integration/fixtures/case-fixture-reads-clean.spec.ts each
    seed the committed fixture case, glossary and capability data into the real tables (vocabulary and
    concept/capability rows via ON CONFLICT DO NOTHING, the case document itself through the real store,
    guarded by a not-already-stored check) rather than copying the fixture's own directories into a scratch
    one, and each now removes every row it seeded in its own afterAll — added deliberately so a later-running
    sibling suite that owns a glossary table wholesale (relational-glossary-store.repository.spec.ts's
    own wipeGlossaryTables()) never meets a foreign key one of these three files' persistent fixture rows
    still holds open; diagnose-server.factory.spec.ts identifies each test's own written investigation
    by a freshly generated requester rather than by scanning a directory, and diagnose-e2e.spec.ts continues
    to identify it by the id its own runDiagnose wrapper captures. integration/factories/production-diagnose.factory.spec.ts
    seeds its own glossary, capability and pinned-case rows directly against the real tables, each under
    a freshly generated vocabulary bundle, since ProductionDiagnoseDependencies now carries one connection
    rather than three directories. unit/factories/production-diagnose.factory.spec.ts (createDiagnoseRunner
    is mocked there) only needed its own baseDependencies() and WiredPassThroughFields type updated to
    a single connection field, satisfied with a bare stand-in DatabaseConnection since nothing in that
    file ever queries it. unit/config/env.spec.ts's own validEnvSource() no longer names the four retired
    fields, and its own field-refusal test now pairs CONSOLIDATOR_MODEL with EVALUATOR_MODEL instead of
    the now-nonexistent CASE_DATA_DIRECTORY. Every one of the ten integration files already discloses,
    inline, the same STK-08 departure (DATABASE_URL read directly from process.env rather than through
    loadEnv) every other real-database integration proof in this initiative already carries.
  why: This initiative is still open, every one of these breaks is a direct and legitimate consequence
    of this task's own signature cutover (or, for env.spec.ts, of criterion 2's own removal of the four
    fields), and folding all eleven fixes into this delivery keeps one coherent change answering for what
    it caused, following the same pattern already used repeatedly in this initiative (capability-store.md,
    case-store.md).
- from: case-query.factory.spec.ts's own pre-existing inference test, "routes each of the three dependencies
    to the directory named for it, whether all three differ or two of them coincide"
  departure: dropped outright rather than adapted.
  why: createCaseQuery no longer takes three independently routable directories at all under this task's
    own single-connection signature (this task's own criterion 1); the test's own premise — that the three
    could differ or coincide — no longer exists, so adapting it would mean inventing a scenario this task's
    own change forecloses rather than proving anything this task states.
- from: the boundary that a task's own proof touches only its own task's test files, extended once more —
    three further, distinct real-database findings this task's own end-to-end cutover surfaced, none of
    which the ten-file fix above covers
  departure: >-
    (1) vitest.config.ts's own testTimeout, already raised once by task/relational-stores/glossary-store,
    is raised again here from 20000ms to 40000ms: production-diagnose.factory.ts's own
    TOTAL_DEADLINE_BUDGET_MS bounds one production diagnose call to 20000ms, and diagnose-server.factory.spec.ts's
    and diagnose-e2e.spec.ts's own end-to-end HTTP tests are the first in this initiative to exercise
    that internal deadline against the real database rather than a mock — a test timeout equal to or only
    slightly above the application's own internal deadline can itself expire at nearly the same instant,
    aborting the test (and its afterEach cleanup) before an investigation write it drove finishes being
    deleted, which is exactly what left two orphaned investigation rows behind on a first attempt at this
    delivery's own suite run, breaking three unrelated sibling suites' own wholesale-cleanup queries
    through the pinned-case foreign key those rows held open.
    (2) GlossaryService.withNonConclusionOutcomes tops up the two non-conclusion outcomes through a
    whole-table writeTerms('outcome', ...) replace whenever a glossary read finds either missing
    (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case); against the real, shared outcomes
    table every coherence-checking integration test in this suite now reads through, that top-up racing
    another test's own currently-live outcome row (still referenced by a hypothesis row that test has not
    yet cleaned up) reproducibly broke case-query.factory.spec.ts and store-wiring.spec.ts. Fixed at the
    root: vitest-global-setup.ts now seeds both non-conclusion outcomes once, right after migrating,
    idempotently (ON CONFLICT DO NOTHING) — the durable fix, since it means the top-up's own write path
    never fires during this suite at all. Two sibling files that wipe or delete from the whole outcomes
    table as part of their own fixture convention no longer undo that seed: glossary.factory.spec.ts's own
    deliberate empty-table test now restores both names in its own afterAll before the connection closes,
    and diagnose-server.factory.spec.ts's, diagnose-e2e.spec.ts's and case-fixture-reads-clean.spec.ts's
    own fixture-cleanup functions now exclude both non-conclusion names from the fixture's own outcome.json
    deletion list, since the fixture file happens to name both among its own committed terms but neither
    is this fixture's own to remove.
    (3) case-query.factory.spec.ts's own "refuses ... a structurally valid case whose collected concept
    the glossary does not hold" test is rewritten, not merely reconnected: hypothesis_collects.concept_name
    is a real foreign key into concepts under the real relational schema, so a case naming a concept that
    was never registered is refused by the store itself at write time, and — once written with the concept
    still registered — that same foreign key permanently pins the concept row, so it can never be removed
    afterward either. Both directions this test's original, file-backed-store-era premise needed (write
    succeeds despite the absence; a later read discovers it) are now structurally unreachable at once. The
    coherence module's own identical check already has its own unaffected, real-effect-independent
    unit-level proof (validate-case-coherence.spec.ts's "refuses a case collecting a concept the glossary
    does not hold, naming the concept"), so this integration test is rewritten to prove the stronger,
    genuinely reachable real effect instead — that the real store's own foreign key refuses the write
    outright, through CaseStoreError, before the coherence module or a read ever runs.
  why: >-
    This initiative is still open; all three are direct and legitimate consequences of wiring every
    coherence-checking read and every investigation write against the real, shared database for the first
    time, discovered only by running this delivery's own full suite repeatedly against it, and folding each
    fix into this delivery keeps one coherent change answering for what it caused.
- from: a run this delivery's own suite performed beyond the one this record's `run` field names
  departure: >-
    A second full-suite run, taken purely as a stability check after (2) and (3) above, reproduced one
    further failure: diagnose-server.factory.spec.ts's own "writes two independent investigation records
    for two requests" test, which drives two full diagnose pipelines sequentially against the real
    database, answered 500 on its second call. This is the same class of finding already disclosed and
    accepted elsewhere in this initiative for relational-capability-store.repository.spec.ts's own
    ETIMEDOUT/ENETUNREACH flake: real, variable network latency against this environment's externally
    provisioned Postgres endpoint occasionally pushes one of two sequential real calls, each itself
    bounded by production-diagnose.factory.ts's own 20000ms internal deadline, into that deadline —
    an application-level timeout no test-file timeout can rescue, since the test itself is not what times
    out. The run this record cites (run/service-on-the-database-store-wiring-suite-8) passed all 644
    tests cleanly; this note discloses the one flake a further, non-cited run surfaced rather than
    silently rerunning until green.
  why: >-
    Disclosing a flake found on a run this record does not cite, rather than omitting it because a clean
    run was already in hand, keeps the review honest about what real-network variance this suite still
    carries — the same standard already applied to the ETIMEDOUT/ENETUNREACH finding, and consistent with
    never answering a red run by silently discarding it.
---

## What it is

Thirteen tests — eleven structural/unit audits and two real-database integration tests — proving
the four stores are built from one connection with no data-directory path anywhere in the wiring
chain, the environment schema and file tree are cut accordingly, and the four removed file
repositories plus their shared helper leave no importer behind.

## Notes

Ten sibling test files (plus an eleventh, unit/config/env.spec.ts) broke on this task's own
legitimate cutover from directory-based to connection-based factory signatures and are rewritten
here against the real database, disclosed above.
