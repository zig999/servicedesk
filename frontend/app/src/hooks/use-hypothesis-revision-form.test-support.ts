import { createElement, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { HypothesisRevisionFormState } from "./use-hypothesis-revision-form";

export const SLUG = "case-1";
export const VERSION = 4;
export const VERSION_PATH = `/v1/cases/${SLUG}/versions/${VERSION}`;
export const SUBJECT_TYPE = "billing-dispute";

export function revisionsPath(hypothesisName: string): string {
  return `/v1/cases/${SLUG}/hypotheses/${encodeURIComponent(hypothesisName)}/revisions`;
}

export type ManifestEntryFixture = {
  readonly hypothesis_revision: {
    readonly hypothesis: { readonly name: string };
    readonly revision: number;
  };
};

export function manifestEntry(name: string, revision: number): ManifestEntryFixture {
  return { hypothesis_revision: { hypothesis: { name }, revision } };
}

export function caseVersionResponse(
  manifest: readonly ManifestEntryFixture[],
): { readonly subject: string; readonly manifest: readonly ManifestEntryFixture[] } {
  return { subject: SUBJECT_TYPE, manifest };
}

const EMPTY_TERMS = { data: [] };

export function revisionsPage(
  revisions: readonly number[],
): {
  readonly data: readonly {
    readonly revision: number;
    readonly criterion: string;
    readonly collects: readonly string[];
    readonly resolution: {
      readonly outcome: string;
      readonly referral: { readonly action: string; readonly recipient: string };
    };
  }[];
} {
  return {
    data: revisions.map((revision) => ({
      revision,
      criterion: "some criterion",
      collects: [],
      resolution: { outcome: "", referral: { action: "", recipient: "" } },
    })),
  };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
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
      throw new Error(`use-hypothesis-revision-form proof: no mocked response for ${key}`);
    }
    return handler();
  });
}

export function stubFetch(fetchMock: Mock<FetchFn>): void {
  vi.stubGlobal("fetch", fetchMock);
}

export function baseHandlers(
  overrides: Record<string, FetchResponder> = {},
): Record<string, FetchResponder> {
  return {
    [`GET ${VERSION_PATH}`]: () => jsonResponse(caseVersionResponse([])),
    "GET /v1/glossary/concepts": () => jsonResponse(EMPTY_TERMS),
    "GET /v1/glossary/outcome": () => jsonResponse(EMPTY_TERMS),
    "GET /v1/glossary/action": () => jsonResponse(EMPTY_TERMS),
    "GET /v1/glossary/recipient": () => jsonResponse(EMPTY_TERMS),
    ...overrides,
  };
}

export function createWrapper(): {
  readonly Wrapper: (props: { children: ReactNode }) => ReactElement;
  readonly queryClient: QueryClient;
} {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
  return { Wrapper, queryClient };
}

export function readyState(
  state: HypothesisRevisionFormState,
): Extract<HypothesisRevisionFormState, { phase: "ready" }> {
  if (state.phase !== "ready") {
    throw new Error(
      `use-hypothesis-revision-form proof: expected the ready phase, got "${state.phase}"`,
    );
  }
  return state;
}

function getCalls(fetchMock: Mock<FetchFn>) {
  return fetchMock.mock.calls.filter(
    ([, init]) => (init?.method ?? "GET").toUpperCase() === "GET",
  );
}

export function requestedGetUrls(fetchMock: Mock<FetchFn>): readonly string[] {
  const urls = getCalls(fetchMock).map(([input]) =>
    typeof input === "string" ? input : input.toString(),
  );
  return Array.from(new Set(urls));
}

export function getCallCountFor(fetchMock: Mock<FetchFn>, url: string): number {
  return getCalls(fetchMock).filter(
    ([input]) => (typeof input === "string" ? input : input.toString()) === url,
  ).length;
}
