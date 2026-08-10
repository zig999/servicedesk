// The diagnose entry point (contracts/investigation/diagnosis): the payload
// shape — case, subject, narrative, requester and an optional ticket
// reference — and the window dedup
// rules/investigation/an-investigation-is-idempotent-within-a-window names,
// sitting in front of run-diagnosis.ts's own already-delivered per-call
// runner (task/diagnose-entry-point/diagnose-pipeline-composition). That
// module is never modified here: this file receives it as an injected
// runFresh callback (DiagnoseRunInput -> Promise<Assessment>), structurally
// identical to its own DiagnoseCall (src/factories/diagnose.factory.ts)
// without importing it, so this context never depends on src/factories —
// no file under src/investigation does, and this one does not start.
//
// requester and ticket_ref both travel in this payload and nowhere else
// (contracts/investigation/diagnosis, domain/investigation/investigation's
// own "requester and ticket_ref both arrive in the diagnose call itself");
// a missing (or empty) requester is refused before anything else runs —
// the very first statement diagnose() executes (criterion 1), and neither
// field is read from any other source (criterion 5).
//
// The window dedup applies only where a ticket reference is given
// (scenarios/investigation/no-ticket-reference-never-repeats): where
// payload.ticket_ref is absent, this module never builds a key and never
// touches the lease store or the run registry — it always calls runFresh,
// with nothing for a later call to match against regardless of how closely
// subject, case or timing coincide.
//
// Where a ticket reference is given, the key
// rules/investigation/an-investigation-is-idempotent-within-a-window names
// — subject type, the subject's whole attribute-value set, case and ticket
// reference — is built over the canonical Subject (subject.ts's own
// buildSubject, reused rather than re-decided) and the case's own slug (see
// this delivery's own inference for why slug alone), then resolved through
// idempotency-resolution.ts's own resolveIdempotency, unchanged, in its own
// stated precedence: completed answers first, in-progress next, free last
// (scenarios/investigation/a-repeated-request-returns-the-same-investigation).
// The in-progress marker stays exactly the lease resolveIdempotency and
// IdempotencyLeaseStore already keep
// (constraints/in-progress-is-a-lease-not-domain-state); "join it" means
// literally awaiting the same run's own promise
// (diagnosis-run-registry.ts's own inProgressRun), never polling and never
// a second dedup mechanism of this module's own invention.

import type { Case } from '../case/case.js';
import { RequesterRequiredError } from '../errors/requester-required.error.js';
import type { Assessment } from './assessment.js';
import type { Cost } from './cost.js';
import type { DiagnosisRunRegistry } from './diagnosis-run-registry.js';
import type { Durations } from './durations.js';
import type { IdempotencyKey } from './idempotency-key.js';
import type { IdempotencyLeaseStore } from './idempotency-lease-store.js';
import { resolveIdempotency } from './idempotency-resolution.js';
import { buildSubject } from './subject.js';
import type { SubjectAttributeValue } from './subject-attribute-value.js';

/**
 * Represents "no ticket reference given" at run-diagnosis.ts's own
 * RunDiagnosisOptions.ticket_ref boundary, which this task does not modify
 * and which declares that field as a mandatory string with no optionality
 * of its own — the same empty-string-for-an-unresolved-relationship
 * convention evidence.ts's own capability_name/capability_version already
 * establishes for this codebase (see this delivery's own inference).
 */
const NO_TICKET_REFERENCE = '';

/**
 * The diagnose entry point's own raw payload (contracts/investigation/diagnosis):
 * case, subject, narrative and requester in, with an optional ticket
 * reference. requester is typed as possibly absent because this module is
 * exactly where its presence is checked (criterion 1); every other field
 * keeps run-diagnosis.ts's own already-established, already-mandatory
 * shape unchanged, since no criterion of this task asks any of them to be
 * validated at this boundary.
 */
export type DiagnosePayload = {
  readonly id: string;
  readonly requester?: string;
  readonly ticket_ref?: string;
  readonly narrative: string;
  readonly subjectType: string;
  readonly subjectAttributes: readonly SubjectAttributeValue[];
  readonly case: Case;
  readonly prompt_version: string;
  readonly model: string;
  readonly cost: Cost;
  readonly durations: Durations;
  readonly now: number;
  readonly deadline: number;
};

/**
 * Exactly what src/factories/diagnose.factory.ts's own DiagnoseCall already
 * declares, field for field — structurally, never by import, so
 * createDiagnoseRunner's own returned function can be passed as runFresh
 * unchanged.
 */
