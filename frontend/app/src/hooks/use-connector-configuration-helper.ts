import { useState } from "react";
import {
  useDraftConnectorConfigurationFromOpenApi,
  type ConnectorConfigurationDraftStatedFor,
  type DraftConnectorConfigurationRequestOutcome,
} from "./use-draft-connector-configuration-from-openapi";
import {
  useOpenApiDocumentOperations,
  type OpenApiDocumentOperationsReadOutcome,
  type OpenApiOperation,
} from "./use-openapi-document-operations";

export type ConnectorConfigurationHelperState = {
  readonly connector?: string;
  readonly link: string;
  readonly onLinkChange: (value: string) => void;
  readonly operations: readonly OpenApiOperation[];
  readonly operationsOutcome: OpenApiDocumentOperationsReadOutcome;
  readonly onChooseOperation: (operation: OpenApiOperation) => void;
  readonly path: string;
  readonly method: string;
  readonly onRequestDraft: () => void;
  readonly outcome: DraftConnectorConfigurationRequestOutcome;
  readonly stale?: boolean;
};

function operationsOfferedFor(
  operationsOutcome: OpenApiDocumentOperationsReadOutcome,
): readonly OpenApiOperation[] {
  return operationsOutcome.kind === "operations" ? operationsOutcome.operations : [];
}

function draftIsStale(
  outcome: DraftConnectorConfigurationRequestOutcome,
  statedFor: ConnectorConfigurationDraftStatedFor | undefined,
  current: { readonly link: string; readonly path: string; readonly method: string; readonly connector: string },
): boolean {
  if (outcome.kind !== "drafted" || statedFor === undefined) {
    return false;
  }
  return (
    statedFor.link !== current.link ||
    statedFor.path !== current.path ||
    statedFor.method !== current.method ||
    statedFor.connector !== current.connector
  );
}

export function useConnectorConfigurationHelper(
  connector: string,
): ConnectorConfigurationHelperState {
  const { requestDraft, outcome, statedFor } = useDraftConnectorConfigurationFromOpenApi(connector);

  const [link, setLink] = useState("");
  const [path, setPath] = useState("");
  const [method, setMethod] = useState("");

  const { outcome: operationsOutcome } = useOpenApiDocumentOperations(link);

  return {
    connector,
    link,
    onLinkChange: setLink,
    operations: operationsOfferedFor(operationsOutcome),
    operationsOutcome,
    onChooseOperation: (operation) => {
      setPath(operation.path);
      setMethod(operation.method);
    },
    path,
    method,
    onRequestDraft: () => {
      requestDraft({ link, path, method });
    },
    outcome,
    stale: draftIsStale(outcome, statedFor, { link, path, method, connector }),
  };
}
