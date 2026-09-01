import type { JSX } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";
import { useHypothesisRevisions } from "../hooks/use-hypothesis-revisions";
import { useCaseVersions } from "../hooks/use-case-versions";

const REVISION_COLUMNS: StatusTableColumn[] = [
  { key: "revision", header: "Revision" },
  { key: "status", header: "Status" },
  { key: "criterion", header: "Criterion" },
  { key: "collects", header: "Collects" },
  { key: "actions", header: "Actions" },
];

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
  const versionsQuery = useCaseVersions(slug);

  function retryLoad(): void {
    void revisionsQuery.refetch();
    void versionsQuery.refetch();
  }

  if (revisionsQuery.isLoading || versionsQuery.isLoading) {
    return <p>Loading revision history…</p>;
  }

  const revisions = revisionsQuery.data?.data ?? [];
  const versions = versionsQuery.data?.data ?? [];

  if (
    revisionsQuery.isError ||
    versionsQuery.isError ||
    revisions.length === 0 ||
    versions.length === 0
  ) {
    return (
      <section>
        <p>Unable to load this hypothesis&apos;s revision history.</p>
        <Button type="button" onClick={retryLoad}>
          Retry
        </Button>
      </section>
    );
  }

  const currentRevisionNumber = Math.max(...revisions.map((revision) => revision.revision));
  const targetVersion = Math.max(...versions.map((version) => version.version));
  const totalRevisions = revisionsQuery.data?.total ?? revisions.length;

  const rows: StatusTableRow[] = revisions
    .slice()
    .sort((a, b) => b.revision - a.revision)
    .map((revision) => {
      const isCurrent = revision.revision === currentRevisionNumber;
      return {
        id: revision.revision,
        revision: revision.revision,
        status: isCurrent
          ? { color: "bg-success", label: "current" }
          : { color: "bg-muted-foreground", label: "frozen" },
        criterion: revision.criterion,
        collects: revision.collects.join(", "),
        actions: isCurrent ? (
          <Link
            to="/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName"
            params={{ slug, version: String(targetVersion), hypothesisName }}
          >
            Revise →
          </Link>
        ) : null,
      };
    });

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
      <StatusTable columns={REVISION_COLUMNS} rows={rows} />
    </section>
  );
}
