import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError } from "../services/api-client";
import { errorStateKind } from "./use-edit-draft-version-form";
import {
  hypothesisRevisionsQueryOptions,
  type HypothesisRevisionListItem,
  type HypothesisRevisionsPage,
} from "./use-hypothesis-revisions";

export type HypothesisRevisionReleaseControl = {
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly isConfirming: boolean;
  readonly onConfirm: () => void;
};

const GENERIC_RELEASE_FAILURE_MESSAGE = "Something went wrong while releasing. Try again.";

function withRevisionReleased(
  page: HypothesisRevisionsPage,
  revision: number,
): HypothesisRevisionsPage {
  return {
    ...page,
    data: page.data.map(
      (item): HypothesisRevisionListItem =>
        item.revision === revision ? { ...item, state: "released" } : item,
    ),
  };
}

export function useHypothesisRevisionRelease(
  slug: string,
  hypothesisName: string,
  revision: number,
): HypothesisRevisionReleaseControl {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const { queryKey } = hypothesisRevisionsQueryOptions(slug, hypothesisName);

  const releaseMutation = useMutation({
    mutationFn: () =>
      apiFetch<void>(
        `/v1/cases/${encodeURIComponent(slug)}/hypotheses/${encodeURIComponent(hypothesisName)}/revisions/${revision}/release`,
        { method: "POST" },
      ),
    onSuccess: () => {
      setIsOpen(false);
      queryClient.setQueryData<HypothesisRevisionsPage>(queryKey, (page) =>
        page === undefined ? page : withRevisionReleased(page, revision),
      );
    },
    onError: (error) => {
      if (errorStateKind(error) === "hypothesis-revision-not-draft-at-release") {
        setIsOpen(false);
        toast.error(error instanceof ApiError ? error.message : GENERIC_RELEASE_FAILURE_MESSAGE);
        void queryClient.invalidateQueries({ queryKey });
        return;
      }
      toast.error(GENERIC_RELEASE_FAILURE_MESSAGE);
    },
  });

  return {
    isOpen,
    onOpenChange: setIsOpen,
    isConfirming: releaseMutation.isPending,
    onConfirm: () => releaseMutation.mutate(),
  };
}
