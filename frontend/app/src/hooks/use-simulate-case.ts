/**
 * The simulate-case mutation hook (task/simulation-cockpit/use-simulate-case,
 * contracts/investigation/case-simulation): dispatches POST /v1/simulate for
 * a given pinned case version and subject, and exposes the complete record
 * the operation returns -- evidence per collected concept, evaluation per
 * manifested hypothesis, the resolved assessment, cost and durations -- as
 * typed data.
 *
 * Mirrors use-test-connector-panel.ts's own apiFetch + useMutation dispatch
 * convention, the direct precedent this task's own objective names: a
 * one-shot, non-persisted dispatch through apiFetch(), a ref-guarded flag
 * against a second overlapping dispatch while one is already in flight
 * (criterion 7 -- `isSimulating` is the pending status a caller reads to
 * gate its own trigger; `isDispatchingRef` is this hook's own belt-and-
 * suspenders guard against the same race that precedent's own header
 * comment names, since React state read inside the same synchronous click
 * has not necessarily committed a re-render yet), and a dispatch failure
 * resolved through error-ui-state.ts's own uiStateForApiError rather than a
 * hand-checked error.code at this call site (criterion 6) -- exactly that
 * precedent's own testDispatchFailureMessage, renamed for this operation.
 * No criterion of this task states a distinct wording for any one failure
 * kind, so every kind falls back to the one generic message below, the same
 * as that precedent's own TEST_DISPATCH_FAILURE_MESSAGE_BY_KIND leaves
 * empty for the same stated reason -- no change to error-ui-state.ts's own
 * central table was needed for this task's own criteria.
 *
 * `simulate-case` runs the engine open to a case version in either state --
 * draft or released (contracts/investigation/case-simulation's own "open to
 * a case version in either state, where a diagnosis reads only released").
 * This hook never reads or branches on a version's own state at all: the
 * case identity it dispatches with is exactly `{slug, version}`
 * (domain/knowledge/case-version's own pinned identity), with no `state`
 * field anywhere in this file, so dispatching against a draft version and a
 * released version run through the exact same code path with nothing to
 * tell them apart (criterion 1) -- structural indifference rather than a
 * branch that happens to answer the same way for both.
 *
 * The request body's own shape -- `{case: {slug, version}, subject: {type,
 * attributes}, requester}` -- mirrors src/src/http/dto/diagnose.dto.ts's own
 * caseRefSchema/subjectSchema (the same engine family's own already-
 * established wire convention for a pinned case and a subject), minus the
 * narrative and ticket_ref fields contracts/investigation/case-simulation's
 * own description states neither simulate-case nor simulate-hypothesis ever
 * carries ("Neither operation carries a narrative or a ticket reference").
 * `requester` is included though no node this task implements states the
 * simulate-case request body's own wire shape: the collection stage this
 * operation runs resolves `${requester}` placeholders the same way
 * test-connector's own dispatch already requires one for
 * (use-test-connector-panel.ts's own TestConnectorRequestBody, contracts/
 * integration/connector-diagnostics), and domain/investigation/
 * investigation.md states requester as a required string every diagnose
 * call already carries ("requester and ticket_ref both arrive in the
 * diagnose call itself; requester is always given"). Recorded as this
 * task's own inference in its delivery record, since it changes no
 * criterion here (none names the request body's own shape) and the request
 * body is form, not a domain fact this task states.
 *
 * Every field of the typed success response below is read fresh from this
 * task's own implemented nodes (domain/investigation/evidence, evaluation,
 * usage, cost, durations, citation, verdict, evidence-result,
 * evaluation-reason, assessment) rather than from src/src/investigation's
 * own current TypeScript source, confirmed mid-migration by this task's own
 * Notes: usage/elapsed_ms on evidence.ts, and register/usage/elapsed_ms/
 * prompt on assessment.ts, are declared by the specification nodes as they
 * now stand but not yet produced by that backend code (the sibling
 * case-simulation-backend initiative's own investigation-telemetry epic).
 * Writing this hook's own types against that backend source directly would
 * silently narrow this hook's own contract to what has not finished
 * shipping yet -- exactly what this task's own Notes warn against.
 *
 * This hook issues exactly one call and holds no other query or mutation:
 * no queryClient, no invalidateQueries, no read of any other cache key --
 * nothing but this mutation's own in-memory result (`result`) ever crosses
 * this hook's own boundary (criterion 5,
 * rules/investigation/a-simulation-writes-no-investigation's own "a
 * simulation runs the engine ... and writes no investigation"). A dispatch
 * that succeeds changes nothing any other screen's own cached read would
 * ever notice.
 */

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch, ApiError } from "../services/api-client";
import { uiStateForApiError, type UiErrorStateKind } from "../services/error-ui-state";

