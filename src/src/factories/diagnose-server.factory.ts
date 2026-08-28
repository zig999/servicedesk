// Wires the diagnose HTTP surface for a real process
// (task/http-surface/diagnose-http-endpoint): one database connection built
// once from the given env's own DATABASE_URL, the relational case query and
// the production diagnose runner built from that same connection
// (task/service-on-the-database/store-wiring — every one of the four stores
// this composition wires now answers from it, and no factory below receives
// a data-directory path for any of them), plus the HTTP declarative
// observation-source adapter
// (task/http-observation-runtime/http-declarative-observation-source) built
// from that same connection through the already-delivered capability and
// connector-configuration registries
// (task/http-observation-runtime/production-wiring-swap): the production
// wiring point that used to construct and seed FakeObservationSource from
// the static observations.json fixture now constructs
// HttpDeclarativeObservationSource instead, so this process depends on a
// registered capability and connector configuration rather than the fixture
// — no production code path here seeds or reads observations.json any
// longer. Never listens itself: buildApp's own instance is handed back
// unstarted, so only src/index.ts calls .listen().
//
// task/case-lifecycle-http/register-routes-in-build-app: createDiagnoseHttpServer
// keeps its own exported name and one-parameter signature exactly as
// store-wiring.spec.ts already asserts them — this task changes only what
// it hands to buildApp, from the diagnose route's own dependencies alone to
// every one of the nineteen routes' dependencies (BuildAppDependencies).
// Composing the other eighteen routes' own dependencies from this same
// connection is build-app.factory.ts's own job (ARC-03 — one factory per
// module), kept out of this file's body so createDiagnoseHttpServer stays
// exactly the size store-wiring.spec.ts already found it.

import type { FastifyInstance } from 'fastify';
import type { Env } from '../config/env.js';
import { buildApp } from '../http/build-app.js';
import type { DiagnoseControllerDependencies } from '../http/diagnose.controller.js';
import type { SimulateCaseControllerDependencies } from '../http/simulate-case.controller.js';
import type { SimulateHypothesisControllerDependencies } from '../http/simulate-hypothesis.controller.js';
import { HttpDeclarativeObservationSource } from '../investigation/http-declarative-observation-source.adapter.js';
import type { IObservationSource } from '../investigation/observation-source.port.js';
import { createDatabaseConnection, type DatabaseConnection } from '../persistence/database-connection.js';
import { buildAppDependencies } from './build-app.factory.js';
import { createCapabilityQuery } from './capability-registry.factory.js';
import { createCaseQuery } from './case-query.factory.js';
import { createConnectorConfigurationRegistry } from './connector-configuration-registry.factory.js';
import { createGlossaryQuery } from './glossary.factory.js';
import { createProductionDiagnoseRunner, type ProductionDiagnoseDependencies } from './production-diagnose.factory.js';
import {
  createProductionHypothesisSimulationRunner,
  type ProductionHypothesisSimulationDependencies,
} from './production-simulate-hypothesis.factory.js';
import { createProductionSimulationRunner, type ProductionSimulationDependencies } from './production-simulate.factory.js';

/**
 * Builds the whole diagnose HTTP surface for a real process: one database
 * connection built once from the given env, the relational case query and
 * production diagnose runner wired from that same connection, the HTTP
 * declarative observation-source adapter built from the capability query
 * and connector-configuration registry this same connection backs, the
 * production simulation runner wired from the same connection
 * (task/case-simulation-pipeline/simulate-case-operation — reusing the same
 * caseQuery instance diagnose already built rather than a second one, and
 * the published glossary-query read the simulate-case route checks a
 * subject's attributes against), and the production hypothesis-simulation
 * runner wired from the same connection
 * (task/case-simulation-pipeline/simulate-hypothesis-operation — reusing the
 * identical caseQuery and glossary-query instances rather than a third
 * built), all handed to buildApp already built alongside every other route's
 * own dependencies (build-app.factory.ts's own buildAppDependencies).
 */
