---
title: Proof for the production wiring swap
summary: 'What proves task/http-observation-runtime/production-wiring-swap: the reconciled integration
  spec of the one wiring point the swap changed, observed at its two network boundaries, plus the env-schema
  tests over the retired variable — written against the implementation record that deferred exactly this
  reconciliation to this pass.'
implementation: sha256:118ddf65219c386710763319ddf711f3c7f7af385892265f18e3545742ca4a62
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/http-observation-runtime-production-wiring-swap-suite-2
tests:
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: reaches the network to observe a concept the case collects, rather than answering from FakeObservationSource's
    static fixture
  proves: Building the production diagnose pipeline no longer constructs FakeObservationSource.
  fails_when: 'createDiagnoseHttpServer goes back to constructing FakeObservationSource (or any source
    that answers without a network call): the pipeline then serves the request without ever calling fetch,
    and the stubbed global fetch records zero calls.'
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: calls each collected concept's own registered connector address, proving the pipeline's IObservationSource
    resolves through the HTTP declarative adapter's own registry-driven resolution rather than a hardcoded
    or fixture-derived one
  proves: The production diagnose pipeline's IObservationSource dependency resolves to the HTTP declarative
    adapter.
  fails_when: 'the factory wires anything but HttpDeclarativeObservationSource over the capability and
    connector-configuration registries: only that adapter resolves a configuration registered through
    createConnectorConfigurationRegistry into a call against its registered address, so the stubbed fetch
    stops seeing both registered addresses among its calls.'
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: calls each collected concept's own registered connector address, proving the pipeline's IObservationSource
    resolves through the HTTP declarative adapter's own registry-driven resolution rather than a hardcoded
    or fixture-derived one
  proves: the inference the implementation recorded — the adapter's connector-configuration query dependency
    is createConnectorConfigurationRegistry(connection)'s own return value, with no parallel createConnectorConfigurationQuery
    wrapper — so the structural-compatibility choice is pinned rather than incidental
  fails_when: 'ConnectorConfigurationRegistryService.readConnectorConfiguration stops satisfying IConnectorConfigurationQuery''s
    shape, or the factory feeds the adapter configurations from anywhere but that registry: the configurations
    this suite registers through the real registry would then never be the ones the pipeline resolves,
    and the two registered addresses would not be called.'
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: answers correctly even while the retired static observations fixture holds unparseable content,
    proving no production path still reads it
  proves: No production code path still seeds or reads the static observations fixture file.
  fails_when: 'any module on the exercised production path — createDiagnoseHttpServer''s own construction
    through a full POST /v1/diagnose — seeds or reads observations.json again: building the server or
    serving the request then meets the deliberately unparseable content and stops answering 200.'
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: answers 200 with exactly the fixture case's own declared fallback outcome, referral and drafted
    text — no verdict, citation, evidence item or determining_hypothesis — for a request naming the seeded
    canonical subject
  proves: 'what the task''s Notes name as this proof''s own to account for — the existing integration
    consumer of the fake-backed wiring still holds over the swapped wiring: the production pipeline''s
    observable answer for the fixture case (its declared fallback outcome, referral and drafted text)
    is unchanged by which adapter answers the port'
  fails_when: the swap changes what the production pipeline answers for the fixture case — the outcome,
    the referral or the drafted text drifts from what the fake-backed wiring answered before it.
- file: src/__tests__/unit/config/env.spec.ts
  name: parses an environment naming the retired OBSERVATIONS_FIXTURE_FILE variable without carrying it
    onto Env, now that no production path reads it
  proves: '"Every environment variable env.ts still declares as required has at least one remaining production
    consumer once the swap lands." — the one variable whose only production consumer the swap removed
    is dropped from envSchema rather than left declared with nothing reading it'
  fails_when: 'envSchema declares OBSERVATIONS_FIXTURE_FILE again: a source supplying it would carry it
    onto Env, and this assertion of its absence from the parsed result fails.'
- file: src/__tests__/unit/config/env.spec.ts
  name: defaults PORT to 3000 when the given environment names none
  proves: 'the required-set half of the same criterion from the other side: validEnvSource() names no
    OBSERVATIONS_FIXTURE_FILE and loadEnv accepts it as a complete, valid environment, so the retired
    variable is no longer among what env.ts declares as required'
  fails_when: 'env.ts re-declares OBSERVATIONS_FIXTURE_FILE as required: loadEnv over the fixture-less
    validEnvSource() then throws InvalidEnvironmentError instead of parsing, and this test (with every
    sibling built from the same fixture) fails.'
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: sends the caller-configured evaluator and consolidator models to the provider, both read once
    from this factory's own Env
  proves: 'the consumer half of the same criterion for EVALUATOR_MODEL and CONSOLIDATOR_MODEL: both remaining
    required variables are read from the factory''s own Env and reach the provider, so neither is an orphaned
    declaration'
  fails_when: either model variable stops being threaded from Env through runnerDependencies into the
    provider call — the mocked provider then never sees the test's own configured model names.
