import { createElement, type ReactElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCasesList } from "./use-cases-list";

type FetchMock = ReturnType<typeof vi.fn<(input: string | URL | Request) => Promise<Response>>>;

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
}

function createWrapper(): (props: { children: ReactNode }) => ReactElement {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCasesList -- reads every case's slug together with a summary derived from its own version-listing reads", () => {
  it("resolves to one entry per case, each carrying the highest-numbered version's own state and authored_at", async () => {
    const fetchMock: FetchMock = vi.fn(async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url === "/v1/cases") {
        return jsonResponse({ data: [{ slug: "case-alpha" }], total: 1, limit: 20, offset: 0, pageCount: 1 });
      }
      if (url === "/v1/cases/case-alpha/versions?limit=1&offset=0") {
        return jsonResponse({ data: [{ version: 1, state: "released" }], total: 1, limit: 1, offset: 0, pageCount: 1 });
      }
      if (url === "/v1/cases/case-alpha/versions/1") {
        return jsonResponse({ authored_at: "2024-01-01T00:00:00.000Z" });
      }
      throw new Error(`useCasesList proof: unexpected fetch to ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCasesList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toEqual([
      {
        slug: "case-alpha",
        summary: { versionCount: 1, currentState: "released", lastUpdated: "2024-01-01T00:00:00.000Z" },
      },
    ]);
  });

  it("resolves a case holding no version yet to a summary carrying only versionCount", async () => {
    const fetchMock: FetchMock = vi.fn(async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url === "/v1/cases") {
        return jsonResponse({ data: [{ slug: "case-empty" }], total: 1, limit: 20, offset: 0, pageCount: 1 });
      }
      if (url === "/v1/cases/case-empty/versions?limit=1&offset=0") {
        return jsonResponse({ data: [], total: 0, limit: 1, offset: 0, pageCount: 0 });
      }
      throw new Error(`useCasesList proof: unexpected fetch to ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCasesList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toEqual([{ slug: "case-empty", summary: { versionCount: 0 } }]);
  });
});
