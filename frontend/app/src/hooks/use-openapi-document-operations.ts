import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch, ApiError } from "../services/api-client";
import { isPlainRecord } from "../shared/services/plain-record";
import type { OpenApiDocumentFetchFailure } from "./use-draft-connector-configuration-from-openapi";

export type OpenApiOperation = {
  readonly path: string;
  readonly method: string;
};

export type OpenApiDocumentOperationsReadOutcome =
  | { readonly kind: "idle" }
  | { readonly kind: "pending" }
  | { readonly kind: "operations"; readonly operations: readonly OpenApiOperation[] }
  | {
      readonly kind: "openapi-document-not-fetched";
      readonly link?: string;
      readonly failure: OpenApiDocumentFetchFailure;
    }
  | { readonly kind: "openapi-document-not-readable" }
  | { readonly kind: "openapi-document-declares-no-version" }
  | { readonly kind: "unrecognized-failure" };

export type UseOpenApiDocumentOperationsResult = {
  readonly outcome: OpenApiDocumentOperationsReadOutcome;
  readonly refetch: () => void;
};

type ReadOpenApiDocumentOperationsResponse = {
  readonly operations: readonly OpenApiOperation[];
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

function outcomeForNotFetchedError(details: unknown): OpenApiDocumentOperationsReadOutcome {
  if (!isPlainRecord(details)) {
    return { kind: "unrecognized-failure" };
  }
  const failure = fetchFailureFromDetails(details);
  if (failure === undefined) {
    return { kind: "unrecognized-failure" };
  }
  return typeof details.link === "string"
    ? { kind: "openapi-document-not-fetched", link: details.link, failure }
    : { kind: "openapi-document-not-fetched", failure };
}

function outcomeForNotReadableError(details: unknown): OpenApiDocumentOperationsReadOutcome {
  if (isPlainRecord(details) && details.reason === "no-version-declared") {
    return { kind: "openapi-document-declares-no-version" };
  }
  return { kind: "openapi-document-not-readable" };
}

function outcomeForRefusal(error: unknown): OpenApiDocumentOperationsReadOutcome {
  if (!(error instanceof ApiError)) {
    return { kind: "unrecognized-failure" };
  }
  switch (error.code) {
    case "OpenApiDocumentNotFetchedError":
      return outcomeForNotFetchedError(error.details);
    case "OpenApiDocumentNotReadableError":
      return outcomeForNotReadableError(error.details);
    default:
      return { kind: "unrecognized-failure" };
  }
}

function outcomeFromQuery(
  query: UseQueryResult<ReadOpenApiDocumentOperationsResponse>,
  link: string,
): OpenApiDocumentOperationsReadOutcome {
  if (link === "") {
    return { kind: "idle" };
  }
  switch (query.status) {
    case "pending":
      return { kind: "pending" };
    case "error":
      return outcomeForRefusal(query.error);
    case "success":
      return { kind: "operations", operations: query.data.operations };
  }
}

export function useOpenApiDocumentOperations(link: string): UseOpenApiDocumentOperationsResult {
  const query: UseQueryResult<ReadOpenApiDocumentOperationsResponse> = useQuery({
    queryKey: ["read-openapi-document-operations", link],
    queryFn: () =>
      apiFetch<ReadOpenApiDocumentOperationsResponse>(
        `/v1/read-openapi-document-operations?link=${encodeURIComponent(link)}`,
      ),
    enabled: link !== "",
  });

  return {
    outcome: outcomeFromQuery(query, link),
    refetch: () => {
      void query.refetch();
    },
  };
}
