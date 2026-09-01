import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "../services/api-client";
import { errorStateKind } from "./use-edit-draft-version-form";
import { useTelemetry } from "./use-telemetry";

type ManifestEntryDto = {
  readonly position: number;
  readonly hypothesis_revision: {
    readonly hypothesis: { readonly name: string };
    readonly revision: number;
  };
};

type ManifestVersionRecord = {
  readonly manifest: readonly ManifestEntryDto[];
};

export type ManifestRow = {
  readonly position: number;
  readonly hypothesisName: string;
  readonly revision: number;

  readonly canMoveUp: boolean;

  readonly canMoveDown: boolean;

  readonly isOnlyEntry: boolean;

  readonly moveErrorMessage: string | null;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
  readonly onRemove: () => void;
};

export type ManifestBuilderState =
  | { readonly phase: "loading" }
  | { readonly phase: "load-error"; readonly retryLoad: () => void }
  | {
      readonly phase: "ready";
      readonly rows: readonly ManifestRow[];

      readonly isBlocked: boolean;

      readonly isBusy: boolean;
    };

const MOVE_BLOCKED_MESSAGE = "Another hypothesis already holds that position. Try again.";
const GENERIC_FAILURE_MESSAGE = "Something went wrong while saving. Try again.";

function sortByPosition(manifest: readonly ManifestEntryDto[]): readonly ManifestEntryDto[] {
  return [...manifest].sort((a, b) => a.position - b.position);
}

export function useManifestBuilder(slug: string, version: number): ManifestBuilderState {
  const queryClient = useQueryClient();
  const telemetry = useTelemetry();
  const [isBlocked, setIsBlocked] = useState(false);
  const [moveError, setMoveError] = useState<{
    hypothesisName: string;
    message: string;
  } | null>(null);

  const versionQuery = useQuery({
    queryKey: ["case-version", slug, version],
    queryFn: () =>
      apiFetch<ManifestVersionRecord>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}`),
  });

  function invalidateManifest(): void {
    void queryClient.invalidateQueries({ queryKey: ["case-version", slug, version] });
  }

  const placeMutation = useMutation({
    mutationFn: (vars: { hypothesisName: string; revision: number; position: number }) =>
      apiFetch<void>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${version}/manifest/${encodeURIComponent(vars.hypothesisName)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ revision: vars.revision, position: vars.position }),
        },
      ),
    onSuccess: (_data, vars) => {

      setMoveError(null);
      telemetry.manifestHypothesisPlaced({
        slug,
        version,
        hypothesis_name: vars.hypothesisName,
        position: vars.position,
        moved: true,
      });
      invalidateManifest();
    },
    onError: (error, vars) => {
      const kind = errorStateKind(error);
      if (kind === "case-version-not-draft") {

        setIsBlocked(true);
        return;
      }
      if (kind === "manifest-position-occupied") {

        setMoveError({ hypothesisName: vars.hypothesisName, message: MOVE_BLOCKED_MESSAGE });
        return;
      }
      toast.error(GENERIC_FAILURE_MESSAGE);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (vars: { hypothesisName: string }) =>
      apiFetch<void>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${version}/manifest/${encodeURIComponent(vars.hypothesisName)}`,
        { method: "DELETE" },
      ),
    onSuccess: (_data, vars) => {

      telemetry.manifestHypothesisRemoved({ slug, version, hypothesis_name: vars.hypothesisName });
      invalidateManifest();
    },
    onError: (error) => {
      const kind = errorStateKind(error);
      if (kind === "case-version-not-draft") {

        setIsBlocked(true);
        return;
      }
      if (kind === "manifest-would-hold-no-hypothesis") {

        invalidateManifest();
        return;
      }
      toast.error(GENERIC_FAILURE_MESSAGE);
    },
  });

  if (versionQuery.isError) {
    return { phase: "load-error", retryLoad: () => void versionQuery.refetch() };
  }
  if (versionQuery.isLoading || !versionQuery.data) {
    return { phase: "loading" };
  }

  const sorted = sortByPosition(versionQuery.data.manifest);
  const lastIndex = sorted.length - 1;
  const isBusy = placeMutation.isPending || removeMutation.isPending;

  const rows: ManifestRow[] = sorted.map((entry, index) => {
    const hypothesisName = entry.hypothesis_revision.hypothesis.name;
    const revision = entry.hypothesis_revision.revision;
    const previous = sorted[index - 1];
    const next = sorted[index + 1];

    function moveTo(target: ManifestEntryDto | undefined): void {
      if (target === undefined) {
        return;
      }
      setMoveError(null);
      placeMutation.mutate({ hypothesisName, revision, position: target.position });
    }

    return {
      position: entry.position,
      hypothesisName,
      revision,
      canMoveUp: index > 0,
      canMoveDown: index < lastIndex,
      isOnlyEntry: sorted.length === 1,
      moveErrorMessage: moveError?.hypothesisName === hypothesisName ? moveError.message : null,
      onMoveUp: () => moveTo(previous),
      onMoveDown: () => moveTo(next),
      onRemove: () => removeMutation.mutate({ hypothesisName }),
    };
  });

  return { phase: "ready", rows, isBlocked, isBusy };
}
