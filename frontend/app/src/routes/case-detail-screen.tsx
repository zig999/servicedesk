import type { JSX, ReactNode } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tui/ui/tabs";
import { Button } from "@tui/ui/button";
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";
import {
  useCaseVersions,
  type CaseVersionListItem,
  type CaseVersionState,
} from "../hooks/use-case-versions";
import { CaseHypothesesTab } from "./case-hypotheses-tab";
import { CaseAttributesTab } from "./case-attributes-tab";

/**
 * Case Detail (task/cases-list-and-detail/case-detail-timeline, extended by
 * task/manifest-hypothesis-authoring/hypotheses-tab): two tabs over one
 * case, built with the existing tabs component (@tui/ui/tabs) rather than
 * two separate routes or a top-level sidebar entry (this task's own
 * criterion 1) --
 *
 * - "Versions": a case's version timeline, read from GET
 *   /v1/cases/:slug/versions (contracts/knowledge/case-query's own
 *   list-case-versions operation), and a precondition-free "Continue
 *   editing" navigation to whichever version is still in draft. Renders
 *   every version the response's own `data` page carries
 *   (domain/knowledge/case-version, domain/knowledge/case-version-state) --
 *   never only the most recently opened one -- which is also this screen's
 *   own read of rules/knowledge/every-case-version-remains-readable: the
 *   store keeps every version, and this is the one screen that lists them
 *   back rather than surfacing only the latest. Also renders the "New
 *   draft" action (task/version-editor/new-draft-creation, criterion 1)
 *   navigating to route-tree.tsx's own "/cases/$slug/versions/new" -- shown
 *   only when none of this same version list is currently in draft state,
 *   per rules/knowledge/a-case-has-at-most-one-draft. A released row's own
 *   actions cell (task/version-editor/view-released-version-read-only,
 *   criteria 1-3), previously empty, now carries a "View" action -- the same
 *   client-side Link, to the same "/cases/$slug/versions/$version" route a
 *   draft row's own "Continue editing" already targets, performing no
 *   request of its own beyond the load that route itself triggers; that
 *   route's own screen (case-version-editor-screen.tsx) renders whichever of
 *   its two states the loaded version's own state calls for.
 * - "Hypotheses": delegates entirely to CaseHypothesesTab, this task's own
 *   new component (case-hypotheses-tab.tsx).
 * - "Attributes": task/cases-list-and-detail/case-attributes-at-a-glance's
 *   own new view, delegating entirely to CaseAttributesTab
 *   (case-attributes-tab.tsx): the case's current version's own declared
 *   attributes, read whole through read-case rather than only this same
 *   Versions tab's own list-case-versions metadata, plus the one
 *   state-sensitive action that version's own draft/released state calls
 *   for.
 *
 * All three tabs read the same ["case-versions", slug] query (useCaseVersions,
 * extracted out of this file for that reuse) but only the active one's
 * subtree ever mounts: TabsContent renders null for an inactive value, so
 * switching tabs is what actually triggers either fetch, never both at
 * once on first render (PRF-04 -- an independently loadable section fetches
 * its own data separately).
 *
 * This is the first task to introduce the tabs component into this file
 * (this task's own Notes): the Versions tab's own markup below is otherwise
 * unchanged from what task/cases-list-and-detail/case-detail-timeline
 * delivered and task/version-editor/new-draft-creation extended.
 *
 * Wired in as route-tree.tsx's "/cases/$slug" route's own `component`.
 */

const CASE_VERSIONS_COLUMNS: StatusTableColumn[] = [
  { key: "version", header: "Version" },
  { key: "state", header: "State" },
  { key: "actions", header: "Actions" },
];

/**
 * The color/label a version's state renders as, through StatusTable's own
 * `{ color, label }` cell contract (a status always shows its color and its
 * word together, never color alone). Neither domain/knowledge/case-version
 * nor domain/knowledge/case-version-state names a color for either state --
 * only the two states themselves -- so `draft` -> `bg-warning` (an
 * in-progress, not-yet-published state) and `released` -> `bg-success` (a
 * finished, immutable state) are this task's own inference. Both are TUI's
 * own semantic tokens (frontend/tui/frontend/src/shared/components/ui/
 * alert/alert.tsx already keys its own success/warning variants off them),
 * not a second, literal-palette color scheme.
 */
