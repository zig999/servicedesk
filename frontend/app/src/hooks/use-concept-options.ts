import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";

export type ConceptOption = {
  readonly name: string;
  readonly accepts: readonly string[];
};

type ConceptsPage = {
  readonly data: readonly ConceptOption[];
};

export type ConceptOptionsResult = {
  readonly concepts: readonly ConceptOption[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => void;
};

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
