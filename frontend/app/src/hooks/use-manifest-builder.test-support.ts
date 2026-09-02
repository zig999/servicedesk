import { createElement, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ManifestBuilderState, ManifestRow } from "./use-manifest-builder";

export const SLUG = "case-1";
export const VERSION = 3;
export const VERSION_PATH = `/v1/cases/${SLUG}/versions/${VERSION}`;

export function manifestPath(hypothesisName: string): string {
  return `${VERSION_PATH}/manifest/${encodeURIComponent(hypothesisName)}`;
}

export type ManifestEntryFixture = {
  readonly position: number;
  readonly hypothesis_revision: {
    readonly hypothesis: { readonly name: string };
    readonly revision: number;
  };
};

export function entry(position: number, name: string, revision: number): ManifestEntryFixture {
  return { position, hypothesis_revision: { hypothesis: { name }, revision } };
}

export const TWO_ENTRY_MANIFEST = { manifest: [entry(1, "H1", 2), entry(2, "H2", 5)] };
export const THREE_ENTRY_MANIFEST = {
  manifest: [entry(1, "H1", 2), entry(2, "H2", 5), entry(3, "H3", 9)],
};
export const AFTER_REPIN_THREE_ENTRY_MANIFEST = {
  manifest: [entry(1, "H1", 2), entry(2, "H2", 7), entry(3, "H3", 9)],
};
export const AFTER_REPIN_TWO_ENTRY_MANIFEST = {
  manifest: [entry(1, "H1", 2), entry(2, "H2", 9)],
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

export function apiErrorResponse(code: string, status: number, message: string): Response {
  return jsonResponse({ error: { code, message } }, status);
}

export function sequentialGetHandler(responses: readonly unknown[]): () => Response {
  let call = 0;
  return () => {
    const body = responses[Math.min(call, responses.length - 1)];
    call += 1;
    return jsonResponse(body);
  };
}

type FetchResponder = () => Response | Promise<Response>;
type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export function createFetchStub(handlers: Record<string, FetchResponder>): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const key = `${method} ${url}`;
    const handler = handlers[key];
    if (!handler) {
      throw new Error(`use-manifest-builder proof: no mocked response for ${key}`);
    }
    return handler();
  });
}

export function stubFetch(fetchMock: Mock<FetchFn>): void {
  vi.stubGlobal("fetch", fetchMock);
}

export function createWrapper(): {
  Wrapper: (props: { children: ReactNode }) => ReactElement;
  queryClient: QueryClient;
} {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
  return { Wrapper, queryClient };
}

export function readyState(
  state: ManifestBuilderState,
): Extract<ManifestBuilderState, { phase: "ready" }> {
  if (state.phase !== "ready") {
    throw new Error(`use-manifest-builder proof: expected the ready phase, got "${state.phase}"`);
  }
  return state;
}

export function rowFor(state: ManifestBuilderState, hypothesisName: string): ManifestRow {
  const row = readyState(state).rows.find((candidate) => candidate.hypothesisName === hypothesisName);
  if (!row) {
    throw new Error(`use-manifest-builder proof: expected a row for ${hypothesisName}`);
  }
  return row;
}

function callsFor(fetchMock: Mock<FetchFn>, method: string) {
  return fetchMock.mock.calls.filter(
    ([, init]) => (init?.method ?? "GET").toUpperCase() === method,
  );
}

export function putCallCount(fetchMock: Mock<FetchFn>): number {
  return callsFor(fetchMock, "PUT").length;
}

export function getCallCount(fetchMock: Mock<FetchFn>): number {
  return callsFor(fetchMock, "GET").length;
}

export function parsedPutBody(fetchMock: Mock<FetchFn>, callIndex = 0): unknown {
  const rawBody = callsFor(fetchMock, "PUT")[callIndex]?.[1]?.body;
  if (typeof rawBody !== "string") {
    throw new Error("use-manifest-builder proof: expected a PUT call carrying a JSON string body");
  }
  return JSON.parse(rawBody);
}

export function putUrl(fetchMock: Mock<FetchFn>, callIndex = 0): string {
  const call = callsFor(fetchMock, "PUT")[callIndex];
  if (!call) {
    throw new Error("use-manifest-builder proof: expected a PUT call");
  }
  const [input] = call;
  return typeof input === "string" ? input : input.toString();
}
