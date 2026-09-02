import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useManifestRowRevisions } from "./use-manifest-row-revisions";
import type { HypothesisRevisionListItem } from "./use-hypothesis-revisions";

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
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useManifestRowRevisions -- reading the row's own revisions (criteria 1, 2, 4)", () => {
  it("obtains exactly the revisions the hypothesis-revisions listing answered", async () => {
    const listed = [revisionItem({ revision: 1 }), revisionItem({ revision: 2 }), revisionItem({ revision: 3 })];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: listed, total: 3 }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useManifestRowRevisions("case-1", "hyp-a"), {
      wrapper: createWrapper(newQueryClient()),
    });

    await waitFor(() => expect(result.current.revisions).toEqual(listed));

    expect(result.current.revisions.map((r) => r.revision)).toEqual([1, 2, 3]);
  });

  it("obtains no revision beyond the non-contiguous set the listing actually answered", async () => {
    const listed = [revisionItem({ revision: 2 }), revisionItem({ revision: 5 })];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: listed, total: 2 }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useManifestRowRevisions("case-1", "hyp-a"), {
      wrapper: createWrapper(newQueryClient()),
    });

    await waitFor(() => expect(result.current.revisions).toHaveLength(2));

    expect(result.current.revisions.map((r) => r.revision).sort()).toEqual([2, 5]);
    expect(result.current.revisions.some((r) => r.revision === 1)).toBe(false);
    expect(result.current.revisions.some((r) => r.revision === 3)).toBe(false);
    expect(result.current.revisions.some((r) => r.revision === 4)).toBe(false);
  });

  it("carries each item's own revision number from the listing, never its position in the obtained array", async () => {
    const listed = [revisionItem({ revision: 7 }), revisionItem({ revision: 4 })];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: listed, total: 2 }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useManifestRowRevisions("case-1", "hyp-a"), {
      wrapper: createWrapper(newQueryClient()),
    });

    await waitFor(() => expect(result.current.revisions).toHaveLength(2));

    expect(result.current.revisions[0]?.revision).toBe(7);
    expect(result.current.revisions[1]?.revision).toBe(4);
  });
});

describe("useManifestRowRevisions -- an answered listing holding no revisions yet", () => {
  it("answers an empty revisions array and an undefined highest revision once a hypothesis with no revisions has actually loaded", async () => {
    const queryClient = newQueryClient();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [], total: 0 }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useManifestRowRevisions("case-1", "hyp-a"), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() =>
      expect(queryClient.getQueryState(["hypothesis-revisions", "case-1", "hyp-a"])?.status).toBe(
        "success",
      ),
    );

    expect(result.current.revisions).toEqual([]);
    expect(result.current.highestRevision).toBeUndefined();
  });
});

describe("useManifestRowRevisions -- reusing the shared cache entry (criterion 3, disclosed inference)", () => {
  it("reads its revisions from the same [\"hypothesis-revisions\", slug, hypothesisName] cache entry the hypothesis-revision form already populates", () => {
    const queryClient = newQueryClient();
    const cached = [revisionItem({ revision: 9 })];
    queryClient.setQueryData(["hypothesis-revisions", "case-1", "hyp-a"], { data: cached, total: 1 });
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: cached, total: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useManifestRowRevisions("case-1", "hyp-a"), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.revisions).toEqual(cached);
  });
});

describe("useManifestRowRevisions -- one row's own hypothesis, and a different one (criterion 5)", () => {
  it("keeps two rows naming different hypotheses on the same case reading their own, isolated revisions", async () => {
    const revisionsByHypothesis: Record<string, HypothesisRevisionListItem[]> = {
      "hyp-a": [revisionItem({ revision: 1 })],
      "hyp-b": [revisionItem({ revision: 1 }), revisionItem({ revision: 2 })],
    };
    const fetchMock = vi.fn((input: string) => {
      const hypothesisName = input.includes("hyp-a") ? "hyp-a" : "hyp-b";
      return Promise.resolve(
        jsonResponse({ data: revisionsByHypothesis[hypothesisName], total: revisionsByHypothesis[hypothesisName]?.length }),
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const queryClient = newQueryClient();

    const { result: resultA } = renderHook(() => useManifestRowRevisions("case-1", "hyp-a"), {
      wrapper: createWrapper(queryClient),
    });
    const { result: resultB } = renderHook(() => useManifestRowRevisions("case-1", "hyp-b"), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(resultA.current.revisions).toHaveLength(1));
    await waitFor(() => expect(resultB.current.revisions).toHaveLength(2));

    expect(resultA.current.revisions.map((r) => r.revision)).toEqual([1]);
    expect(resultB.current.revisions.map((r) => r.revision)).toEqual([1, 2]);
  });
});

describe("useManifestRowRevisions -- the highest revision, via the existing reduction (criterion 6)", () => {
  it("answers the highest revision number among those obtained, regardless of the listing's own order", async () => {
    const listed = [revisionItem({ revision: 1 }), revisionItem({ revision: 3 }), revisionItem({ revision: 2 })];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: listed, total: 3 }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useManifestRowRevisions("case-1", "hyp-a"), {
      wrapper: createWrapper(newQueryClient()),
    });

    await waitFor(() => expect(result.current.highestRevision).toBe(3));
  });
});

describe("useManifestRowRevisions -- before the listing has answered (criterion 7)", () => {
  it("obtains an empty revisions array and an undefined highest revision before the listing resolves, never a value derived from a pinned revision", () => {
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useManifestRowRevisions("case-1", "hyp-a"), {
      wrapper: createWrapper(newQueryClient()),
    });

    expect(result.current.revisions).toEqual([]);
    expect(result.current.highestRevision).toBeUndefined();
  });

  it("stays empty, rather than throwing, once the revisions listing has actually failed", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);
    const queryClient = newQueryClient();

    const { result } = renderHook(() => useManifestRowRevisions("case-1", "hyp-a"), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() =>
      expect(queryClient.getQueryState(["hypothesis-revisions", "case-1", "hyp-a"])?.status).toBe(
        "error",
      ),
    );

    expect(result.current.revisions).toEqual([]);
    expect(result.current.highestRevision).toBeUndefined();
  });
});
