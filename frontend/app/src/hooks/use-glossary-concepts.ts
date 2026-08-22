/**
 * Reads every concept the glossary currently holds through the published
 * contracts/glossary/glossary-query contract's own list-concepts operation
 * (GET /v1/glossary/concepts), keeping each concept's own `ttl`
 * (domain/glossary/concept's third attribute) intact -- the field
 * use-concept-options.ts's own ConceptOption deliberately narrows away
 * because no criterion of that hook's task needed it.
 *
 * A sibling of use-concept-options.ts, not a reuse or a widening of it: that
 * hook's own header comment names widening ConceptOption as exactly the
 * wrong move, since `ttl` would leak into use-hypothesis-revision-form.ts,
 * its one existing consumer, which reads nothing about freshness at all.
 * This task's own rationale (task/glossary-and-capabilities-browser/
 * glossary-browser-screen) draws the same conclusion for the same reason,
 * for the Glossary Browser's own Concepts tab, this hook's one consumer
 * today.
 *
 * Mirrors use-glossary-vocabulary.ts's and use-concept-options.ts's own
 * established convention exactly: apiFetch<PageType>, reading only the
 * page's `data` array (`total`/`limit`/`offset`/`pageCount` deliberately
 * left unread, the same convention both of those hooks already keep since
 * this app's own seed fixtures fit inside one page), and returning
 * {list-field, isLoading, isError, refetch}.
 *
 * Its own query key, ["glossary", "concepts-with-ttl"], is deliberately
 * distinct from use-concept-options.ts's own ["glossary", "concepts"] --
 * this hook's own inference, disclosed in its delivery record: the two
 * hooks narrow the same endpoint's response to two different TypeScript
 * shapes, and sharing one cache key would let one hook's query populate the
 * cache entry the other reads as if it always carried `ttl`, or never did.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";

/** domain/glossary/concept, every field this app's Glossary Browser reads. */
export type GlossaryConcept = {
  readonly name: string;
  readonly accepts: readonly string[];
  readonly ttl: number;
};

/** The shape of one page of GET /v1/glossary/concepts -- only the fields this hook reads. */
type GlossaryConceptsPage = {
  readonly data: readonly GlossaryConcept[];
};

export type GlossaryConceptsResult = {
  readonly concepts: readonly GlossaryConcept[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => void;
};

/** Reads every concept the glossary currently holds, its own `accepts` and `ttl` intact. */
export function useGlossaryConcepts(): GlossaryConceptsResult {
  const query: UseQueryResult<GlossaryConceptsPage> = useQuery({
    queryKey: ["glossary", "concepts-with-ttl"],
    queryFn: () => apiFetch<GlossaryConceptsPage>("/v1/glossary/concepts"),
  });

  return {
    concepts: query.data?.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
  };
}
