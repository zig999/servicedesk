import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch, ApiError } from "../services/api-client";
import { uiStateForApiError, type UiErrorStateKind } from "../services/error-ui-state";

export type SimulateHypothesisSubjectAttribute = {
  readonly attribute: string;
  readonly value: string;
};

export type SimulateHypothesisSubject = {
  readonly type: string;
  readonly attributes: readonly SimulateHypothesisSubjectAttribute[];
};

type SimulateHypothesisCaseRef = {
  readonly slug: string;
  readonly version: number;
};

type SimulateHypothesisRequestBody = {
  readonly case: SimulateHypothesisCaseRef;
  readonly subject: SimulateHypothesisSubject;
  readonly requester: string;
  readonly hypothesis: string;
};

export type Usage = {
  readonly input_tokens: number;
  readonly output_tokens: number;
};

export type Citation = {
  readonly concept: string;
  readonly field: string;
};

export type EvaluationReason = "no-data" | "judgment-failure" | "deadline-exceeded";

export type Verdict = "confirmed" | "refuted" | "inconclusive";

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

export type EvidenceResult = "ok" | "unavailable" | "denied" | "timeout";

export type FieldSemantics = {
  readonly name: string;
  readonly type?: string;
  readonly description?: string;
};

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

  readonly fields?: readonly FieldSemantics[];

  readonly concept_description?: string;
};

export type Durations = {
  readonly collection: number;
  readonly judgment: number;
  readonly total: number;
};

export type SimulateHypothesisResult = {
  readonly evidence: readonly Evidence[];
  readonly evaluation: Evaluation;
  readonly durations: Durations;
};

const SIMULATE_HYPOTHESIS_ENDPOINT = "/v1/simulate/hypothesis";

const GENERIC_SIMULATE_HYPOTHESIS_DISPATCH_FAILURE_MESSAGE =
  "The simulation could not be sent. Check the selected hypothesis and subject, then try again.";

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
