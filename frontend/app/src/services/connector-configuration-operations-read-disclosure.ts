import type { OpenApiDocumentFetchFailure } from "../hooks/use-draft-connector-configuration-from-openapi";
import type { OpenApiDocumentOperationsReadOutcome } from "../hooks/use-openapi-document-operations";

export type OperationsReadDisclosureState =
  | { readonly kind: "none" }
  | { readonly kind: "refused"; readonly message: string };

function fetchFailureLabel(failure: OpenApiDocumentFetchFailure): string {
  switch (failure.kind) {
    case "network-failure":
      return "a network failure";
    case "timeout":
      return "a timeout";
    case "status-outside-2xx":
      return `a response outside the 2xx range (status ${failure.status})`;
  }
}

export function operationsReadDisclosureStateForOutcome(
  outcome: OpenApiDocumentOperationsReadOutcome,
): OperationsReadDisclosureState {
  switch (outcome.kind) {
    case "idle":
    case "pending":
    case "operations":
      return { kind: "none" };
    case "openapi-document-not-fetched":
      return {
        kind: "refused",
        message:
          "No operations were listed: the named OpenAPI document link could not be fetched " +
          `(${fetchFailureLabel(outcome.failure)}).`,
      };
    case "openapi-document-not-readable":
    case "openapi-document-declares-no-version":
      return {
        kind: "refused",
        message:
          "No operations were listed: the fetched document could not be read as an OpenAPI " +
          "3.x document.",
      };
    case "unrecognized-failure":
      return {
        kind: "refused",
        message:
          "No operations were listed: the request failed for a reason this helper does not " +
          "recognise.",
      };
  }
}
