import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";
import { errorStateKind } from "./use-edit-draft-version-form";
import { useCaseVersions, type CaseVersionListItem, type CaseVersionState } from "./use-case-versions";
import type { CaseVersionRecord } from "../services/case-version-record";

export type CaseAttributesAtAGlanceState =
  | { readonly phase: "loading" }
  | { readonly phase: "no-version" }
  | { readonly phase: "load-error"; readonly retryLoad: () => void }
  | {

      readonly phase: "case-not-valid";
      readonly version: number;
    }
  | {
      readonly phase: "ready";
      readonly version: number;
      readonly versionState: CaseVersionState;
      readonly record: CaseVersionRecord;
    };

function highestNumbered(
  versions: readonly CaseVersionListItem[],
): CaseVersionListItem | undefined {
  return versions.reduce<CaseVersionListItem | undefined>(
    (latest, item) => (latest === undefined || item.version > latest.version ? item : latest),
    undefined,
  );
}

export function useCaseAttributesAtAGlance(slug: string): CaseAttributesAtAGlanceState {
  const versionsQuery = useCaseVersions(slug);
  const versions = versionsQuery.data?.data;
  const draft = versions?.find((item) => item.state === "draft");
  const current = draft ?? (versions ? highestNumbered(versions) : undefined);

  const versionQuery = useQuery({
    queryKey: ["case-version", slug, current?.version ?? null],
    queryFn: () => {

      if (current === undefined) {
        throw new Error("cannot read a version before one has been resolved");
      }
      return apiFetch<CaseVersionRecord>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${current.version}`,
      );
    },
    enabled: current !== undefined,
  });

  if (versionsQuery.isLoading) {
    return { phase: "loading" };
  }
  if (versionsQuery.isError) {
    return { phase: "load-error", retryLoad: () => void versionsQuery.refetch() };
  }
  if (current === undefined) {
    return { phase: "no-version" };
  }

  if (versionQuery.isError) {
    if (errorStateKind(versionQuery.error) === "case-not-valid") {
      return { phase: "case-not-valid", version: current.version };
    }
    return { phase: "load-error", retryLoad: () => void versionQuery.refetch() };
  }
  if (versionQuery.isLoading || !versionQuery.data) {
    return { phase: "loading" };
  }

  return {
    phase: "ready",
    version: current.version,
    versionState: current.state,
    record: versionQuery.data,
  };
}