export async function createDiagnoseHttpServer(env: Env): Promise<FastifyInstance> {
  const connection = createDatabaseConnection(env.DATABASE_URL);
  const observationSource = new HttpDeclarativeObservationSource({
    capabilities: createCapabilityQuery(connection),
    connectorConfigurations: createConnectorConfigurationRegistry(connection),
  });
  const caseQuery = createCaseQuery(connection);
  const runDiagnose = createProductionDiagnoseRunner(runnerDependencies(env, connection, observationSource));
  const diagnose: DiagnoseControllerDependencies = { caseQuery, runDiagnose, model: env.EVALUATOR_MODEL, promptVersion: env.PROMPT_VERSION };
  const runSimulate = createProductionSimulationRunner(simulationRunnerDependencies(env, connection));
  const simulateCase: SimulateCaseControllerDependencies = { caseQuery, glossary: createGlossaryQuery(connection), runSimulate };
  const runSimulateHypothesis = createProductionHypothesisSimulationRunner(hypothesisSimulationRunnerDependencies(env, connection));
  const simulateHypothesis: SimulateHypothesisControllerDependencies = {
    caseQuery,
    glossary: createGlossaryQuery(connection),
    runSimulateHypothesis,
  };
  return buildApp(buildAppDependencies({ env, connection, caseQuery, diagnose, simulateCase, simulateHypothesis }));
}

/** ProductionDiagnoseDependencies assembled from the given env, the shared connection and the already-built observation source, kept out of createDiagnoseHttpServer's own body to stay inside MNT-01's line bound. */
function runnerDependencies(
  env: Env,
  connection: DatabaseConnection,
  observationSource: IObservationSource,
): ProductionDiagnoseDependencies {
  return {
    connection,
    observationSource,
    poolSize: env.POOL_SIZE,
    defaultConsolidationRegister: env.DEFAULT_CONSOLIDATION_REGISTER,
    evaluatorModel: env.EVALUATOR_MODEL,
    evaluatorMaxTokens: env.EVALUATOR_MAX_TOKENS,
    consolidatorModel: env.CONSOLIDATOR_MODEL,
    consolidatorMaxTokens: env.CONSOLIDATOR_MAX_TOKENS,
  };
}

/**
 * ProductionSimulationDependencies assembled from the given env and the
 * shared connection, kept out of createDiagnoseHttpServer's own body for the
 * same MNT-01 reason as runnerDependencies above
 * (task/case-simulation-pipeline/simulate-case-operation). Reads exactly the
 * same env fields runnerDependencies already reads for diagnose's own
 * production wiring — no field this scope's construction needs is newly
 * declared on Env (this initiative's own inventory notes) — and no
 * observation source, since simulate.factory.ts's own createSimulationRunner
 * constructs its own internally rather than accepting one.
 */
function simulationRunnerDependencies(env: Env, connection: DatabaseConnection): ProductionSimulationDependencies {
  return {
    connection,
    poolSize: env.POOL_SIZE,
    defaultConsolidationRegister: env.DEFAULT_CONSOLIDATION_REGISTER,
    evaluatorModel: env.EVALUATOR_MODEL,
    evaluatorMaxTokens: env.EVALUATOR_MAX_TOKENS,
    consolidatorModel: env.CONSOLIDATOR_MODEL,
    consolidatorMaxTokens: env.CONSOLIDATOR_MAX_TOKENS,
  };
}

/**
 * ProductionHypothesisSimulationDependencies assembled from the given env and
 * the shared connection, kept out of createDiagnoseHttpServer's own body for
 * the same MNT-01 reason as runnerDependencies and simulationRunnerDependencies
 * above (task/case-simulation-pipeline/simulate-hypothesis-operation). Reads
 * exactly the same env fields simulationRunnerDependencies already reads for
 * simulate-case's own production wiring, minus the consolidator's own model
 * and token-ceiling fields — this operation never consolidates, so it never
 * constructs one — and no observation source, since
 * production-simulate-hypothesis.factory.ts's own
 * createProductionHypothesisSimulationRunner constructs its own internally
 * rather than accepting one.
 */
function hypothesisSimulationRunnerDependencies(env: Env, connection: DatabaseConnection): ProductionHypothesisSimulationDependencies {
  return {
    connection,
    poolSize: env.POOL_SIZE,
    evaluatorModel: env.EVALUATOR_MODEL,
    evaluatorMaxTokens: env.EVALUATOR_MAX_TOKENS,
  };
}