const STATE_CELL: Record<CaseVersionState, { color: string; label: string }> = {
  draft: { color: "bg-warning", label: "Draft" },
  released: { color: "bg-success", label: "Released" },
};

/**
 * The Versions tab's own actions cell (task/version-editor/
 * view-released-version-read-only, criteria 1 and 2): a draft row renders
 * "Continue editing"; a released row -- previously left empty, the inventory's
 * own risk on this exact cell -- now renders "View" instead. Both are
 * @tanstack/react-router's own `Link` to the identical route
 * ("/cases/$slug/versions/$version", already registered in route-tree.tsx),
 * differing only in label: a `Link` navigates client-side on click with no
 * data fetch of its own, which is exactly what "performing no additional
 * request beyond the load the route itself triggers" (criterion 3) asks
 * for. domain/knowledge/case-version-state names exactly these two values,
 * so this two-branch mapping is exhaustive with no further fallback needed.
 */
function actionsForRow(slug: string, version: CaseVersionListItem): ReactNode {
  const params = { slug, version: String(version.version) };
  if (version.state === "draft") {
    return (
      <Link to="/cases/$slug/versions/$version" params={params}>
        Continue editing
      </Link>
    );
  }
  return (
    <Link to="/cases/$slug/versions/$version" params={params}>
      View
    </Link>
  );
}

/**
 * Builds one StatusTable row per version: the version number, its state as
 * a status cell, and its own actions cell (actionsForRow above).
 */
function toRow(slug: string, version: CaseVersionListItem): StatusTableRow {
  return {
    id: version.version,
    version: version.version,
    state: STATE_CELL[version.state],
    actions: actionsForRow(slug, version),
  };
}

/**
 * The "Versions" tab's own body: unchanged from what this screen rendered
 * before this task, other than being lifted out of the top-level return so
 * it can sit inside a TabsContent (this task's own Notes).
 */
function VersionsPanel({ slug }: { readonly slug: string }): JSX.Element {
  const { data, isLoading, isError, refetch } = useCaseVersions(slug);

  if (isLoading) {
    return <p>Loading version timeline…</p>;
  }
  if (isError || !data) {
    // A failed request is already surfaced through the shared QueryClient's
    // own cache-level toast (services/query-client.ts); this generic
    // fallback keeps the screen from rendering an empty table underneath
    // it, without inventing a per-error-code message no criterion of this
    // task states. EDG-02 still asks for an explicit retry action rather
    // than only that toast, matching this same file's own CaseHypothesesTab
    // (case-hypotheses-tab.tsx) convention for a raw useQuery result: its
    // own refetch, called directly.
    return (
      <section>
        <p>Unable to load this case&apos;s version timeline.</p>
        <Button type="button" onClick={() => void refetch()}>
          Retry
        </Button>
      </section>
    );
  }

  const rows = data.data.map((version) => toRow(slug, version));
  const hasDraft = data.data.some((version) => version.state === "draft");

  return (
    <>
      {!hasDraft && (
        <Link to="/cases/$slug/versions/new" params={{ slug }}>
          New draft
        </Link>
      )}
      {rows.length === 0 ? (
        // API-04: an empty response renders its own explicit empty state,
        // never a header-only table with nothing said about why -- matching
        // this same file's own CaseHypothesesTab (case-hypotheses-tab.tsx)
        // empty-state branch for the same list shape, and this route's own
        // reading of scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
        // (the discarded-only-draft case reads identically to a case that
        // never held a version, so both are told the same explicit sentence
        // here). "New draft" above still renders: an empty list trivially
        // satisfies "none of the case's versions is currently in draft"
        // (task/version-editor/new-draft-creation's own criterion), so this
        // branch replaces only the table, never the surrounding chrome.
        <p>This case currently holds no version.</p>
      ) : (
        <StatusTable columns={CASE_VERSIONS_COLUMNS} rows={rows} />
      )}
    </>
  );
}

export function CaseDetailScreen(): JSX.Element {
  const { slug } = useParams({ from: "/cases/$slug" });

  return (
    <section>
      <h1>Case {slug}</h1>
      <Tabs defaultValue="versions">
        <TabsList>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="hypotheses">Hypotheses</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
        </TabsList>
        <TabsContent value="versions">
          <VersionsPanel slug={slug} />
        </TabsContent>
        <TabsContent value="hypotheses">
          <CaseHypothesesTab slug={slug} />
        </TabsContent>
        <TabsContent value="attributes">
          <CaseAttributesTab slug={slug} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
