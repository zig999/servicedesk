import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";

export type GlossaryConcept = {
  readonly name: string;
  readonly accepts: readonly string[];
  readonly ttl: number;
  readonly description: string;
};

type GlossaryConceptsPage = {
  readonly data: readonly GlossaryConcept[];
};

export type GlossaryConceptsResult = {
  readonly concepts: readonly GlossaryConcept[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => void;
};

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
