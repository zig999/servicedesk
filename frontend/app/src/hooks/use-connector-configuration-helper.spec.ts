import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useConnectorConfigurationHelper } from "./use-connector-configuration-helper";

afterEach(() => {
  vi.unstubAllGlobals();
});

const DRAFT_ROUTE = "/v1/draft-connector-configuration-from-openapi";
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