/** domain/knowledge/case-version's own pinned identity: slug plus the immutable version number -- the same shape src/src/http/dto/diagnose.dto.ts's own caseRefSchema already wires for this engine family. */
export type SimulateCaseRef = {
  readonly slug: string;
  readonly version: number;
};

/**
 * One attribute-value pair identifying the subject instance, mirroring
 * domain/investigation/subject-attribute-value's own two attributes.
 * Declared locally rather than imported from use-test-connector-panel.ts's
 * own SubjectAttributeValue -- matching src/src/http/dto/diagnose.dto.ts's
 * own independently-declared subjectAttributeValueSchema, kept separate
 * from test-connector.dto.ts's own, the established convention for this
 * exact wire shape on the backend side of this same engine family.
 */
export type SimulateSubjectAttributeValue = {
  readonly attribute: string;
  readonly value: string;
};

/** The subject the simulation examines, mirroring domain/investigation/subject: a governed subject type name and its whole attribute-value set. */
export type SimulateSubject = {
  readonly type: string;
  readonly attributes: readonly SimulateSubjectAttributeValue[];
};

/** The whole POST /v1/simulate request body this hook dispatches (this file's own header comment on its inferred wire shape). */
export type SimulateCaseRequestBody = {
  readonly case: SimulateCaseRef;
  readonly subject: SimulateSubject;
  readonly requester: string;
};

/** domain/investigation/evidence-result's own closed set: only `ok` carries a usable observation. */
export type SimulateEvidenceResult = "ok" | "unavailable" | "denied" | "timeout";

/** domain/investigation/verdict's own closed set. */
export type SimulateVerdict = "confirmed" | "refuted" | "inconclusive";

/** domain/investigation/evaluation-reason's own closed set: why an evaluation is inconclusive. */
export type SimulateEvaluationReason = "no-data" | "judgment-failure" | "deadline-exceeded";

/** domain/investigation/usage: what one provider call spent, at the granularity of the call itself. */
export type SimulateUsage = {
  readonly input_tokens: number;
  readonly output_tokens: number;
};

/** domain/investigation/citation: one concept and one field of the observation that grounded a decided verdict. */
export type SimulateCitation = {
  readonly concept: string;
  readonly field: string;
};

/** domain/investigation/cost: what this simulation cost at the LLM provider, across every call it made. */
export type SimulateCost = {
  readonly calls: number;
  readonly input_tokens: number;
  readonly output_tokens: number;
};

/** domain/investigation/durations: per-stage timing in milliseconds; `writing` present only once a consolidation call happened. */
export type SimulateDurations = {
  readonly collection: number;
  readonly judgment: number;
  readonly writing?: number;
  readonly total: number;
};

/**
 * One field's own snapshotted semantics (domain/investigation/field-semantics,
 * task/simulation-evidence-snapshot/evidence-snapshot-wire-types): the
 * producing capability's own declared field-by-field meaning, exactly as it
 * stood when this evidence item was collected. Only `name` is required --
 * `type` and `description` travel only where the capability's own
 * output_schema declared them, mirroring that node's own "where the schema
 * states them" qualifier.
 */
export type SimulateFieldSemantics = {
  readonly name: string;
  readonly type?: string;
  readonly description?: string;
};

