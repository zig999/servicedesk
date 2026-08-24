/**
 * Reads every connector configuration currently registered
 * (task/connector-configuration-authoring/connector-configuration-create-edit-form,
 * criterion 1) through GET /v1/connectors
 * (contracts/integration/connector-configuration-registry). Mirrors
 * use-glossary-concepts.ts's own established convention exactly
 * (work/capability-connector-authoring-frontend/inventory/
 * capability-connector-authoring-frontend-area's own must_not_duplicate
 * entry naming that file as the shape any new list read must follow):
 * apiFetch<PageType>, reading only the page's own `data` array
 * (`total`/`limit`/`offset`/`pageCount` deliberately left unread, the same
 * convention that hook and use-glossary-vocabulary.ts/use-concept-options.ts
 * already keep since this app's own seed fixtures fit inside one page), and
 * returning {list-field, isLoading, isError, refetch} with `refetch` already
 * wrapped to a void-returning function so a caller (this task's own screen)
 * can pass it straight to a Button's onClick, the same convention
 * capabilities-browser-screen.tsx's own header comment names for its sibling
 * useCapabilities.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";

/**
 * domain/integration/connector-configuration: its two required string
 * attributes, `connector` (its own identity) and `configuration` (the JSON
 * text it holds) -- exactly the shape PUT /v1/connectors/{connector}'s own
 * request body carries (register-connector.dto.ts) and this app's own GET
 * /v1/connectors read returns for each entry.
 */
export type ConnectorConfiguration = {
  readonly connector: string;
  readonly configuration: string;
};

/** The shape of one page of GET /v1/connectors -- only the field this hook reads. */
type ConnectorConfigurationsPage = {
  readonly data: readonly ConnectorConfiguration[];
};

export type ConnectorConfigurationsResult = {
  readonly connectorConfigurations: readonly ConnectorConfiguration[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => void;
};

/** Reads every connector configuration currently registered (criterion 1). */
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
