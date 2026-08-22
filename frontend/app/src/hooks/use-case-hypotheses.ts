/**
 * Reads every hypothesis a case has ever originated through GET
 * /v1/cases/{slug}/hypotheses (contracts/knowledge/case-query's own
 * list-hypotheses operation) -- this task's own criterion 2
 * (task/manifest-hypothesis-authoring/hypotheses-tab). The real response
 * carries only each hypothesis's bare `name` (domain/knowledge/hypothesis):
 * its content -- criterion, collects, resolution -- belongs to its
 * revisions, a separate read (use-hypothesis-revisions.ts).
 *
 * Reads only `data`; `total`/`limit`/`offset`/`pageCount` describe a page
 * this hook does not paginate through, the same convention already kept for
 * list-case-versions and every glossary vocabulary read in this app.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";

/** One hypothesis as GET /v1/cases/{slug}/hypotheses answers it (src/src/case/case-store.port.ts's own HypothesisIdentity) -- its bare name alone. */
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
