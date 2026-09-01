import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";

export type CaseVersionState = "draft" | "released";

export type CaseVersionListItem = {
  readonly version: number;
  readonly state: CaseVersionState;
};

export type CaseVersionsPage = {
  readonly data: readonly CaseVersionListItem[];
};

export function useCaseVersions(slug: string): UseQueryResult<CaseVersionsPage> {
  return useQuery({
    queryKey: ["case-versions", slug],
    queryFn: () =>
      apiFetch<CaseVersionsPage>(`/v1/cases/${encodeURIComponent(slug)}/versions`),
  });
}
