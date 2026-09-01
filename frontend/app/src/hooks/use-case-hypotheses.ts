import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";

export type HypothesisIdentity = {
  readonly name: string;
};

export type CaseHypothesesPage = {
  readonly data: readonly HypothesisIdentity[];
};

export function useCaseHypotheses(slug: string): UseQueryResult<CaseHypothesesPage> {
  return useQuery({
    queryKey: ["case-hypotheses", slug],
    queryFn: () =>
      apiFetch<CaseHypothesesPage>(`/v1/cases/${encodeURIComponent(slug)}/hypotheses`),
  });
}
