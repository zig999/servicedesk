import { useQueries } from "@tanstack/react-query";
import {
  hypothesisRevisionsQueryOptions,
  type HypothesisRevisionState,
} from "./use-hypothesis-revisions";
import type { CaseVersionManifestEntry } from "../services/case-version-record";

export type ManifestPinnedRevisionStates = ReadonlyMap<number, HypothesisRevisionState>;

export function useManifestPinnedRevisionStates(
  slug: string,
  manifest: readonly CaseVersionManifestEntry[],
): ManifestPinnedRevisionStates {
  const results = useQueries({
    queries: manifest.map((entry) =>
      hypothesisRevisionsQueryOptions(slug, entry.hypothesis_revision.hypothesis.name),
    ),
  });

  const states = new Map<number, HypothesisRevisionState>();
  manifest.forEach((entry, index) => {
    const result = results[index];
    const pinned = result.data?.data.find(
      (item) => item.revision === entry.hypothesis_revision.revision,
    );
    if (pinned !== undefined) {
      states.set(entry.position, pinned.state);
    }
  });
  return states;
}
