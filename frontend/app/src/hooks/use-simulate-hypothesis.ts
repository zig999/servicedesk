/**
 * The hypothesis-level counterpart of `use-simulate-case.ts`
 * (task/simulation-cockpit/use-simulate-hypothesis,
 * contracts/investigation/case-simulation's own `simulate-hypothesis`
 * operation): dispatches a simulation narrowed to one named hypothesis
 * revision of a case version, and exposes exactly one evaluation back --
 * never the case-level response's outcome or assessment
 * (scenarios/investigation/a-single-hypothesis-is-simulated: "no outcome
 * and no assessment are resolved").
 *
 * Follows use-test-connector-panel.ts's own established dispatch
 * convention exactly (this task's own inventory: "the apiFetch<T> +
 * useMutation dispatch pattern for a one-shot, non-persisted operation"):
 * apiFetch<T> wrapped by useMutation, a dispatch failure resolved through
 * uiStateForApiError (error-ui-state.ts) rather than a hand-checked
 * error.code at the call site, and useMutation's own isPending exposed as
 * the pending status a caller gates a second dispatch on.
 *
 * One divergence from that file's own shape: use-test-connector-panel.ts
 * owns its whole form's state internally (selected capability, subject
 * type, attribute rows, requester) and gates dispatch on a canTest boolean
 * computed from that owned state. This task names no screen and no
 * reference layout -- nothing states that this hook owns a hypothesis
 * picker or a subject-attribute form -- so the hypothesis name, the
 * subject and the requester are received as this hook's own dispatch
 * arguments instead, exactly as domain/investigation/subject.md's own
 * responsibility puts it: "the entry point... assembles that whole set
 * before the diagnose call". There is therefore no persisted form validity
 * to expose as a canX boolean; what the convention's dispatch-gating
 * protects -- refusing a second concurrent dispatch -- is preserved
 * through the same isDispatchingRef re-entrancy guard onTest uses, checked
 * against the per-call arguments instead of internal field state.
 *
 * Endpoint (fix-use-simulate-hypothesis-dispatch, a corrective increment):
 * POST /v1/simulate/hypothesis is the route the sibling
 * case-simulation-backend initiative actually delivered
 * (src/src/http/simulate-hypothesis.routes.ts,
 * src/src/http/dto/simulate-hypothesis.dto.ts) -- read fresh from that
 * source rather than inferred, superseding this file's own prior inference
 * of a nested per-case-version URL
 * (POST /v1/cases/{slug}/versions/{version}/simulate-hypothesis), which
 * was never registered and produced a 404 on every dispatch. The case is
 * therefore no longer addressed by the path alone: it travels in the body
 * as `case: {slug, version}`, mirroring use-simulate-case.ts's own
 * SimulateCaseRequestBody exactly (case, subject, requester), widened with
 * this operation's own added `hypothesis` field -- the one hypothesis name
 * this run narrows to. `slug` and `version` (this hook's own constructor
 * arguments, unchanged by this fix) are read from closure to build that
 * `case` field; they are no longer interpolated into the endpoint path.
 *
 * Wire field names mirror the specification's own attribute names verbatim
 * (domain/investigation/evaluation.md: hypothesis, verdict, reason,
 * citations, usage, elapsed_ms, prompt; domain/investigation/usage.md:
 * input_tokens, output_tokens; domain/investigation/evidence.md: concept,
 * inputs, observation, observed_at, ttl, origin, result, result_detail,
 * elapsed_ms) and, for evidence's own capability reference and the
 * response envelope, the route's own delivered DTO exactly
 * (simulate-hypothesis.dto.ts's own evidenceSchema, evaluationSchema,
 * durationsSchema, simulateHypothesisResponseSchema) -- read fresh from
 * that now-live source rather than inferred, since a live backend exists
 * to read one from now. Two structural facts that DTO settles and this
 * file's own prior version could not have known: evidence's capability
 * reference travels as two flat fields, `capability_name` and
 * `capability_version`, never nested under a `capability` object (unlike
 * the sibling use-simulate-case.ts hook's own nested `capability: {name,
 * version}`, a structurally different, pre-existing convention this fix
 * does not touch); and an inconclusive evaluation's own `citations` field
 * is present (possibly empty) rather than absent, the same key every other
 * verdict branch already carries.
 *
 * rules/investigation/a-simulation-writes-no-investigation's frontend half:
 * this hook never imports useQueryClient and never calls
 * invalidateQueries -- its only observable effect is the mutation's own
 * in-memory result, so nothing it dispatches writes to or invalidates any
 * query or endpoint that persists an investigation.
 */

import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch, ApiError } from "../services/api-client";
import { uiStateForApiError, type UiErrorStateKind } from "../services/error-ui-state";

