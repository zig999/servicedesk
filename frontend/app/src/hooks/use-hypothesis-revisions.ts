import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";
import type { HypothesisRevisionFormValues } from "../services/hypothesis-revision-form-schema";

export type HypothesisRevisionState = "draft" | "released";

export type HypothesisRevisionListItem = {
  readonly revision: number;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: HypothesisRevisionFormValues["resolution"];
  readonly state: HypothesisRevisionState;
};

export type HypothesisRevisionsPage = {
  readonly data: readonly HypothesisRevisionListItem[];
  readonly total: number;
};

export function hypothesisRevisionsQueryOptions(
  slug: string,
  hypothesisName: string,
): {
  queryKey: readonly [string, string, string];
  queryFn: () => Promise<HypothesisRevisionsPage>;
} {
  return {
    queryKey: ["hypothesis-revisions", slug, hypothesisName] as const,
    queryFn: () =>
      apiFetch<HypothesisRevisionsPage>(
        `/v1/cases/${encodeURIComponent(slug)}/hypotheses/${encodeURIComponent(hypothesisName)}/revisions`,
      ),
  };
}

export function useHypothesisRevisions(
  slug: string,
  hypothesisName: string,
): UseQueryResult<HypothesisRevisionsPage> {
  return useQuery(hypothesisRevisionsQueryOptions(slug, hypothesisName));
}
