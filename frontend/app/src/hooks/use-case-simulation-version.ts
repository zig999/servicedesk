import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";
import type { CaseVersionState } from "./use-case-versions";
import type { CaseVersionRecord } from "../services/case-version-record";

export type CaseSimulationVersionState =
  | { readonly phase: "loading" }
  | { readonly phase: "load-error"; readonly retryLoad: () => void }
  | {
      readonly phase: "ready";
      readonly record: CaseVersionRecord;
      readonly versionState: CaseVersionState;
    };

export function useCaseSimulationVersion(
  slug: string,
  version: number,
): CaseSimulationVersionState {
  const versionQuery = useQuery({
    queryKey: ["case-version", slug, version],
    queryFn: () =>
      apiFetch<CaseVersionRecord>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${version}`,
      ),
  });

  if (versionQuery.isError) {
    return { phase: "load-error", retryLoad: () => void versionQuery.refetch() };
  }
  if (versionQuery.isLoading || !versionQuery.data) {
    return { phase: "loading" };
  }

  const record = versionQuery.data;
  if (record.state === undefined) {

    throw new Error("a loaded case version record always reports its own state");
  }

  return { phase: "ready", record, versionState: record.state };
}
