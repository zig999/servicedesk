import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useGlossaryConcepts } from "./use-glossary-concepts";

// use-glossary-concepts.ts is a new sibling hook built for task/glossary-and-capabilities-browser/
// glossary-browser-screen's own Concepts tab -- it carried no spec file of its own before this
// task, unlike use-concept-options.ts (whose one existing consumer,
// use-hypothesis-revision-form.ts, never needed a dedicated proof of the hook's own contract).
// This file proves the hook's own contract directly through renderHook, matching
// use-glossary-vocabulary.spec.ts's own established convention: real Response objects through a
// stubbed global fetch, so apiFetch()'s own JSON handling runs unmodified, rather than mounting a
// whole screen the hook has no view of its own.

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

// Built once per test and captured in this closure, not constructed inline inside the returned
// component's own body -- a QueryClient built there would be rebuilt on every render the
// provider tree undergoes, discarding its cache mid-test.
function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function newQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useGlossaryConcepts", () => {
  it("issues a GET to /v1/glossary/concepts and returns each concept's own name, accepts and ttl intact", async () => {
    const concepts = [
      { name: "billing-dispute", accepts: ["customer-account"], ttl: 3600 },
      { name: "fraud-flag", accepts: ["customer-account", "merchant"], ttl: 60 },
    ];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: concepts }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useGlossaryConcepts(), {
      wrapper: createWrapper(newQueryClient()),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/v1/glossary/concepts");
    expect(result.current.concepts).toEqual(concepts);
  });

  it("returns an empty concepts array, rather than throwing or leaving it undefined, when the concepts page holds none yet", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useGlossaryConcepts(), {
      wrapper: createWrapper(newQueryClient()),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.concepts).toEqual([]);
  });

  it("reports isError, with concepts staying empty, when the request fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useGlossaryConcepts(), {
      wrapper: createWrapper(newQueryClient()),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.concepts).toEqual([]);
  });

  it("caches under its own key, [\"glossary\", \"concepts-with-ttl\"], distinct from use-concept-options.ts's own [\"glossary\", \"concepts\"] key (disclosed inference)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ data: [{ name: "billing-dispute", accepts: [], ttl: 60 }] }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const queryClient = newQueryClient();

    const { result } = renderHook(() => useGlossaryConcepts(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Proves the two hooks never share one cache entry: if useGlossaryConcepts wrote under
    // use-concept-options.ts's own key instead of (or in addition to) its own, this second
    // assertion would find data there too.
    expect(queryClient.getQueryData(["glossary", "concepts-with-ttl"])).toBeDefined();
    expect(queryClient.getQueryData(["glossary", "concepts"])).toBeUndefined();
  });
});
