import type { JSX } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";
import {
  useHypothesisRevisions,
  type HypothesisRevisionState,
} from "../hooks/use-hypothesis-revisions";
import { useCaseHypothesisCurrentPin } from "../hooks/use-case-hypothesis-current-pin";

const REVISION_COLUMNS: StatusTableColumn[] = [
  { key: "revision", header: "Revision" },
  { key: "state", header: "State" },
  { key: "status", header: "Status" },
  { key: "criterion", header: "Criterion" },
  { key: "collects", header: "Collects" },
  { key: "actions", header: "Actions" },
];

const REVISION_STATE_CELL: Readonly<
  Record<HypothesisRevisionState, { color: string; label: string }>
> = {
  draft: { color: "bg-warning", label: "Draft" },
  released: { color: "bg-success", label: "Released" },
};

export type HypothesisRevisionHistoryProps = {
  readonly slug: string;
  readonly hypothesisName: string;
  readonly onBack: () => void;
};

export function HypothesisRevisionHistory({
  slug,
  hypothesisName,
  onBack,
}: HypothesisRevisionHistoryProps): JSX.Element {
  const revisionsQuery = useHypothesisRevisions(slug, hypothesisName);
  const currentPin = useCaseHypothesisCurrentPin(slug, hypothesisName);

  function retryLoad(): void {
    void revisionsQuery.refetch();
    if (currentPin.phase === "load-error") {
      currentPin.retryLoad();
    }
  }

  if (revisionsQuery.isLoading || currentPin.phase === "loading") {
    return <p>Loading revision history…</p>;
  }

  const revisions = revisionsQuery.data?.data ?? [];

  if (revisionsQuery.isError || revisions.length === 0 || currentPin.phase === "load-error") {
    return (
      <section>
        <p>Unable to load this hypothesis&apos;s revision history.</p>
        <Button type="button" onClick={retryLoad}>
          Retry
        </Button>
      </section>
    );
  }

  const totalRevisions = revisionsQuery.data?.total ?? revisions.length;

  const rows: StatusTableRow[] = revisions
    .slice()
    .sort((a, b) => b.revision - a.revision)
    .map((revision) => {
      const isCurrent = revision.revision === currentPin.pinnedRevision;
      return {
        id: revision.revision,
        revision: revision.revision,
        state: REVISION_STATE_CELL[revision.state],
        status: isCurrent
          ? { color: "bg-success", label: "current" }
          : { color: "bg-muted-foreground", label: "frozen" },
        criterion: revision.criterion,
        collects: revision.collects.join(", "),
        actions: isCurrent ? (
          <Link
            to="/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName"
            params={{ slug, version: String(currentPin.targetVersion), hypothesisName }}
          >
            Revise →
          </Link>
        ) : null,
      };
    });

  const usesNoRevision = currentPin.phase === "ready" && currentPin.pinnedRevision === null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2>
          {hypothesisName} — {totalRevisions} revision{totalRevisions === 1 ? "" : "s"}
        </h2>
        <Button type="button" onClick={onBack}>
          Back to hypotheses
        </Button>
      </div>
      {usesNoRevision ? (
        <p>The case currently uses no revision of {hypothesisName}.</p>
      ) : null}
      <StatusTable columns={REVISION_COLUMNS} rows={rows} />
    </section>
  );
}
