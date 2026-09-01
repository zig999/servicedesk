import { useState, type JSX } from "react";
import { useQueries } from "@tanstack/react-query";
import { Button } from "@tui/ui/button";
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";
import { useCaseHypotheses } from "../hooks/use-case-hypotheses";
import { hypothesisRevisionsQueryOptions } from "../hooks/use-hypothesis-revisions";
import { HypothesisRevisionHistory } from "./hypothesis-revision-history";

const HYPOTHESES_COLUMNS: StatusTableColumn[] = [
  { key: "hypothesis", header: "Hypothesis" },
  { key: "revisions", header: "Revisions" },
];

export type CaseHypothesesTabProps = {
  readonly slug: string;
};

export function CaseHypothesesTab({ slug }: CaseHypothesesTabProps): JSX.Element {
  const [selectedHypothesis, setSelectedHypothesis] = useState<string | null>(null);
  const hypothesesQuery = useCaseHypotheses(slug);
  const names = hypothesesQuery.data?.data.map((hypothesis) => hypothesis.name) ?? [];

  const revisionCounts = useQueries({
    queries: names.map((name) => hypothesisRevisionsQueryOptions(slug, name)),
  });

  function handleRowClick(row: StatusTableRow): void {
    const hypothesisName = row.hypothesis;
    if (typeof hypothesisName !== "string") {
      return;
    }
    setSelectedHypothesis(hypothesisName);
  }

  if (selectedHypothesis !== null) {
    return (
      <HypothesisRevisionHistory
        slug={slug}
        hypothesisName={selectedHypothesis}
        onBack={() => setSelectedHypothesis(null)}
      />
    );
  }

  if (hypothesesQuery.isLoading) {
    return <p>Loading hypotheses…</p>;
  }
  if (hypothesesQuery.isError || !hypothesesQuery.data) {

    return (
      <section>
        <p>Unable to load this case&apos;s hypotheses.</p>
        <Button type="button" onClick={() => void hypothesesQuery.refetch()}>
          Retry
        </Button>
      </section>
    );
  }
  if (hypothesesQuery.data.data.length === 0) {

    return <p>This case has originated no hypotheses yet.</p>;
  }

  const rows: StatusTableRow[] = hypothesesQuery.data.data.map((hypothesis, index) => {
    const countResult = revisionCounts[index];
    const revisionsCell =
      countResult.data !== undefined ? countResult.data.total : countResult.isError ? "—" : "…";
    return {
      id: hypothesis.name,
      hypothesis: hypothesis.name,
      revisions: revisionsCell,
    };
  });

  return (
    <StatusTable columns={HYPOTHESES_COLUMNS} rows={rows} onRowClick={handleRowClick} />
  );
}
