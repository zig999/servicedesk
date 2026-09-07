import { useQueries } from "@tanstack/react-query";
import { hypothesisRevisionsQueryOptions } from "./use-hypothesis-revisions";
import {
  offPageRevisionStateQueryOptions,
  pinnedRevisionStateOf,
  type PinnedRevisionStateResult,
} from "./use-pinned-revision-state";
import type { CaseVersionManifestEntry } from "../services/case-version-record";

export type ManifestPinnedRevisionStates = ReadonlyMap<number, PinnedRevisionStateResult>;

function hasReadableHypothesisName(entry: CaseVersionManifestEntry): boolean {
  return typeof entry.hypothesis_revision?.hypothesis?.name === "string";
}

export function useManifestPinnedRevisionStates(
  slug: string,
  manifest: readonly CaseVersionManifestEntry[],
): ManifestPinnedRevisionStates {
  const readableEntries = manifest.filter(hasReadableHypothesisName);

  const defaultResults = useQueries({
    queries: readableEntries.map((entry) =>
      hypothesisRevisionsQueryOptions(slug, entry.hypothesis_revision.hypothesis.name),
    ),
  });

  const offPageResults = useQueries({
    queries: readableEntries.map((entry, index) =>
      offPageRevisionStateQueryOptions(
        slug,
        entry.hypothesis_revision.hypothesis.name,
        entry.hypothesis_revision.revision,
        defaultResults[index],
      ),
    ),
  });

  const states = new Map<number, PinnedRevisionStateResult>();
  readableEntries.forEach((entry, index) => {
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
