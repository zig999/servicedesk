import type { ChangeEvent, JSX } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@tui/ui/button";
import { apiFetch } from "../services/api-client";
import {
  StatusTable,
  type StatusTableRow,
} from "../shared/components/status-table";

/**
 * The Cases List screen (task/cases-list-and-detail/cases-list-screen, the
 * scope's section 2.1): every case GET /v1/cases answers, one row each, with
 * a client-side search/filter over the already-fetched rows, an empty state
 * for a backend answering zero cases, and per-row navigation to that case's
 * own Case Detail route.
 *
 * GET /v1/cases answers only `{ slug }` per case, confirmed against the real
 * backend (src/src/case/case-store.port.ts's own CaseIdentity) -- the state,
 * version count and last-updated instant a row shows are never carried by
 * that call. They are domain/knowledge/case-summary, computed per its own
 * deriving rule (rules/knowledge/a-case-summary-is-derived-from-its-existing-versions):
 * current_state is the case's highest-numbered version's own state,
 * version_count is how many versions it currently holds, and last_updated is
 * that same highest-numbered version's own authored_at. This screen derives
 * that value-object itself, per case, through GET /v1/cases/:slug/versions
 * and, for authored_at, GET /v1/cases/:slug/versions/:version -- the task's
 * own advisory note leaves this call pattern to the implementation, since no
 * node mandates one.
 */

// ---------------------------------------------------------------- wire shapes

/**
 * The one pagination envelope every backend listing answers with
 * (src/types/pagination.ts, read directly -- the frontend depends on no
 * backend package, so this is a redeclaration rather than an import). This
 * screen is the first frontend module to consume a paginated backend
 * response, so no shared frontend type for it exists yet; this task's own
 * inference, disclosed in its delivery record.
 */
