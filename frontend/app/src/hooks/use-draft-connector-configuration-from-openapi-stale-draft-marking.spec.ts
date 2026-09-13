import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useDraftConnectorConfigurationFromOpenApi,
  type DraftConnectorConfigurationFromOpenApiRequest,
} from "./use-draft-connector-configuration-from-openapi";

afterEach(() => {
  vi.unstubAllGlobals();
});

const DRAFT_ROUTE = "/v1/draft-connector-configuration-from-openapi";
const CONNECTOR = "deepl-connector";

const DRAFT_REQUEST: DraftConnectorConfigurationFromOpenApiRequest = {
  link: "https://api.example.com/openapi.json",
  path: "/v2/translate",
  method: "POST",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function stubFetch(body: unknown): void {
  const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    if (url !== DRAFT_ROUTE) {
      throw new Error(
        `use-draft-connector-configuration-from-openapi stale-draft-marking proof: no mocked response for ${url}`,
      );
    }
    return jsonResponse(body);
  });
  vi.stubGlobal("fetch", fetchMock);
}

function createWrapper(): (props: { children: ReactNode }) => ReactElement {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function mount() {
  return renderHook(() => useDraftConnectorConfigurationFromOpenApi(CONNECTOR), { wrapper: createWrapper() }).result;
}

describe("useDraftConnectorConfigurationFromOpenApi -- a drafted outcome's statedFor names the link, the operation and the connector name of the request that produced it (criteria 1, 2, 3)", () => {
  it("exposes statedFor equal to exactly the dispatched link, path and method, and the connector the hook was constructed with", async () => {
    stubFetch({ connector: CONNECTOR, configuration: "{}", unresolved: [], generated_credentials: [] });
    const result = mount();

    act(() => {
      result.current.requestDraft(DRAFT_REQUEST);
    });
    await waitFor(() => expect(result.current.outcome.kind).toBe("drafted"));

    expect(result.current.statedFor).toEqual({
      link: DRAFT_REQUEST.link,
      path: DRAFT_REQUEST.path,
      method: DRAFT_REQUEST.method,
      connector: CONNECTOR,
    });
  });
});

describe("useDraftConnectorConfigurationFromOpenApi -- the drafted outcome's own draft carries no link, path or method field, even where the response body smuggles them in (UNDERDETERMINED, from the specification -- widening the drafted answer's own shape to carry the mark, instead of a separate statedFor field)", () => {
  it("exposes no link, path or method key on the drafted outcome's draft", async () => {
    stubFetch({
      connector: CONNECTOR,
      configuration: "{}",
      unresolved: [],
      generated_credentials: [],
      link: DRAFT_REQUEST.link,
      path: DRAFT_REQUEST.path,
      method: DRAFT_REQUEST.method,
    });
    const result = mount();

    act(() => {
      result.current.requestDraft(DRAFT_REQUEST);
    });
    await waitFor(() => expect(result.current.outcome.kind).toBe("drafted"));

    const outcome = result.current.outcome;
    if (outcome.kind !== "drafted") {
      throw new Error("use-draft-connector-configuration-from-openapi stale-draft-marking proof: expected a drafted outcome");
    }
    for (const key of ["link", "path", "method"]) {
      expect(Object.prototype.hasOwnProperty.call(outcome.draft, key)).toBe(false);
    }
  });
});
