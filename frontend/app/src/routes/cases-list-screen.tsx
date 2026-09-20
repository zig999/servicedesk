import type { ChangeEvent, JSX } from "react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { Input } from "@tui/ui/input";
import {
  StatusTable,
  type StatusTableRow,
} from "../shared/components/status-table";
import {
  useCasesList,
  isCaseListEntryNotValid,
  type CaseListEntry,
  type CaseVersionState,
} from "../hooks/use-cases-list";

const CASE_STATE_CELL: Readonly<Record<CaseVersionState, { color: string; label: string }>> = {
  draft: { color: "bg-warning", label: "Draft" },
  released: { color: "bg-success", label: "Released" },
};

const NO_VERSION_YET_LABEL = "No version yet";
const NO_VERSION_YET_DASH = "—";
const CURRENT_VERSION_NOT_VALID_STATEMENT =
  "This case's current version does not read back as a case.";

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
  if (isCaseListEntryNotValid(entry)) {
    return {
      id: entry.slug,
      slug: entry.slug,
      state: CURRENT_VERSION_NOT_VALID_STATEMENT,
    };
  }
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

  const casesQuery = useCasesList();

  const entries = casesQuery.data ?? [];
  const filteredEntries = filterEntriesBySlug(entries, searchText);

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
        <Input
          type="search"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Search cases by slug"
          aria-label="Search cases by slug"
          className="w-full max-w-sm"
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
