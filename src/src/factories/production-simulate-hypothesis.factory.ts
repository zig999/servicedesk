import { AnthropicHypothesisEvaluator } from '../investigation/anthropic-hypothesis-evaluator.adapter.js';
import { HttpDeclarativeObservationSource } from '../investigation/http-declarative-observation-source.adapter.js';
import {
  runSimulateHypothesisPipeline,
  type SimulateHypothesisPipelineOptions,
  type SimulateHypothesisPipelineResult,
} from '../investigation/simulate-hypothesis-pipeline.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { createCapabilityQuery } from './capability-registry.factory.js';
import { createConnectorConfigurationRegistry } from './connector-configuration-registry.factory.js';
import { createGlossaryQuery } from './glossary.factory.js';

const TOTAL_DEADLINE_BUDGET_MS = 20_000;

export type ProductionHypothesisSimulationDependencies = {
  readonly connection: DatabaseConnection;
  readonly poolSize: number;

  readonly evaluatorModel: string;

  readonly evaluatorMaxTokens?: number;
};

export type ProductionHypothesisSimulationCall = Omit<
  SimulateHypothesisPipelineOptions,
  'capabilities' | 'glossary' | 'observationSource' | 'evaluator' | 'poolSize' | 'now' | 'deadline'
>;

export function createProductionHypothesisSimulationRunner(
  dependencies: ProductionHypothesisSimulationDependencies,
): (call: ProductionHypothesisSimulationCall) => Promise<SimulateHypothesisPipelineResult> {
  const capabilities = createCapabilityQuery(dependencies.connection);
  const glossary = createGlossaryQuery(dependencies.connection);
  const connectorConfigurations = createConnectorConfigurationRegistry(dependencies.connection);
  const observationSource = new HttpDeclarativeObservationSource({ capabilities, connectorConfigurations });
  const evaluator = new AnthropicHypothesisEvaluator({
    model: dependencies.evaluatorModel,
    maxTokens: dependencies.evaluatorMaxTokens,
  });
  return (call: ProductionHypothesisSimulationCall): Promise<SimulateHypothesisPipelineResult> => {
    const now = Date.now();
    return runSimulateHypothesisPipeline({
      ...call,
      capabilities,
      glossary,
      observationSource,
      evaluator,
      poolSize: dependencies.poolSize,
      now,
      deadline: now + TOTAL_DEADLINE_BUDGET_MS,
    });
  };
}
