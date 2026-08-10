import type { Assessment } from '../investigation/assessment.js';
import { diagnose, type DiagnosePayload } from '../investigation/diagnose.js';
import { DiagnosisRunRegistry } from '../investigation/diagnosis-run-registry.js';
import { IdempotencyLeaseStore } from '../investigation/idempotency-lease-store.js';
import { createDiagnoseRunner, type DiagnoseDependencies } from './diagnose.factory.js';

/**
 * Everything createDiagnoseEntryPoint needs beyond createDiagnoseRunner's
 * own DiagnoseDependencies (diagnose.factory.ts, unmodified by this task):
 * the configured dedup window bound, caller-given the same way poolSize
 * already is (constraints/hypotheses-are-judged-in-isolated-parallel-calls'
 * own "the pool bound is configuration") — never a number this module
 * invents (task/diagnose-entry-point/diagnose-payload-and-window-dedup).
 */
export type DiagnoseEntryPointDependencies = DiagnoseDependencies & { readonly windowMs: number };

/**
 * The full published diagnose entry point (contracts/investigation/diagnosis,
 * task/diagnose-entry-point/diagnose-payload-and-window-dedup): wires
 * createDiagnoseRunner's own already-delivered pipeline as the fresh-run
 * callback the window-dedup module calls (src/investigation/diagnose.ts),
 * alongside one fresh IdempotencyLeaseStore bound to the given window and
 * one fresh DiagnosisRunRegistry for the completed/in-progress half — each
 * instantiated once per call to this factory and held for the life of the
 * process, the same way createDiagnoseRunner's own store/glossary/capabilities
 * already are. Kept as its own factory file rather than a second exported
 * function added to diagnose.factory.ts, so each factory file still wires
 * exactly one module (ARC-03) and diagnose-pipeline-composition's own
 * delivered file stays untouched.
 */
export function createDiagnoseEntryPoint(
  dependencies: DiagnoseEntryPointDependencies,
): (payload: DiagnosePayload) => Promise<Assessment> {
  const runFresh = createDiagnoseRunner(dependencies);
  const leases = new IdempotencyLeaseStore(dependencies.windowMs);
  const registry = new DiagnosisRunRegistry();
  return (payload: DiagnosePayload): Promise<Assessment> => diagnose(payload, { runFresh, leases, registry });
}
