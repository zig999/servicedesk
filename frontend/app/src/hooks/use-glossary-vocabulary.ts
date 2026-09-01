import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { SelectOption } from "@tui/ui/select";
import { apiFetch } from "../services/api-client";

export type GlossaryVocabulary =
  | "outcome"
  | "action"
  | "recipient"
  | "subject-type"
  | "subject-attribute";

type GlossaryTermsPage = {
  readonly data: readonly { readonly name: string }[];
};

export type GlossaryVocabularyOptions = {

  readonly options: SelectOption[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => void;
};

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
