/**
 * Reads one term vocabulary of the glossary through the published
 * contracts/glossary/glossary-query contract (GET /v1/glossary/{vocabulary},
 * task/glossary-query-http/list-vocabulary-terms-route), and shapes its
 * page of terms into TUI's own Select option list -- the one place this
 * mapping happens, so a screen never re-derives {value, label} inline.
 *
 * Reads only `data`, the page of terms itself: `total`/`limit`/`offset`/
 * `pageCount` describe a page no caller of this hook paginates through, the
 * same convention case-detail-screen.tsx already keeps for
 * list-case-versions's own envelope. The seed fixtures the inventory
 * confirmed (one subject-type, four outcomes, three actions, three
 * recipients) all fit inside the route's own configured default page size,
 * so no caller needs to ask for a second page to see "exactly the terms"
 * a vocabulary currently holds.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { SelectOption } from "@tui/ui/select";
import { apiFetch } from "../services/api-client";

/**
 * The glossary term vocabularies this app's forms read -- domain/glossary/outcome,
 * domain/glossary/action, domain/glossary/recipient (edit-draft-version's own three), plus
 * domain/glossary/subject-type (task/version-editor/new-draft-creation's own blank-form
 * field, criterion 2: "the subject field pre-set to the one subject-type value GET
 * /v1/glossary/subject-type currently returns"). The route itself
 * (list-vocabulary-terms.dto.ts's own TERM_VOCABULARIES) also serves subject-attribute; a
 * later task reading it extends this union rather than this one guessing its shape ahead of
 * need.
 */
export type GlossaryVocabulary = "outcome" | "action" | "recipient" | "subject-type";

/** The shape of one page of GET /v1/glossary/{vocabulary} -- only the field this hook reads. */
type GlossaryTermsPage = {
  readonly data: readonly { readonly name: string }[];
};

export type GlossaryVocabularyOptions = {
  // Not `readonly SelectOption[]`: TUI's own Select requires a plain,
  // mutable array for its `options` prop (select.types.ts), and a readonly
  // array is not assignable to it -- returning one here would force every
  // caller to spread-copy it before rendering a Select.
  readonly options: SelectOption[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => void;
};

/**
 * Reads one vocabulary's current terms and maps each to a Select option
 * whose value and label are both the term's own name -- the glossary names
 * a term once, and nothing here re-labels it.
 */
export function useGlossaryVocabularyOptions(
  vocabulary: GlossaryVocabulary,
): GlossaryVocabularyOptions {
  const query: UseQueryResult<GlossaryTermsPage> = useQuery({
    queryKey: ["glossary", vocabulary],
    queryFn: () => apiFetch<GlossaryTermsPage>(`/v1/glossary/${vocabulary}`),
  });

  const options = (query.data?.data ?? []).map((term) => ({
    value: term.name,
    label: term.name,
  }));

  return {
    options,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
  };
}
