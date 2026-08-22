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

/**
 * The Hypotheses tab (task/manifest-hypothesis-authoring/hypotheses-tab):
 * lists every hypothesis GET /v1/cases/{slug}/hypotheses returns for this
 * case, by name (criterion 2). Each row's own "Revisions" count is the
 * *total* GET /v1/cases/{slug}/hypotheses/{name}/revisions reports for that
 * hypothesis, never the length of a single returned page (criterion 3) --
 * one bounded read per listed hypothesis, the per-row cost this task's own
 * rationale accepts as distinct from the unbounded, per-version cost the
 * deferred "Referenced by" column would have paid.
 *
 * Selecting a row expands, in place, into that hypothesis's own
 * revision-history view (criterion 4, HypothesisRevisionHistory below) --
 * this task's own reading of the criterion's "navigates to, or expands
 * into" either/or: no dedicated per-hypothesis route exists, and this task
 * does not add one -- route-tree.tsx's own separate, still-registered
 * "/cases/$slug/hypotheses" placeholder route is left exactly as it stood
 * (touching it is outside this task's own criteria, and risks a needless
 * conflict with route-tree.tsx edits the concurrently-delivered
 * manifest-builder task may also make); this tab is reached only as
 * case-detail-screen.tsx's own "Hypotheses" TabsContent, at "/cases/$slug".
 *
 * Composed by case-detail-screen.tsx's own "Hypotheses" TabsContent
 * (criterion 1); this component owns no tab chrome of its own.
 */

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

  // One useQueries call, never one useQuery per list item: the number of
  // hypotheses is not known until hypothesesQuery itself resolves, and
  // calling a variable number of useQuery hooks directly across renders
  // would violate the rules of hooks. useQueries stays safe over that
  // varying length by construction.
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
    // The QueryCache-level onError handler (query-client.ts) already toasts
    // this failure; EDG-02 still asks for an explicit retry action rather
    // than only that toast, matching case-version-editor-screen.tsx's own
    // load-error convention.
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
    // API-04: an empty response renders its own explicit empty state,
    // never treated as still loading or as a failure.
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
