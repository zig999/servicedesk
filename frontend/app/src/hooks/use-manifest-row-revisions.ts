import { useHypothesisRevisions, type HypothesisRevisionListItem } from "./use-hypothesis-revisions";
import { latestRevisionOf } from "./use-hypothesis-revision-form";

export type ManifestRowRevisions = {
  readonly revisions: readonly HypothesisRevisionListItem[];
  readonly highestRevision: number | undefined;
};

export function useManifestRowRevisions(
  slug: string,
  hypothesisName: string,
): ManifestRowRevisions {
  const revisionsQuery = useHypothesisRevisions(slug, hypothesisName);
  const revisions = revisionsQuery.data?.data ?? [];

  return {
    revisions,
    highestRevision: latestRevisionOf(revisions)?.revision,
  };
}