- file: src/__tests__/unit/investigation/observation-source-modules.spec.ts
  name: 'ships exactly two concrete classes implementing IObservationSource: the fake, and this epic''s
    own generic HTTP adapter'
  proves: the closed world the criterion-2 reading above rests on — the network-observing source the factory
    wires can only be HttpDeclarativeObservationSource, since these two are the only IObservationSource
    implementers and the fake reaches no network (an existing test, its totality owned by task/evidence-collection/observation-source-port's
    criterion 2 and the sibling adapter task's objective; cited here, not authored here)
  fails_when: a third IObservationSource implementer lands, or either named implementer is removed or
    renamed — the inference from "the pipeline calls the registered addresses" to "the HTTP declarative
    adapter answers the port" loses its ground.
- file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  name: IObservationSource is still declared as an interface in observation-source.port.ts — the one real
    port at the domain boundary this task must not be bypassed by
  proves: 'the preserved fact criterion 2 presupposes, recorded by the implementation: the swap changed
    which class answers the port, never the port itself — the "IObservationSource dependency" the criterion
    names is still a port an adapter resolves to, not a concrete type'
  fails_when: the swap (or a later edit) replaces the exported interface with a concrete class or type
    alias, so the dependency criterion 2 speaks of stops being a port.
not_applicable:
- edge_case: the two e2e specs the inventory names as consumers of the fake-backed wiring (diagnose-e2e.spec.ts,
    diagnose-persistence-deadline-e2e.spec.ts) meeting this swap
  why: both compose createDiagnoseRunner and buildApp directly with their own FakeObservationSource, never
    through createDiagnoseHttpServer, so the swap does not reach either file's construction path and no
    reconciliation was owed — the implementation record's preserved entry states this, and both files
    are unchanged.
- edge_case: a case collecting no concepts (an empty collection where observations come back)
  why: what the pipeline does over zero collected concepts is the diagnose runner's own behavior, unchanged
    by which adapter answers the port; no criterion of this task states it, and its tests live with the
    runner's own tasks.
- edge_case: an unregistered connector configuration or capability at observe time (an operation against
    state that forbids it)
  why: the refusal is the HTTP declarative adapter's own stated behavior, proven under task/http-observation-runtime/http-declarative-observation-source;
    the wiring swap adds no state of its own to refuse over.
- edge_case: a connector that fails or answers slowly (a dependency that fails or answers slowly)
  why: the failure and deadline endings are the adapter's and the runner's own criteria, proven under
    their own tasks — this task changes only which class answers the port, and asserting those endings
    here would restate a sibling's proof over its ground.
- edge_case: two diagnose requests against one subject at once
  why: no criterion of this task states concurrent behavior; a test would assert a guarantee nobody made.
    The two-requests test in the same file runs sequentially, under the http-surface task's own criterion.
- edge_case: a boundary at each end of a stated range, and a duplicate where uniqueness is claimed
  why: no criterion of this task states a range or a uniqueness claim — the registry's one-row-per-connector
    fact belongs to the connector-registration task.
untested:
- 'Criterion 3''s totality beyond the exercised path: seed.ts, migrate.ts and index.ts are never driven
  against a corrupted observations.json by any test, so that none of them reads or seeds it rests on reading
  (seed.ts reads only the glossary, capability and case fixtures; every remaining production mention of
  the fixture or the variable is a retirement comment in config/env.ts and factories/diagnose-server.factory.ts).
  No static repo-wide sweep asserts it, deliberately: three retroactive corrections in this suite record
  directory-wide sweeps breaking the moment a legitimate sibling landed, and a comment-stripping text
  sweep would claim the same over-wide ground.'
- 'diagnose-server.factory.ts regaining a node:fs import would be caught by no test: store-wiring.spec.ts''s
  own no-fs-import sweep (another task''s file, untouched here) still excludes that factory under a comment
  written when the factory legitimately read the fixture — a now-stale exclusion its owning task''s next
  pass could close.'
- 'Criterion 4''s consumer half for CONSOLIDATOR_MAX_TOKENS, POOL_SIZE, DEFAULT_CONSOLIDATION_REGISTER
  and PROMPT_VERSION: consumption is observed behaviorally only for DATABASE_URL and the two model variables
  (diagnose-server integration tests); for the other four, "has at least one remaining production consumer"
  rests on the implementation record''s named readers, and a variable regaining orphan status would surface
  through no test here.'
divergences:
- cites: STK-08
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than parsed through config/env.ts's
    loadEnv, the Zod boundary STK-08 names for environment input.
  why: loadEnv refuses unless every other application variable is configured too, which this suite has
    no use for; the same departure stands disclosed in every sibling integration proof over the same file
    shape, and this record carries tests in this file, so it is disclosed here rather than left in prose.
---

## What it is

The wiring that puts the HTTP declarative adapter, instead of the fixture-backed fake, behind IObservationSource in production, proven at the factory's two network boundaries with the retired fixture deliberately corrupted.
The judging author changed no file: the reconciled tests already on disk are the ones the implementation record deferred to this pass.

## Notes

This proof was composed after the delivery's own suite step: at delivery time the tree's suite was red on 2 pre-existing failures outside this change's file set — the closed EXPECTED_MIGRATION_FILENAMES enumeration owned by task/relational-substrate/migration-step of the relational-persistence initiative — and a record over a run that did not pass is refused, so no proof was written then.
That assertion was re-judged whole through the proof-only re-delivery of its owning task, the suite is green, and this record cites its own passing captured run.
