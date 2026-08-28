/**
 * Pure types and cell-shaping helpers for case-simulation-hypotheses-table.tsx
 * (task/simulation-cockpit/hypotheses-table), extracted from that file so its
 * own JSX composition stays under this project's own max-component-lines
 * rule (MNT-01) -- a mechanical split, matching ARC-03's own requirement
 * that a computation or a transformation of fetched data live outside a
 * component's JSX render logic. No fact here is new: every type and helper
 * below is documented, and referenced, from case-simulation-hypotheses-
 * table.tsx's own file-level doc.
 */

export type SimulationVerdict = "confirmed" | "refuted" | "inconclusive";

export type SimulationEvaluationReason =
  | "no-data"
  | "judgment-failure"
  | "deadline-exceeded";

/** domain/investigation/usage: one provider call's own token spend. */
export type SimulationUsage = {
  readonly input_tokens: number;
  readonly output_tokens: number;
};

/**
 * The subset of domain/investigation/evaluation this row needs: its own
 * verdict, its reason when inconclusive, and the call-level usage the
 * token-cost cell reads -- never citations, elapsed_ms or prompt, which
 * belong to the per-hypothesis detail region, a separate task in this epic.
 * `stale` (rules/investigation/a-simulation-result-is-stale-once-its-source-
 * changes) is carried through from CockpitEvaluation (case-simulation-
 * cockpit-adapters.ts's own toRowEvaluation) unchanged, symmetric to the
 * Case Result region's own CaseResultRun.stale. Optional rather than
 * required, matching CockpitEvaluation's own field: an absent value reads
 * exactly as "not stale" at this row's own read site (staleCell in
 * case-simulation-hypotheses-table.tsx reads `row.evaluation?.stale`), the
 * correct reading for every already-existing fixture that predates this
 * field and was never stale to begin with.
 */
export type SimulationHypothesisEvaluation = {
  readonly hypothesis: string;
  readonly verdict: SimulationVerdict;
  readonly reason?: SimulationEvaluationReason;
  readonly usage?: SimulationUsage;
  readonly stale?: boolean;
};

/**
 * One manifest-entry row (domain/knowledge/manifest-entry's own `position`,
 * domain/knowledge/hypothesis-revision's own `collects`), always rendered
 * whether or not `evaluation` is present (criterion 1). `hypothesisName` is
 * a routing identity only -- see case-simulation-hypotheses-table.tsx's own
 * file-level doc for why it is never this row's own displayed label.
 */
export type SimulationManifestRow = {
  readonly position: number;
  readonly hypothesisName: string;
  readonly collects: readonly string[];
  readonly evaluation?: SimulationHypothesisEvaluation;
};

/** domain/knowledge/referral: what to do and which operational role does it. */
export type SimulationReferral = {
  readonly action: string;
  readonly recipient: string;
};

/**
 * The determining/outcome/referral summary this region reads from the last
 * full-case run's own assessment (domain/investigation/assessment) --
 * outcome, referral and determining_hypothesis come from the case's own
 * resolve-outcome (domain/knowledge/case-version) and are never decided
 * here. `outcome` and `referral` are always co-required, never one without
 * the other -- domain/knowledge/resolution's own pairing responsibility,
 * mirrored structurally rather than through a nested `resolution` field
 * (assessment's own attributes are flat, and this type follows that shape).
 * `determiningHypothesis` is absent exactly when nothing confirmed and the
 * fallback answered.
 */
export type SimulationRunSummary = {
  readonly outcome: string;
  readonly referral: SimulationReferral;
  readonly determiningHypothesis?: string;
};

/**
 * domain/investigation/durations, unmodified: how long each stage of the
 * last run took. `writingMs` is present exactly when a consolidation call
 * happened -- a full-case run only, since `simulate-hypothesis` resolves no
 * outcome and never reaches writing.
 */
export type SimulationDurations = {
  readonly collectionMs: number;
  readonly judgmentMs: number;
  readonly writingMs?: number;
  readonly totalMs: number;
};

/**
 * Neither domain/investigation/verdict nor any node this task implements
 * names a color for any of its three values -- only the values themselves
 * -- so this table is this task's own inference, the same reasoning
 * case-detail-screen.tsx's own STATE_CELL already recorded for
 * domain/knowledge/case-version-state. All three are TUI's own semantic
 * tokens (bg-success, bg-destructive, bg-warning), already read elsewhere
 * in this app (json-textarea-field.tsx's own text-destructive, case-detail-
 * screen.tsx's own bg-success/bg-warning), not a second literal palette.
 */
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

/**
 * The Hypothesis column's own text: blank unless this row has produced an
 * evaluation this session, in which case it is evaluation.hypothesis
 * verbatim (this task's own Notes -- see the .tsx file's own doc).
 */
export function hypothesisLabel(row: SimulationManifestRow): string {
  return row.evaluation ? row.evaluation.hypothesis : "—";
}

/**
 * Criterion 3: a row that has not run this session shows no verdict at all
 * (a plain placeholder, never a colored cell); a row whose last run
 * resolved inconclusive always shows its reason alongside the verdict.
 */
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

/** The call's own input+output token spend; blank when no call happened. */
export function costCell(evaluation: SimulationHypothesisEvaluation | undefined): string {
  if (!evaluation?.usage) {
    return "—";
  }
  return String(evaluation.usage.input_tokens + evaluation.usage.output_tokens);
}
