import { useState } from "react";
import {
  useDraftCapabilitySchemaFromOpenApi,
  type DraftCapabilitySchemaRequestOutcome,
} from "./use-draft-capability-schema-from-openapi";
import {
  useOpenApiDocumentOperations,
  type OpenApiDocumentOperationsReadOutcome,
  type OpenApiOperation,
} from "./use-openapi-document-operations";

export type CapabilitySchemaHelperState = {
  readonly link: string;
  readonly onLinkChange: (value: string) => void;
  readonly operations: readonly OpenApiOperation[];
  readonly operationsOutcome: OpenApiDocumentOperationsReadOutcome;
  readonly onRetryOperationsRead: () => void;
  readonly chosenOperation: OpenApiOperation | undefined;
  readonly onChooseOperation: (operation: OpenApiOperation) => void;
  readonly onRequestDraft: () => void;
  readonly outcome: DraftCapabilitySchemaRequestOutcome;
};

function operationsOfferedFor(
  operationsOutcome: OpenApiDocumentOperationsReadOutcome,
): readonly OpenApiOperation[] {
  return operationsOutcome.kind === "operations" ? operationsOutcome.operations : [];
}

export function useCapabilitySchemaHelper(): CapabilitySchemaHelperState {
  const { requestDraft, outcome } = useDraftCapabilitySchemaFromOpenApi();

  const [link, setLink] = useState("");
  const [chosenOperation, setChosenOperation] = useState<OpenApiOperation | undefined>(undefined);

  const { outcome: operationsOutcome, refetch } = useOpenApiDocumentOperations(link);

  return {
    link,
    onLinkChange: setLink,
    operations: operationsOfferedFor(operationsOutcome),
    operationsOutcome,
    onRetryOperationsRead: refetch,
    chosenOperation,
    onChooseOperation: (operation) => setChosenOperation(operation),
    onRequestDraft: () => {
      if (chosenOperation === undefined) {
        return;
      }
      requestDraft({ link, path: chosenOperation.path, method: chosenOperation.method });
    },
    outcome,
  };
}