/** One fact about the subject's identity, mirroring domain/investigation/subject-attribute-value.md (governed attribute name paired with the one value it holds for this instance). */
export type SimulateHypothesisSubjectAttribute = {
  readonly attribute: string;
  readonly value: string;
};

/** The subject this simulation examines, mirroring domain/investigation/subject.md -- assembled by the caller (this hook owns no subject-picking form of its own), never derived here from a stored subject. */
export type SimulateHypothesisSubject = {
  readonly type: string;
  readonly attributes: readonly SimulateHypothesisSubjectAttribute[];
};

/**
 * domain/knowledge/case-version's own pinned identity: `slug` names the
 * case itself (domain/knowledge/case's own stable identity, never shared
 * with another case) and `version` is the immutable version number a slug
 * pairs with to name one content (domain/knowledge/case-version.md: "a
 * version is written once, so the pair names one content") -- the same
 * shape use-simulate-case.ts's own SimulateCaseRef already wires for this
 * engine family, mirroring the route's own caseRefSchema
 * (simulate-hypothesis.dto.ts).
 */
type SimulateHypothesisCaseRef = {
  readonly slug: string;
  readonly version: number;
};

/**
 * The request body POST /v1/simulate/hypothesis is dispatched with (this
 * file's own header comment): the pinned case, the assembled subject, the
 * requester and `hypothesis` -- the one hypothesis's name
 * (domain/knowledge/hypothesis-revision.md: a revision is reached only
 * through the hypothesis it belongs to) this run narrows to, per
 * contracts/investigation/case-simulation's own "simulate-hypothesis
 * narrows the same run to what one named hypothesis revision collects and
 * judges, alone". `requester` is required the same way
 * domain/investigation/investigation.md states it is on every diagnose
 * call this engine family ever receives ("requester ... always given") --
 * exactly simulateHypothesisRequestSchema's own required fields
 * (src/src/http/dto/simulate-hypothesis.dto.ts), never the
 * case-and-requester-less body this hook dispatched before this fix.
 */
type SimulateHypothesisRequestBody = {
  readonly case: SimulateHypothesisCaseRef;
  readonly subject: SimulateHypothesisSubject;
  readonly requester: string;
  readonly hypothesis: string;
};

/** What the judgment call itself spent, mirroring domain/investigation/usage.md. */
export type Usage = {
  readonly input_tokens: number;
  readonly output_tokens: number;
};

/** The traceability a decided evaluation carries, mirroring domain/investigation/citation.md -- one concept and one field of the observation that grounded the verdict. `concept` names the concept by its own glossary identity (a name), the same way this app's other hooks already carry a concept reference as a plain string (use-hypothesis-revision-form.ts's own `collects: readonly string[]`). */
export type Citation = {
  readonly concept: string;
  readonly field: string;
};

/** Why an evaluation is inconclusive, mirroring domain/investigation/evaluation-reason.md. */
export type EvaluationReason = "no-data" | "judgment-failure" | "deadline-exceeded";

/** What the judgment of one hypothesis concluded, mirroring domain/investigation/verdict.md. */
export type Verdict = "confirmed" | "refuted" | "inconclusive";

/**
 * One hypothesis's judgment, mirroring domain/investigation/evaluation.md and
 * the route's own evaluationSchema (simulate-hypothesis.dto.ts) exactly.
 * Modeled as a discriminated union on `verdict` (TYP-04) rather than a bag
 * of optional fields: a decided verdict (confirmed/refuted) always carries
 * at least one citation, an inconclusive verdict always carries its reason
 * and a citations array too -- present on every branch per the route's own
 * schema, though only decided verdicts require it non-empty -- and
 * usage/elapsed_ms/prompt stay optional on both branches since their
 * presence is a fact about whether a judgment call actually happened --
 * present exactly when one did, absent when reason `no-data` means
 * judgment was never called at all -- which neither branch's own
 * discriminant decides on its own.
 */
export type Evaluation =
  | {
      readonly hypothesis: string;
      readonly verdict: "confirmed" | "refuted";
      readonly citations: readonly Citation[];
      readonly usage?: Usage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    }
  | {
      readonly hypothesis: string;
      readonly verdict: "inconclusive";
      readonly reason: EvaluationReason;
      readonly citations: readonly Citation[];
      readonly usage?: Usage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    };

/** How one collection ended, mirroring domain/investigation/evidence-result.md's own closed set: only `ok` carries a usable observation. */
export type EvidenceResult = "ok" | "unavailable" | "denied" | "timeout";

/**
 * One collected concept's whole record, mirroring domain/investigation/evidence.md and the
 * route's own evidenceSchema (simulate-hypothesis.dto.ts) exactly: the capability reference
 * travels as two flat fields, `capability_name` and `capability_version`, never nested under a
 * `capability` object -- this operation's own delivered DTO shape, read fresh from that source
 * rather than mirrored from the sibling use-simulate-case.ts hook's own (structurally different,
 * pre-existing) nested `capability: {name, version}` convention.
 */
