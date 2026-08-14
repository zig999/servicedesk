---
title: Production wiring swap — HTTP declarative adapter replaces the fixture-backed fake
summary: diagnose-server.factory.ts now constructs HttpDeclarativeObservationSource from the capability and connector-configuration registries instead of FakeObservationSource, and env.ts drops OBSERVATIONS_FIXTURE_FILE now that no production path reads it.
task: sha256:0d235aa3a46ae2525b4c9296e378c80f2c01bccd1cfdd6886762021469c07e7e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/http-observation-runtime-production-wiring-swap-build-2
files:
- path: src/factories/diagnose-server.factory.ts
  effect: 'createDiagnoseHttpServer no longer imports, constructs or seeds FakeObservationSource from observations.json; it now builds observationSource = new HttpDeclarativeObservationSource({ capabilities: createCapabilityQuery(connection), connectorConfigurations: createConnectorConfigurationRegistry(connection) }) over the same shared DatabaseConnection every other store in this composition already uses, and threads it unchanged into runnerDependencies (now typed IObservationSource rather than the concrete fake) and on into createProductionDiagnoseRunner. The readFile call, the zod fixture-record schema, the SEEDED_SUBJECT constant and the seedFixtureObservations/outcomeOf helpers are all removed along with their now-unused imports (node:fs/promises''s readFile, zod, EVIDENCE_RESULTS, FakeObservationSource, ObservationOutcome, Subject, buildSubject).'
- path: src/config/env.ts
  effect: envSchema no longer declares OBSERVATIONS_FIXTURE_FILE; the module comment is updated to say why (its only production consumer — diagnose-server.factory.ts's fixture-seeding call — is gone, so keeping it required would have left a startup-required variable with no remaining production consumer).
criteria:
- criterion: Building the production diagnose pipeline no longer constructs FakeObservationSource.
  met: true
  how: createDiagnoseHttpServer, the one production wiring point that ever imported or instantiated FakeObservationSource, no longer does either; a repository-wide search confirms every remaining `new FakeObservationSource(` call sits in a test file (unit or integration spec), never in src/factories, src/http or src/index.ts.
- criterion: The production diagnose pipeline's IObservationSource dependency resolves to the HTTP declarative adapter.
  met: true
  how: createDiagnoseHttpServer constructs `new HttpDeclarativeObservationSource({ capabilities, connectorConfigurations })` and passes it through runnerDependencies into ProductionDiagnoseDependencies.observationSource, which createProductionDiagnoseRunner (production-diagnose.factory.ts, unmodified since it only ever received IObservationSource as a dependency rather than constructing one) threads unchanged into createDiagnoseRunner.
- criterion: No production code path still seeds or reads the static observations fixture file.
  met: true
  how: the only production reader/seeder of observations.json (diagnose-server.factory.ts's removed seedFixtureObservations, driven by env.OBSERVATIONS_FIXTURE_FILE) is gone; a repository-wide search for `observations.json` and `OBSERVATIONS_FIXTURE_FILE` under src/ now matches only comments (in env.ts and diagnose-server.factory.ts, explaining the retirement) and test files, never a production module. The file itself is left on disk since it still backs non-production consumers (e.g. case-fixture-observations.spec.ts).
- criterion: Every environment variable env.ts still declares as required has at least one remaining production consumer once the swap lands.
  met: true
  how: OBSERVATIONS_FIXTURE_FILE, whose only production consumer was the now-removed seeding call, is dropped from envSchema entirely rather than left declared with nothing reading it. Every variable envSchema still declares has a confirmed production reader — DATABASE_URL and PORT (index.ts and diagnose-server.factory.ts), EVALUATOR_MODEL/EVALUATOR_MAX_TOKENS/CONSOLIDATOR_MODEL/CONSOLIDATOR_MAX_TOKENS/POOL_SIZE/DEFAULT_CONSOLIDATION_REGISTER (runnerDependencies into production-diagnose.factory.ts), and PROMPT_VERSION (buildApp's DiagnoseControllerDependencies, read in diagnose.controller.ts).
inferences:
- inferred: the connector-configuration query dependency is supplied directly from createConnectorConfigurationRegistry(connection)'s own return value, without adding a parallel createConnectorConfigurationQuery export to connector-configuration-registry.factory.ts.
  from: ConnectorConfigurationRegistryService.readConnectorConfiguration already matches IConnectorConfigurationQuery's declared shape structurally (same method name, same ConnectorConfigurationResolution type imported from the one service module both files read it from); unlike ICapabilityQuery, no specification node publishes a connector-configuration-registry contract that would call for the narrower accessor capability-registry.factory.ts's own createCapabilityQuery exists to serve for contracts/integration/capability-registry, so adding a mirroring wrapper here would be a shape nothing asked for.
preserved:
- The ProductionDiagnoseDependencies and DiagnoseControllerDependencies shapes, unchanged, so production-diagnose.factory.ts, diagnose.factory.ts, buildApp and diagnose.controller.ts continue composing exactly as before this swap.
- The IObservationSource port's own never-throws-for-the-four-endings contract that evidence-collection-stage.ts's raceObservation already depends on — this task changes which class answers the port, never the port's own shape or calling convention.
- FakeObservationSource itself, left unmodified and still exported for its existing non-production consumers (unit specs, and the integration specs that compose createDiagnoseRunner directly rather than through createDiagnoseHttpServer).
- diagnose-e2e.spec.ts's and diagnose-persistence-deadline-e2e.spec.ts's own independent wiring — both compose createDiagnoseRunner and buildApp directly with their own FakeObservationSource, never through createDiagnoseHttpServer, so this swap does not reach either file's own construction path.
- observations.json itself, left on disk for its remaining non-production consumers.
deferred:
- what: src/__tests__/integration/factories/diagnose-server.factory.spec.ts still builds its Env object literal with an OBSERVATIONS_FIXTURE_FILE field (now excess against the narrowed Env type) and asserts an outcome that depended on FakeObservationSource being seeded from that fixture through createDiagnoseHttpServer — it now needs either a registered capability and connector configuration for its own fixture capabilities, or an adjusted expectation, once HttpDeclarativeObservationSource is what the factory actually constructs.
  why: this task's own Notes name this file as exactly what its own proof, not its implementation, has to account for — adjusting a test's fixtures or assertions is test-author's judgment in this same task's proof pass, and reaching into it here would be writing the test that proves this change from inside the change itself.
---

## What it is

The composition-root change that swaps which concrete class answers IObservationSource in production: HttpDeclarativeObservationSource, wired from the same shared database connection every other store already uses, in place of FakeObservationSource.
The retirement of observations.json's production role, and the corresponding removal of OBSERVATIONS_FIXTURE_FILE from env.ts now that nothing in production reads it.

## Notes

No specification node is implemented by this task: which concrete adapter class backs an unchanged port in one wiring point is production topology, not a fact the specification decides — the port's own obligations are covered by the sibling task http-observation-runtime/http-declarative-observation-source's own implements.
FakeObservationSource is not deleted; it remains available to tests and to the two e2e specs that wire createDiagnoseRunner directly rather than through createDiagnoseHttpServer.
diagnose-server.factory.spec.ts's own fixture expectations, built around the retired fake-seeded wiring, are left for this task's own proof pass to reconcile — adjusting a test's own fixtures is the test-author's judgment, not this implementation's.
