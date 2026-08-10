import type { IAssessmentConsolidator } from '../investigation/assessment-consolidator.port.js';
import type { Assessment } from '../investigation/assessment.js';
import type { ConsolidationRegister } from '../investigation/consolidation-register.js';
import type { IHypothesisEvaluator } from '../investigation/hypothesis-evaluator.port.js';
import type { IObservationSource } from '../investigation/observation-source.port.js';
import { runDiagnosis, type RunDiagnosisOptions } from '../investigation/run-diagnosis.js';
import { createCapabilityQuery } from './capability-registry.factory.js';
import { createGlossaryQuery } from './glossary.factory.js';
import { createInvestigationStore } from './investigation-store.factory.js';

/**
 * The per-deployment wiring runDiagnosis needs but a single diagnose call
 * does not vary on: where the investigation, glossary and capability data
 * live, which concrete adapters answer observation, judgment and
 * consolidation behind their published ports, the configured judgment pool
 * bound (constraints/hypotheses-are-judged-in-isolated-parallel-calls' own
 * "the pool bound is configuration") and the register to fall back to where
 * a case leaves consolidation_register undeclared. No production adapter
 * exists yet for observation, judgment or consolidation
 * (task/evidence-collection/observation-source-port,
 * task/hypothesis-judgment/hypothesis-evaluator-port,
 * task/assessment-consolidation/assessment-consolidator-port-and-fake each
 * leave their real connector as a declared remainder), so which concrete
 * instance answers each is this factory's caller to choose, never this
 * module's to invent — the same "the caller's to choose" convention
 * createCaseStore's own data-directory parameter already keeps.
 */
export type DiagnoseDependencies = {
  readonly investigationDataDirectory: string;
  readonly glossaryDataDirectory: string;
  readonly capabilityDataDirectory: string;
  readonly observationSource: IObservationSource;
  readonly evaluator: IHypothesisEvaluator;
  readonly consolidator: IAssessmentConsolidator;
  readonly poolSize: number;
  readonly defaultConsolidationRegister: ConsolidationRegister;
};

/** Everything one diagnose call still needs to supply once this factory has wired every fixed, per-deployment dependency above. */
export type DiagnoseCall = Omit<
  RunDiagnosisOptions,
  | 'store'
  | 'glossary'
  | 'capabilities'
  | 'observationSource'
  | 'evaluator'
  | 'consolidator'
  | 'poolSize'
  | 'defaultConsolidationRegister'
>;

/**
 * Wires runDiagnosis's own leaf dependencies — the file-backed investigation
 * store, the published glossary-query and capability-query reads (composed
 * the same way createCaseQuery already composes them for its own service),
 * and the given observation/judgment/consolidation adapters — into one
 * function that only still needs each individual call's own inputs (the
 * resolved case, subject, narrative, requester/ticket_ref, the model and
 * prompt version in use, the accumulated cost and durations, and the
 * propagated now/deadline pair). The diagnose composition root's own single
 * wiring point (task/diagnose-entry-point/diagnose-pipeline-composition),
 * extending the per-context factory convention case-query.factory.ts and
 * case-store.factory.ts already establish rather than starting a second
 * wiring style.
 */
export function createDiagnoseRunner(dependencies: DiagnoseDependencies): (call: DiagnoseCall) => Promise<Assessment> {
  const store = createInvestigationStore(dependencies.investigationDataDirectory);
  const glossary = createGlossaryQuery(dependencies.glossaryDataDirectory);
  const capabilities = createCapabilityQuery(dependencies.capabilityDataDirectory);
  return (call: DiagnoseCall): Promise<Assessment> =>
    runDiagnosis({
      ...call,
      store,
      glossary,
      capabilities,
      observationSource: dependencies.observationSource,
      evaluator: dependencies.evaluator,
      consolidator: dependencies.consolidator,
      poolSize: dependencies.poolSize,
      defaultConsolidationRegister: dependencies.defaultConsolidationRegister,
    });
}
