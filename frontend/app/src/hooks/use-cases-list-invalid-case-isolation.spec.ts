import { createElement, type ReactElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCasesList } from "./use-cases-list";

type FetchHandler = () => Response | Promise<Response>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function errorResponse(code: string, status = 409): Response {
  return new Response(JSON.stringify({ error: { code, message: code } }), { status });
}

function stubFetch(handlers: Record<string, FetchHandler>): void {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(
        `use-cases-list-invalid-case-isolation.spec.ts: no mocked response registered for ${url}`,
      );
    }
    return handler();
  });
  vi.stubGlobal("fetch", fetchMock);
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

describe("useCasesList -- isolating one case's current version failing validation from the rest of the listing (criterion 1, criterion 2)", () => {
  it("resolves every other case's own summary unaffected and the failing case's own entry to only its slug and the not-valid marker when one case's current version fails validation", async () => {
    stubFetch({
      "/v1/cases": () =>
        jsonResponse({
          data: [{ slug: "case-alpha" }, { slug: "case-broken" }],
          total: 2,
          limit: 20,
          offset: 0,
          pageCount: 1,
        }),
      "/v1/cases/case-alpha/versions?limit=1&offset=0": () =>
        jsonResponse({
          data: [{ version: 1, state: "released" }],
          total: 1,
          limit: 1,
          offset: 0,
          pageCount: 1,
        }),
      "/v1/cases/case-alpha/versions/1": () =>
        jsonResponse({
          authored_at: "2024-01-01T00:00:00.000Z",
          title: "Case Alpha",
          when_to_use: "When alpha applies",
        }),
      "/v1/cases/case-broken/versions?limit=1&offset=0": () =>
        jsonResponse({
          data: [{ version: 5, state: "draft" }],
          total: 5,
          limit: 1,
          offset: 0,
          pageCount: 5,
        }),
      "/v1/cases/case-broken/versions/5": () => errorResponse("CaseVersionNotValidError"),
    });

    const { result } = renderHook(() => useCasesList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual([
      {
        slug: "case-alpha",
        summary: {
          versionCount: 1,
          currentState: "released",
          lastUpdated: "2024-01-01T00:00:00.000Z",
          title: "Case Alpha",
          whenToUse: "When alpha applies",
          releasedVersion: 1,
        },
      },
      { slug: "case-broken", notValid: true },
    ]);
  });
});

describe("useCasesList -- deriving title, when_to_use and released_version from a case's highest-numbered released version, separately from its current, higher-numbered draft", () => {
  it("resolves a case whose highest version is a draft to a summary carrying the current draft's own state alongside title, when_to_use and released_version read from the case's own highest released version below it", async () => {
    stubFetch({
      "/v1/cases": () =>
        jsonResponse({
          data: [{ slug: "case-drafted-past-release" }],
          total: 1,
          limit: 20,
          offset: 0,
          pageCount: 1,
        }),
      "/v1/cases/case-drafted-past-release/versions?limit=1&offset=0": () =>
        jsonResponse({
          data: [{ version: 3, state: "draft" }],
          total: 3,
          limit: 1,
          offset: 0,
          pageCount: 3,
        }),
      "/v1/cases/case-drafted-past-release/versions/3": () =>
        jsonResponse({
          authored_at: "2024-03-03T00:00:00.000Z",
          title: "Draft title, never read for the summary",
          when_to_use: "Draft when_to_use, never read for the summary",
        }),
      "/v1/cases/case-drafted-past-release/versions?limit=3&offset=0": () =>
        jsonResponse({
          data: [
            { version: 3, state: "draft" },
            { version: 2, state: "released" },
            { version: 1, state: "released" },
          ],
          total: 3,
          limit: 3,
          offset: 0,
          pageCount: 1,
        }),
      "/v1/cases/case-drafted-past-release/versions/2": () =>
        jsonResponse({
          authored_at: "2024-02-02T00:00:00.000Z",
          title: "Case Drafted Past Release",
          when_to_use: "When the released procedure applies",
        }),
    });

    const { result } = renderHook(() => useCasesList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual([
      {
        slug: "case-drafted-past-release",
        summary: {
          versionCount: 3,
          currentState: "draft",
          lastUpdated: "2024-03-03T00:00:00.000Z",
          title: "Case Drafted Past Release",
          whenToUse: "When the released procedure applies",
          releasedVersion: 2,
        },
      },
    ]);
  });
});

describe("useCasesList -- more than one case's current version failing validation at the same reading (UNDERDETERMINED note 2)", () => {
  it("resolves the listing successfully with an isolated not-valid entry for each of two cases whose current versions fail validation at the same reading, rather than reverting to a whole-listing failure", async () => {
    stubFetch({
      "/v1/cases": () =>
        jsonResponse({
          data: [{ slug: "case-good" }, { slug: "case-bad-one" }, { slug: "case-bad-two" }],
          total: 3,
          limit: 20,
          offset: 0,
          pageCount: 1,
        }),
      "/v1/cases/case-good/versions?limit=1&offset=0": () =>
        jsonResponse({
          data: [{ version: 1, state: "released" }],
          total: 1,
          limit: 1,
          offset: 0,
          pageCount: 1,
        }),
      "/v1/cases/case-good/versions/1": () =>
        jsonResponse({
          authored_at: "2024-02-02T00:00:00.000Z",
          title: "Case Good",
          when_to_use: "When good applies",
        }),
      "/v1/cases/case-bad-one/versions?limit=1&offset=0": () =>
        jsonResponse({
          data: [{ version: 2, state: "draft" }],
          total: 2,
          limit: 1,
          offset: 0,
          pageCount: 2,
        }),
      "/v1/cases/case-bad-one/versions/2": () => errorResponse("CaseVersionNotValidError"),
      "/v1/cases/case-bad-two/versions?limit=1&offset=0": () =>
        jsonResponse({
          data: [{ version: 9, state: "released" }],
          total: 9,
          limit: 1,
          offset: 0,
          pageCount: 9,
        }),
      "/v1/cases/case-bad-two/versions/9": () => errorResponse("CaseVersionNotValidError"),
    });

    const { result } = renderHook(() => useCasesList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual([
      {
        slug: "case-good",
        summary: {
          versionCount: 1,
          currentState: "released",
          lastUpdated: "2024-02-02T00:00:00.000Z",
          title: "Case Good",
          whenToUse: "When good applies",
          releasedVersion: 1,
        },
      },
      { slug: "case-bad-one", notValid: true },
      { slug: "case-bad-two", notValid: true },
    ]);
  });
});
