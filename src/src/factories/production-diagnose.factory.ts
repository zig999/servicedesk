import { AnthropicAssessmentConsolidator } from '../investigation/anthropic-assessment-consolidator.adapter.js';
import { AnthropicHypothesisEvaluator } from '../investigation/anthropic-hypothesis-evaluator.adapter.js';
import type { Assessment } from '../investigation/assessment.js';
import type { ConsolidationRegister } from '../investigation/consolidation-register.js';
import type { IObservationSource } from '../investigation/observation-source.port.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { createDiagnoseRunner, type DiagnoseCall } from './diagnose.factory.js';

const TOTAL_DEADLINE_BUDGET_MS = 20_000;

export type ProductionDiagnoseDependencies = {
  readonly connection: DatabaseConnection;
  readonly observationSource: IObservationSource;
  readonly poolSize: number;
  readonly defaultConsolidationRegister: ConsolidationRegister;

  readonly evaluatorModel: string;

  readonly evaluatorMaxTokens?: number;

  readonly consolidatorModel: string;

  readonly consolidatorMaxTokens: number;
};

export type ProductionDiagnoseCall = Omit<DiagnoseCall, 'now' | 'deadline'>;

export function createProductionDiagnoseRunner(
  dependencies: ProductionDiagnoseDependencies,
): (call: ProductionDiagnoseCall) => Promise<Assessment> {
  const runner = createDiagnoseRunner({
    connection: dependencies.connection,
    observationSource: dependencies.observationSource,
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
  return (call: ProductionDiagnoseCall): Promise<Assessment> => {
    const now = Date.now();
    return runner({ ...call, now, deadline: now + TOTAL_DEADLINE_BUDGET_MS });
  };
}
