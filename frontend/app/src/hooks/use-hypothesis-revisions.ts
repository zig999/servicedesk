/**
 * Reads every revision one named hypothesis holds through GET
 * /v1/cases/{slug}/hypotheses/{name}/revisions (contracts/knowledge/
 * case-query's own list-hypothesis-revisions operation) --
 * task/manifest-hypothesis-authoring/hypotheses-tab's own criteria 3 and 5.
 *
 * The full envelope is read here, unlike use-hypothesis-revision-form.ts's
 * own local type for the same endpoint: that hook only ever needs the
 * current (highest-numbered) revision's own content to pre-populate a form,
 * so it never reads `total`. This task's own criterion 3 -- "the total GET
 * .../revisions reports for that hypothesis, not the length of a single
 * returned page" -- is exactly what `total` is for, so this hook keeps it.
 *
 * `hypothesisRevisionsQueryOptions` is exported separately from the hook
 * itself so a caller listing many hypotheses at once
 * (case-hypotheses-tab.tsx) can pass one query object per hypothesis into
 * @tanstack/react-query's own `useQueries` -- the one hook call that stays
 * rules-of-hooks-safe over a list whose length is only known once the
 * hypothesis list itself has loaded -- without duplicating the URL and the
 * query key `useHypothesisRevisions` below already builds.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";
import type { HypothesisRevisionFormValues } from "../services/hypothesis-revision-form-schema";

/** One revision as GET /v1/cases/{slug}/hypotheses/{name}/revisions answers it (src/src/case/case-store.port.ts's own HypothesisRevisionListItem) -- every attribute domain/knowledge/hypothesis-revision declares beyond its own hypothesis relationship. */
export type HypothesisRevisionListItem = {
  readonly revision: number;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: HypothesisRevisionFormValues["resolution"];
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
