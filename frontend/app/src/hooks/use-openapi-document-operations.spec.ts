import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useOpenApiDocumentOperations,
  type OpenApiOperation,
  type OpenApiDocumentOperationsReadOutcome,
} from "./use-openapi-document-operations";

afterEach(() => {
  vi.unstubAllGlobals();
});

const READ_ROUTE_PREFIX = "/v1/read-openapi-document-operations";
const LINK = "https://api.example.com/openapi.json";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function errorResponse(code: string, details: unknown, status = 422): Response {
  return new Response(JSON.stringify({ error: { code, message: "the request was refused", details } }), { status });
}

type CapturedCall = { readonly url: string };
type FetchHandler = () => Response | Promise<Response>;

function stubFetch(handler: FetchHandler): { readonly calls: CapturedCall[] } {
  const calls: CapturedCall[] = [];
  const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    calls.push({ url });
    return handler();
  });
  vi.stubGlobal("fetch", fetchMock);
  return { calls };
}

function stubFetchRoutedByLink(responses: Record<string, FetchHandler>): { readonly calls: CapturedCall[] } {
  const calls: CapturedCall[] = [];
  const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    calls.push({ url });
    const matchingLink = Object.keys(responses).find((link) => url.includes(encodeURIComponent(link)));
    if (matchingLink === undefined) {
      throw new Error(`use-openapi-document-operations proof: no mocked response matching url ${url}`);
    }
    return responses[matchingLink]();
  });
  vi.stubGlobal("fetch", fetchMock);
  return { calls };
}

