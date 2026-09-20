import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";
import { errorStateKind } from "./use-edit-draft-version-form";

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
  readonly title: string;
  readonly when_to_use: string;
};

export type CaseSummary = {
  readonly versionCount: number;
  readonly currentState?: CaseVersionState;
  readonly lastUpdated?: string;
  readonly title?: string;
  readonly whenToUse?: string;
  readonly releasedVersion?: number;
};

type ReleasedInfo = {
  readonly title?: string;
  readonly whenToUse?: string;
  readonly releasedVersion?: number;
};

export type CaseListEntry =
  | { readonly slug: string; readonly summary: CaseSummary }
  | { readonly slug: string; readonly notValid: true };

export function isCaseListEntryNotValid(
  entry: CaseListEntry,
): entry is Extract<CaseListEntry, { notValid: true }> {
  return "notValid" in entry;
}

function caseVersionsUrl(slug: string, limit: number, offset: number): string {
  return `/v1/cases/${encodeURIComponent(slug)}/versions?limit=${limit}&offset=${offset}`;
}

async function fetchCaseListEntry(slug: string): Promise<CaseListEntry> {
  const highestPage = await apiFetch<PaginatedResponse<CaseVersionListItem>>(
    caseVersionsUrl(slug, 1, 0),
  );
  const versionCount = highestPage.total;
  if (versionCount === 0) {
    return { slug, summary: { versionCount } };
  }
  const highest = highestPage.data[0];

  let detail: CaseVersionDetail;
  try {
    detail = await apiFetch<CaseVersionDetail>(
      `/v1/cases/${encodeURIComponent(slug)}/versions/${highest.version}`,
    );
  } catch (error) {
    if (errorStateKind(error) === "case-not-valid") {
      return { slug, notValid: true };
    }
    throw error;
  }

  const released = await releasedInfo(slug, highest, detail, versionCount);

  return {
    slug,
    summary: {
      versionCount,
      currentState: highest.state,
      lastUpdated: detail.authored_at,
      ...released,
    },
  };
}

async function releasedInfo(
  slug: string,
  highest: CaseVersionListItem,
  highestDetail: CaseVersionDetail,
  versionCount: number,
): Promise<ReleasedInfo> {
  if (highest.state === "released") {
    return {
      title: highestDetail.title,
      whenToUse: highestDetail.when_to_use,
      releasedVersion: highest.version,
    };
  }
  if (versionCount === 1) {
    return {};
  }
  const everyVersion = await apiFetch<PaginatedResponse<CaseVersionListItem>>(
    caseVersionsUrl(slug, versionCount, 0),
  );
  const released = everyVersion.data.find((item) => item.state === "released");
  if (released === undefined) {
    return {};
  }
  const detail = await apiFetch<CaseVersionDetail>(
    `/v1/cases/${encodeURIComponent(slug)}/versions/${released.version}`,
  );
  return { title: detail.title, whenToUse: detail.when_to_use, releasedVersion: released.version };
}

async function fetchCasesWithSummaries(): Promise<CaseListEntry[]> {
  const casesPage = await apiFetch<PaginatedResponse<CaseIdentity>>("/v1/cases");
  return Promise.all(casesPage.data.map((identity) => fetchCaseListEntry(identity.slug)));
}

export function useCasesList(): UseQueryResult<CaseListEntry[]> {
  return useQuery({
    queryKey: ["cases-list"],
    queryFn: fetchCasesWithSummaries,
  });
}
