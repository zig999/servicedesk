/**
 * Reads a case's own version timeline through GET /v1/cases/{slug}/versions
 * (contracts/knowledge/case-query's own list-case-versions operation).
 *
 * Extracted out of case-detail-screen.tsx (task/manifest-hypothesis-authoring/
 * hypotheses-tab): that screen's own Versions tab and this task's new
 * Hypotheses tab both need this same page -- the Versions tab to render it,
 * the Hypotheses tab to derive the target version its own "Revise ->" link
 * addresses (hypothesis-revision-history.tsx) -- so the fetch and its two
 * types live in one place rather than being re-declared per caller
 * (case-detail-screen.tsx's own established "must_not_duplicate" instinct,
 * applied here for the first time this wave needed it from two call sites).
 * Business logic (a data fetch) belongs in a hook, never inline in a
 * component's JSX (ARC-02, ARC-03).
 *
 * Reads only `data`, the page of versions itself: `total`/`limit`/`offset`/
 * `pageCount` describe a page no caller of this hook paginates through, the
 * same convention already kept for list-hypotheses and every glossary
 * vocabulary read in this app.
 */

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
