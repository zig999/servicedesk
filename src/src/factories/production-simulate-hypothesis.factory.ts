// Wires the production simulate-hypothesis composition
// (task/case-simulation-pipeline/simulate-hypothesis-operation,
// contracts/investigation/case-simulation): mirrors simulate.factory.ts's own
// cache-free observation-source construction (a freshly built
// HttpDeclarativeObservationSource from the given connection's own
// capability and connector-configuration reads, never a caller-supplied
// IObservationSource that could be a caching decorator —
// scenarios/investigation/a-simulation-never-enters-the-cache) and
// production-simulate.factory.ts's own adapter-fixing shape (the real,
// Anthropic-backed AnthropicHypothesisEvaluator, never the caller's to
// choose here) — collapsed into this one file, since this operation needs no
// separate generic per-context composition the way simulate-case's own
// no-cache-simulation-composition already built for the full pipeline: this
// run never consolidates at all, so it carries no consolidator and no
// defaultConsolidationRegister field anywhere. Calls
// simulate-hypothesis-pipeline.ts's own runSimulateHypothesisPipeline
// directly, never runInvestigationPipeline, runDiagnosis,
// createDiagnoseRunner, createProductionDiagnoseRunner or
// createSimulationRunner (rules/investigation/a-simulation-writes-no-investigation).

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

/**
 * The same total deadline budget production-simulate.factory.ts's own
 * TOTAL_DEADLINE_BUDGET_MS stamps
 * (rules/investigation/an-answer-arrives-within-the-declared-deadline): this
 * run's own stages carry the identical nominal per-stage budgets
 * evidence-collection-stage.ts and investigation-pipeline.ts already declare
 * (COLLECTION_STAGE_BUDGET_MS, JUDGMENT_STAGE_BUDGET_MS), and no
 * specification node names a distinct total for a narrower simulation —
 * this task's own disclosed inference, reusing the one precedent already
 * established for this pipeline's own stages rather than inventing an
 * unrelated value.
 */
const TOTAL_DEADLINE_BUDGET_MS = 20_000;

/**
 * What one production simulate-hypothesis call's own caller still chooses:
 * the shared database connection, the configured judgment pool bound
 * (constraints/hypotheses-are-judged-in-isolated-parallel-calls' own "the
 * pool bound is configuration"), and the construction-time configuration
 * AnthropicHypothesisEvaluatorOptions still requires of its own caller — the
 * same fields ProductionSimulationDependencies already names for the
 * identical reason, minus the consolidator/defaultConsolidationRegister pair
 * this operation never reaches.
 */
export type ProductionHypothesisSimulationDependencies = {
  readonly connection: DatabaseConnection;
  readonly poolSize: number;
  /** AnthropicHypothesisEvaluatorOptions' own required model — no specification node names a version, so this factory's own caller supplies it rather than one being invented here. */
  readonly evaluatorModel: string;
  /** AnthropicHypothesisEvaluatorOptions' own optional token ceiling — left undefined, the adapter keeps its own DEFAULT_MAX_TOKENS. */
  readonly evaluatorMaxTokens?: number;
};

/**
 * Everything one production simulate-hypothesis call still needs to supply
 * once this factory has wired every fixed dependency above and computed its
 * own (now, deadline) pair — simulate-hypothesis-pipeline.ts's own
 * SimulateHypothesisPipelineOptions minus the fields this factory itself
 * wires.
 */
export type ProductionHypothesisSimulationCall = Omit<
  SimulateHypothesisPipelineOptions,
  'capabilities' | 'observationSource' | 'evaluator' | 'poolSize' | 'now' | 'deadline'
>;

/**
 * Wires the production simulate-hypothesis pipeline
 * (task/case-simulation-pipeline/simulate-hypothesis-operation,
 * contracts/investigation/case-simulation): capabilities,
 * connector-configurations and one fresh, cache-free
 * HttpDeclarativeObservationSource built once from the given connection, and
 * the real, Anthropic-backed AnthropicHypothesisEvaluator built once from the
 * given model/token configuration — both constructed exactly once per call to
 * this outer factory, the same per-deployment convention
 * createProductionSimulationRunner already keeps for its own leaf
 * dependencies, never once per request.
 */
export function createProductionHypothesisSimulationRunner(
  dependencies: ProductionHypothesisSimulationDependencies,
): (call: ProductionHypothesisSimulationCall) => Promise<SimulateHypothesisPipelineResult> {
  const capabilities = createCapabilityQuery(dependencies.connection);
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
      observationSource,
      evaluator,
      poolSize: dependencies.poolSize,
      now,
      deadline: now + TOTAL_DEADLINE_BUDGET_MS,
    });
  };
}
