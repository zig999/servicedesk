import type { OpenApiDocumentOperationsReadOutcome } from "../hooks/use-openapi-document-operations";
import {
  openApiFetchFailureText,
  operationsNotListedFetchFailureMessage,
  OPERATIONS_NOT_LISTED_NOT_READABLE_MESSAGE,
  OPERATIONS_NOT_LISTED_UNRECOGNIZED_FAILURE_MESSAGE,
} from "./connector-configuration-messages";

export type OperationsReadDisclosureState =
  | { readonly kind: "none" }
  | { readonly kind: "pending" }
  | { readonly kind: "empty" }
  | { readonly kind: "refused"; readonly message: string };

export function operationsReadDisclosureStateForOutcome(
  outcome: OpenApiDocumentOperationsReadOutcome,
): OperationsReadDisclosureState {
  switch (outcome.kind) {
    case "idle":
      return { kind: "none" };
    case "pending":
      return { kind: "pending" };
    case "operations":
      return outcome.operations.length === 0 ? { kind: "empty" } : { kind: "none" };
    case "openapi-document-not-fetched":
      return {
        kind: "refused",
        message: operationsNotListedFetchFailureMessage(openApiFetchFailureText(outcome.failure)),
      };
    case "openapi-document-not-readable":
    case "openapi-document-declares-no-version":
      return {
        kind: "refused",
        message: OPERATIONS_NOT_LISTED_NOT_READABLE_MESSAGE,
      };
    case "unrecognized-failure":
      return {
        kind: "refused",
        message: OPERATIONS_NOT_LISTED_UNRECOGNIZED_FAILURE_MESSAGE,
      };
  }
}
