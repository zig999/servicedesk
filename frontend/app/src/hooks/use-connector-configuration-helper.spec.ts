import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useConnectorConfigurationHelper } from "./use-connector-configuration-helper";
import type { OpenApiOperation } from "./use-openapi-document-operations";

afterEach(() => {
  vi.unstubAllGlobals();
});

const DRAFT_ROUTE = "/v1/draft-connector-configuration-from-openapi";
const OPERATIONS_READ_ROUTE_PREFIX = "/v1/read-openapi-document-operations";
const CONNECTOR = "deepl-connector";

const FULL_DRAFT = {
  connector: CONNECTOR,
  configuration: "{}",
  unresolved: [],
  generated_credentials: [],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

type CapturedCall = { readonly url: string; readonly init: RequestInit | undefined };
type FetchHandler = () => Response | Promise<Response>;

function stubFetch(handler: FetchHandler): { readonly calls: CapturedCall[] } {
  const calls: CapturedCall[] = [];
  const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.startsWith(OPERATIONS_READ_ROUTE_PREFIX)) {
      return jsonResponse({ operations: [] });
    }
    calls.push({ url, init });
    if (url !== DRAFT_ROUTE) {
      throw new Error(`use-connector-configuration-helper proof: no mocked response for ${url}`);
    }
    return handler();
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

function parsedBody(call: CapturedCall): unknown {
  const body = call.init?.body;
  if (typeof body !== "string") {
    throw new Error("use-connector-configuration-helper proof: expected a string request body");
  }
  return JSON.parse(body);
}

function mount(connector = CONNECTOR) {
  return renderHook(() => useConnectorConfigurationHelper(connector), { wrapper: createWrapper() }).result;
}

describe("useConnectorConfigurationHelper -- starts with empty link, path and method and an idle outcome (inference)", () => {
  it("exposes empty strings for link, path and method, and {kind: 'idle'}, before any change or dispatch", () => {
    stubFetch(() => jsonResponse(FULL_DRAFT));
    const result = mount();

    expect(result.current.link).toBe("");
    expect(result.current.path).toBe("");
    expect(result.current.method).toBe("");
    expect(result.current.outcome).toEqual({ kind: "idle" });
  });
});

describe("useConnectorConfigurationHelper -- each setter updates only its own field (inference)", () => {
  it("updates link, path and method independently through onLinkChange, onPathChange and onMethodChange", () => {
    stubFetch(() => jsonResponse(FULL_DRAFT));
    const result = mount();

    act(() => {
      result.current.onLinkChange("https://api.example.com/openapi.json");
    });
    expect(result.current.link).toBe("https://api.example.com/openapi.json");
    expect(result.current.path).toBe("");
    expect(result.current.method).toBe("");

    act(() => {
      result.current.onPathChange("/v2/translate");
    });
    expect(result.current.path).toBe("/v2/translate");
    expect(result.current.link).toBe("https://api.example.com/openapi.json");

    act(() => {
      result.current.onMethodChange("POST");
    });
    expect(result.current.method).toBe("POST");
    expect(result.current.link).toBe("https://api.example.com/openapi.json");
    expect(result.current.path).toBe("/v2/translate");
  });
});

describe("useConnectorConfigurationHelper -- onRequestDraft composes the held link, path and method with the bound connector into the sibling hook's own dispatch (criterion 6)", () => {
  it("sends exactly {connector, link, path, method} in the POST body when onRequestDraft is called", async () => {
    const { calls } = stubFetch(() => jsonResponse(FULL_DRAFT));
    const result = mount();

    act(() => {
      result.current.onLinkChange("https://api.example.com/openapi.json");
      result.current.onPathChange("/v2/translate");
      result.current.onMethodChange("POST");
    });
    act(() => {
      result.current.onRequestDraft();
    });

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(parsedBody(calls[0])).toEqual({
      connector: CONNECTOR,
      link: "https://api.example.com/openapi.json",
      path: "/v2/translate",
      method: "POST",
    });
  });
});

describe("useConnectorConfigurationHelper -- outcome mirrors the sibling draft hook's own outcome, unmodified (inference)", () => {
  it("reports pending while the request is outstanding and drafted once it resolves", async () => {
    let resolveDraft: ((value: Response) => void) | undefined;
    const pendingResponse = new Promise<Response>((resolve) => {
      resolveDraft = resolve;
    });
    stubFetch(() => pendingResponse);
    const result = mount();

    act(() => {
      result.current.onRequestDraft();
    });
    await waitFor(() => expect(result.current.outcome.kind).toBe("pending"));

    resolveDraft?.(jsonResponse(FULL_DRAFT));
    await waitFor(() => expect(result.current.outcome).toEqual({ kind: "drafted", draft: FULL_DRAFT }));
  });
});

describe("useConnectorConfigurationHelper -- the connector dispatched is the one most recently passed in, not bound once at first render (inference)", () => {
  it("sends the connector from a later render's argument after the caller re-renders with a different connector", async () => {
    const { calls } = stubFetch(() => jsonResponse(FULL_DRAFT));
    const { result, rerender } = renderHook(
      ({ connector }: { connector: string }) => useConnectorConfigurationHelper(connector),
      { wrapper: createWrapper(), initialProps: { connector: CONNECTOR } },
    );

    rerender({ connector: "second-connector" });
    act(() => {
      result.current.onRequestDraft();
    });

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(parsedBody(calls[0])).toMatchObject({ connector: "second-connector" });
  });
});

describe("useConnectorConfigurationHelper -- operations exposes the operations read for the link currently named in the helper (criterion 1)", () => {
  it("exposes exactly the operations the read answered for the named link, once it resolves", async () => {
    const OPERATIONS: readonly OpenApiOperation[] = [
      { path: "/v2/translate", method: "POST" },
      { path: "/v2/glossaries", method: "GET" },
    ];
    const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.startsWith(OPERATIONS_READ_ROUTE_PREFIX)) {
        return jsonResponse({ operations: OPERATIONS });
      }
      return jsonResponse(FULL_DRAFT);
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = mount();

    act(() => {
      result.current.onLinkChange("https://api.example.com/openapi.json");
    });

    await waitFor(() => expect(result.current.operations).toEqual(OPERATIONS));
  });
});