export type Evidence = {
  readonly concept: string;
  readonly inputs: string;
  readonly observation: string;
  readonly observed_at: string;
  readonly ttl: number;
  readonly origin: string;
  readonly result: EvidenceResult;
  readonly result_detail?: string;
  readonly capability_name: string;
  readonly capability_version: string;
  readonly elapsed_ms: number;
};

/**
 * How long collection and judgment took, mirroring domain/investigation/durations.md -- narrower
 * than that node's own optional `writing` attribute: the route's own durationsSchema
 * (simulate-hypothesis.dto.ts) never carries a writing field at all, since this operation never
 * consolidates.
 */
export type Durations = {
  readonly collection: number;
  readonly judgment: number;
  readonly total: number;
};

/**
 * The whole simulate-hypothesis response: evidence, exactly one evaluation and stage durations,
 * mirroring the route's own simulateHypothesisResponseSchema (simulate-hypothesis.dto.ts) exactly
 * -- never an outcome or an assessment field
 * (scenarios/investigation/a-single-hypothesis-is-simulated: "no outcome and no assessment are
 * resolved") -- deliberately not the broader shape use-simulate-case's own response carries.
 */
export type SimulateHypothesisResult = {
  readonly evidence: readonly Evidence[];
  readonly evaluation: Evaluation;
  readonly durations: Durations;
};

const SIMULATE_HYPOTHESIS_ENDPOINT = "/v1/simulate/hypothesis";

const GENERIC_SIMULATE_HYPOTHESIS_DISPATCH_FAILURE_MESSAGE =
  "The simulation could not be sent. Check the selected hypothesis and subject, then try again.";

/** No criterion of this task states a distinct wording for a dispatch failure (this file's own header comment, mirroring use-test-connector-panel.ts's own empty table); every mapped kind falls back to the one generic message above, through error-ui-state.ts's own central registry rather than a hand-checked error.code here. */
const SIMULATE_HYPOTHESIS_DISPATCH_FAILURE_MESSAGE_BY_KIND: Partial<
  Record<UiErrorStateKind, string>
> = {};

function simulateHypothesisDispatchFailureMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const state = uiStateForApiError(error);
    return (
      SIMULATE_HYPOTHESIS_DISPATCH_FAILURE_MESSAGE_BY_KIND[state.kind] ??
      GENERIC_SIMULATE_HYPOTHESIS_DISPATCH_FAILURE_MESSAGE
    );
  }
  return GENERIC_SIMULATE_HYPOTHESIS_DISPATCH_FAILURE_MESSAGE;
}

export type SimulateHypothesisState = {
  readonly isSimulating: boolean;
  readonly result: SimulateHypothesisResult | null;
  readonly simulationError: string | null;
  readonly onSimulate: (
    hypothesisName: string,
    subject: SimulateHypothesisSubject,
    requester: string,
  ) => void;
};

/**
 * Dispatches one simulate-hypothesis call for `slug`/`version`, the case
 * version this hook is scoped to -- carried in the dispatched body's own
 * `case` field (this file's own header comment), not in the endpoint path.
 * `hypothesisName`, `subject` and `requester` are supplied per dispatch
 * (this file's own header comment) rather than owned as internal form
 * state; `requester` is forwarded unchanged into the dispatched body, the
 * same way useSimulateCase's own onSimulate already receives one from its
 * caller.
 */
export function useSimulateHypothesis(slug: string, version: number): SimulateHypothesisState {
  const isDispatchingRef = useRef(false);

  const mutation = useMutation({
    mutationFn: (body: SimulateHypothesisRequestBody) =>
      apiFetch<SimulateHypothesisResult>(SIMULATE_HYPOTHESIS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
  });

  const onSimulate = (
    hypothesisName: string,
    subject: SimulateHypothesisSubject,
    requester: string,
  ): void => {
    const canSimulate =
      hypothesisName.trim() !== "" && subject.type !== "" && subject.attributes.length > 0;
    if (!canSimulate || isDispatchingRef.current) {
      return;
    }
    isDispatchingRef.current = true;

    const body: SimulateHypothesisRequestBody = {
      case: { slug, version },
      subject,
      requester,
      hypothesis: hypothesisName,
    };

    mutation.mutate(body, {
      onSettled: () => {
        isDispatchingRef.current = false;
      },
    });
  };

  return {
    isSimulating: mutation.isPending,
    result: mutation.data ?? null,
    simulationError:
      mutation.error !== null ? simulateHypothesisDispatchFailureMessage(mutation.error) : null,
    onSimulate,
  };
}
