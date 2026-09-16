import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCapabilitySchemaHelper } from "./use-capability-schema-helper";
import type { OpenApiOperation } from "./use-openapi-document-operations";

afterEach(() => {
  vi.unstubAllGlobals();
});

const LINK = "https://api.example.com/openapi.json";
const OPERATIONS_READ_ROUTE_PREFIX = "/v1/read-openapi-document-operations";
const DRAFT_ROUTE = "/v1/draft-capability-schema-from-openapi";

const FULL_DRAFT = { input_schema: "{}", output_schema: "{}", unresolved: [] };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

type CapturedCall = { readonly url: string; readonly init: RequestInit | undefined };

function parsedBody(call: CapturedCall): unknown {
  const body = call.init?.body;
  if (typeof body !== "string") {
    throw new Error("use-capability-schema-helper proof: expected a string request body");
  }
  return JSON.parse(body);
}

function createWrapper(): (props: { children: ReactNode }) => ReactElement {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function mount() {
  return renderHook(() => useCapabilitySchemaHelper(), { wrapper: createWrapper() }).result;
}

describe("useCapabilitySchemaHelper -- operations exposes exactly what use-openapi-document-operations reads for the named link, no second reader involved (criterion 3)", () => {
  it("lists the operations the shared hook's own read answers for the link, touching no other operations route", async () => {
    const OPERATIONS: readonly OpenApiOperation[] = [
      { path: "/v2/translate", method: "POST" },
      { path: "/v2/glossaries", method: "GET" },
    ];
    const requestedUrls: string[] = [];
    const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      requestedUrls.push(url);
      if (url.startsWith(OPERATIONS_READ_ROUTE_PREFIX)) {
        return jsonResponse({ operations: OPERATIONS });
      }
      throw new Error(`use-capability-schema-helper proof: unexpected request to ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = mount();

    act(() => {
      result.current.onLinkChange(LINK);
    });

    await waitFor(() => expect(result.current.operations).toEqual(OPERATIONS));
    expect(requestedUrls.length).toBeGreaterThan(0);
    expect(requestedUrls.every((url) => url.startsWith(OPERATIONS_READ_ROUTE_PREFIX))).toBe(true);
  });
});

describe("useCapabilitySchemaHelper -- fetches no OpenAPI document directly; only the backend's own routes are called (constraints/the-openapi-document-is-fetched-by-the-backend)", () => {
  it("never issues a request whose URL is the operator-named link itself, once that link is named", async () => {
    const requestedUrls: string[] = [];
    const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      requestedUrls.push(url);
      if (url.startsWith(OPERATIONS_READ_ROUTE_PREFIX)) {
        return jsonResponse({ operations: [] });
      }
      throw new Error(`use-capability-schema-helper proof: unexpected request to ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = mount();

    act(() => {
      result.current.onLinkChange(LINK);
    });
    await waitFor(() => expect(result.current.operationsOutcome.kind).toBe("operations"));

    expect(requestedUrls.some((url) => url === LINK)).toBe(false);
  });
});

describe("useCapabilitySchemaHelper -- onRequestDraft dispatches nothing while no operation is chosen (criterion 6)", () => {
  it("issues no network request when onRequestDraft is called with no chosen operation", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      throw new Error(`use-capability-schema-helper proof: unexpected request to ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = mount();

    act(() => {
      result.current.onRequestDraft();
    });
    await Promise.resolve();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.outcome).toEqual({ kind: "idle" });
  });
});

describe("useCapabilitySchemaHelper -- onRequestDraft composes the chosen operation's own link, path and method into the draft request, and forwards its answered outcome unchanged (criterion 7; contracts/integration/capability-schema-draft)", () => {
  it("sends exactly {link, path, method} from the chosen operation, and exposes the drafted outcome once it resolves", async () => {
    const OPERATIONS: readonly OpenApiOperation[] = [
      { path: "/items", method: "GET" },
      { path: "/items", method: "POST" },
    ];
    const calls: CapturedCall[] = [];
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.startsWith(OPERATIONS_READ_ROUTE_PREFIX)) {
        return jsonResponse({ operations: OPERATIONS });
      }
      calls.push({ url, init });
      return jsonResponse(FULL_DRAFT);
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = mount();

    act(() => {
      result.current.onLinkChange(LINK);
    });
    await waitFor(() => expect(result.current.operations).toEqual(OPERATIONS));

    const postEntry = result.current.operations.find((operation) => operation.method === "POST");
    if (postEntry === undefined) {
      throw new Error("use-capability-schema-helper proof: expected a POST entry among the offered operations");
    }
    act(() => {
      result.current.onChooseOperation(postEntry);
    });
    act(() => {
      result.current.onRequestDraft();
    });

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0]?.url).toBe(DRAFT_ROUTE);
    expect(parsedBody(calls[0])).toEqual({ link: LINK, path: "/items", method: "POST" });

    await waitFor(() =>
      expect(result.current.outcome).toEqual({
        kind: "drafted",
        link: LINK,
        path: "/items",
        method: "POST",
        draft: FULL_DRAFT,
      }),
    );
  });
});