/**
 * One collected concept's whole record (domain/investigation/evidence,
 * criterion 2). The capability reference the node's own relationships
 * section pins (target domain/integration/capability, cardinality exactly
 * one) travels as two flat fields, `capability_name` and
 * `capability_version` -- carried by that aggregate's own two identifying
 * attributes (domain/integration/capability's own declared attributes),
 * never nested under a `capability` object -- corrected by
 * flatten-detail-evidence-capability-reference, a corrective increment: this
 * type previously declared `capability: { name, version }` nested, a shape
 * neither POST /v1/simulate nor POST /v1/simulate/hypothesis has ever sent.
 * Confirmed fresh against this operation's own live DTO
 * (src/src/http/dto/simulate-case.dto.ts's own evidenceSchema) and against a
 * real response body captured in the browser
 * ("capability_name":"perfil-mobile-tecnico-reader","capability_version":"1.0.0"),
 * and matching the sibling use-simulate-hypothesis.ts hook's own Evidence
 * type, which already declared these two fields flat and correctly. `origin`,
 * already the node's own declared string attribute ("where the observation
 * came from, for audit"), is the connector half of criterion 2's
 * "capability/connector reference" -- kept under its own declared name
 * rather than renamed, since the node states no field named `connector` on
 * evidence itself.
 */
export type SimulateEvidenceItem = {
  readonly concept: string;
  readonly inputs: string;
  readonly observation: string;
  readonly observed_at: string;
  readonly ttl: number;
  readonly origin: string;
  readonly result: SimulateEvidenceResult;
  readonly result_detail?: string;
  readonly capability_name: string;
  readonly capability_version: string;
  readonly elapsed_ms: number;
  /**
   * domain/investigation/evidence's own snapshotted semantics -- fields and
   * concept_description below -- task/simulation-evidence-snapshot/
   * evidence-snapshot-wire-types's own criterion 1. Optional rather than
   * required, unlike the node's own `required: true`: a record collected
   * before this snapshot existed as an attribute at all carries neither on
   * the wire, and the node's own decided reading for that case (an empty
   * list, an empty string -- the identical honest-empty values it already
   * sanctions for a legacy concept or an unresolved capability) is exactly
   * what an absent value here already means once read; nothing here invents
   * a third value for a fourth reading of the same field.
   */
  readonly fields?: readonly SimulateFieldSemantics[];
  /** See `fields` above -- the concept's own snapshotted meaning, absent under the identical condition. */
  readonly concept_description?: string;
};

/**
 * One hypothesis's whole judgment (domain/investigation/evaluation,
 * criterion 3): a discriminated union over `verdict` (TYP-04) -- a decided
 * verdict (confirmed/refuted) carries citations and never a reason, while
 * an inconclusive one carries a reason and possibly citations, mirroring
 * src/src/investigation/evaluation.ts's own established discriminated shape
 * for this exact value object. Widened here with usage/elapsed_ms/prompt on
 * every branch, present exactly when a judgment call happened per the
 * node's own description ("present exactly when a call happened, absent
 * when reason no-data means judgment was never called at all") -- that
 * source file's own type has not yet widened to carry them (this file's own
 * header comment on the backend's mid-migration state).
 */
export type SimulateEvaluation =
  | {
      readonly hypothesis: string;
      readonly verdict: Extract<SimulateVerdict, "confirmed" | "refuted">;
      readonly citations: readonly SimulateCitation[];
      readonly usage?: SimulateUsage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    }
  | {
      readonly hypothesis: string;
      readonly verdict: Extract<SimulateVerdict, "inconclusive">;
      readonly reason: SimulateEvaluationReason;
      readonly citations: readonly SimulateCitation[];
      readonly usage?: SimulateUsage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    };

/** domain/knowledge/referral: one action and one recipient, both drawn from the glossary. */
export type SimulateReferral = {
  readonly action: string;
  readonly recipient: string;
};

/** domain/knowledge/consolidation-register's own closed set, the same one domain/investigation/assessment's own `register` attribute draws from. */
export type SimulateConsolidationRegister = "formal" | "plain";

/**
 * The resolved assessment (domain/investigation/assessment, criterion 4):
 * outcome, referral and determining_hypothesis are the pinned case's own
 * resolve-outcome, unchanged; text is the one field the writing step
 * produces; register, usage, elapsed_ms and prompt are all required rather
 * than optional -- the node's own description states a consolidation call
 * never has a no-data reason to have skipped running, so none of the four
 * is ever absent.
 */
