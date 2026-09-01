import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";

export type ConnectorConfiguration = {
  readonly connector: string;
  readonly configuration: string;
};

type ConnectorConfigurationsPage = {
  readonly data: readonly ConnectorConfiguration[];
};

export type ConnectorConfigurationsResult = {
  readonly connectorConfigurations: readonly ConnectorConfiguration[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => void;
};

export function useConnectorConfigurations(): ConnectorConfigurationsResult {
  const query: UseQueryResult<ConnectorConfigurationsPage> = useQuery({
    queryKey: ["connector-configurations"],
    queryFn: () => apiFetch<ConnectorConfigurationsPage>("/v1/connectors"),
  });

  return {
    connectorConfigurations: query.data?.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
  };
}
