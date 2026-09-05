import { createElement, type ReactElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  pinnedRevisionStateCell,
  usePinnedRevisionState,
  type PinnedRevisionStateResult,
} from "./use-pinned-revision-state";

type FetchResponder = () => Response | Promise<Response>;
type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function apiErrorResponse(code: string, status: number, message: string): Response {
  return jsonResponse({ error: { code, message } }, status);
}

function createFetchStub(handlers: Record<string, FetchResponder>): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const key = `${method} ${url}`;
    const handler = handlers[key];
    if (!handler) {
      throw new Error(`use-pinned-revision-state proof: no mocked response for ${key}`);
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
const HYPOTHESIS = "H1";

function revisionsPath(offset?: number): string {
  const base = `/v1/cases/${SLUG}/hypotheses/${HYPOTHESIS}/revisions`;
  return offset === undefined ? base : `${base}?offset=${offset}`;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("usePinnedRevisionState — resolving a pin across more than one further page (criterion 1, this task's own inference on pagination)", () => {
  it("keeps walking forward by each page's own offset and limit until the pinned revision turns up two pages past the default one", async () => {
    const fetchMock = createFetchStub({
      [`GET ${revisionsPath()}`]: () =>
        jsonResponse({
          data: [
            { revision: 1, state: "draft" },
            { revision: 2, state: "draft" },
          ],
          total: 5,
          offset: 0,
          limit: 2,
        }),
      [`GET ${revisionsPath(2)}`]: () =>
        jsonResponse({
          data: [
            { revision: 3, state: "draft" },
            { revision: 4, state: "draft" },
          ],
          total: 5,
          offset: 2,
          limit: 2,
        }),
      [`GET ${revisionsPath(4)}`]: () =>
        jsonResponse({
          data: [{ revision: 5, state: "released" }],
          total: 5,
          offset: 4,
          limit: 2,
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePinnedRevisionState(SLUG, HYPOTHESIS, 5), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current).toEqual({ status: "resolved", state: "released" }),
    );
  });
});

describe("usePinnedRevisionState — a pin the listing never carries (this task's own inference on exhaustion)", () => {
  it("states the pin could not be read once the default page's own total shows every revision has already been read without finding it", async () => {
    const fetchMock = createFetchStub({
      [`GET ${revisionsPath()}`]: () =>
        jsonResponse({
          data: [
            { revision: 1, state: "draft" },
            { revision: 2, state: "draft" },
          ],
          total: 2,
          offset: 0,
          limit: 2,
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePinnedRevisionState(SLUG, HYPOTHESIS, 99), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toEqual({ status: "failed" }));
  });
});

describe("usePinnedRevisionState — a further page that answers with a zero limit (termination safety)", () => {
  it("still states the pin could not be read instead of retrying the same offset forever", async () => {
    const fetchMock = createFetchStub({
      [`GET ${revisionsPath()}`]: () =>
        jsonResponse({
          data: [{ revision: 1, state: "draft" }],
          total: 5,
          offset: 0,
          limit: 1,
        }),
      [`GET ${revisionsPath(1)}`]: () =>
        jsonResponse({
          data: [{ revision: 2, state: "draft" }],
          total: 5,
          offset: 1,
          limit: 0,
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePinnedRevisionState(SLUG, HYPOTHESIS, 99), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toEqual({ status: "failed" }));
  });
});

describe("usePinnedRevisionState — the off-page read still outstanding (criterion 5, the off-page path)", () => {
  it("states the pin is still being read while this task's own further-page request has not yet answered", async () => {
    const fetchMock = createFetchStub({
      [`GET ${revisionsPath()}`]: () =>
        jsonResponse({
          data: [{ revision: 1, state: "draft" }],
          total: 3,
          offset: 0,
          limit: 1,
        }),
      [`GET ${revisionsPath(1)}`]: () => new Promise<Response>(() => {}),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePinnedRevisionState(SLUG, HYPOTHESIS, 3), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([url]) => url === revisionsPath(1))).toBe(true),
    );
    expect(result.current).toEqual({ status: "pending" });
  });
});

describe("usePinnedRevisionState — the off-page read that fails (criterion 6, the off-page path)", () => {
  it("states the pin could not be read when this task's own further-page request answers with an error", async () => {
    const fetchMock = createFetchStub({
      [`GET ${revisionsPath()}`]: () =>
        jsonResponse({
          data: [{ revision: 1, state: "draft" }],
          total: 3,
          offset: 0,
          limit: 1,
        }),
      [`GET ${revisionsPath(1)}`]: () =>
        apiErrorResponse("SomeUnexpectedError", 500, "internal error"),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePinnedRevisionState(SLUG, HYPOTHESIS, 3), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toEqual({ status: "failed" }));
  });
});

describe("pinnedRevisionStateCell — the three windows the rule requires (criterion 7)", () => {
  it("renders four distinct, non-blank presentations for pending, failed, resolved-draft and resolved-released", () => {
    const cells = [
      pinnedRevisionStateCell({ status: "pending" }),
      pinnedRevisionStateCell({ status: "failed" }),
      pinnedRevisionStateCell({ status: "resolved", state: "draft" }),
      pinnedRevisionStateCell({ status: "resolved", state: "released" }),
    ];
    const labels = cells.map((cell) => cell.label);

    expect(new Set(labels).size).toBe(4);
    expect(labels.every((label) => label.length > 0)).toBe(true);
  });
});

describe("pinnedRevisionStateCell — a resolved state value outside draft or released (this task's own inference on the defensive fallback)", () => {
  it("renders the could-not-be-read presentation instead of guessing a draft or released label", () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- deliberately fabricates a state value outside draft/released to exercise pinnedRevisionStateCell's own defensive fallback; a real HypothesisRevisionState can never hold this value, so the literal is routed through `unknown` first because its own type has no overlap with PinnedRevisionStateResult for the compiler to narrow.
    const malformed = { status: "resolved", state: "archived" } as unknown as PinnedRevisionStateResult;

    expect(pinnedRevisionStateCell(malformed)).toEqual(
      pinnedRevisionStateCell({ status: "failed" }),
    );
  });
});
