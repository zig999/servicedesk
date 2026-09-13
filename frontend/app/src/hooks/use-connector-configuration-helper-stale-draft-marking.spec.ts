import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useConnectorConfigurationHelper, type ConnectorConfigurationHelperState } from "./use-connector-configuration-helper";

afterEach(() => {
  vi.unstubAllGlobals();
});

const DRAFT_ROUTE = "/v1/draft-connector-configuration-from-openapi";
const OPERATIONS_READ_ROUTE_PREFIX = "/v1/read-openapi-document-operations";
const CONNECTOR = "deepl-connector";
const LINK = "https://api.example.com/openapi.json";
const PATH = "/v2/translate";
const METHOD = "POST";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function stubFetch(): { readonly calls: readonly string[] } {
  const calls: string[] = [];
  const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.startsWith(OPERATIONS_READ_ROUTE_PREFIX)) {
      return jsonResponse({ operations: [] });
    }
    calls.push(url);
    if (url !== DRAFT_ROUTE) {
      throw new Error(`use-connector-configuration-helper stale-draft-marking proof: no mocked response for ${url}`);
    }
    return jsonResponse({ connector: CONNECTOR, configuration: "{}", unresolved: [], generated_credentials: [] });
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

async function mountWithStatedDraft(connector = CONNECTOR): Promise<{
  readonly result: RenderHookResult<ConnectorConfigurationHelperState, { connector: string }>["result"];
  readonly rerender: RenderHookResult<ConnectorConfigurationHelperState, { connector: string }>["rerender"];
  readonly calls: readonly string[];
}> {
  const { calls } = stubFetch();
  const view = renderHook(
    ({ connector: currentConnector }: { connector: string }) => useConnectorConfigurationHelper(currentConnector),
    { wrapper: createWrapper(), initialProps: { connector } },
  );

  act(() => {
    view.result.current.onLinkChange(LINK);
    view.result.current.onChooseOperation({ path: PATH, method: METHOD });
  });
  act(() => {
    view.result.current.onRequestDraft();
  });
  await waitFor(() => expect(view.result.current.outcome.kind).toBe("drafted"));

  return { result: view.result, rerender: view.rerender, calls };
}

describe("useConnectorConfigurationHelper -- a stated draft becomes stale the instant only the link changes (criterion 4)", () => {
  it("stays false right after the draft is stated, and becomes true once the link alone changes, with no new draft request issued", async () => {
    const { result, calls } = await mountWithStatedDraft();
    expect(result.current.stale).toBe(false);

    act(() => {
      result.current.onLinkChange("https://api.example.com/a-different-openapi.json");
    });

    expect(result.current.stale).toBe(true);
    expect(calls).toHaveLength(1);
  });
});

describe("useConnectorConfigurationHelper -- a stated draft becomes stale the instant only the chosen operation changes (criterion 5)", () => {
  it("stays false right after the draft is stated, and becomes true once a different operation is chosen, with the link and connector left untouched", async () => {
    const { result } = await mountWithStatedDraft();
    expect(result.current.stale).toBe(false);

    act(() => {
      result.current.onChooseOperation({ path: "/v2/glossaries", method: "GET" });
    });

    expect(result.current.stale).toBe(true);
  });
});

describe("useConnectorConfigurationHelper -- a stated draft becomes stale the instant only the connector name changes (criterion 6)", () => {
  it("stays false right after the draft is stated, and becomes true once the caller re-renders the helper with a different connector", async () => {
    const { result, rerender } = await mountWithStatedDraft();
    expect(result.current.stale).toBe(false);

    rerender({ connector: "a-different-connector" });

    expect(result.current.stale).toBe(true);
  });
});
