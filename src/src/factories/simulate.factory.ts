import type { IAssessmentConsolidator } from '../investigation/assessment-consolidator.port.js';
import type { ConsolidationRegister } from '../investigation/consolidation-register.js';
import { HttpDeclarativeObservationSource } from '../investigation/http-declarative-observation-source.adapter.js';
import type { IHypothesisEvaluator } from '../investigation/hypothesis-evaluator.port.js';
import {
  runInvestigationPipeline,
  type InvestigationPipelineOptions,
  type InvestigationPipelineResult,
} from '../investigation/investigation-pipeline.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { createCapabilityQuery } from './capability-registry.factory.js';
import { createConnectorConfigurationRegistry } from './connector-configuration-registry.factory.js';
import { createGlossaryQuery } from './glossary.factory.js';

export type SimulationDependencies = {
  readonly connection: DatabaseConnection;
  readonly evaluator: IHypothesisEvaluator;
  readonly consolidator: IAssessmentConsolidator;
  readonly poolSize: number;
  readonly defaultConsolidationRegister: ConsolidationRegister;
};

export type SimulationCall = Omit<
  InvestigationPipelineOptions,
  | 'capabilities'
  | 'glossary'
  | 'observationSource'
  | 'evaluator'
  | 'consolidator'
  | 'poolSize'
  | 'defaultConsolidationRegister'
>;

export function createSimulationRunner(
  dependencies: SimulationDependencies,
): (call: SimulationCall) => Promise<InvestigationPipelineResult> {
  const capabilities = createCapabilityQuery(dependencies.connection);
  const glossary = createGlossaryQuery(dependencies.connection);
  const connectorConfigurations = createConnectorConfigurationRegistry(dependencies.connection);
  const observationSource = new HttpDeclarativeObservationSource({ capabilities, connectorConfigurations });
  return (call: SimulationCall): Promise<InvestigationPipelineResult> =>
    runInvestigationPipeline({
      ...call,
      capabilities,
      glossary,
      observationSource,
      evaluator: dependencies.evaluator,
      consolidator: dependencies.consolidator,
      poolSize: dependencies.poolSize,
      defaultConsolidationRegister: dependencies.defaultConsolidationRegister,
    });
}
