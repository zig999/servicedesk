import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCapabilitySchemaHelper } from "./use-capability-schema-helper";

afterEach(() => {
  vi.unstubAllGlobals();
});

const OPERATIONS_READ_ROUTE_PREFIX = "/v1/read-openapi-document-operations";
const DRAFT_ROUTE = "/v1/draft-capability-schema-from-openapi";
const LINK = "https://api.example.com/openapi.json";
const PATH = "/v2/translate";
const METHOD = "POST";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function stubFetch(): void {
  const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.startsWith(OPERATIONS_READ_ROUTE_PREFIX)) {
      return jsonResponse({ operations: [] });
    }
    if (url !== DRAFT_ROUTE) {
      throw new Error(`use-capability-schema-helper stale-draft-marking proof: no mocked response for ${url}`);
    }
    return jsonResponse({ input_schema: "{}", output_schema: "{}", unresolved: [] });
  });
  vi.stubGlobal("fetch", fetchMock);
}

function createWrapper(): (props: { children: ReactNode }) => ReactElement {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

async function mountWithStatedDraft() {
  stubFetch();
  const view = renderHook(() => useCapabilitySchemaHelper(), { wrapper: createWrapper() });

  act(() => {
    view.result.current.onLinkChange(LINK);
    view.result.current.onChooseOperation({ path: PATH, method: METHOD });
  });
  act(() => {
    view.result.current.onRequestDraft();
  });
  await waitFor(() => expect(view.result.current.outcome.kind).toBe("drafted"));

  return view;
}

describe("useCapabilitySchemaHelper -- a stated draft stays not stale while its link and chosen operation both match the request it was generated for, and becomes stale the instant only the link changes (criteria 3, 4, 7)", () => {
  it("reads stale as false right after the draft is stated, and true once the link alone changes, with the chosen operation left untouched", async () => {
    const { result } = await mountWithStatedDraft();
    expect(result.current.stale).toBe(false);

    act(() => {
      result.current.onLinkChange("https://api.example.com/a-different-openapi.json");
    });

    expect(result.current.stale).toBe(true);
  });
});

describe("useCapabilitySchemaHelper -- a stated draft stays not stale while its link and chosen operation both match the request it was generated for, and becomes stale the instant only the chosen operation changes (criteria 3, 5, 7)", () => {
  it("reads stale as false right after the draft is stated, and true once a different operation is chosen, with the link left untouched", async () => {
    const { result } = await mountWithStatedDraft();
    expect(result.current.stale).toBe(false);

    act(() => {
      result.current.onChooseOperation({ path: "/v2/glossaries", method: "GET" });
    });

    expect(result.current.stale).toBe(true);
  });
});
