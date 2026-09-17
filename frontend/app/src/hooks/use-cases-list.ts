import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";

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

export type CaseVersionState = "draft" | "released";

type CaseVersionListItem = {
  readonly version: number;
  readonly state: CaseVersionState;
};

type CaseVersionDetail = {
  readonly authored_at: string;
};

export type CaseSummary = {
  readonly versionCount: number;
  readonly currentState?: CaseVersionState;
  readonly lastUpdated?: string;
};

export type CaseListEntry = {
  readonly slug: string;
  readonly summary: CaseSummary;
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

export function useCasesList(): UseQueryResult<CaseListEntry[]> {
  return useQuery({
    queryKey: ["cases-list"],
    queryFn: fetchCasesWithSummaries,
  });
}
