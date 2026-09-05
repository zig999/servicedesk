export type SimulationVerdict = "confirmed" | "refuted" | "inconclusive";

export type SimulationEvaluationReason =
  | "no-data"
  | "judgment-failure"
  | "deadline-exceeded";

export type SimulationUsage = {
  readonly input_tokens: number;
  readonly output_tokens: number;
};

export type SimulationHypothesisEvaluation = {
  readonly hypothesis: string;
  readonly verdict: SimulationVerdict;
  readonly reason?: SimulationEvaluationReason;
  readonly usage?: SimulationUsage;
  readonly stale?: boolean;
};

export type SimulationManifestRow = {
  readonly position: number;
  readonly hypothesisName: string;
  readonly revision: number;
  readonly collects: readonly string[];
  readonly evaluation?: SimulationHypothesisEvaluation;
};

export type SimulationReferral = {
  readonly action: string;
  readonly recipient: string;
};

export type SimulationRunSummary = {
  readonly outcome: string;
  readonly referral: SimulationReferral;
  readonly determiningHypothesis?: string;
};

export type SimulationDurations = {
  readonly collectionMs: number;
  readonly judgmentMs: number;
  readonly writingMs?: number;
  readonly totalMs: number;
};

export const VERDICT_CELL: Record<SimulationVerdict, { color: string; label: string }> = {
  confirmed: { color: "bg-success", label: "Confirmed" },
  refuted: { color: "bg-destructive", label: "Refuted" },
  inconclusive: { color: "bg-warning", label: "Inconclusive" },
};

export const REASON_LABEL: Record<SimulationEvaluationReason, string> = {
  "no-data": "no data",
  "judgment-failure": "judgment failed",
  "deadline-exceeded": "deadline exceeded",
};

export function hypothesisLabel(row: SimulationManifestRow): string {
  return row.hypothesisName;
}

export function verdictCell(
  evaluation: SimulationHypothesisEvaluation | undefined,
): { color: string; label: string } | string {
  if (!evaluation) {
    return "—";
  }
  const base = VERDICT_CELL[evaluation.verdict];
  if (evaluation.verdict === "inconclusive" && evaluation.reason) {
    return { color: base.color, label: `${base.label} · ${REASON_LABEL[evaluation.reason]}` };
  }
  return base;
}

export function costCell(evaluation: SimulationHypothesisEvaluation | undefined): string {
  if (!evaluation?.usage) {
    return "—";
  }
  return String(evaluation.usage.input_tokens + evaluation.usage.output_tokens);
}
