// The evaluation value object as data (domain/investigation/evaluation): one
// hypothesis's whole judgment, identified by the hypothesis name within the
// pinned case — a name and not a model reference, because a hypothesis lives
// inside the case aggregate and is reached only through its root. Mirrors
// hypothesis-evaluator.port.ts's own EvaluationOutcome discriminated union
// exactly, adding only the `hypothesis` field EvaluationOutcome deliberately
// omits: one evaluate() call answers what it alone can determine, and the
// caller who already knows which hypothesis it called for names it here
// (src/investigation/hypothesis-evaluator.port.ts's own deferred note,
// task/hypothesis-judgment/judgment-stage). Confirmed and refuted each carry
// at least one citation, enforced by the type itself
// (rules/investigation/a-decided-evaluation-cites-evidence); inconclusive
// carries a reason and whatever citations ground it, possibly none
// (rules/investigation/an-inconclusive-evaluation-declares-its-reason).
// usage, elapsed_ms and prompt are the judgment call's own record — what the
// provider charged, how long the call took and the judgment prompt as the
// call actually materialized it — present exactly when a call happened,
// absent when reason no-data means judgment was never called at all
// (task/investigation-telemetry/widen-judgment-and-consolidation-ports).

import type { Citation } from './citation.js';
import type { EvaluationReason } from './evaluation-reason.js';
import type { Usage } from './usage.js';
import type { Verdict } from './verdict.js';

/**
 * One hypothesis's whole judgment (domain/investigation/evaluation): the
 * hypothesis it judges, by name, the verdict reached, and, depending on it,
 * the citations grounding a decided verdict or the reason declaring why the
 * judgment did not decide. An investigation holds exactly one of these per
 * hypothesis its pinned case requires
 * (rules/investigation/one-evaluation-per-required-hypothesis), assembled by
 * task/hypothesis-judgment/judgment-stage, never by this port or its fake.
 * usage, elapsed_ms and prompt are optional, carried exactly when the
 * judgment call this evaluation records actually happened — absent for a
 * no-data evaluation, whose reason is that judgment was never called at all.
 */
export type Evaluation =
  | {
      readonly hypothesis: string;
      readonly verdict: 'confirmed';
      readonly citations: readonly [Citation, ...Citation[]];
      readonly usage?: Usage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    }
  | {
      readonly hypothesis: string;
      readonly verdict: 'refuted';
      readonly citations: readonly [Citation, ...Citation[]];
      readonly usage?: Usage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    }
  | {
      readonly hypothesis: string;
      readonly verdict: Exclude<Verdict, 'confirmed' | 'refuted'>;
      readonly reason: EvaluationReason;
      readonly citations: readonly Citation[];
      readonly usage?: Usage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    };
