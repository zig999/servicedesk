import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";

export type CapabilityReference = {
  readonly name: string;
  readonly version: string;
};

export type CaseInputRequirement = {
  readonly attribute: string;
  readonly required: boolean;
  readonly capabilities: readonly CapabilityReference[];
};

type CaseInputRequirementsResponse = {
  readonly requirements: readonly CaseInputRequirement[];
  readonly capabilities_with_malformed_input_schema: readonly CapabilityReference[];
};

export type CaseInputRequirementsResult = {
  readonly requirements: readonly CaseInputRequirement[];
  readonly capabilitiesWithMalformedInputSchema: readonly CapabilityReference[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => void;
};

export function useCaseInputRequirements(
  slug: string,
  version: number,
): CaseInputRequirementsResult {
  const query: UseQueryResult<CaseInputRequirementsResponse> = useQuery({
    queryKey: ["case-input-requirements", slug, version],
    queryFn: () =>
      apiFetch<CaseInputRequirementsResponse>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${version}/input-requirements`,
      ),
  });

  return {
    requirements: query.data?.requirements ?? [],
    capabilitiesWithMalformedInputSchema:
      query.data?.capabilities_with_malformed_input_schema ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
  };
}
