import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";
import { errorStateKind } from "./use-edit-draft-version-form";
import { useCaseVersions, type CaseVersionListItem } from "./use-case-versions";
import type { CaseVersionRecord } from "../services/case-version-record";

export type CaseCurrentVersionOutcome =
  | { readonly phase: "pending" }
  | { readonly phase: "no-version" }
  | { readonly phase: "checking"; readonly version: number }
  | { readonly phase: "not-valid"; readonly version: number }
  | { readonly phase: "read-failed"; readonly version: number }
  | { readonly phase: "valid"; readonly version: number };

function highestNumbered(
  versions: readonly CaseVersionListItem[],
): CaseVersionListItem | undefined {
  return versions.reduce<CaseVersionListItem | undefined>(
    (highest, item) => (highest === undefined || item.version > highest.version ? item : highest),
    undefined,
  );
}

export function useCaseCurrentVersionValidity(slug: string): CaseCurrentVersionOutcome {
  const versionsQuery = useCaseVersions(slug);
  const versions = versionsQuery.data?.data;
  const current = versions ? highestNumbered(versions) : undefined;

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

  if (!versionsQuery.data) {
    return { phase: "pending" };
  }
  if (current === undefined) {
    return { phase: "no-version" };
  }
  if (versionQuery.isError) {
    return errorStateKind(versionQuery.error) === "case-not-valid"
      ? { phase: "not-valid", version: current.version }
      : { phase: "read-failed", version: current.version };
  }
  if (!versionQuery.data) {
    return { phase: "checking", version: current.version };
  }
  return { phase: "valid", version: current.version };
}
