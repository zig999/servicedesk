import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "../services/api-client";
import { errorStateKind } from "./use-edit-draft-version-form";
import { useTelemetry } from "./use-telemetry";
import { useCaseHypotheses, type HypothesisIdentity } from "./use-case-hypotheses";

type ManifestEntryDto = {
  readonly position: number;
  readonly hypothesis_revision: {
    readonly hypothesis: { readonly name: string };
    readonly revision: number;
  };
};

type ManifestVersionRecord = {
  readonly manifest: readonly ManifestEntryDto[];
  readonly state?: "draft" | "released";
};

export type ManifestRow = {
  readonly position: number;
  readonly hypothesisName: string;
  readonly revision: number;

  readonly canMoveUp: boolean;

  readonly canMoveDown: boolean;

  readonly isOnlyEntry: boolean;

  readonly moveErrorMessage: string | null;

  readonly revisionErrorMessage: string | null;

  readonly removeErrorMessage: string | null;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
  readonly onRemove: () => void;

  readonly onRepin: (revision: number) => void;
};

export type ManifestCandidate = HypothesisIdentity;

export type PlaceExistingError = {
  readonly hypothesisName: string;
  readonly message: string;
};

export type ManifestBuilderState =
  | { readonly phase: "loading" }
  | { readonly phase: "load-error"; readonly retryLoad: () => void }
  | { readonly phase: "not-valid" }
  | {
      readonly phase: "ready";
      readonly rows: readonly ManifestRow[];

      readonly isBlocked: boolean;

      readonly isBusy: boolean;

      readonly isReleased: boolean;

      readonly candidateHypotheses: readonly ManifestCandidate[];

      readonly candidatesAnswered: boolean;

      readonly placeExistingError: PlaceExistingError | null;

      readonly onPlaceExisting: (hypothesisName: string, revision: number, position: number) => void;
    };

const MOVE_BLOCKED_MESSAGE = "Another hypothesis already holds that position. Try again.";
const GENERIC_FAILURE_MESSAGE = "Something went wrong while saving. Try again.";
const REVISION_FAILURE_MESSAGE = "Could not switch to that revision. Try again.";
const REMOVE_BLOCKED_MESSAGE =
  "This case's manifest must hold at least one hypothesis; this entry is still held.";
const PLACE_EXISTING_POSITION_BLOCKED_MESSAGE =
  "This version's manifest already places a different hypothesis at that position; it stands exactly as it did before this placement.";

function candidatesOf(
  hypotheses: readonly HypothesisIdentity[],
  rows: readonly ManifestRow[],
): readonly ManifestCandidate[] {
  const manifested = new Set(rows.map((row) => row.hypothesisName));
  return hypotheses.filter((hypothesis) => !manifested.has(hypothesis.name));
}

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
  const [revisionError, setRevisionError] = useState<{
    hypothesisName: string;
    message: string;
  } | null>(null);
  const [removeError, setRemoveError] = useState<{
    hypothesisName: string;
    message: string;
  } | null>(null);
  const [placeExistingError, setPlaceExistingError] = useState<PlaceExistingError | null>(null);

  const versionQuery = useQuery({
    queryKey: ["case-version", slug, version],
    queryFn: () =>
      apiFetch<ManifestVersionRecord>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}`),
  });
  const caseHypothesesQuery = useCaseHypotheses(slug);

  function invalidateManifest(): void {
    void queryClient.invalidateQueries({ queryKey: ["case-version", slug, version] });
  }

  const placeMutation = useMutation({
    mutationFn: (vars: {
      hypothesisName: string;
      revision: number;
      position: number;
      kind: "move" | "repin" | "place-existing";
    }) =>
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
      setRevisionError(null);
      setPlaceExistingError(null);
      telemetry.manifestHypothesisPlaced({
        slug,
        version,
        hypothesis_name: vars.hypothesisName,
        position: vars.position,
        moved: vars.kind === "move",
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

        if (vars.kind === "place-existing") {
          setPlaceExistingError({
            hypothesisName: vars.hypothesisName,
            message: PLACE_EXISTING_POSITION_BLOCKED_MESSAGE,
          });
          return;
        }
        setMoveError({ hypothesisName: vars.hypothesisName, message: MOVE_BLOCKED_MESSAGE });
        return;
      }
      if (vars.kind === "repin") {

        setRevisionError({ hypothesisName: vars.hypothesisName, message: REVISION_FAILURE_MESSAGE });
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

      setRemoveError(null);
      telemetry.manifestHypothesisRemoved({ slug, version, hypothesis_name: vars.hypothesisName });
      invalidateManifest();
    },
    onError: (error, vars) => {
      const kind = errorStateKind(error);
      if (kind === "case-version-not-draft") {

        setIsBlocked(true);
        return;
      }
      if (kind === "manifest-would-hold-no-hypothesis") {

        setRemoveError({ hypothesisName: vars.hypothesisName, message: REMOVE_BLOCKED_MESSAGE });
        invalidateManifest();
        return;
      }
      toast.error(GENERIC_FAILURE_MESSAGE);
    },
  });

  if (versionQuery.isError) {
    if (errorStateKind(versionQuery.error) === "case-not-valid") {
      return { phase: "not-valid" };
    }
    return { phase: "load-error", retryLoad: () => void versionQuery.refetch() };
  }
  if (versionQuery.isLoading || !versionQuery.data) {
    return { phase: "loading" };
  }

  const sorted = sortByPosition(versionQuery.data.manifest);
  const lastIndex = sorted.length - 1;
  const isBusy = placeMutation.isPending || removeMutation.isPending;
  const isReleased = versionQuery.data.state === "released";

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
      setRevisionError(null);
      placeMutation.mutate({ hypothesisName, revision, position: target.position, kind: "move" });
    }

    function repinTo(chosenRevision: number): void {
      setMoveError(null);
      setRevisionError(null);
      placeMutation.mutate({
        hypothesisName,
        revision: chosenRevision,
        position: entry.position,
        kind: "repin",
      });
    }

    return {
      position: entry.position,
      hypothesisName,
      revision,
      canMoveUp: index > 0,
      canMoveDown: index < lastIndex,
      isOnlyEntry: sorted.length === 1,
      moveErrorMessage: moveError?.hypothesisName === hypothesisName ? moveError.message : null,

      revisionErrorMessage:
        revisionError?.hypothesisName === hypothesisName ? revisionError.message : null,
      removeErrorMessage:
        removeError?.hypothesisName === hypothesisName ? removeError.message : null,
      onMoveUp: () => moveTo(previous),
      onMoveDown: () => moveTo(next),
      onRemove: () => {
        setRemoveError(null);
        removeMutation.mutate({ hypothesisName });
      },

      onRepin: repinTo,
    };
  });

  function placeExisting(hypothesisName: string, revision: number, position: number): void {
    setPlaceExistingError(null);
    placeMutation.mutate({ hypothesisName, revision, position, kind: "place-existing" });
  }

  return {
    phase: "ready",
    rows,
    isBlocked,
    isBusy,
    isReleased,
    candidateHypotheses: candidatesOf(caseHypothesesQuery.data?.data ?? [], rows),
    candidatesAnswered: caseHypothesesQuery.isSuccess,
    placeExistingError,
    onPlaceExisting: placeExisting,
  };
}
