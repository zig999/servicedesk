import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch, ApiError } from "../services/api-client";
import { uiStateForApiError, type UiErrorStateKind } from "../services/error-ui-state";

export type SimulateCaseRef = {
  readonly slug: string;
  readonly version: number;
};

export type SimulateSubjectAttributeValue = {
  readonly attribute: string;
  readonly value: string;
};

export type SimulateSubject = {
  readonly type: string;
  readonly attributes: readonly SimulateSubjectAttributeValue[];
};

export type SimulateCaseRequestBody = {
  readonly case: SimulateCaseRef;
  readonly subject: SimulateSubject;
  readonly requester: string;
};

export type SimulateEvidenceResult = "ok" | "unavailable" | "denied" | "timeout";

export type SimulateVerdict = "confirmed" | "refuted" | "inconclusive";

export type SimulateEvaluationReason = "no-data" | "judgment-failure" | "deadline-exceeded";

export type SimulateUsage = {
  readonly input_tokens: number;
  readonly output_tokens: number;
};

export type SimulateCitation = {
  readonly concept: string;
  readonly field: string;
};

export type SimulateCost = {
  readonly calls: number;
  readonly input_tokens: number;
  readonly output_tokens: number;
};

export type SimulateDurations = {
  readonly collection: number;
  readonly judgment: number;
  readonly writing?: number;
  readonly total: number;
};

export type SimulateFieldSemantics = {
  readonly name: string;
  readonly type?: string;
  readonly description?: string;
};

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

  readonly fields?: readonly SimulateFieldSemantics[];

  readonly concept_description?: string;
};

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

export type SimulateReferral = {
  readonly action: string;
  readonly recipient: string;
};

export type SimulateConsolidationRegister = "formal" | "plain";

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

const SIMULATE_CASE_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind, string>> = {};

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

  readonly result: SimulateCaseResult | null;

  readonly isSimulating: boolean;

  readonly simulateError: string | null;

  readonly onSimulate: (body: SimulateCaseRequestBody) => void;
};

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
