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

const CASE_VERSIONS_COLUMNS: StatusTableColumn[] = [
  { key: "version", header: "Version" },
  { key: "state", header: "State" },
  { key: "actions", header: "Actions" },
];

const STATE_CELL: Record<CaseVersionState, { color: string; label: string }> = {
  draft: { color: "bg-warning", label: "Draft" },
  released: { color: "bg-success", label: "Released" },
};

function actionsForRow(slug: string, version: CaseVersionListItem): ReactNode {
  const params = { slug, version: String(version.version) };
  return (
    <div className="flex items-center gap-4">
      {version.state === "draft" ? (
        <Link to="/cases/$slug/versions/$version" params={params}>
          Continue editing
        </Link>
      ) : (
        <Link to="/cases/$slug/versions/$version" params={params}>
          View
        </Link>
      )}
      <Link to="/cases/$slug/versions/$version/simulate" params={params}>
        Simulate
      </Link>
    </div>
  );
}

function toRow(slug: string, version: CaseVersionListItem): StatusTableRow {
  return {
    id: version.version,
    version: version.version,
    state: STATE_CELL[version.state],
    actions: actionsForRow(slug, version),
  };
}

function VersionsPanel({ slug }: { readonly slug: string }): JSX.Element {
  const { data, isLoading, isError, refetch } = useCaseVersions(slug);

  if (isLoading) {
    return <p>Loading version timeline…</p>;
  }
  if (isError || !data) {

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