describe("useConnectorConfigurationHelper -- naming a different link makes the offered entries those of the newly named link (criterion 2)", () => {
  it("replaces the offered operations with the newly named link's own operations once the read for it resolves", async () => {
    const LINK_A = "https://api.example.com/first-openapi.json";
    const LINK_B = "https://api.example.com/second-openapi.json";
    const OPERATIONS_A: readonly OpenApiOperation[] = [{ path: "/v1/a", method: "GET" }];
    const OPERATIONS_B: readonly OpenApiOperation[] = [{ path: "/v1/b", method: "POST" }];
    const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.startsWith(OPERATIONS_READ_ROUTE_PREFIX)) {
        return url.includes(encodeURIComponent(LINK_A))
          ? jsonResponse({ operations: OPERATIONS_A })
          : jsonResponse({ operations: OPERATIONS_B });
      }
      return jsonResponse(FULL_DRAFT);
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = mount();

    act(() => {
      result.current.onLinkChange(LINK_A);
    });
    await waitFor(() => expect(result.current.operations).toEqual(OPERATIONS_A));

    act(() => {
      result.current.onLinkChange(LINK_B);
    });
    await waitFor(() => expect(result.current.operations).toEqual(OPERATIONS_B));
  });
});

describe("useConnectorConfigurationHelper -- choosing an offered entry sets the helper's path and method to that entry's own path and method (criteria 3, 4)", () => {
  it("sets both path and method from the chosen entry, and from no other source", () => {
    stubFetch(() => jsonResponse(FULL_DRAFT));
    const result = mount();
    const CHOSEN: OpenApiOperation = { path: "/v2/accounts/{accountId}/invoices", method: "DELETE" };

    act(() => {
      result.current.onChooseOperation(CHOSEN);
    });

    expect(result.current.path).toBe(CHOSEN.path);
    expect(result.current.method).toBe(CHOSEN.method);
  });
});

describe("useConnectorConfigurationHelper -- choosing the /items, POST entry from a document listing a get and a post operation makes the draft request name /items and POST (criterion 5)", () => {
  it("issues a draft request naming /items as its path and POST as its method once that entry is chosen", async () => {
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
      result.current.onLinkChange("https://api.example.com/openapi.json");
    });
    await waitFor(() => expect(result.current.operations).toEqual(OPERATIONS));

    const postEntry = result.current.operations.find((operation) => operation.method === "POST");
    if (postEntry === undefined) {
      throw new Error("use-connector-configuration-helper proof: expected a POST entry among the offered operations");
    }
    act(() => {
      result.current.onChooseOperation(postEntry);
    });
    act(() => {
      result.current.onRequestDraft();
    });

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(parsedBody(calls[0])).toMatchObject({ path: "/items", method: "POST" });
  });
});

describe("useConnectorConfigurationHelper -- the operations read's outcome is exposed distinct from the draft request outcome (criterion 6)", () => {
  it("keeps operationsOutcome and outcome independent: naming a link changes only operationsOutcome, and requesting a draft changes only outcome", async () => {
    const OPERATIONS: readonly OpenApiOperation[] = [{ path: "/items", method: "GET" }];
    const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.startsWith(OPERATIONS_READ_ROUTE_PREFIX)) {
        return jsonResponse({ operations: OPERATIONS });
      }
      return jsonResponse(FULL_DRAFT);
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = mount();

    act(() => {
      result.current.onLinkChange("https://api.example.com/openapi.json");
    });
    await waitFor(() => expect(result.current.operationsOutcome).toEqual({ kind: "operations", operations: OPERATIONS }));
    expect(result.current.outcome).toEqual({ kind: "idle" });

    act(() => {
      result.current.onRequestDraft();
    });
    await waitFor(() => expect(result.current.outcome).toEqual({ kind: "drafted", draft: FULL_DRAFT }));
    expect(result.current.operationsOutcome).toEqual({ kind: "operations", operations: OPERATIONS });
  });
});

describe("useConnectorConfigurationHelper -- no request is issued to the operator-named link itself, only to the backend's own operations-read route (UNDERDETERMINED note 2)", () => {
  it("issues no fetch call whose URL is the operator-named link, once that link is named", async () => {
    const LINK = "https://api.example.com/openapi.json";
    const calls: string[] = [];
    const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      calls.push(url);
      if (url.startsWith(OPERATIONS_READ_ROUTE_PREFIX)) {
        return jsonResponse({ operations: [] });
      }
      return jsonResponse(FULL_DRAFT);
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = mount();

    act(() => {
      result.current.onLinkChange(LINK);
    });
    await waitFor(() => expect(result.current.operationsOutcome.kind).toBe("operations"));

    expect(calls.some((url) => url === LINK)).toBe(false);
  });
});
