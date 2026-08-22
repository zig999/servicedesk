/**
 * The Manifest Builder's own state (task/manifest-hypothesis-authoring/
 * manifest-builder): reads a draft version's own manifest through
 * GET /v1/cases/{slug}/versions/{version} (contracts/knowledge/case-query),
 * ordered by each entry's own declared position
 * (rules/knowledge/hypotheses-are-ordered-by-precedence), and dispatches one
 * isolated PUT or DELETE per row action (contracts/knowledge/case-lifecycle's
 * own place-hypothesis/remove-hypothesis operations) -- no client-side
 * "dirty" flag spans more than one action, matching use-edit-draft-version-
 * form.ts's own established convention (a PATCH/PUT/DELETE mutation is its
 * own isolated useMutation with its own onSuccess/onError branch).
 *
 * Reordering (criterion 3): an up/down click issues exactly one PUT naming
 * the position the row's immediate neighbor (by current declared order)
 * currently holds, adopting the row's own current revision unchanged
 * (domain/knowledge/manifest-entry: reordering "changes only the position...
 * never the revision"). This task's own criterion 4 states that landing on a
 * currently-free position always succeeds "even though that position
 * belonged to a different entry before the move" and that only a position a
 * *different* hypothesis still holds is refused -- so this hook never
 * pre-checks occupancy client-side before issuing the PUT
 * (src/src/case/manifest-composition.operations.ts's own
 * refuseOccupiedByAnother is the one and only authority over whether a
 * position is free at the moment of the call); a 409
 * ManifestPositionOccupiedError is handled per criterion 5 rather than
 * avoided. This task's own criteria describe exactly one PUT per click,
 * never a client-orchestrated multi-call maneuver to force a swap between
 * two still-occupied positions -- manifest-composition.operations.spec.ts's
 * own "contested evidence" test confirms a bare two-call swap is refused by
 * the backend itself, and this hook does not attempt to route around that;
 * criterion 5's inline-message path is exactly how a blocked swap surfaces,
 * and it is the expected outcome whenever a manifest's positions sit packed
 * with no gap to land on. This module's own inference, disclosed in this
 * task's delivery record.
 *
 * errorStateKind is reused from use-edit-draft-version-form.ts rather than
 * re-declared here -- this task's own inference: resolving an unknown error
 * to the shared error-to-UI-state table's own `kind` is exactly the three
 * lines that module already exports for this same purpose, not worth a
 * second, drifting copy.
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "../services/api-client";
import { errorStateKind } from "./use-edit-draft-version-form";
import { useTelemetry } from "./use-telemetry";

/**
 * One manifest entry exactly as GET /v1/cases/{slug}/versions/{version}
 * answers it (src/src/http/dto/read-case.dto.ts's own manifestEntrySchema) --
 * only the hypothesis's own name and the revision number this task's own
 * Notes says are needed ("No task here renders the manifest entry's own
 * criterion or collects text; only its hypothesis name and revision number
 * are asserted"), never criterion/collects/resolution.
 */
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

/** One manifest row as this hook exposes it to the screen -- flattened, ordered by declared position (rules/knowledge/hypotheses-are-ordered-by-precedence), each carrying its own bound row actions. */
export type ManifestRow = {
  readonly position: number;
  readonly hypothesisName: string;
  readonly revision: number;
  /** False on the entry holding the lowest position (criterion 2). */
  readonly canMoveUp: boolean;
  /** False on the entry holding the highest position (criterion 2). */
  readonly canMoveDown: boolean;
  /** True exactly when this is the manifest's one remaining entry (criterion 6). */
  readonly isOnlyEntry: boolean;
  /** The inline message a 409 ManifestPositionOccupiedError left on this row (criterion 5), or null. */
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
      /** True once a 409 CaseVersionNotDraftError has been seen on either the PUT or the DELETE (criterion 9) -- sticky, since the version is no longer in draft state until the curator reloads. */
      readonly isBlocked: boolean;
      /** True while a move or a remove is in flight, so a second click cannot race the first (this hook's own inference: no criterion states this, but every sibling hook in this app disables its own controls while its one mutation is pending). */
      readonly isBusy: boolean;
    };

/** No criterion of this task names wording for either failure below (the same reasoning use-edit-draft-version-form.ts's own header comment states for its own generic mutation failure) -- both mirror that module's own generic, non-domain fallback rather than inventing a second one. */
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
      // Criterion 3: a 204 re-renders the list in the new order.
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
        // Criterion 9.
        setIsBlocked(true);
        return;
      }
      if (kind === "manifest-position-occupied") {
        // Criterion 5: nothing was optimistically changed above, so the list
        // is already exactly what it was before this attempt -- the inline
        // message is this hook's own answer to "reverts the attempted move".
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
      // Criterion 7: a 204 removes that entry from the list.
      telemetry.manifestHypothesisRemoved({ slug, version, hypothesis_name: vars.hypothesisName });
      invalidateManifest();
    },
    onError: (error) => {
      const kind = errorStateKind(error);
      if (kind === "case-version-not-draft") {
        // Criterion 9.
        setIsBlocked(true);
        return;
      }
      if (kind === "manifest-would-hold-no-hypothesis") {
        // Criterion 8: never trust the client's own removed-entry state --
        // reload the manifest from the real GET instead.
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
