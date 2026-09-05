import { createElement, type ReactElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useManifestPinnedRevisionStates } from "./use-manifest-pinned-revision-states";
import type { CaseVersionManifestEntry } from "../services/case-version-record";

type FetchResponder = () => Response | Promise<Response>;
type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function createFetchStub(handlers: Record<string, FetchResponder>): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const key = `${method} ${url}`;
    const handler = handlers[key];
    if (!handler) {
      throw new Error(`use-manifest-pinned-revision-states proof: no mocked response for ${key}`);
    }
    return handler();
  });
}

function createWrapper(): (props: { children: ReactNode }) => ReactElement {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const SLUG = "some-slug";

function revisionsPath(hypothesisName: string, offset?: number): string {
  const base = `/v1/cases/${SLUG}/hypotheses/${hypothesisName}/revisions`;
  return offset === undefined ? base : `${base}?offset=${offset}`;
}

function entry(position: number, name: string, revision: number): CaseVersionManifestEntry {
  return {
    position,
    hypothesis_revision: { hypothesis: { name }, revision, criterion: "some criterion", collects: [] },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useManifestPinnedRevisionStates — each position resolves its own pin independently (criteria 2 and 4)", () => {
  it("carries the on-page entry's own state and the off-page entry's own state without either borrowing the other's value", async () => {
    const fetchMock = createFetchStub({
      [`GET ${revisionsPath("H1")}`]: () =>
        jsonResponse({
          data: [{ revision: 1, state: "draft" }],
          total: 1,
          offset: 0,
          limit: 1,
        }),
      [`GET ${revisionsPath("H2")}`]: () =>
        jsonResponse({
          data: [
            { revision: 3, state: "draft" },
            { revision: 4, state: "draft" },
          ],
          total: 5,
          offset: 0,
          limit: 2,
        }),
      [`GET ${revisionsPath("H2", 2)}`]: () =>
        jsonResponse({
          data: [{ revision: 5, state: "released" }],
          total: 5,
          offset: 2,
          limit: 2,
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const manifest = [entry(1, "H1", 1), entry(2, "H2", 5)];
    const { result } = renderHook(() => useManifestPinnedRevisionStates(SLUG, manifest), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.get(2)).toEqual({ status: "resolved", state: "released" }),
    );
    expect(result.current.get(1)).toEqual({ status: "resolved", state: "draft" });
  });
});

describe("useManifestPinnedRevisionStates — one entry pending beside one already resolved, in the same batch (criteria 4 and 5)", () => {
  it("keeps the still-loading entry pending while a different entry in the same manifest has already resolved", async () => {
    const fetchMock = createFetchStub({
      [`GET ${revisionsPath("H1")}`]: () =>
        jsonResponse({
          data: [{ revision: 1, state: "released" }],
          total: 1,
          offset: 0,
          limit: 1,
        }),
      [`GET ${revisionsPath("H2")}`]: () => new Promise<Response>(() => {}),
    });
    vi.stubGlobal("fetch", fetchMock);

    const manifest = [entry(1, "H1", 1), entry(2, "H2", 2)];
    const { result } = renderHook(() => useManifestPinnedRevisionStates(SLUG, manifest), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.get(1)).toEqual({ status: "resolved", state: "released" }),
    );
    expect(result.current.get(2)).toEqual({ status: "pending" });
  });
});
