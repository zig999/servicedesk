import { AnthropicAssessmentConsolidator } from '../investigation/anthropic-assessment-consolidator.adapter.js';
import { AnthropicHypothesisEvaluator } from '../investigation/anthropic-hypothesis-evaluator.adapter.js';
import type { ConsolidationRegister } from '../investigation/consolidation-register.js';
import type { InvestigationPipelineResult } from '../investigation/investigation-pipeline.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { createSimulationRunner, type SimulationCall } from './simulate.factory.js';

const TOTAL_DEADLINE_BUDGET_MS = 20_000;

export type ProductionSimulationDependencies = {
  readonly connection: DatabaseConnection;
  readonly poolSize: number;
  readonly defaultConsolidationRegister: ConsolidationRegister;

  readonly evaluatorModel: string;

  readonly evaluatorMaxTokens?: number;

  readonly consolidatorModel: string;

  readonly consolidatorMaxTokens: number;
};

export type ProductionSimulationCall = Omit<SimulationCall, 'now' | 'deadline'>;

export function createProductionSimulationRunner(
  dependencies: ProductionSimulationDependencies,
): (call: ProductionSimulationCall) => Promise<InvestigationPipelineResult> {
  const runner = createSimulationRunner({
    connection: dependencies.connection,
    evaluator: new AnthropicHypothesisEvaluator({
      model: dependencies.evaluatorModel,
      maxTokens: dependencies.evaluatorMaxTokens,
    }),
    consolidator: new AnthropicAssessmentConsolidator({
      model: dependencies.consolidatorModel,
      maxTokens: dependencies.consolidatorMaxTokens,
    }),
    poolSize: dependencies.poolSize,
    defaultConsolidationRegister: dependencies.defaultConsolidationRegister,
  });
  return (call: ProductionSimulationCall): Promise<InvestigationPipelineResult> => {
    const now = Date.now();
    return runner({ ...call, now, deadline: now + TOTAL_DEADLINE_BUDGET_MS });
  };
}
