import type { JSX } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";
import { CaseSimulationStatusDot } from "./case-simulation-status-dot";
import {
  costCell,
  hypothesisLabel,
  verdictCell,
  type SimulationDurations,
  type SimulationManifestRow,
  type SimulationRunSummary,
} from "./case-simulation-hypotheses-table-row";

export type CaseSimulationHypothesesTableProps = {
  readonly slug: string;
  readonly version: number;
  readonly rows: readonly SimulationManifestRow[];
  readonly summary?: SimulationRunSummary;
  readonly lastRunDurations?: SimulationDurations;

  readonly onSimulateHypothesis: (hypothesisName: string) => void;

  readonly disableSimulate?: boolean;

  readonly onSelectHypothesis?: (hypothesisName: string) => void;
};

const COLUMNS: StatusTableColumn[] = [
  { key: "position", header: "#" },
  { key: "hypothesis", header: "Hypothesis" },
  { key: "revision", header: "Version" },
  { key: "collects", header: "Collects" },
  { key: "verdict", header: "Verdict" },
  { key: "cost", header: "Cost (tok)" },
  { key: "actions", header: "Actions" },
  { key: "stale", header: "Stale" },
];

const EDIT_LINK_SEARCH: { readonly back: "simulate" } = { back: "simulate" };

function RowActions({
  slug,
  version,
  row,
  onSimulateHypothesis,
  disableSimulate,
}: {
  readonly slug: string;
  readonly version: number;
  readonly row: SimulationManifestRow;
  readonly onSimulateHypothesis: (hypothesisName: string) => void;
  readonly disableSimulate: boolean;
}): JSX.Element {
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        type="button"
        aria-label={`Simulate hypothesis at position ${row.position}`}
        disabled={disableSimulate}
        onClick={() => onSimulateHypothesis(row.hypothesisName)}
      >
        Simulate
      </Button>
      <Button type="button" variant="secondary" asChild>
        <Link
          to="/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName"
          params={{ slug, version: String(version), hypothesisName: row.hypothesisName }}
          search={EDIT_LINK_SEARCH}
          aria-label={`Edit hypothesis at position ${row.position}`}
        >
          Edit
        </Link>
      </Button>
    </span>
  );
}

function staleCell(row: SimulationManifestRow): JSX.Element | null {
  return row.evaluation?.stale ? (
    <CaseSimulationStatusDot color="bg-warning" label="Stale" />
  ) : null;
}

function toTableRow(
  slug: string,
  version: number,
  row: SimulationManifestRow,
  onSimulateHypothesis: (hypothesisName: string) => void,
  disableSimulate: boolean,
): StatusTableRow {
  return {
    id: row.position,
    position: row.position,
    hypothesis: hypothesisLabel(row),
    revision: row.revision,
    collects: row.collects.length,
    verdict: verdictCell(row.evaluation),
    stale: staleCell(row),
    cost: costCell(row.evaluation),
    actions: (
      <RowActions
        slug={slug}
        version={version}
        row={row}
        onSimulateHypothesis={onSimulateHypothesis}
        disableSimulate={disableSimulate}
      />
    ),
  };
}

function handleRowSelected(
  row: StatusTableRow,
  rows: readonly SimulationManifestRow[],
  onSelectHypothesis: (hypothesisName: string) => void,
): void {
  const position = row.id;
  if (typeof position !== "number") {
    return;
  }
  const matched = rows.find((candidate) => candidate.position === position);
  if (matched) {
    onSelectHypothesis(matched.hypothesisName);
  }
}

function SummaryLine({ summary }: { readonly summary: SimulationRunSummary }): JSX.Element {
  return (
    <p className="text-sm text-foreground">
      Determining: {summary.determiningHypothesis ?? "Fallback"} · Outcome{" "}
      {summary.outcome} · Referral {summary.referral.action} / {summary.referral.recipient}
    </p>
  );
}

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
  disableSimulate = false,
  onSelectHypothesis,
}: CaseSimulationHypothesesTableProps): JSX.Element {

  const orderedRows = [...rows].sort((a, b) => a.position - b.position);

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">Hypotheses</h2>
      {orderedRows.length === 0 ? (

        <p>This version&apos;s manifest holds no hypothesis.</p>
      ) : (
        <StatusTable
          columns={COLUMNS}
          rows={orderedRows.map((row) =>
            toTableRow(slug, version, row, onSimulateHypothesis, disableSimulate),
          )}
          onRowClick={
            onSelectHypothesis
              ? (row) => handleRowSelected(row, orderedRows, onSelectHypothesis)
              : undefined
          }
        />
      )}
      {summary && <SummaryLine summary={summary} />}
      {lastRunDurations && <DurationsLine durations={lastRunDurations} />}
    </section>
  );
}
