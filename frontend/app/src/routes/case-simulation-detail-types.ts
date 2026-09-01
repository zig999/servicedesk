export type SimulationVerdict = "confirmed" | "refuted" | "inconclusive";

export type SimulationEvidenceResult = "ok" | "unavailable" | "denied" | "timeout";

export type SimulationCitation = {
  readonly concept: string;
  readonly field: string;
};

export type SimulationUsage = {
  readonly inputTokens: number;
  readonly outputTokens: number;
};

export type SimulationFieldSemantics = {
  readonly name: string;
  readonly type?: string;
  readonly description?: string;
};

export type SimulationEvidenceItem = {
  readonly concept: string;
  readonly result: SimulationEvidenceResult;
  readonly resultDetail?: string;
  readonly elapsedMs: number;
  readonly observation: string;
  readonly capabilityName: string;
  readonly capabilityVersion: string;
  readonly connector: string;

  readonly fields?: readonly SimulationFieldSemantics[];

  readonly conceptDescription?: string;
};

export type SimulationJudgmentCall =
  | {
      readonly called: true;
      readonly model?: string;
      readonly promptVersion?: string;
      readonly usage: SimulationUsage;
      readonly elapsedMs: number;
      readonly prompt: string;
    }
  | { readonly called: false };

export type SimulationEvaluation = {
  readonly hypothesis: string;
  readonly verdict: SimulationVerdict;
  readonly citations: readonly SimulationCitation[];
  readonly judgmentCall: SimulationJudgmentCall;

  readonly stale?: boolean;
};

export type SimulationHypothesisRevisionSummary = {
  readonly criterion: string;
  readonly collects: readonly string[];
};

export type CaseSimulationDetailPanelProps = {
  readonly hypothesisRevision: SimulationHypothesisRevisionSummary;
  readonly evaluation: SimulationEvaluation;

  readonly evidence: readonly SimulationEvidenceItem[];

  readonly rawResponse: unknown;
};
