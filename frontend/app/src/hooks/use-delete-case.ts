import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";

export function useDeleteCase(): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) =>
      apiFetch<void>(`/v1/cases/${encodeURIComponent(slug)}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cases-list"] });
    },
  });
}
