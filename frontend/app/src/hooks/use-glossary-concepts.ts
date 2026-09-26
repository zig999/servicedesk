import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError } from "../services/api-client";
import { uiStateForApiError } from "../services/error-ui-state";

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

export type RemoveGlossaryConceptResult = {
  readonly remove: (name: string) => void;
  readonly isRemoving: boolean;
};

const GENERIC_REMOVAL_FAILURE_MESSAGE = "Nothing was removed. Try again.";

function removalFailureMessage(error: unknown, name: string): string {
  if (error instanceof ApiError && uiStateForApiError(error).kind === "concept-in-use") {
    return `Nothing was removed; something else in the glossary still names the concept "${name}".`;
  }
  return GENERIC_REMOVAL_FAILURE_MESSAGE;
}

export function useRemoveGlossaryConcept(): RemoveGlossaryConceptResult {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (name: string) =>
      apiFetch<void>(`/v1/glossary/concepts/${encodeURIComponent(name)}`, {
        method: "DELETE",
      }),
    onSuccess: (_data, name) => {
      toast.success(`Concept ${name} removed.`);
      void queryClient.invalidateQueries({ queryKey: ["glossary", "concepts-with-ttl"] });
    },
    onError: (error, name) => {
      toast.error(removalFailureMessage(error, name));
    },
  });

  return {
    remove: (name: string) => {
      mutation.mutate(name);
    },
    isRemoving: mutation.isPending,
  };
}
