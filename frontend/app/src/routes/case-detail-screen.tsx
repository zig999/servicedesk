import type { JSX } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";

/**
 * The read-only half of Case Detail (task/cases-list-and-detail/
 * case-detail-timeline): a case's version timeline, read from
 * GET /v1/cases/:slug/versions (contracts/knowledge/case-query's own
 * list-case-versions operation), and a precondition-free "Continue editing"
 * navigation to whichever version is still in draft.
 *
 * Renders every version the response's own `data` page carries
 * (domain/knowledge/case-version, domain/knowledge/case-version-state) --
 * never only the most recently opened one -- which is also this screen's
 * own read of rules/knowledge/every-case-version-remains-readable: the
 * store keeps every version, and this is the one screen that lists them
 * back rather than surfacing only the latest.
 *
 * Wired in as route-tree.tsx's "/cases/$slug" route's own `component`,
 * replacing CaseDetailPlaceholder.
 */

/** The shape list-case-versions answers with, confirmed against the real
 * backend (src/src/http/list-case-versions.controller.ts,
 * src/src/case/case-store.port.ts's own CaseVersionListItem) -- this task's
 * own binder note. Only `data` is read here; `total`/`limit`/`offset`/
 * `pageCount` describe a page this screen does not paginate through. */
type CaseVersionState = "draft" | "released";

type CaseVersionListItem = {
  readonly version: number;
  readonly state: CaseVersionState;
};

type CaseVersionsPage = {
  readonly data: readonly CaseVersionListItem[];
};

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
 * Builds one StatusTable row per version: the version number, its state as
 * a status cell, and -- only where the state is draft -- a "Continue
 * editing" action that is @tanstack/react-router's own `Link` to that
 * version's own route ("/cases/$slug/versions/$version", already registered
 * in route-tree.tsx). A `Link` navigates client-side on click with no data
 * fetch of its own, which is exactly what "performing no additional request
 * first" asks for; a released version's action cell is left empty rather
 * than carrying a second action nothing in this task's criteria describes.
 */
function toRow(slug: string, version: CaseVersionListItem): StatusTableRow {
  return {
    id: version.version,
    version: version.version,
    state: STATE_CELL[version.state],
    actions:
      version.state === "draft" ? (
        <Link
          to="/cases/$slug/versions/$version"
          params={{ slug, version: String(version.version) }}
        >
          Continue editing
        </Link>
      ) : null,
  };
}

export function CaseDetailScreen(): JSX.Element {
  const { slug } = useParams({ from: "/cases/$slug" });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["case-versions", slug],
    queryFn: () =>
      apiFetch<CaseVersionsPage>(`/v1/cases/${encodeURIComponent(slug)}/versions`),
  });

  if (isLoading) {
    return <p>Loading version timeline…</p>;
  }
  if (isError || !data) {
    // A failed request is already surfaced through the shared QueryClient's
    // own cache-level toast (services/query-client.ts); this generic
    // fallback keeps the screen from rendering an empty table underneath
    // it, without inventing a per-error-code message no criterion of this
    // task states.
    return <p>Unable to load this case&apos;s version timeline.</p>;
  }

  const rows = data.data.map((version) => toRow(slug, version));

  return (
    <section>
      <h1>Case {slug}</h1>
      <StatusTable columns={CASE_VERSIONS_COLUMNS} rows={rows} />
    </section>
  );
}
