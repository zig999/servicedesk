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
import { createCaseInputRequirementsQuery } from './case-input-requirements.factory.js';
import { createCaseQuery } from './case-query.factory.js';
import { createConnectorConfigurationRegistry } from './connector-configuration-registry.factory.js';
import { createGlossaryQuery } from './glossary.factory.js';
import { createProductionDiagnoseRunner, type ProductionDiagnoseDependencies } from './production-diagnose.factory.js';
import {
  createProductionHypothesisSimulationRunner,
  type ProductionHypothesisSimulationDependencies,
} from './production-simulate-hypothesis.factory.js';
import { createProductionSimulationRunner, type ProductionSimulationDependencies } from './production-simulate.factory.js';

export async function createDiagnoseHttpServer(env: Env): Promise<FastifyInstance> {
  const connection = createDatabaseConnection(env.DATABASE_URL);
  const observationSource = new HttpDeclarativeObservationSource({
    capabilities: createCapabilityQuery(connection),
    connectorConfigurations: createConnectorConfigurationRegistry(connection),
  });
  const caseQuery = createCaseQuery(connection);
  const caseInputRequirementsQuery = createCaseInputRequirementsQuery(connection);
  const runDiagnose = createProductionDiagnoseRunner(runnerDependencies(env, connection, observationSource));
  const diagnose: DiagnoseControllerDependencies = {
    caseQuery,
    caseInputRequirementsQuery,
    runDiagnose,
    model: env.EVALUATOR_MODEL,
    promptVersion: env.PROMPT_VERSION,
  };
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

function hypothesisSimulationRunnerDependencies(env: Env, connection: DatabaseConnection): ProductionHypothesisSimulationDependencies {
  return {
    connection,
    poolSize: env.POOL_SIZE,
    evaluatorModel: env.EVALUATOR_MODEL,
    evaluatorMaxTokens: env.EVALUATOR_MAX_TOKENS,
  };
}
