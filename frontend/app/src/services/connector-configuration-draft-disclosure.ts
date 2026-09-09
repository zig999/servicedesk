import type {
  ConnectorConfigurationDraft,
  DraftConnectorConfigurationRequestOutcome,
  OpenApiDocumentFetchFailure,
} from "../hooks/use-draft-connector-configuration-from-openapi";

export type UnresolvedItemDisclosure = {
  readonly name: string;
  readonly reason: string;
  readonly reasonLabel: string;
};

export type GeneratedCredentialDisclosure = {
  readonly name: string;
  readonly securityScheme: string;
};

export type MethodMismatchDisclosure = {
  readonly registered: string;
  readonly operation: string;
};

export type DraftDisclosure = {
  readonly configuration: string;
  readonly unresolved: readonly UnresolvedItemDisclosure[];
  readonly generatedCredentials: readonly GeneratedCredentialDisclosure[];
  readonly methodMismatch: MethodMismatchDisclosure | undefined;
};

export type ConnectorConfigurationHelperDisclosureState =
  | { readonly kind: "none" }
  | { readonly kind: "pending" }
  | { readonly kind: "drafted"; readonly draft: DraftDisclosure }
  | { readonly kind: "refused"; readonly message: string };

const UNRESOLVED_REASON_LABEL: Readonly<Record<string, string>> = {
  "no-capability-registered": "No capability is currently registered naming this connector.",
  "no-matching-input-schema-property":
    "No registered capability's input schema names a matching property.",
  "security-scheme-not-reducible-to-a-credential":
    "This security scheme cannot be reduced to a single credential value.",
  "drafted-key-occupied-by-another-security-scheme":
    "This drafted key is already occupied by another security scheme.",
};

function unresolvedReasonLabel(reason: string): string {
  return UNRESOLVED_REASON_LABEL[reason] ?? reason;
}

function draftDisclosureFrom(draft: ConnectorConfigurationDraft): DraftDisclosure {
  return {
    configuration: draft.configuration,
    unresolved: draft.unresolved.map((item) => ({
      name: item.name,
      reason: item.reason,
      reasonLabel: unresolvedReasonLabel(item.reason),
    })),
    generatedCredentials: draft.generated_credentials.map((credential) => ({
      name: credential.name,
      securityScheme: credential.security_scheme,
    })),
    methodMismatch: draft.method_mismatch,
  };
}

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

export function disclosureStateForOutcome(
  outcome: DraftConnectorConfigurationRequestOutcome,
): ConnectorConfigurationHelperDisclosureState {
  switch (outcome.kind) {
    case "idle":
      return { kind: "none" };
    case "pending":
      return { kind: "pending" };
    case "drafted":
      return { kind: "drafted", draft: draftDisclosureFrom(outcome.draft) };
    case "openapi-document-not-fetched":
      return {
        kind: "refused",
        message:
          "No configuration draft was generated: the named OpenAPI document link could not be " +
          `fetched (${fetchFailureLabel(outcome.failure)}).`,
      };
    case "openapi-document-not-readable":
      return {
        kind: "refused",
        message:
          "No configuration draft was generated: the fetched document could not be read as an " +
          "OpenAPI 3.x document.",
      };
    case "openapi-operation-not-found":
      return {
        kind: "refused",
        message:
          "No configuration draft was generated: the document declares no operation for method " +
          `${outcome.method} at path ${outcome.path}.`,
      };
    case "unrecognized-failure":
      return {
        kind: "refused",
        message:
          "No configuration draft was generated: the request failed for a reason this helper " +
          "does not recognise.",
      };
  }
}
