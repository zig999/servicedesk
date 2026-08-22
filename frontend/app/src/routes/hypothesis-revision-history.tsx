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

/**
 * The revision-history view for one hypothesis
 * (task/manifest-hypothesis-authoring/hypotheses-tab, criteria 5-7): every
 * revision GET /v1/cases/{slug}/hypotheses/{name}/revisions returns for it,
 * each rendered as its own StatusTable row -- a closed, non-editable block,
 * per this task's own "what it is" (reusing StatusTable for this rendering
 * too, not a bespoke block layout).
 *
 * The revision holding the highest revision number is labeled "current";
 * every other one "frozen" (criterion 6) -- comparing revision numbers is
 * sufficient, per this task's own rationale: no hypothesis-revision is ever
 * edited in place regardless of a version's release state
 * (rules/knowledge/a-released-hypothesis-revision-is-never-altered), and
 * rules/knowledge/a-hypothesis-revision-number-is-never-reused guarantees
 * the highest number is always the most recently originated one.
 *
 * "Revise ->" (criterion 7) renders only on the current revision's own row,
 * as a router Link to the Revise route route-tree.tsx already registers
 * ("/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName"),
 * addressed at this case's own current version -- the highest version
 * number GET /v1/cases/{slug}/versions returns. rules/knowledge/
 * a-case-version-number-is-never-reused ("a case's next version number is
 * always greater than every version number the case has ever held")
 * guarantees that number is always either the case's own single active
 * draft (rules/knowledge/a-case-has-at-most-one-draft) or, absent a draft,
 * its most recently released version -- this task's own inference, disclosed
 * in its delivery record, since no criterion of this task names which
 * version a case-level (not version-scoped) "Revise ->" link should
 * address. Rendered unconditionally, regardless of which of those two it
 * is: this task's own Notes disclose that gating this control on draft
 * state is not this task's concern, and a CaseHoldsNoDraftError, if a
 * curator follows the link against a released case, is
 * revise-hypothesis-form's own generic-failure handling to surface, not a
 * check added here.
 *
 * The Revise route's own ReviseHypothesisScreen re-reads this exact
 * hypothesis's own revisions itself (use-hypothesis-revision-form.ts) to
 * pre-populate criterion, collects and resolution from its current revision
 * -- so navigating with just the hypothesis's name and this target version
 * already satisfies "pre-loaded with that revision's own criterion,
 * collects and resolution" (criterion 7); this component passes no extra
 * state of its own.
 */

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

  // A hypothesis with zero revisions is impossible by the domain -- every
  // hypothesis is born with revision 1 (rules/knowledge/
  // a-hypothesis-revision-number-is-never-reused) -- and a case with zero
  // versions is impossible once it exists at all. Neither is a real, reachable
  // empty state this task's own Notes ask for; both are treated as a load
  // failure instead.
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
