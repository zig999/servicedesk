import { AnthropicAssessmentConsolidator } from '../investigation/anthropic-assessment-consolidator.adapter.js';
import { AnthropicHypothesisEvaluator } from '../investigation/anthropic-hypothesis-evaluator.adapter.js';
import type { Assessment } from '../investigation/assessment.js';
import type { ConsolidationRegister } from '../investigation/consolidation-register.js';
import type { IObservationSource } from '../investigation/observation-source.port.js';
import { createDiagnoseRunner, type DiagnoseCall } from './diagnose.factory.js';

/**
 * The specification's own declared total deadline budget
 * (rules/investigation/an-answer-arrives-within-the-declared-deadline: two
 * of overhead and margin, seven of collection, five of judgment, four of
 * writing and two of persistence), stamped once per call as this factory's
 * own start instant plus this bound
 * (constraints/the-deadline-is-an-absolute-propagated-instant's own "a
 * request records one absolute deadline at entry").
 */
const TOTAL_DEADLINE_BUDGET_MS = 20_000;

/**
 * What this factory's own caller still chooses for a production run:
 * createDiagnoseRunner's own per-deployment dependencies minus the two
 * adapters this factory fixes itself (evaluator, consolidator), passed
 * straight through unchanged — the observation source, the pool bound, the
 * three data directories and the default consolidation register — plus the
 * construction-time configuration the two fixed Anthropic adapters each
 * still require of their own caller (their own module comments: "the
 * model... is this class's caller's own choice, never a value fixed in
 * source"). Neither adapter's credential is a parameter here: both already
 * fall back to process.env.ANTHROPIC_API_KEY on their own when none is
 * given (STK-11's own "the credential read from the environment"), and this
 * factory introduces no second place that credential is handled.
 */
export type ProductionDiagnoseDependencies = {
  readonly investigationDataDirectory: string;
  readonly glossaryDataDirectory: string;
  readonly capabilityDataDirectory: string;
  readonly observationSource: IObservationSource;
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
 * Everything one production diagnose call still needs to supply once this
 * factory has wired every fixed dependency above and computes its own
 * (now, deadline) pair — createDiagnoseRunner's own DiagnoseCall minus the
 * two fields this factory itself stamps.
 */
export type ProductionDiagnoseCall = Omit<DiagnoseCall, 'now' | 'deadline'>;

/**
 * Wires the production diagnose pipeline
 * (task/diagnose-composition-root/wire-diagnose-runner,
 * contracts/investigation/diagnosis): always the real, Anthropic-backed
 * AnthropicHypothesisEvaluator and AnthropicAssessmentConsolidator behind
 * createDiagnoseRunner's own evaluator/consolidator dependencies — never the
 * caller's to choose here, unlike diagnose.factory.ts's own generic
 * DiagnoseDependencies — with every other dependency passed straight
 * through unchanged. Both adapters are constructed once, the same
 * per-deployment convention createDiagnoseRunner already keeps for its own
 * file-backed stores, and calls createDiagnoseRunner/runDiagnosis directly:
 * nothing here imports diagnose.ts, idempotency-key.ts,
 * idempotency-lease-store.ts, idempotency-resolution.ts,
 * diagnosis-run-registry.ts or diagnose-entry-point.factory.ts, all six
 * removed from this tree along with the window-based dedup rule the
 * specification withdrew. Adds no caching or memoization of its own, so two
 * calls given the same case, subject, narrative and requester each run the
 * whole pipeline again through the returned callable and are each written
 * as their own investigation (contracts/investigation/diagnosis's own
 * "every call is fresh").
 */
export function createProductionDiagnoseRunner(
  dependencies: ProductionDiagnoseDependencies,
): (call: ProductionDiagnoseCall) => Promise<Assessment> {
  const runner = createDiagnoseRunner({
    investigationDataDirectory: dependencies.investigationDataDirectory,
    glossaryDataDirectory: dependencies.glossaryDataDirectory,
    capabilityDataDirectory: dependencies.capabilityDataDirectory,
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
