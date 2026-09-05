import { useQueries } from "@tanstack/react-query";
import { hypothesisRevisionsQueryOptions } from "./use-hypothesis-revisions";
import {
  offPageRevisionStateQueryOptions,
  pinnedRevisionStateOf,
  type PinnedRevisionStateResult,
} from "./use-pinned-revision-state";
import type { CaseVersionManifestEntry } from "../services/case-version-record";

export type ManifestPinnedRevisionStates = ReadonlyMap<number, PinnedRevisionStateResult>;

export function useManifestPinnedRevisionStates(
  slug: string,
  manifest: readonly CaseVersionManifestEntry[],
): ManifestPinnedRevisionStates {
  const defaultResults = useQueries({
    queries: manifest.map((entry) =>
      hypothesisRevisionsQueryOptions(slug, entry.hypothesis_revision.hypothesis.name),
    ),
  });

  const offPageResults = useQueries({
    queries: manifest.map((entry, index) =>
      offPageRevisionStateQueryOptions(
        slug,
        entry.hypothesis_revision.hypothesis.name,
        entry.hypothesis_revision.revision,
        defaultResults[index],
      ),
    ),
  });

  const states = new Map<number, PinnedRevisionStateResult>();
  manifest.forEach((entry, index) => {
    states.set(
      entry.position,
      pinnedRevisionStateOf(
        defaultResults[index],
        offPageResults[index],
        entry.hypothesis_revision.revision,
      ),
    );
  });
  return states;
}
