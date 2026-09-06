import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useCaseCurrentVersionValidity } from "./use-case-current-version-validity";

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
      throw new Error(`use-case-current-version-validity proof: no mocked response for ${url}`);
    }
    return handler();
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCaseCurrentVersionValidity -- the current version fails to read back as a case (criterion 1)", () => {
  it('resolves to phase "not-valid", carrying the failing version\'s own number, when reading it as a case is refused', async () => {
    stubFetch({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 4, state: "draft" }] }),
      [versionPath(4)]: () => errorResponse("CaseVersionNotValidError", 409),
    });

    const { result } = renderHook(() => useCaseCurrentVersionValidity(SLUG), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.phase).toBe("not-valid"));
    expect(result.current).toMatchObject({ phase: "not-valid", version: 4 });
  });
});

describe("useCaseCurrentVersionValidity -- answering the highest-numbered version even beside a lower-numbered draft (criterion 2)", () => {
  it("reads the case's highest-numbered version, never the lower-numbered draft, to decide the outcome", async () => {
    stubFetch({
      [VERSIONS_PATH]: () =>
        jsonResponse({
          data: [
            { version: 2, state: "draft" },
            { version: 5, state: "released" },
          ],
        }),
      [versionPath(5)]: () => errorResponse("CaseVersionNotValidError", 409),
    });

    const { result } = renderHook(() => useCaseCurrentVersionValidity(SLUG), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.phase).toBe("not-valid"));
    expect(result.current).toMatchObject({ phase: "not-valid", version: 5 });
  });
});

describe("useCaseCurrentVersionValidity -- a read that fails for a reason other than failing validation (criterion 7)", () => {
  it('resolves to phase "read-failed", distinct from "not-valid", when the current version\'s own read fails for any other reason', async () => {
    stubFetch({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 3, state: "released" }] }),
      [versionPath(3)]: () => errorResponse("SomeOtherError", 500),
    });

    const { result } = renderHook(() => useCaseCurrentVersionValidity(SLUG), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.phase).toBe("read-failed"));
    expect(result.current).toMatchObject({ phase: "read-failed", version: 3 });
  });
});

describe("useCaseCurrentVersionValidity -- a current version that reads back cleanly (criterion 8)", () => {
  it('resolves to phase "valid" once the highest-numbered version reads back as a case', async () => {
    stubFetch({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 1, state: "released" }] }),
      [versionPath(1)]: () => jsonResponse({}),
    });

    const { result } = renderHook(() => useCaseCurrentVersionValidity(SLUG), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.phase).toBe("valid"));
    expect(result.current).toMatchObject({ phase: "valid", version: 1 });
  });
});

describe("useCaseCurrentVersionValidity -- a case holding no version", () => {
  it('resolves to phase "no-version" when the version list comes back empty', async () => {
    stubFetch({
      [VERSIONS_PATH]: () => jsonResponse({ data: [] }),
    });

    const { result } = renderHook(() => useCaseCurrentVersionValidity(SLUG), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.phase).toBe("no-version"));
  });
});

describe("useCaseCurrentVersionValidity -- before the version list itself has resolved", () => {
  it('reports phase "pending" while the version list is still in flight', () => {
    stubFetch({
      [VERSIONS_PATH]: () => new Promise<Response>(() => {}),
    });

    const { result } = renderHook(() => useCaseCurrentVersionValidity(SLUG), {
      wrapper: createWrapper(),
    });

    expect(result.current.phase).toBe("pending");
  });
});

describe("useCaseCurrentVersionValidity -- the current version's own read still in flight (a dependency answering slowly)", () => {
  it('reports phase "checking", carrying the version number, once the version list has resolved but its own read has not', async () => {
    stubFetch({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 6, state: "draft" }] }),
      [versionPath(6)]: () => new Promise<Response>(() => {}),
    });

    const { result } = renderHook(() => useCaseCurrentVersionValidity(SLUG), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.phase).toBe("checking"));
    expect(result.current).toMatchObject({ phase: "checking", version: 6 });
  });
});