type PaginatedResponse<T> = {
  readonly data: readonly T[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly pageCount: number;
};

/** GET /v1/cases's own per-case shape (case-store.port.ts's own CaseIdentity): slug alone. */
type CaseIdentity = {
  readonly slug: string;
};

/** domain/knowledge/case-version-state's own two values. */
type CaseVersionState = "draft" | "released";

/**
 * GET /v1/cases/:slug/versions's own per-item shape (case-store.port.ts's
 * own CaseVersionListItem): a version's own number and state alone, never
 * its authored_at.
 */
type CaseVersionListItem = {
  readonly version: number;
  readonly state: CaseVersionState;
};

/**
 * The one field this screen reads off GET /v1/cases/:slug/versions/:version
 * (case-store.port.ts's own AssembledCaseVersion): authored_at, needed for
 * last_updated since CaseVersionListItem above never carries it. Every other
 * field that endpoint answers is irrelevant to this listing and left
 * unread/untyped here.
 */
type CaseVersionDetail = {
  readonly authored_at: string;
};

// ---------------------------------------------------------------- case-summary derivation

/**
 * domain/knowledge/case-summary, computed per
 * rules/knowledge/a-case-summary-is-derived-from-its-existing-versions.
 * currentState and lastUpdated are undefined only where the case currently
 * holds no version at all -- domain/knowledge/case-summary's own
 * conditional-presence statement ("current_state and last_updated are
 * present only where the case currently holds at least one version; a case
 * whose every version was ever discarded before release holds none to
 * derive either from, and both are absent rather than invented"), and
 * a-case-summary-is-derived-from-its-existing-versions's own statement of
 * the same case ("a case currently holding no version has version_count
 * zero and neither current_state nor last_updated, there being no version
 * to derive either from") -- both decided, not this screen's own inference
 * (case-store.port.ts's own listCaseVersions header: "a case row survives
 * the discarding of every version it ever held", so a case can reach zero
 * versions by every draft it ever held being discarded before release).
 * This screen renders the explicit absence both nodes state rather than
 * inventing a state or a timestamp neither node names.
 */
type CaseSummary = {
  readonly versionCount: number;
  readonly currentState?: CaseVersionState;
  readonly lastUpdated?: string;
};

function caseVersionsUrl(slug: string, limit: number, offset: number): string {
  return `/v1/cases/${encodeURIComponent(slug)}/versions?limit=${limit}&offset=${offset}`;
}

/**
 * Derives one case's own summary from its existing versions alone.
 *
 * Call pattern (this task's own inference, disclosed in its delivery
 * record -- no node mandates one): a probe call at limit=1/offset=0 reads
 * `total` (version_count) and, where total === 1, already carries the one
 * version that is also the highest-numbered one. Where total > 1, a second
 * call at offset=total-1/limit=1 reads the highest-numbered version's own
 * row directly: relational-case-store.repository.ts's own
 * caseVersionsPageSelect orders "case_versions" `ORDER BY version` ascending
 * (confirmed by reading that file), so the row at that offset is always the
 * highest-numbered one. A third call, GET /v1/cases/:slug/versions/:version
 * for that highest version, reads its own authored_at
 * (case-store.port.ts's own AssembledCaseVersion) since CaseVersionListItem
 * never carries it.
 */
async function fetchCaseSummary(slug: string): Promise<CaseSummary> {
  const probe = await apiFetch<PaginatedResponse<CaseVersionListItem>>(
    caseVersionsUrl(slug, 1, 0),
  );
  const versionCount = probe.total;
  if (versionCount === 0) {
    return { versionCount };
  }

  const highestOffset = versionCount - 1;
  const highestPage =
    highestOffset < probe.data.length
      ? probe
      : await apiFetch<PaginatedResponse<CaseVersionListItem>>(
          caseVersionsUrl(slug, 1, highestOffset),
        );
  const highest = highestPage.data[0];

  const detail = await apiFetch<CaseVersionDetail>(
    `/v1/cases/${encodeURIComponent(slug)}/versions/${highest.version}`,
  );

  return {
    versionCount,
    currentState: highest.state,
    lastUpdated: detail.authored_at,
  };
}

/** One row of GET /v1/cases plus its own derived summary. */
type CaseListEntry = {
  readonly slug: string;
  readonly summary: CaseSummary;
};

/**
 * GET /v1/cases, then this listing's own per-case derivation
 * (fetchCaseSummary) for each case it returns. Reads only the first page GET
 * /v1/cases answers -- neither this task's criteria nor the scope's section
 * 2.1 names a pagination control for the cases list itself, so paging
 * through every one of GET /v1/cases's own pages is out of this task's
 * scope (deferred, disclosed in its delivery record).
 */
async function fetchCasesWithSummaries(): Promise<CaseListEntry[]> {
  const casesPage = await apiFetch<PaginatedResponse<CaseIdentity>>("/v1/cases");
  const summaries = await Promise.all(
    casesPage.data.map((identity) => fetchCaseSummary(identity.slug)),
  );
  return casesPage.data.map((identity, index) => ({
    slug: identity.slug,
    summary: summaries[index],
  }));
}

// ---------------------------------------------------------------- rendering

/**
 * The color+word cell each of the two case-version-state values renders as
 * (StatusTable's own { color, label } convention). Matches
 * case-detail-timeline's own mapping exactly (routes/case-detail-screen.tsx's
 * own STATE_CELL, delivered and visible in this same tree): `draft` ->
 * `bg-warning` (in-progress, not yet published), `released` -> `bg-success`
 * (finished, immutable) -- TUI's own semantic tokens
 * (frontend/tui/frontend/src/shared/components/ui/alert/alert.tsx's own
 * success/warning variants), not a second, literal-palette scheme. Neither
 * domain/knowledge/case-version nor domain/knowledge/case-version-state names
 * a color for either state, so this is still an inference, just one taken
 * from the sibling screen's own record rather than invented independently.
 */
const CASE_STATE_CELL: Readonly<Record<CaseVersionState, { color: string; label: string }>> = {
  draft: { color: "bg-warning", label: "Draft" },
  released: { color: "bg-success", label: "Released" },
};

/** Renders where no version exists yet to derive current_state/last_updated from. */
const NO_VERSION_YET_LABEL = "No version yet";
const NO_VERSION_YET_DASH = "—";

function formatLastUpdated(iso: string | undefined): string {
  if (iso === undefined) {
    return NO_VERSION_YET_DASH;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function toRow(entry: CaseListEntry): StatusTableRow {
  const stateCell =
    entry.summary.currentState === undefined
      ? { color: "bg-muted", label: NO_VERSION_YET_LABEL }
      : CASE_STATE_CELL[entry.summary.currentState];
  return {
    id: entry.slug,
    slug: entry.slug,
    state: stateCell,
    versionCount: entry.summary.versionCount,
    lastUpdated: formatLastUpdated(entry.summary.lastUpdated),
  };
}

const COLUMNS = [
  { key: "slug", header: "Slug" },
  { key: "state", header: "State" },
  { key: "versionCount", header: "Versions" },
  { key: "lastUpdated", header: "Last updated" },
];

/**
 * Narrows the already-fetched rows to those whose slug matches the given
 * text, case-insensitively -- client-side over data already in memory, per
 * this task's own criteria ("client-side over the already-fetched data").
 * Matching against the slug alone (rather than any other visible field) is
 * this task's own call, disclosed in its delivery record: slug is the one
 * field a curator searching for a known case would type.
 */
function filterEntriesBySlug(entries: CaseListEntry[], searchText: string): CaseListEntry[] {
  const needle = searchText.trim().toLowerCase();
  if (needle === "") {
    return entries;
  }
  return entries.filter((entry) => entry.slug.toLowerCase().includes(needle));
}

export function CasesListScreen(): JSX.Element {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  const casesQuery = useQuery({
    queryKey: ["cases-list"],
    queryFn: fetchCasesWithSummaries,
  });

  const entries = casesQuery.data ?? [];
  const filteredEntries = useMemo(
    () => filterEntriesBySlug(entries, searchText),
    [entries, searchText],
  );

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    setSearchText(event.target.value);
  }

  function handleRowClick(row: StatusTableRow): void {
    const slug = row.slug;
    if (typeof slug !== "string") {
      return;
    }
    void navigate({ to: "/cases/$slug", params: { slug } });
  }

  if (casesQuery.isPending) {
    return <p>Loading cases…</p>;
  }

  if (casesQuery.isError) {
    // The QueryCache-level onError handler (query-client.ts) already toasts
    // this failure; EDG-02 still asks for an explicit retry action rather
    // than only that toast, matching case-hypotheses-tab.tsx's own
    // load-error convention for a raw useQuery result (its own refetch,
    // called directly rather than through a hook that already wraps it).
    return (
      <section>
        <p>Cases could not be loaded.</p>
        <Button type="button" onClick={() => void casesQuery.refetch()}>
          Retry
        </Button>
      </section>
    );
  }

  const hasNoCasesAtAll = entries.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Cases</h1>
      {!hasNoCasesAtAll && (
        <>
          <input
            type="search"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search cases by slug"
            aria-label="Search cases by slug"
            className="w-full max-w-sm rounded border border-border bg-surface px-3 py-2 text-sm text-foreground"
          />
          {/*
            ACC-07: the search-filtered row count changes with no page
            navigation, so it is exposed through its own aria-live region --
            this screen's own visible copy of the count, rather than a
            visually-hidden duplicate, since StatusTable's own row count is
            not otherwise stated in text anywhere on this screen.
          */}
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {filteredEntries.length} case{filteredEntries.length === 1 ? "" : "s"} found
          </p>
        </>
      )}
      {hasNoCasesAtAll ? (
        <div className="flex flex-col items-start gap-3 rounded border border-border bg-surface p-6">
          <p className="text-sm text-foreground">
            No cases yet — create the first one
          </p>
          {/*
            The button's own target action (case creation) is out of this
            task's scope: no case-creation screen exists yet anywhere in this
            plan. Rendered present but inert (disabled, with a title
            explaining why) rather than wired to a route that does not
            exist -- this task's own call, disclosed in its delivery record
            as a deferral.
          */}
          <button
            type="button"
            disabled
            title="Case creation is not built yet in this plan"
            className="rounded bg-muted px-3 py-2 text-sm text-foreground"
          >
            Create case
          </button>
        </div>
      ) : (
        <StatusTable
          columns={COLUMNS}
          rows={filteredEntries.map(toRow)}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
}
