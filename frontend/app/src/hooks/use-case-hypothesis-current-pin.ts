import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";
import { useCaseVersions } from "./use-case-versions";

type ManifestEntryDto = {
  readonly hypothesis_revision: {
    readonly hypothesis: { readonly name: string };
    readonly revision: number;
  };
};

type CaseVersionManifest = {
  readonly manifest: readonly ManifestEntryDto[];
};

export type CaseHypothesisCurrentPin =
  | { readonly phase: "loading" }
  | { readonly phase: "load-error"; readonly retryLoad: () => void }
  | {
      readonly phase: "ready";
      readonly targetVersion: number;
      readonly pinnedRevision: number | null;
    };

function pinnedRevisionFor(
  manifest: readonly ManifestEntryDto[],
  hypothesisName: string,
): number | null {
  const entry = manifest.find(
    (item) => item.hypothesis_revision.hypothesis.name === hypothesisName,
  );
  return entry === undefined ? null : entry.hypothesis_revision.revision;
}

export function useCaseHypothesisCurrentPin(
  slug: string,
  hypothesisName: string,
): CaseHypothesisCurrentPin {
  const versionsQuery = useCaseVersions(slug);
  const versions = versionsQuery.data?.data ?? [];
  const targetVersion =
    versions.length > 0 ? Math.max(...versions.map((version) => version.version)) : undefined;

  const manifestQuery: UseQueryResult<CaseVersionManifest> = useQuery({
    queryKey: ["case-version", slug, targetVersion],
    queryFn: () =>
      apiFetch<CaseVersionManifest>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${targetVersion}`,
      ),
    enabled: targetVersion !== undefined,
  });

  function retryLoad(): void {
    void versionsQuery.refetch();
    if (targetVersion !== undefined) {
      void manifestQuery.refetch();
    }
  }

  if (versionsQuery.isError || (versionsQuery.data !== undefined && versions.length === 0)) {
    return { phase: "load-error", retryLoad };
  }

  if (versionsQuery.isLoading || targetVersion === undefined) {
    return { phase: "loading" };
  }

  if (manifestQuery.isError) {
    return { phase: "load-error", retryLoad };
  }

  if (manifestQuery.data === undefined) {
    return { phase: "loading" };
  }

  return {
    phase: "ready",
    targetVersion,
    pinnedRevision: pinnedRevisionFor(manifestQuery.data.manifest, hypothesisName),
  };
}
