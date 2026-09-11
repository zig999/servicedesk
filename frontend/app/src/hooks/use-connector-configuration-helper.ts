import { useState } from "react";
import {
  useDraftConnectorConfigurationFromOpenApi,
  type DraftConnectorConfigurationRequestOutcome,
} from "./use-draft-connector-configuration-from-openapi";
import {
  useOpenApiDocumentOperations,
  type OpenApiDocumentOperationsReadOutcome,
  type OpenApiOperation,
} from "./use-openapi-document-operations";

export type ConnectorConfigurationHelperState = {
  readonly link: string;
  readonly onLinkChange: (value: string) => void;
  readonly operations: readonly OpenApiOperation[];
  readonly operationsOutcome: OpenApiDocumentOperationsReadOutcome;
  readonly onChooseOperation: (operation: OpenApiOperation) => void;
  readonly path: string;
  readonly onPathChange: (value: string) => void;
  readonly method: string;
  readonly onMethodChange: (value: string) => void;
  readonly onRequestDraft: () => void;
  readonly outcome: DraftConnectorConfigurationRequestOutcome;
};

function operationsOfferedFor(
  operationsOutcome: OpenApiDocumentOperationsReadOutcome,
): readonly OpenApiOperation[] {
  return operationsOutcome.kind === "operations" ? operationsOutcome.operations : [];
}

export function useConnectorConfigurationHelper(
  connector: string,
): ConnectorConfigurationHelperState {
  const { requestDraft, outcome } = useDraftConnectorConfigurationFromOpenApi(connector);

  const [link, setLink] = useState("");
  const [path, setPath] = useState("");
  const [method, setMethod] = useState("");

  const { outcome: operationsOutcome } = useOpenApiDocumentOperations(link);

  return {
    link,
    onLinkChange: setLink,
    operations: operationsOfferedFor(operationsOutcome),
    operationsOutcome,
    onChooseOperation: (operation) => {
      setPath(operation.path);
      setMethod(operation.method);
    },
    path,
    onPathChange: setPath,
    method,
    onMethodChange: setMethod,
    onRequestDraft: () => {
      requestDraft({ link, path, method });
    },
    outcome,
  };
}
