// Wires the production simulation composition
// (task/case-simulation-pipeline/simulate-case-operation,
// contracts/investigation/case-simulation): always the real, Anthropic-backed
// AnthropicHypothesisEvaluator and AnthropicAssessmentConsolidator behind
// simulate.factory.ts's own createSimulationRunner — never the caller's to
// choose here, unlike simulate.factory.ts's own generic
// SimulationDependencies — with every other dependency, including the
// shared connection, passed straight through unchanged. Mirrors
// production-diagnose.factory.ts's own shape exactly: the one existing
// example of a no-cache-shaped, adapter-fixing composition this module sits
// parallel to (this initiative's own inventory notes) — the real production
// composition root no-cache-simulation-composition's own delivery record
// deferred as belonging to "whichever task builds the simulate HTTP
// surface," which is this one. Calls createSimulationRunner directly, never
// runDiagnosis, createDiagnoseRunner or createProductionDiagnoseRunner
// (rules/investigation/a-simulation-writes-no-investigation).

import { AnthropicAssessmentConsolidator } from '../investigation/anthropic-assessment-consolidator.adapter.js';
import { AnthropicHypothesisEvaluator } from '../investigation/anthropic-hypothesis-evaluator.adapter.js';
import type { ConsolidationRegister } from '../investigation/consolidation-register.js';
import type { InvestigationPipelineResult } from '../investigation/investigation-pipeline.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { createSimulationRunner, type SimulationCall } from './simulate.factory.js';

/**
 * The same total deadline budget production-diagnose.factory.ts's own
 * TOTAL_DEADLINE_BUDGET_MS stamps
 * (rules/investigation/an-answer-arrives-within-the-declared-deadline): a
 * simulation runs the identical stages 1-4 under the identical nominal
 * per-stage budgets investigation-pipeline.ts already declares
 * (COLLECTION_STAGE_BUDGET_MS, JUDGMENT_STAGE_BUDGET_MS), and no
 * specification node names a distinct total for simulation — this task's own
 * disclosed inference, reusing the one precedent already established for
 * this identical pipeline rather than inventing an unrelated value.
 */
const TOTAL_DEADLINE_BUDGET_MS = 20_000;

/**
 * What this factory's own caller still chooses for a production simulation
 * run: simulate.factory.ts's own per-deployment dependencies minus the two
 * adapters this factory fixes itself (evaluator, consolidator), passed
 * straight through unchanged — the one shared database connection, the pool
 * bound and the default consolidation register — plus the construction-time
 * configuration the two fixed Anthropic adapters each still require of their
 * own caller, the same shape ProductionDiagnoseDependencies already keeps
 * for diagnose's own production composition.
 */
export type ProductionSimulationDependencies = {
  readonly connection: DatabaseConnection;
  readonly poolSize: number;
  readonly defaultConsolidationRegister: ConsolidationRegister;
  /** AnthropicHypothesisEvaluatorOptions' own required model — no specification node names a version, so this factory's own caller supplies it rather than one being invented here. */
  readonly evaluatorModel: string;
  /** AnthropicHypothesisEvaluatorOptions' own optional token ceiling — left undefined, the adapter keeps its own DEFAULT_MAX_TOKENS. */
  readonly evaluatorMaxTokens?: number;
  /** AnthropicConsolidatorConfig's own required model, for the same reason as evaluatorModel above. */
  readonly consolidatorModel: string;
  /** AnthropicConsolidatorConfig's own required token ceiling — that class keeps no default of its own, so this factory's own caller must supply one. */
  readonly consolidatorMaxTokens: number;
};

/**
 * Everything one production simulation call still needs to supply once this
 * factory has wired every fixed dependency above and computes its own
 * (now, deadline) pair — simulate.factory.ts's own SimulationCall minus the
 * two fields this factory itself stamps.
 */
export type ProductionSimulationCall = Omit<SimulationCall, 'now' | 'deadline'>;

/**
 * Wires the production simulation pipeline
 * (task/case-simulation-pipeline/simulate-case-operation,
 * contracts/investigation/case-simulation): always the real, Anthropic-backed
 * AnthropicHypothesisEvaluator and AnthropicAssessmentConsolidator behind
 * createSimulationRunner's own evaluator/consolidator dependencies, with
 * every other dependency passed straight through unchanged. Both adapters
 * are constructed once, the same per-deployment convention
 * createProductionDiagnoseRunner already keeps for its own.
 */
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
