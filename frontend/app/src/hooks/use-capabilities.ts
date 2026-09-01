import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";

export type CapabilityNature = "read-only" | "mutating";

export type Capability = {
  readonly name: string;
  readonly version: string;
  readonly nature: CapabilityNature;
  readonly input_schema: string;
  readonly output_schema: string;
  readonly timeout: number;
  readonly connector: string;
  readonly concept: string;
};

type CapabilitiesPage = {
  readonly data: readonly Capability[];
};

export type CapabilitiesResult = {
  readonly capabilities: readonly Capability[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => void;
};

export function useCapabilities(): CapabilitiesResult {
  const query: UseQueryResult<CapabilitiesPage> = useQuery({
    queryKey: ["capabilities"],
    queryFn: () => apiFetch<CapabilitiesPage>("/v1/capabilities"),
  });

  return {
    capabilities: query.data?.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
  };
}
