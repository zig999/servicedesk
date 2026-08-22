/**
 * Reads every concept the glossary currently holds through the published
 * contracts/glossary/glossary-query contract's own list-concepts operation
 * (GET /v1/glossary/concepts, task/glossary-query-http/list-concepts-route),
 * keeping each concept's own `accepts` list rather than mapping it away.
 *
 * A sibling of use-glossary-vocabulary.ts's useGlossaryVocabularyOptions,
 * not a reuse of it: that hook's GlossaryTermsPage type reads only a term's
 * `name` (its own header comment states this explicitly), but
 * domain/glossary/concept additionally carries `accepts`
 * (rules/knowledge/a-concept-accepts-the-declared-subject-type), which this
 * task's own criterion 4 needs to filter Collects by the draft's declared
 * subject type. Widening that hook's shared type would leak `accepts` into
 * every other vocabulary (outcome, action, recipient, subject-type) that
 * never carries it; this task's own Notes name this exact fork as the
 * reason a sibling hook exists instead.
 *
 * GET /v1/glossary/concepts has no server-side `accepts` filter (confirmed
 * against src/src/http/dto/list-concepts.dto.ts and this app's own
 * inventory, work/frontend-bootstrap/intake/onda-4-scope.md's "Achado real
 * do backend" #5) -- the client-side pre-check this task's own criterion 4
 * performs is what use-hypothesis-revision-form.ts computes over the full
 * list this hook returns, never a second server round-trip per subject
 * type.
 *
 * Reads only `data`, matching use-glossary-vocabulary.ts's own convention:
 * the seed fixtures this app's inventory confirms are small enough to fit
 * inside the route's own configured default page size, so no caller needs a
 * second page to see every concept the glossary currently holds. This
 * task's own inference, following that hook's own established convention.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";

/** domain/glossary/concept, the fields this app's forms need: its name and the subject types it accepts. `ttl` is left unread -- no criterion of this task needs it. */
export type ConceptOption = {
  readonly name: string;
  readonly accepts: readonly string[];
};

/** The shape of one page of GET /v1/glossary/concepts -- only the fields this hook reads. */
type ConceptsPage = {
  readonly data: readonly ConceptOption[];
};

export type ConceptOptionsResult = {
  readonly concepts: readonly ConceptOption[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => void;
};

/** Reads every concept the glossary currently holds, its own `accepts` list intact. */
export function useConceptOptions(): ConceptOptionsResult {
  const query: UseQueryResult<ConceptsPage> = useQuery({
    queryKey: ["glossary", "concepts"],
    queryFn: () => apiFetch<ConceptsPage>("/v1/glossary/concepts"),
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
