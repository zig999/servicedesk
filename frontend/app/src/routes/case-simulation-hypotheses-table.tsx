import type { JSX } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";
import {
  costCell,
  hypothesisLabel,
  verdictCell,
  type SimulationDurations,
  type SimulationManifestRow,
  type SimulationRunSummary,
} from "./case-simulation-hypotheses-table-row";

/**
 * task/simulation-cockpit/hypotheses-table: the Hypotheses region of the
 * case simulation cockpit (intake/layout/simulation-screen.md's own
 * "Hypotheses" region, read only for form) -- the precedence-ordered
 * StatusTable of every manifested hypothesis (domain/knowledge/case-version's
 * own manifest, domain/knowledge/manifest-entry, domain/knowledge/
 * hypothesis-revision), each row's last-run verdict (domain/investigation/
 * verdict, domain/investigation/evaluation-reason) and token cost
 * (domain/investigation/usage), a simulate action and an edit action, and
 * beneath the table the determining/outcome/referral summary line from the
 * last full-case run (domain/investigation/assessment, domain/knowledge/
 * resolution, domain/knowledge/referral) plus that run's own stage-timing
 * line (domain/investigation/durations, measured values only -- this task's
 * own Notes: the 7s/5s/4s budget figures live only in rules scoped to
 * `diagnose`, outside this task's implements and this epic's covers, so no
 * budget comparison is shown). The pure types and cell-shaping helpers this
 * component composes live in case-simulation-hypotheses-table-row.ts
 * (MNT-01/ARC-03: kept out of this file's own JSX render logic).
 *
 * Presentational and fixture-driven by this task's own rationale: every
 * fact renders from props, and a row's own simulate action is exposed as a
 * callback (criterion 6) this component never dispatches itself --
 * `use-simulate-case`/`use-simulate-hypothesis` (contracts/investigation/
 * case-simulation's own two operations) are separate, not-yet-delivered
 * tasks in this same epic, and this component depends on neither. Because it
 * dispatches nothing itself, it also cannot write an investigation of its
 * own accord -- rules/investigation/a-simulation-writes-no-investigation is
 * honored by this component issuing no request at all, not by a check this
 * file makes. This region is the curator's own view (contracts/
 * investigation/case-simulation's own description: the operational detail
 * "rules/investigation/the-customer-sees-only-the-text keeps from the
 * customer" is "faced to the curator instead"), so verdicts and costs are
 * shown here deliberately -- that rule constrains a different,
 * customer-facing surface no code in this delivery renders.
 *
 * `hypothesisName` on `SimulationManifestRow` is a routing identity only --
 * it builds the edit action's own route param and names which hypothesis
 * the simulate callback acts on -- never this row's own *displayed* label.
 * The "name" the objective's own prose names lives on domain/knowledge/
 * hypothesis, outside this task's own `implements` (this task's own Notes);
 * a row's visible Hypothesis-column text is therefore sourced only from
 * `evaluation.hypothesis` (domain/investigation/evaluation's own field, in
 * `implements`) when this session has produced one, and left blank
 * otherwise.
 */

export type CaseSimulationHypothesesTableProps = {
  readonly slug: string;
  readonly version: number;
  readonly rows: readonly SimulationManifestRow[];
  readonly summary?: SimulationRunSummary;
  readonly lastRunDurations?: SimulationDurations;
  /** Criterion 6: dispatch belongs to the caller, never to this component. */
  readonly onSimulateHypothesis: (hypothesisName: string) => void;
};

const COLUMNS: StatusTableColumn[] = [
  { key: "position", header: "#" },
  { key: "hypothesis", header: "Hypothesis" },
  { key: "collects", header: "Collects" },
  { key: "verdict", header: "Verdict" },
  { key: "cost", header: "Cost (tok)" },
  { key: "actions", header: "Actions" },
];