export type SimulateAssessment = {
  readonly outcome: string;
  readonly referral: SimulateReferral;
  readonly determining_hypothesis?: string;
  readonly text: string;
  readonly register: SimulateConsolidationRegister;
  readonly usage: SimulateUsage;
  readonly elapsed_ms: number;
  readonly prompt: string;
};

/**
 * The whole simulate-case success response (criterion 4): evidence per
 * concept, evaluation per hypothesis, the resolved assessment, cost and
 * durations -- the same five field names domain/investigation/
 * investigation.md's own attributes already use for this exact record
 * (evidence, evaluations, assessment, cost, durations), reused here since
 * no node this task implements states a distinct envelope shape of its own
 * for the simulate-case response and this is the closest domain-stated
 * vocabulary for it -- recorded as this task's own inference.
 */
export type SimulateCaseResult = {
  readonly evidence: readonly SimulateEvidenceItem[];
  readonly evaluations: readonly SimulateEvaluation[];
  readonly assessment: SimulateAssessment;
  readonly cost: SimulateCost;
  readonly durations: SimulateDurations;
};

const SIMULATE_CASE_ENDPOINT = "/v1/simulate";

const GENERIC_SIMULATE_CASE_FAILURE_MESSAGE =
  "The simulation could not be run. Check the case version and subject, then try again.";

/** No criterion of this task states a distinct wording for a dispatch failure (see this file's own header comment); every mapped kind falls back to the one generic message above, through error-ui-state.ts's own central registry rather than a hand-checked error.code here (criterion 6). */
const SIMULATE_CASE_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind, string>> = {};

/**
 * Resolves a dispatch failure to a message through uiStateForApiError
 * (criterion 6) -- an ApiError (network/5xx/validation) is the only thing
 * this ever reads; a returned verdict lives entirely inside a successful
 * response's own `result` field and never reaches this function at all, so
 * the two can never be confused with each other.
 */
function simulateCaseFailureMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const state = uiStateForApiError(error);
    return (
      SIMULATE_CASE_FAILURE_MESSAGE_BY_KIND[state.kind] ?? GENERIC_SIMULATE_CASE_FAILURE_MESSAGE
    );
  }
  return GENERIC_SIMULATE_CASE_FAILURE_MESSAGE;
}

export type SimulateCaseState = {
  /** The last successful dispatch's own typed result, or null before the first dispatch or after a failure (criteria 2-4). */
  readonly result: SimulateCaseResult | null;
  /** The pending status a caller reads to gate a second dispatch while one is already in flight (criterion 7). */
  readonly isSimulating: boolean;
  /** The message a failed dispatch resolves to through uiStateForApiError, or null while no dispatch has failed (criterion 6). */
  readonly simulateError: string | null;
  /** Dispatches one simulate-case call for the given case version and subject; a call made while one is already in flight is dropped rather than queued. */
  readonly onSimulate: (body: SimulateCaseRequestBody) => void;
};

/**
 * Dispatches the simulate-case operation (contracts/investigation/
 * case-simulation) and exposes its complete typed response -- evidence,
 * evaluations, the resolved assessment, cost and durations -- following the
 * apiFetch + useMutation convention use-test-connector-panel.ts already
 * establishes (this file's own header comment).
 */
export function useSimulateCase(): SimulateCaseState {
  const [simulateError, setSimulateError] = useState<string | null>(null);
  const isDispatchingRef = useRef(false);

  const mutation = useMutation({
    mutationFn: (body: SimulateCaseRequestBody) =>
      apiFetch<SimulateCaseResult>(SIMULATE_CASE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
  });

  const onSimulate = (body: SimulateCaseRequestBody): void => {
    if (isDispatchingRef.current) {
      return;
    }
    isDispatchingRef.current = true;
    setSimulateError(null);

    mutation.mutate(body, {
      onError: (error) => {
        setSimulateError(simulateCaseFailureMessage(error));
      },
      onSettled: () => {
        isDispatchingRef.current = false;
      },
    });
  };

  return {
    result: mutation.data ?? null,
    isSimulating: mutation.isPending,
    simulateError,
    onSimulate,
  };
}
