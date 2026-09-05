import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useHypothesisRevisions } from "./use-hypothesis-revisions";
import type { HypothesisRevisionListItem, HypothesisRevisionState } from "./use-hypothesis-revisions";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function newQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function revisionItem(
  overrides: Partial<HypothesisRevisionListItem> = {},
): HypothesisRevisionListItem {
  return {
    revision: 1,
    criterion: "some criterion",
    collects: [],
    resolution: { outcome: "resolved", referral: { action: "notify", recipient: "customer" } },
    state: "released",
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useHypothesisRevisions -- carrying each revision's own state through to the answered page", () => {
  it("reads a draft revision's own state through unchanged", async () => {
    const listed = [revisionItem({ revision: 1, state: "draft" })];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: listed, total: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useHypothesisRevisions("case-1", "hyp-a"), {
      wrapper: createWrapper(newQueryClient()),
    });

    await waitFor(() => expect(result.current.data?.data[0]?.state).toBe("draft"));
  });

  it("reads a released revision's own state through unchanged", async () => {
    const listed = [revisionItem({ revision: 1, state: "released" })];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: listed, total: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useHypothesisRevisions("case-1", "hyp-a"), {
      wrapper: createWrapper(newQueryClient()),
    });

    await waitFor(() => expect(result.current.data?.data[0]?.state).toBe("released"));
  });

  it("carries each revision's own state independently of its position in the answered page", async () => {
    const listed = [
      revisionItem({ revision: 1, state: "draft" }),
      revisionItem({ revision: 2, state: "released" }),
      revisionItem({ revision: 3, state: "draft" }),
    ];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: listed, total: 3 }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useHypothesisRevisions("case-1", "hyp-a"), {
      wrapper: createWrapper(newQueryClient()),
    });

    await waitFor(() => expect(result.current.data?.data).toHaveLength(3));

    expect(result.current.data?.data.map((item) => item.state)).toEqual([
      "draft",
      "released",
      "draft",
    ]);
  });
});

describe("HypothesisRevisionState -- a closed union of exactly draft and released", () => {
  it("refuses a third value as a revision's own state, at compile time", () => {
    // @ts-expect-error -- "archived" is not draft or released, and HypothesisRevisionState admits only those two
    const invalidState: HypothesisRevisionState = "archived";
    expect(invalidState).toBe("archived");
  });
});