export type DiagnoseRunInput = {
  readonly id: string;
  readonly requester: string;
  readonly ticket_ref: string;
  readonly narrative: string;
  readonly subjectType: string;
  readonly subjectAttributes: readonly SubjectAttributeValue[];
  readonly case: Case;
  readonly prompt_version: string;
  readonly model: string;
  readonly cost: Cost;
  readonly durations: Durations;
  readonly now: number;
  readonly deadline: number;
};

/**
 * Everything one diagnose() call needs beyond the payload: the
 * already-composed pipeline, injected as a callback, and the window-dedup
 * machinery.
 */
export type DiagnoseWindowDependencies = {
  readonly runFresh: (input: DiagnoseRunInput) => Promise<Assessment>;
  readonly leases: IdempotencyLeaseStore;
  readonly registry: DiagnosisRunRegistry;
};

/**
 * Realizes the published diagnose operation (contracts/investigation/diagnosis):
 * refuses a payload with no requester before anything else runs; where no
 * ticket reference travels, always calls runFresh, unmatched against
 * anything (scenarios/investigation/no-ticket-reference-never-repeats);
 * otherwise hands off to resolveRepeat below, which resolves the
 * repeat-request key in the rule's own precedence
 * (rules/investigation/an-investigation-is-idempotent-within-a-window).
 */
export async function diagnose(
  payload: DiagnosePayload,
  dependencies: DiagnoseWindowDependencies,
): Promise<Assessment> {
  const requester = refuseMissingRequester(payload.requester);
  const ticketRef = payload.ticket_ref;
  if (ticketRef === undefined) {
    return dependencies.runFresh(runInputOf(payload, requester));
  }
  return resolveRepeat({ payload, ticketRef, requester, dependencies });
}

/** What resolveRepeat needs, bundled as one object so the function itself keeps to one positional parameter. */
type ResolveRepeatArgs = {
  readonly payload: DiagnosePayload;
  readonly ticketRef: string;
  readonly requester: string;
  readonly dependencies: DiagnoseWindowDependencies;
};

/**
 * Resolves one repeat-request key in the rule's own precedence: a completed
 * match answers without starting a second investigation, an in-progress
 * match is joined by awaiting its own run, and only where neither exists
 * does this call start its own fresh run
 * (scenarios/investigation/a-repeated-request-returns-the-same-investigation).
 */
async function resolveRepeat(args: ResolveRepeatArgs): Promise<Assessment> {
  const { payload, ticketRef, requester, dependencies } = args;
  const key: IdempotencyKey = {
    subject: buildSubject(payload.subjectType, payload.subjectAttributes),
    caseReference: payload.case.slug,
    ticketRef,
  };
  const outcome = await resolveIdempotency<Assessment>({
    key,
    now: payload.now,
    leases: dependencies.leases,
    findCompleted: (matchKey: IdempotencyKey) =>
      Promise.resolve(dependencies.registry.completedMatch(matchKey, payload.now, dependencies.leases)),
  });
  if (outcome.outcome === 'completed') {
    return outcome.match;
  }
  const joined = outcome.outcome === 'in-progress' ? dependencies.registry.inProgressRun(key) : undefined;
  return joined ?? dependencies.registry.run(key, () => dependencies.runFresh(runInputOf(payload, requester)));
}

/**
 * Refuses a payload with no requester, or an empty one, before anything
 * else runs (criterion 1) — requester is read from this payload alone
 * (criterion 5).
 */
function refuseMissingRequester(requester: string | undefined): string {
  if (requester === undefined || requester.length === 0) {
    throw new RequesterRequiredError(requester);
  }
  return requester;
}

/**
 * The run-diagnosis.ts-shaped input this module hands to runFresh: every
 * field copied straight from the payload, except ticket_ref, which stands
 * in for its absence with NO_TICKET_REFERENCE at that already-delivered
 * boundary alone — this module's own dedup decision above reads
 * payload.ticket_ref directly throughout, never this substituted value.
 */
function runInputOf(payload: DiagnosePayload, requester: string): DiagnoseRunInput {
  return {
    id: payload.id,
    requester,
    ticket_ref: payload.ticket_ref ?? NO_TICKET_REFERENCE,
    narrative: payload.narrative,
    subjectType: payload.subjectType,
    subjectAttributes: payload.subjectAttributes,
    case: payload.case,
    prompt_version: payload.prompt_version,
    model: payload.model,
    cost: payload.cost,
    durations: payload.durations,
    now: payload.now,
    deadline: payload.deadline,
  };
}
