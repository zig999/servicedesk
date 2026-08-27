import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useCaseSimulationVersion } from "./use-case-simulation-version";
import type { CaseVersionRecord } from "../services/case-version-record";

// task/simulation-cockpit/case-simulation-route's own read hook. This file
// proves the hook's own returned phase-union directly through renderHook,
// mirroring use-case-attributes-at-a-glance.spec.ts's own established
// convention for a hook with no view of its own.

const SLUG = "some-slug";
const VERSION = 3;
const VERSION_PATH = `/v1/cases/${SLUG}/versions/${VERSION}`;

const RECORD: CaseVersionRecord = {
  title: "Some title",
  when_to_use: "Use when the customer disputes a charge",
  subject: "billing-dispute",
  fallback: { outcome: "resolved", referral: { action: "notify", recipient: "customer" } },
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

type FetchFn = (input: string | URL | Request) => Promise<Response>;

function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function stubFetch(handlers: Record<string, () => Response | Promise<Response>>): Mock<FetchFn> {
  const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(`use-case-simulation-version proof: no mocked response for ${url}`);
    }
    return handler();
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCaseSimulationVersion -- loading and load-error phases", () => {
  it('reports the "loading" phase before the version resolves', () => {
    stubFetch({ [VERSION_PATH]: () => new Promise<Response>(() => {}) });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useCaseSimulationVersion(SLUG, VERSION), {
      wrapper: wrapperFor(queryClient),
    });

    expect(result.current.phase).toBe("loading");
  });

  it('reports the "load-error" phase, with a retryLoad that reissues the request, when the read fails', async () => {
    let shouldFail = true;
    const fetchMock = stubFetch({
      [VERSION_PATH]: () => {
        if (shouldFail) {
          throw new Error("network down");
        }
        return jsonResponse({ ...RECORD, state: "draft" });
      },
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useCaseSimulationVersion(SLUG, VERSION), {
      wrapper: wrapperFor(queryClient),
    });

    await waitFor(() => expect(result.current.phase).toBe("load-error"));
    const callsBeforeRetry = fetchMock.mock.calls.length;

    shouldFail = false;
    if (result.current.phase === "load-error") {
      result.current.retryLoad();
    }

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBeforeRetry));
    await waitFor(() => expect(result.current.phase).toBe("ready"));
  });
});

describe("useCaseSimulationVersion -- the ready phase", () => {
  it("resolves to the ready phase carrying the loaded record and its own version state", async () => {
    stubFetch({ [VERSION_PATH]: () => jsonResponse({ ...RECORD, state: "released" }) });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useCaseSimulationVersion(SLUG, VERSION), {
      wrapper: wrapperFor(queryClient),
    });

    await waitFor(() => expect(result.current.phase).toBe("ready"));
    if (result.current.phase === "ready") {
      expect(result.current.versionState).toBe("released");
      expect(result.current.record.when_to_use).toBe(RECORD.when_to_use);
    }
  });
});

describe('useCaseSimulationVersion -- reading under the shared ["case-version", slug, version] cache key (this task\'s own recorded inference, STA-01)', () => {
  it("resolves to the ready phase from an existing, fresh cache entry under that exact key, issuing no fetch of its own", () => {
    const fetchMock = stubFetch({
      [VERSION_PATH]: () => {
        throw new Error(
          "use-case-simulation-version proof: a fetch was issued despite a fresh cache entry already present under this hook's own query key",
        );
      },
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } },
    });
    queryClient.setQueryData(["case-version", SLUG, VERSION], { ...RECORD, state: "draft" });

    const { result } = renderHook(() => useCaseSimulationVersion(SLUG, VERSION), {
      wrapper: wrapperFor(queryClient),
    });

    expect(result.current).toMatchObject({ phase: "ready", versionState: "draft" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
