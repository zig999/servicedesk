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

type PaginatedResponse<T> = {
  readonly data: readonly T[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly pageCount: number;
};

type CaseIdentity = {
  readonly slug: string;
};

type CaseVersionState = "draft" | "released";

type CaseVersionListItem = {
  readonly version: number;
  readonly state: CaseVersionState;
};

type CaseVersionDetail = {
  readonly authored_at: string;
};

type CaseSummary = {
  readonly versionCount: number;
  readonly currentState?: CaseVersionState;
  readonly lastUpdated?: string;
};

function caseVersionsUrl(slug: string, limit: number, offset: number): string {
  return `/v1/cases/${encodeURIComponent(slug)}/versions?limit=${limit}&offset=${offset}`;
}

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

type CaseListEntry = {
  readonly slug: string;
  readonly summary: CaseSummary;
};

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

const CASE_STATE_CELL: Readonly<Record<CaseVersionState, { color: string; label: string }>> = {
  draft: { color: "bg-warning", label: "Draft" },
  released: { color: "bg-success", label: "Released" },
};

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

  function renderBody(): JSX.Element {
    if (casesQuery.isPending) {
      return <p>Loading cases…</p>;
    }

    if (casesQuery.isError) {
      return (
        <section>
          <p>Cases could not be loaded.</p>
          <Button type="button" onClick={() => void casesQuery.refetch()}>
            Retry
          </Button>
        </section>
      );
    }

    if (entries.length === 0) {
      return (
        <div className="flex flex-col items-start gap-3 rounded border border-border bg-surface p-6">
          <p className="text-sm text-foreground">
            No cases yet — create the first one
          </p>
        </div>
      );
    }

    return (
      <>
        <input
          type="search"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Search cases by slug"
          aria-label="Search cases by slug"
          className="w-full max-w-sm rounded border border-border bg-surface px-3 py-2 text-sm text-foreground"
        />
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {filteredEntries.length} case{filteredEntries.length === 1 ? "" : "s"} found
        </p>
        <StatusTable
          columns={COLUMNS}
          rows={filteredEntries.map(toRow)}
          onRowClick={handleRowClick}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Cases</h1>
        <Button type="button" onClick={() => void navigate({ to: "/cases/new" })}>
          Create case
        </Button>
      </div>
      {renderBody()}
    </div>
  );
}
