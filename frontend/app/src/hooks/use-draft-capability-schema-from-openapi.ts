import { useRef } from "react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { apiFetch, ApiError } from "../services/api-client";

export type DraftCapabilitySchemaFromOpenApiRequest = {
  readonly link: string;
  readonly path: string;
  readonly method: string;
};

export type CapabilitySchemaDraftUnresolvedItem = {
  readonly name: string;
  readonly reason: string;
};

export type CapabilitySchemaDraft = {
  readonly input_schema: string;
  readonly output_schema: string;
  readonly unresolved: readonly CapabilitySchemaDraftUnresolvedItem[];
};

export type CapabilitySchemaDraftRefusalKind =
  | "openapi-document-not-fetched"
  | "openapi-document-not-readable"
  | "openapi-operation-not-found";

export type DraftCapabilitySchemaRequestOutcome =
  | { readonly kind: "idle" }
  | { readonly kind: "pending" }
  | ({ readonly kind: "drafted"; readonly draft: CapabilitySchemaDraft } & DraftCapabilitySchemaFromOpenApiRequest)
  | ({ readonly kind: CapabilitySchemaDraftRefusalKind } & DraftCapabilitySchemaFromOpenApiRequest)
  | { readonly kind: "unrecognized-failure" };

export type UseDraftCapabilitySchemaFromOpenApiResult = {
  readonly outcome: DraftCapabilitySchemaRequestOutcome;
  readonly requestDraft: (request: DraftCapabilitySchemaFromOpenApiRequest) => void;
};

function pickCapabilitySchemaDraftFields(data: CapabilitySchemaDraft): CapabilitySchemaDraft {
  return {
    input_schema: data.input_schema,
    output_schema: data.output_schema,
    unresolved: data.unresolved.map((item) => ({ name: item.name, reason: item.reason })),
  };
}

function refusalKindForError(error: unknown): CapabilitySchemaDraftRefusalKind | undefined {
  if (!(error instanceof ApiError)) {
    return undefined;
  }
  switch (error.code) {
    case "OpenApiDocumentNotFetchedError":
      return "openapi-document-not-fetched";
    case "OpenApiDocumentNotReadableError":
      return "openapi-document-not-readable";
    case "OpenApiOperationNotFoundError":
      return "openapi-operation-not-found";
    default:
      return undefined;
  }
}

function outcomeFromMutation(
  mutation: UseMutationResult<CapabilitySchemaDraft, Error, DraftCapabilitySchemaFromOpenApiRequest>,
): DraftCapabilitySchemaRequestOutcome {
  switch (mutation.status) {
    case "idle":
      return { kind: "idle" };
    case "pending":
      return { kind: "pending" };
    case "success":
      return { kind: "drafted", ...mutation.variables, draft: pickCapabilitySchemaDraftFields(mutation.data) };
    case "error": {
      const refusalKind = refusalKindForError(mutation.error);
      if (refusalKind === undefined) {
        return { kind: "unrecognized-failure" };
      }
      return { kind: refusalKind, ...mutation.variables };
    }
  }
}

export function useDraftCapabilitySchemaFromOpenApi(): UseDraftCapabilitySchemaFromOpenApiResult {
  const isDispatchingRef = useRef(false);

  const mutation = useMutation({
    mutationFn: (request: DraftCapabilitySchemaFromOpenApiRequest) =>
      apiFetch<CapabilitySchemaDraft>("/v1/draft-capability-schema-from-openapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      }),
  });

  const requestDraft = (request: DraftCapabilitySchemaFromOpenApiRequest): void => {
    if (isDispatchingRef.current) {
      return;
    }
    isDispatchingRef.current = true;

    mutation.reset();

    mutation.mutate(request, {
      onSettled: () => {
        isDispatchingRef.current = false;
      },
    });
  };

  return {
    outcome: outcomeFromMutation(mutation),
    requestDraft,
  };
}
