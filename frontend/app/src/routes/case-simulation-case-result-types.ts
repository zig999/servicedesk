export type SimulationVerdict = "confirmed" | "refuted" | "inconclusive";

export type SimulationReferral = {
  readonly action: string;
  readonly recipient: string;
};

export type SimulationConsolidationRegister = "formal" | "plain";

export type CaseResultRunHypothesisVerdict = {
  readonly hypothesis: string;
  readonly verdict: SimulationVerdict;
};

export type CaseResultRun = {
  readonly id: string;
  readonly ranAt: string;
  readonly outcome: string;
  readonly referral: SimulationReferral;
  readonly determiningHypothesis?: string;
  readonly text: string;
  readonly register: SimulationConsolidationRegister;
  readonly hypotheses: readonly CaseResultRunHypothesisVerdict[];
  readonly stale: boolean;
};

export const VERDICT_CELL: Record<
  SimulationVerdict,
  { readonly color: string; readonly label: string }
> = {
  confirmed: { color: "bg-success", label: "confirmed" },
  refuted: { color: "bg-destructive", label: "refuted" },
  inconclusive: { color: "bg-warning", label: "inconclusive" },
};

export function formatRunTime(ranAt: string): string {
  return new Date(ranAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function toggleCompareSelection(
  selected: readonly string[],
  id: string,
): readonly string[] {
  if (selected.includes(id)) {
    return selected.filter((existing) => existing !== id);
  }
  if (selected.length < 2) {
    return [...selected, id];
  }
  return [selected[1], id];
}

export function resolveCompareRuns(
  runs: readonly CaseResultRun[],
  selectedIds: readonly string[],
): readonly [CaseResultRun, CaseResultRun] | undefined {
  const matched = runs.filter((run) => selectedIds.includes(run.id));
  if (matched.length !== 2) {
    return undefined;
  }
  return [matched[0], matched[1]];
}

export function verdictForHypothesis(
  run: CaseResultRun,
  hypothesis: string,
): CaseResultRunHypothesisVerdict | undefined {
  return run.hypotheses.find((entry) => entry.hypothesis === hypothesis);
}

export function hypothesisNamesAcross(
  runs: readonly [CaseResultRun, CaseResultRun],
): readonly string[] {
  const [first, second] = runs;
  const names = new Set<string>();
  for (const entry of first.hypotheses) {
    names.add(entry.hypothesis);
  }
  for (const entry of second.hypotheses) {
    names.add(entry.hypothesis);
  }
  return Array.from(names);
}
