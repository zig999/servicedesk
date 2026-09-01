import type { IAssessmentConsolidator } from '../investigation/assessment-consolidator.port.js';
import type { Assessment } from '../investigation/assessment.js';
import type { ConsolidationRegister } from '../investigation/consolidation-register.js';
import type { IHypothesisEvaluator } from '../investigation/hypothesis-evaluator.port.js';
import type { IObservationSource } from '../investigation/observation-source.port.js';
import { runDiagnosis, type RunDiagnosisOptions } from '../investigation/run-diagnosis.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { createCapabilityQuery } from './capability-registry.factory.js';
import { createGlossaryQuery } from './glossary.factory.js';
import { createInvestigationStore } from './investigation-store.factory.js';

export type DiagnoseDependencies = {
  readonly connection: DatabaseConnection;
  readonly observationSource: IObservationSource;
  readonly evaluator: IHypothesisEvaluator;
  readonly consolidator: IAssessmentConsolidator;
  readonly poolSize: number;
  readonly defaultConsolidationRegister: ConsolidationRegister;
};

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

export function createDiagnoseRunner(dependencies: DiagnoseDependencies): (call: DiagnoseCall) => Promise<Assessment> {
  const store = createInvestigationStore(dependencies.connection);
  const glossary = createGlossaryQuery(dependencies.connection);
  const capabilities = createCapabilityQuery(dependencies.connection);
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
