import { useRef } from "react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { apiFetch, ApiError } from "../services/api-client";
import { isPlainRecord } from "../shared/services/plain-record";

export type ConnectorConfigurationDraftUnresolvedItem = {
  readonly name: string;
  readonly reason: string;
};

export type ConnectorConfigurationDraftGeneratedCredential = {
  readonly name: string;
  readonly security_scheme: string;
};

export type ConnectorConfigurationDraftMethodMismatch = {
  readonly registered: string;
  readonly operation: string;
};

export type ConnectorConfigurationDraft = {
  readonly connector: string;
  readonly configuration: string;
  readonly unresolved: readonly ConnectorConfigurationDraftUnresolvedItem[];
  readonly generated_credentials: readonly ConnectorConfigurationDraftGeneratedCredential[];
  readonly method_mismatch?: ConnectorConfigurationDraftMethodMismatch;
};

export type DraftConnectorConfigurationFromOpenApiRequest = {
  readonly link: string;
  readonly path: string;
  readonly method: string;
};

type DraftConnectorConfigurationFromOpenApiRequestBody = DraftConnectorConfigurationFromOpenApiRequest & {
  readonly connector: string;
};

export type OpenApiDocumentFetchFailure =
  | { readonly kind: "network-failure" }
  | { readonly kind: "timeout" }
  | { readonly kind: "status-outside-2xx"; readonly status: number };

export type DraftConnectorConfigurationRequestOutcome =
  | { readonly kind: "idle" }
  | { readonly kind: "pending" }
  | { readonly kind: "drafted"; readonly draft: ConnectorConfigurationDraft }
  | {
      readonly kind: "openapi-document-not-fetched";
      readonly link: string;
      readonly failure: OpenApiDocumentFetchFailure;
    }
  | { readonly kind: "openapi-document-not-readable" }
  | {
      readonly kind: "openapi-operation-not-found";
      readonly path: string;
      readonly method: string;
    }
  | { readonly kind: "unrecognized-failure" };

export type UseDraftConnectorConfigurationFromOpenApiResult = {
  readonly outcome: DraftConnectorConfigurationRequestOutcome;
  readonly requestDraft: (request: DraftConnectorConfigurationFromOpenApiRequest) => void;
};

function fetchFailureFromDetails(details: Record<string, unknown>): OpenApiDocumentFetchFailure | undefined {
  const kind = details.kind;
  if (kind === "network-failure" || kind === "timeout") {
    return { kind };
  }
  if (kind === "status-outside-2xx" && typeof details.status === "number") {
    return { kind, status: details.status };
  }
  return undefined;
}

function outcomeForNotFetchedError(details: unknown): DraftConnectorConfigurationRequestOutcome {
  if (!isPlainRecord(details) || typeof details.link !== "string") {
    return { kind: "unrecognized-failure" };
  }
  const failure = fetchFailureFromDetails(details);
  if (failure === undefined) {
    return { kind: "unrecognized-failure" };
  }
  return { kind: "openapi-document-not-fetched", link: details.link, failure };
}

function outcomeForOperationNotFoundError(details: unknown): DraftConnectorConfigurationRequestOutcome {
  if (!isPlainRecord(details) || typeof details.path !== "string" || typeof details.method !== "string") {
    return { kind: "unrecognized-failure" };
  }
  return { kind: "openapi-operation-not-found", path: details.path, method: details.method };
}

function pickConnectorConfigurationDraftFields(data: ConnectorConfigurationDraft): ConnectorConfigurationDraft {
  const {
    connector,
    configuration,
    unresolved,
    generated_credentials: generatedCredentials,
    method_mismatch: methodMismatch,
  } = data;
  return methodMismatch === undefined
    ? { connector, configuration, unresolved, generated_credentials: generatedCredentials }
    : { connector, configuration, unresolved, generated_credentials: generatedCredentials, method_mismatch: methodMismatch };
}

function outcomeForRefusal(error: unknown): DraftConnectorConfigurationRequestOutcome {
  if (!(error instanceof ApiError)) {
    return { kind: "unrecognized-failure" };
  }
  switch (error.code) {
    case "OpenApiDocumentNotFetchedError":
      return outcomeForNotFetchedError(error.details);
    case "OpenApiDocumentNotReadableError":
      return { kind: "openapi-document-not-readable" };
    case "OpenApiOperationNotFoundError":
      return outcomeForOperationNotFoundError(error.details);
    default:
      return { kind: "unrecognized-failure" };
  }
}

function outcomeFromMutation(
  mutation: UseMutationResult<ConnectorConfigurationDraft, Error, DraftConnectorConfigurationFromOpenApiRequestBody>,
): DraftConnectorConfigurationRequestOutcome {
  switch (mutation.status) {
    case "idle":
      return { kind: "idle" };
    case "pending":
      return { kind: "pending" };
    case "success":
      return { kind: "drafted", draft: pickConnectorConfigurationDraftFields(mutation.data) };
    case "error":
      return outcomeForRefusal(mutation.error);
  }
}

export function useDraftConnectorConfigurationFromOpenApi(
  connector: string,
): UseDraftConnectorConfigurationFromOpenApiResult {
  const isDispatchingRef = useRef(false);

  const mutation = useMutation({
    mutationFn: (body: DraftConnectorConfigurationFromOpenApiRequestBody) =>
      apiFetch<ConnectorConfigurationDraft>("/v1/draft-connector-configuration-from-openapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
  });

  const requestDraft = (request: DraftConnectorConfigurationFromOpenApiRequest): void => {
    if (isDispatchingRef.current) {
      return;
    }
    isDispatchingRef.current = true;

    mutation.reset();

    mutation.mutate(
      { ...request, connector },
      {
        onSettled: () => {
          isDispatchingRef.current = false;
        },
      },
    );
  };

  return {
    outcome: outcomeFromMutation(mutation),
    requestDraft,
  };
}