function createWrapper(): (props: { children: ReactNode }) => ReactElement {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function mount(link: string) {
  return renderHook(() => useOpenApiDocumentOperations(link), { wrapper: createWrapper() }).result;
}

type ResultHandle = { readonly current: { readonly outcome: OpenApiDocumentOperationsReadOutcome } };

async function waitForKind(result: ResultHandle, kind: OpenApiDocumentOperationsReadOutcome["kind"]): Promise<void> {
  await waitFor(() => expect(result.current.outcome.kind).toBe(kind));
}

describe("useOpenApiDocumentOperations -- the read reaches only the backend's own route, the link carried as data (criteria 1, 2)", () => {
  it("issues exactly one network call, to a route naming read-openapi-document-operations and carrying the link as data, never to the link itself", async () => {
    const { calls } = stubFetch(() => jsonResponse({ operations: [] }));
    const result = mount(LINK);
    await waitForKind(result, "operations");

    expect(calls).toHaveLength(1);
    expect(calls[0]?.url.startsWith(READ_ROUTE_PREFIX)).toBe(true);
    expect(calls[0]?.url).toContain(encodeURIComponent(LINK));
    expect(calls.some((call) => call.url === LINK)).toBe(false);
  });
});

describe("useOpenApiDocumentOperations -- every listed operation is exposed, none dropped or paged (criterion 3)", () => {
  const OPERATIONS: readonly OpenApiOperation[] = [
    { path: "/v2/translate", method: "POST" },
    { path: "/v2/glossaries", method: "GET" },
    { path: "/v2/glossaries/{id}", method: "DELETE" },
  ];

  it("exposes an operations outcome carrying exactly the operations the answer listed, in one array", async () => {
    stubFetch(() => jsonResponse({ operations: OPERATIONS }));
    const result = mount(LINK);
    await waitForKind(result, "operations");

    expect(result.current.outcome).toEqual({ kind: "operations", operations: OPERATIONS });
  });

  it("exposes an empty operations array, not a refusal or an absent outcome, when the answered document declares no operations", async () => {
    stubFetch(() => jsonResponse({ operations: [] }));
    const result = mount(LINK);
    await waitForKind(result, "operations");

    expect(result.current.outcome).toEqual({ kind: "operations", operations: [] });
  });
});

describe("useOpenApiDocumentOperations -- one operation's entry discloses exactly its own path and its own method (criterion 3)", () => {
  const SOLE_OPERATION: OpenApiOperation = { path: "/v2/accounts/{accountId}/invoices", method: "DELETE" };

  it("exposes the answered path and method verbatim, and nothing else, for a document declaring one operation", async () => {
    stubFetch(() => jsonResponse({ operations: [SOLE_OPERATION] }));
    const result = mount(LINK);
    await waitForKind(result, "operations");

    const outcome = result.current.outcome;
    if (outcome.kind !== "operations") {
      throw new Error("use-openapi-document-operations proof: expected an operations outcome");
    }
    expect(outcome.operations).toHaveLength(1);
    expect(outcome.operations[0]).toEqual(SOLE_OPERATION);
    expect(Object.keys(outcome.operations[0] ?? {})).toEqual(["path", "method"]);
  });
});

describe("useOpenApiDocumentOperations -- an entry's method is exposed with no case change of the hook's own (criterion 4)", () => {
  it("exposes a lower-cased method exactly as the answer named it, applying no upper-casing of its own", async () => {
    stubFetch(() => jsonResponse({ operations: [{ path: "/v2/translate", method: "patch" }] }));
    const result = mount(LINK);
    await waitForKind(result, "operations");

    const outcome = result.current.outcome;
    if (outcome.kind !== "operations") {
      throw new Error("use-openapi-document-operations proof: expected an operations outcome");
    }
    expect(outcome.operations[0]?.method).toBe("patch");
  });
});

type FetchFailureCase = {
  readonly label: string;
  readonly details: Record<string, unknown>;
  readonly expectedFailure: Record<string, unknown>;
};

const FETCH_FAILURE_CASES: readonly FetchFailureCase[] = [
  { label: "network-failure", details: { kind: "network-failure" }, expectedFailure: { kind: "network-failure" } },
  { label: "timeout", details: { kind: "timeout" }, expectedFailure: { kind: "timeout" } },
  {
    label: "status-outside-2xx",
    details: { kind: "status-outside-2xx", status: 503 },
    expectedFailure: { kind: "status-outside-2xx", status: 503 },
  },
];

describe("useOpenApiDocumentOperations -- an unfetchable link names which of the three fetch failures occurred (criterion 5)", () => {
  it.each(FETCH_FAILURE_CASES)("exposes openapi-document-not-fetched naming $label", async ({ details, expectedFailure }) => {
    stubFetch(() => errorResponse("OpenApiDocumentNotFetchedError", details));
    const result = mount(LINK);
    await waitForKind(result, "openapi-document-not-fetched");

    expect(result.current.outcome).toMatchObject({ kind: "openapi-document-not-fetched", failure: expectedFailure });
  });
});

describe("useOpenApiDocumentOperations -- a status-outside-2xx refusal carries the answered status and the echoed link (UNDERDETERMINED note 1)", () => {
  it("carries the answered status code and the link exactly as the request named it, not merely the sub-kind", async () => {
    stubFetch(() => errorResponse("OpenApiDocumentNotFetchedError", { kind: "status-outside-2xx", status: 503, link: LINK }));
    const result = mount(LINK);
    await waitForKind(result, "openapi-document-not-fetched");

    expect(result.current.outcome).toEqual({
      kind: "openapi-document-not-fetched",
      link: LINK,
      failure: { kind: "status-outside-2xx", status: 503 },
    });
  });
});

describe("useOpenApiDocumentOperations -- an unreadable document is its own outcome, never the unfetchable-link one (criterion 6)", () => {
  it("exposes OpenApiDocumentNotReadableError as {kind: 'openapi-document-not-readable'}, carrying no fetch-failure data", async () => {
    stubFetch(() => errorResponse("OpenApiDocumentNotReadableError", { anything: "here" }));
    const result = mount(LINK);
    await waitForKind(result, "openapi-document-not-readable");

    expect(result.current.outcome).toEqual({ kind: "openapi-document-not-readable" });
  });
});

describe("useOpenApiDocumentOperations -- a document declaring no version at all is its own named outcome, not collapsed with a parse failure (UNDERDETERMINED note 2)", () => {
  it("exposes openapi-document-declares-no-version for a no-version-declared reason, and openapi-document-not-readable for a parse failure", async () => {
    const LINK_PARSE_FAILURE = "https://api.example.com/malformed-openapi.json";
    const LINK_NO_VERSION_DECLARED = "https://api.example.com/versionless-openapi.json";
    stubFetchRoutedByLink({
      [LINK_PARSE_FAILURE]: () =>
        errorResponse("OpenApiDocumentNotReadableError", { reason: "not-well-formed-openapi" }),
      [LINK_NO_VERSION_DECLARED]: () =>
        errorResponse("OpenApiDocumentNotReadableError", { reason: "no-version-declared" }),
    });

    const parseFailureResult = mount(LINK_PARSE_FAILURE);
    await waitForKind(parseFailureResult, "openapi-document-not-readable");
    expect(parseFailureResult.current.outcome).toEqual({ kind: "openapi-document-not-readable" });

    const noVersionResult = mount(LINK_NO_VERSION_DECLARED);
    await waitForKind(noVersionResult, "openapi-document-declares-no-version");
    expect(noVersionResult.current.outcome).toEqual({ kind: "openapi-document-declares-no-version" });
  });
});

describe("useOpenApiDocumentOperations -- neither known condition, or an unrecognisable body, is exposed as unrecognized-failure (criterion 7)", () => {
  it.each([
    {
      label: "an error code naming neither known condition",
      handler: (): Response => errorResponse("CaseNotFoundError", { anything: "here" }, 404),
    },
    {
      label: "OpenApiDocumentNotFetchedError whose details carry no shape the hook recognizes",
      handler: (): Response => errorResponse("OpenApiDocumentNotFetchedError", { kind: "an-unrecognized-fetch-failure-kind" }),
    },
  ])("exposes {kind: 'unrecognized-failure'} for $label", async ({ handler }) => {
    stubFetch(handler);
    const result = mount(LINK);
    await waitForKind(result, "unrecognized-failure");

    expect(result.current.outcome).toEqual({ kind: "unrecognized-failure" });
  });

  it("exposes {kind: 'unrecognized-failure'} for a raw, non-ApiError throw (the request itself failing outright)", async () => {
    stubFetch(() => {
      throw new TypeError("network failure reaching this project's own backend");
    });
    const result = mount(LINK);
    await waitForKind(result, "unrecognized-failure");

    expect(result.current.outcome).toEqual({ kind: "unrecognized-failure" });
  });
});

describe("useOpenApiDocumentOperations -- a refusal outcome carries no operation entries (criterion 8)", () => {
  it("carries no operations field on the richest refusal outcome, openapi-document-not-fetched", async () => {
    stubFetch(() => errorResponse("OpenApiDocumentNotFetchedError", { kind: "status-outside-2xx", status: 503, link: LINK }));
    const result = mount(LINK);
    await waitForKind(result, "openapi-document-not-fetched");

    expect(Object.prototype.hasOwnProperty.call(result.current.outcome, "operations")).toBe(false);
  });
});

describe("useOpenApiDocumentOperations -- reading a second link exposes only that link's own operations (criterion 9)", () => {
  it("exposes the second link's operations, never the first link's, once the hook is re-keyed to it", async () => {
    const LINK_A = "https://api.example.com/first-openapi.json";
    const LINK_B = "https://api.example.com/second-openapi.json";
    const OPERATIONS_A: readonly OpenApiOperation[] = [{ path: "/v1/a", method: "GET" }];
    const OPERATIONS_B: readonly OpenApiOperation[] = [{ path: "/v1/b", method: "POST" }];
    const { calls } = stubFetchRoutedByLink({
      [LINK_A]: () => jsonResponse({ operations: OPERATIONS_A }),
      [LINK_B]: () => jsonResponse({ operations: OPERATIONS_B }),
    });

    const { result, rerender } = renderHook(({ link }: { link: string }) => useOpenApiDocumentOperations(link), {
      wrapper: createWrapper(),
      initialProps: { link: LINK_A },
    });
    await waitForKind(result, "operations");
    expect(result.current.outcome).toEqual({ kind: "operations", operations: OPERATIONS_A });

    rerender({ link: LINK_B });
    await waitFor(() => expect(result.current.outcome).toEqual({ kind: "operations", operations: OPERATIONS_B }));

    expect(calls.length).toBeGreaterThanOrEqual(2);
  });
});
