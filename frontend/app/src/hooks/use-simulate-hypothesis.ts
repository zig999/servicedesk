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
 * picker or a subject-attribute form -- so the hypothesis name and the
 * subject are received as this hook's own dispatch arguments instead,
 * exactly as domain/investigation/subject.md's own responsibility puts it:
 * "the entry point... assembles that whole set before the diagnose call".
 * There is therefore no persisted form validity to expose as a canX
 * boolean; what the convention's dispatch-gating protects -- refusing a
 * second concurrent dispatch -- is preserved through the same
 * isDispatchingRef re-entrancy guard onTest uses, checked against the
 * per-call arguments instead of internal field state.
 *
 * Endpoint: no live route exists yet (task's own Notes: "the sibling
 * backend initiative has not delivered this route yet"). POST
 * /v1/cases/{slug}/versions/{version}/simulate-hypothesis is this task's
 * own inference, drawn from three things read before writing this file:
 * this app's own existing action-on-a-case-version convention -- POST
 * /v1/cases/{slug}/versions/{version}/release (use-edit-draft-version-form.ts)
 * and PUT/DELETE /v1/cases/{slug}/versions/{version}/manifest/{name}
 * (use-manifest-builder.ts), both addressing the version through the path
 * and the action through one trailing kebab-case segment; the sibling
 * use-simulate-case task's own text, which names no route either and so
 * settles nothing beyond confirming no live backend exists to read one
 * from; and the contract's own operation name `simulate-hypothesis`,
 * already kebab-case, used verbatim as that trailing segment. Only the
 * hypothesis name and the assembled subject travel in the body -- the
 * case version is already fully addressed by the path, mirroring the
 * `/release` call's own POST-with-no-duplicated-identity shape.
 *
 * Wire field names mirror the specification's own attribute names
 * verbatim (domain/investigation/evaluation.md: hypothesis, verdict,
 * reason, citations, usage, elapsed_ms, prompt; domain/investigation/usage.md:
 * input_tokens, output_tokens) rather than a camelCase this task has no
 * live backend to observe -- there is nothing else authoritative to mirror
 * a wire shape from before that backend exists.
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

/** The request body this hook's inferred endpoint (this file's own header comment) is dispatched with -- the case version is addressed by the path alone, so only the named hypothesis and the assembled subject travel here. */
type SimulateHypothesisRequestBody = {
  readonly hypothesis: string;
  readonly subject: SimulateHypothesisSubject;
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
 * One hypothesis's judgment, mirroring domain/investigation/evaluation.md.
 * Modeled as a discriminated union on `verdict` (TYP-04) rather than a bag
 * of optional fields: a decided verdict (confirmed/refuted) always carries
 * its citations and never a reason, an inconclusive verdict always carries
 * its reason and never claims citations, and usage/elapsed_ms/prompt stay
 * optional on both branches since their presence is a fact about whether a
 * judgment call actually happened -- present exactly when one did, absent
 * when reason `no-data` means judgment was never called at all -- which
 * neither branch's own discriminant decides on its own.
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
      readonly usage?: Usage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    };

/**
 * The whole simulate-hypothesis response: exactly one evaluation, never an
 * outcome or an assessment field (scenarios/investigation/a-single-hypothesis-is-simulated:
 * "no outcome and no assessment are resolved") -- deliberately not the
 * broader shape use-simulate-case's own response carries.
 */
export type SimulateHypothesisResult = {
  readonly evaluation: Evaluation;
};

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
  readonly onSimulate: (hypothesisName: string, subject: SimulateHypothesisSubject) => void;
};

/**
 * Dispatches one simulate-hypothesis call for `slug`/`version`, the case
 * version this hook is scoped to. `hypothesisName` and `subject` are
 * supplied per dispatch (this file's own header comment) rather than owned
 * as internal form state.
 */
export function useSimulateHypothesis(slug: string, version: number): SimulateHypothesisState {
  const isDispatchingRef = useRef(false);

  const mutation = useMutation({
    mutationFn: (body: SimulateHypothesisRequestBody) =>
      apiFetch<SimulateHypothesisResult>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${version}/simulate-hypothesis`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      ),
  });

  const onSimulate = (hypothesisName: string, subject: SimulateHypothesisSubject): void => {
    const canSimulate =
      hypothesisName.trim() !== "" && subject.type !== "" && subject.attributes.length > 0;
    if (!canSimulate || isDispatchingRef.current) {
      return;
    }
    isDispatchingRef.current = true;

    const body: SimulateHypothesisRequestBody = {
      hypothesis: hypothesisName,
      subject,
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
