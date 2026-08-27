/**
 * Pure types and helpers for the Case result region
 * (task/simulation-cockpit/case-result-panel): the outcome/referral/
 * determining line and the customer-facing text of the last full-case run
 * (domain/investigation/assessment, domain/knowledge/resolution,
 * domain/knowledge/referral), the shape of one in-memory run this session
 * keeps, and the pure selection/lookup helpers the Compare view (criterion
 * 4) and the panel (criteria 1, 3, 5) compose -- split out of
 * case-simulation-case-result-panel.tsx per MNT-01/ARC-03, the same split
 * case-simulation-hypotheses-table-row.ts and case-simulation-detail-types.ts
 * already establish in this epic.
 *
 * Narrowed to exactly what this task's own criteria read: `citations`,
 * `usage`, `elapsed_ms` and `prompt` (domain/investigation/evaluation,
 * domain/investigation/assessment) belong to the Detail region and to the
 * customer-facing text box's own two fields respectively -- neither is
 * carried on the per-hypothesis Compare row, which shows only the verdict.
 * `domain/investigation/evaluation-reason` is deliberately not modeled here
 * either -- it is not part of this task's own `implements`, and no
 * criterion of this task asks the Compare view to show a reason; that
 * belongs to case-simulation-hypotheses-table-row.ts's own row.
 */

/** domain/investigation/verdict's own three values. */
export type SimulationVerdict = "confirmed" | "refuted" | "inconclusive";

/** domain/knowledge/referral: what to do and which operational role does it. */
export type SimulationReferral = {
  readonly action: string;
  readonly recipient: string;
};

/**
 * domain/knowledge/consolidation-register's own closed set -- the register
 * the writing call actually used, per domain/investigation/assessment's own
 * `register` attribute (criterion 2's own "labeled with assessment.register").
 */
export type SimulationConsolidationRegister = "formal" | "plain";

/**
 * One hypothesis's own verdict for a completed run (domain/investigation/
 * evaluation, narrowed to exactly what the Compare view shows side by side,
 * criterion 4): which hypothesis, what it concluded. Citations, usage,
 * elapsed_ms, prompt and reason all belong to a different region or a
 * different task -- see this file's own header doc.
 */
export type CaseResultRunHypothesisVerdict = {
  readonly hypothesis: string;
  readonly verdict: SimulationVerdict;
};

/**
 * One completed full-case run, kept only in this region's own in-memory
 * history (criterion 3) -- never persisted, sent to any endpoint, or read
 * from a cache (rules/investigation/a-simulation-writes-no-investigation).
 * `id` and `ranAt` are this region's own bookkeeping (a stable key and a
 * client-observed timestamp for the history list), not a fact any
 * specification node states; every other field is the last full-case run's
 * own domain/investigation/assessment (outcome, referral,
 * determiningHypothesis, text, register) plus, per judged hypothesis, its
 * domain/investigation/evaluation verdict for the Compare view.
 * `determiningHypothesis` is absent exactly when nothing confirmed and the
 * fallback answered (domain/investigation/assessment's own description),
 * mirroring how domain/knowledge/case-version's own fallback is already
 * named "Fallback" by case-simulation-hypotheses-table-row.ts's own
 * SummaryLine. `stale` is this region's own passive marker (criterion 5) --
 * set once screen-assembly reports the underlying case version changed
 * underneath it (contracts/knowledge/case-lifecycle's own update-draft,
 * revise-hypothesis, place-hypothesis, remove-hypothesis, release or
 * discard), independent of whether a new run ever replaces it as the last
 * one.
 */
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

/**
 * Colors for domain/investigation/verdict's own three values -- no
 * specification node this task implements names a color for any of them, so
 * this mirrors case-simulation-detail-panel.tsx's own identical VERDICT_CELL
 * inference (bg-success/bg-destructive/bg-warning, TUI's own semantic
 * tokens already used throughout this app) rather than a second, divergent
 * palette.
 */
export const VERDICT_CELL: Record<
  SimulationVerdict,
  { readonly color: string; readonly label: string }
> = {
  confirmed: { color: "bg-success", label: "confirmed" },
  refuted: { color: "bg-destructive", label: "refuted" },
  inconclusive: { color: "bg-warning", label: "inconclusive" },
};

/** The one-line time label a run renders in the history list and the Compare header -- form only (intake/layout/simulation-screen.md's own "#3 14:02"), never a fact any node states. */
export function formatRunTime(ranAt: string): string {
  return new Date(ranAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Toggles one run's id in or out of a two-slot Compare selection: picking a
 * third id drops the oldest of the two already held rather than growing
 * past two, since criterion 4 asks for exactly two runs side by side and no
 * criterion states a different rule for a third pick. This task's own
 * inference -- no criterion names a selection mechanism at all, only the
 * resulting two-run view.
 */
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

/**
 * Resolves the two selected runs, in this history's own chronological order
 * (never selection order) -- undefined unless exactly two of `selectedIds`
 * match a run currently in history, which keeps the Compare view from ever
 * rendering with one slot missing.
 */
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

/** The hypothesis-verdict entry a given run carries for one named hypothesis, or undefined when that run never judged it. */
export function verdictForHypothesis(
  run: CaseResultRun,
  hypothesis: string,
): CaseResultRunHypothesisVerdict | undefined {
  return run.hypotheses.find((entry) => entry.hypothesis === hypothesis);
}

/**
 * Every hypothesis either of the two compared runs judged, deduplicated --
 * criterion 4's own "hypothesis by hypothesis": a hypothesis only one of
 * the two runs judged (e.g. placed in the manifest after the earlier run)
 * still gets its own row, with the untouched side left blank by the
 * Compare view rather than the row being dropped.
 */
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