/**
 * Criterion 4's own `?back=simulate` query. Declared as a named constant,
 * typed against a fixed shape, rather than an inline object literal at the
 * call site: TypeScript's excess-property check applies only to a "fresh"
 * object literal assigned directly where it is written, never to a
 * pre-declared variable of a wider or narrower type passed by reference
 * (the TypeScript Handbook's own documented escape from that check).
 * manifestHypothesisRoute (route-tree.tsx) declares no `validateSearch`
 * today, so its own resolved search schema is `{}` -- amending that route's
 * schema is route-tree.tsx's own task's remit, not this region's, and this
 * constant's own shape does not need to change if it later does, since any
 * concrete object type is structurally assignable to `{}`.
 */
const EDIT_LINK_SEARCH: { readonly back: "simulate" } = { back: "simulate" };

function RowActions({
  slug,
  version,
  row,
  onSimulateHypothesis,
}: {
  readonly slug: string;
  readonly version: number;
  readonly row: SimulationManifestRow;
  readonly onSimulateHypothesis: (hypothesisName: string) => void;
}): JSX.Element {
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        type="button"
        aria-label={`Simulate hypothesis at position ${row.position}`}
        onClick={() => onSimulateHypothesis(row.hypothesisName)}
      >
        Simulate
      </Button>
      <Link
        to="/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName"
        params={{ slug, version: String(version), hypothesisName: row.hypothesisName }}
        search={EDIT_LINK_SEARCH}
        aria-label={`Edit hypothesis at position ${row.position}`}
      >
        Edit
      </Link>
    </span>
  );
}

function toTableRow(
  slug: string,
  version: number,
  row: SimulationManifestRow,
  onSimulateHypothesis: (hypothesisName: string) => void,
): StatusTableRow {
  return {
    id: row.position,
    position: row.position,
    hypothesis: hypothesisLabel(row),
    collects: row.collects.length,
    verdict: verdictCell(row.evaluation),
    cost: costCell(row.evaluation),
    actions: (
      <RowActions
        slug={slug}
        version={version}
        row={row}
        onSimulateHypothesis={onSimulateHypothesis}
      />
    ),
  };
}

/**
 * Criterion 5: the determining/outcome/referral line, absent when no
 * full-case run has completed this session (no `summary` prop, handled by
 * the caller below rather than here). `determiningHypothesis` absent ->
 * "Fallback", domain/knowledge/case-version's own name for the position
 * that answers when nothing confirms -- this task's own inference, the
 * same reasoning applied to VERDICT_CELL's own labels
 * (case-simulation-hypotheses-table-row.ts).
 */
function SummaryLine({ summary }: { readonly summary: SimulationRunSummary }): JSX.Element {
  return (
    <p className="text-sm text-foreground">
      Determining: {summary.determiningHypothesis ?? "Fallback"} · Outcome{" "}
      {summary.outcome} · Referral {summary.referral.action} / {summary.referral.recipient}
    </p>
  );
}

/** The last run's own measured stage durations, no budget comparison. */
function DurationsLine({
  durations,
}: {
  readonly durations: SimulationDurations;
}): JSX.Element {
  return (
    <p className="text-sm text-muted-foreground">
      Last run · collection {durations.collectionMs}ms · judgment {durations.judgmentMs}ms
      {durations.writingMs !== undefined ? ` · writing ${durations.writingMs}ms` : ""} · total{" "}
      {durations.totalMs}ms
    </p>
  );
}

export function CaseSimulationHypothesesTable({
  slug,
  version,
  rows,
  summary,
  lastRunDurations,
  onSimulateHypothesis,
}: CaseSimulationHypothesesTableProps): JSX.Element {
  // Criterion 1: "the manifest's own precedence order" holds regardless of
  // how the caller happens to assemble `rows`.
  const orderedRows = [...rows].sort((a, b) => a.position - b.position);

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">Hypotheses</h2>
      {orderedRows.length === 0 ? (
        // API-04: an empty manifest renders its own explicit empty state,
        // never an empty table with nothing said about why.
        <p>This version&apos;s manifest holds no hypothesis.</p>
      ) : (
        <StatusTable
          columns={COLUMNS}
          rows={orderedRows.map((row) => toTableRow(slug, version, row, onSimulateHypothesis))}
        />
      )}
      {summary && <SummaryLine summary={summary} />}
      {lastRunDurations && <DurationsLine durations={lastRunDurations} />}
    </section>
  );
}
