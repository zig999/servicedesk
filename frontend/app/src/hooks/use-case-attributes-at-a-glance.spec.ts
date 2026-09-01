import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useCaseAttributesAtAGlance } from "./use-case-attributes-at-a-glance";
import type { CaseVersionRecord } from "../services/case-version-record";

const SLUG = "some-slug";
const VERSIONS_PATH = `/v1/cases/${SLUG}/versions`;

function versionPath(version: number): string {
  return `/v1/cases/${SLUG}/versions/${version}`;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function errorResponse(code: string, status = 422): Response {
  return new Response(JSON.stringify({ error: { code, message: code } }), { status });
}

const RECORD: CaseVersionRecord = {
  title: "Some title",
  when_to_use: "When to use text",
  subject: "billing-dispute",
  fallback: { outcome: "resolved", referral: { action: "notify", recipient: "customer" } },
  consolidation_register: "formal",
};

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

type FetchFn = (input: string | URL | Request) => Promise<Response>;

function stubFetch(handlers: Record<string, () => Response | Promise<Response>>): Mock<FetchFn> {
  const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(`use-case-attributes-at-a-glance proof: no mocked response for ${url}`);
    }
    return handler();
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCaseAttributesAtAGlance -- resolving the case's current version (criterion 2)", () => {
  it("resolves to the case's own draft version even when a released version numbered higher than it also exists, never to the plain highest-numbered item", async () => {

    stubFetch({
      [VERSIONS_PATH]: () =>
        jsonResponse({ data: [{ version: 5, state: "released" }, { version: 2, state: "draft" }] }),
      [versionPath(2)]: () => jsonResponse(RECORD),
    });

    const { result } = renderHook(() => useCaseAttributesAtAGlance(SLUG), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(result.current).toMatchObject({ phase: "ready", version: 2, versionState: "draft" });
    if (result.current.phase === "ready") {

      expect(result.current.record).toEqual(RECORD);
    }
  });

  it("resolves to the case's latest released version -- its highest-numbered item -- when the case holds no draft", async () => {
    stubFetch({
      [VERSIONS_PATH]: () =>
        jsonResponse({
          data: [
            { version: 1, state: "released" },
            { version: 3, state: "released" },
            { version: 2, state: "released" },
          ],
        }),
      [versionPath(3)]: () => jsonResponse(RECORD),
    });

    const { result } = renderHook(() => useCaseAttributesAtAGlance(SLUG), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(result.current).toMatchObject({ phase: "ready", version: 3, versionState: "released" });
  });
});

describe("useCaseAttributesAtAGlance -- a case holding no version at all (API-04, EDG-02)", () => {
  it('resolves to the "no-version" phase, rather than staying indefinitely "loading", when the version list is empty', async () => {
    stubFetch({
      [VERSIONS_PATH]: () => jsonResponse({ data: [] }),
    });

    const { result } = renderHook(() => useCaseAttributesAtAGlance(SLUG), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.phase).toBe("no-version"));
  });
});

describe("useCaseAttributesAtAGlance -- loading and load-error phases", () => {
  it('reports the "loading" phase before the version list resolves', () => {
    stubFetch({
      [VERSIONS_PATH]: () => new Promise<Response>(() => {}),
    });

    const { result } = renderHook(() => useCaseAttributesAtAGlance(SLUG), {
      wrapper: createWrapper(),
    });

    expect(result.current.phase).toBe("loading");
  });

  it('reports the "load-error" phase, with a retryLoad that reissues the request, when the version list itself fails', async () => {
    let listShouldFail = true;
    const fetchMock = stubFetch({
      [VERSIONS_PATH]: () => {
        if (listShouldFail) {
          throw new Error("network down");
        }
        return jsonResponse({ data: [] });
      },
    });

    const { result } = renderHook(() => useCaseAttributesAtAGlance(SLUG), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.phase).toBe("load-error"));
    const callsBeforeRetry = fetchMock.mock.calls.length;

    listShouldFail = false;
    if (result.current.phase === "load-error") {
      result.current.retryLoad();
    }

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBeforeRetry));
    await waitFor(() => expect(result.current.phase).toBe("no-version"));
  });
});

describe("useCaseAttributesAtAGlance -- the current version's own whole read (criterion 5, constraints/a-case-is-read-whole)", () => {
  it('resolves to the "case-not-valid" phase, carrying the version number, when read-case refuses the coherence check', async () => {
    stubFetch({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 4, state: "draft" }] }),
      [versionPath(4)]: () => errorResponse("CaseNotValidError"),
    });

    const { result } = renderHook(() => useCaseAttributesAtAGlance(SLUG), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.phase).toBe("case-not-valid"));
    expect(result.current).toMatchObject({ phase: "case-not-valid", version: 4 });
  });

  it('resolves to the generic "load-error" phase, distinct from "case-not-valid", when the current version\'s own read fails for any other reason', async () => {
    stubFetch({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 4, state: "draft" }] }),
      [versionPath(4)]: () => errorResponse("SomeOtherError", 500),
    });

    const { result } = renderHook(() => useCaseAttributesAtAGlance(SLUG), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.phase).toBe("load-error"));
    expect(result.current.phase).not.toBe("case-not-valid");
  });
});
