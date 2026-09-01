import { createElement } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { GlossaryBrowserScreen } from "./glossary-browser-screen";
import type { GlossaryConcept } from "../hooks/use-glossary-concepts";

export const CONCEPTS_PATH = "/v1/glossary/concepts";
export const SUBJECT_TYPE_PATH = "/v1/glossary/subject-type";
export const SUBJECT_ATTRIBUTE_PATH = "/v1/glossary/subject-attribute";
export const OUTCOME_PATH = "/v1/glossary/outcome";
export const ACTION_PATH = "/v1/glossary/action";
export const RECIPIENT_PATH = "/v1/glossary/recipient";

export const CONCEPTS_EMPTY_MESSAGE = "The glossary currently holds no concepts.";
export const CONCEPTS_ERROR_MESSAGE = "Unable to load the glossary's concepts.";

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type RecordedCall = [string | URL | Request, RequestInit | undefined];

export function conceptPutPath(name: string): string {
  return `/v1/glossary/concepts/${encodeURIComponent(name)}`;
}

export function requestsWithMethod(
  fetchMock: Mock<FetchFn>,
  method: string,
): readonly RecordedCall[] {
  return fetchMock.mock.calls
    .filter(([, init]) => (init?.method ?? "GET").toUpperCase() === method)
    .map(([input, init]): RecordedCall => [input, init]);
}

export function putCallCount(fetchMock: Mock<FetchFn>): number {
  return requestsWithMethod(fetchMock, "PUT").length;
}

export function parsedPutBody(fetchMock: Mock<FetchFn>, index = 0): unknown {
  const rawBody = requestsWithMethod(fetchMock, "PUT")[index]?.[1]?.body;
  if (typeof rawBody !== "string") {
    throw new Error(
      "glossary-browser-screen.test-support.ts: expected a PUT call carrying a JSON string body",
    );
  }
  return JSON.parse(rawBody);
}

export function putUrl(fetchMock: Mock<FetchFn>, index = 0): string | undefined {
  const call = requestsWithMethod(fetchMock, "PUT")[index];
  if (call === undefined) {
    return undefined;
  }
  const [input] = call;
  return typeof input === "string" ? input : input.toString();
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function page(data: readonly unknown[]): unknown {
  return { data, total: data.length, limit: 20, offset: 0, pageCount: 1 };
}

export function glossaryConcept(overrides: Partial<GlossaryConcept> = {}): GlossaryConcept {
  return {
    name: "billing-dispute",
    accepts: ["customer-account"],
    ttl: 3600,
    description: "Tracks a customer-raised dispute over a billing charge.",
    ...overrides,
  };
}

export function term(name: string): { readonly name: string } {
  return { name };
}

export function createGlossaryFetchStub(
  handlers: Partial<Record<string, () => Response | Promise<Response>>>,
): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request, _init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    return (handler ?? (() => jsonResponse(page([]))))();
  });
}

export async function mountGlossaryBrowserScreen(fetchMock: FetchFn): Promise<void> {
  vi.stubGlobal("fetch", fetchMock);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(GlossaryBrowserScreen),
    ),
  );
}

export type VocabularyTabCase = {
  readonly tabLabel: string;
  readonly path: string;
  readonly emptyMessage: string;
  readonly errorMessage: string;
};

export const VOCABULARY_TAB_CASES: readonly VocabularyTabCase[] = [
  {
    tabLabel: "Subject types",
    path: SUBJECT_TYPE_PATH,
    emptyMessage: "The glossary currently holds no subject types.",
    errorMessage: "Unable to load subject types.",
  },
  {
    tabLabel: "Subject attributes",
    path: SUBJECT_ATTRIBUTE_PATH,
    emptyMessage: "The glossary currently holds no subject attributes.",
    errorMessage: "Unable to load subject attributes.",
  },
  {
    tabLabel: "Outcomes",
    path: OUTCOME_PATH,
    emptyMessage: "The glossary currently holds no outcomes.",
    errorMessage: "Unable to load outcomes.",
  },
  {
    tabLabel: "Actions",
    path: ACTION_PATH,
    emptyMessage: "The glossary currently holds no actions.",
    errorMessage: "Unable to load actions.",
  },
  {
    tabLabel: "Recipients",
    path: RECIPIENT_PATH,
    emptyMessage: "The glossary currently holds no recipients.",
    errorMessage: "Unable to load recipients.",
  },
];

export const ALL_TAB_LABELS = [
  "Concepts",
  "Subject types",
  "Subject attributes",
  "Outcomes",
  "Actions",
  "Recipients",
] as const;

export const ALL_TAB_CASES: readonly { tabLabel: string; path: string; emptyMessage: string }[] =
  [
    { tabLabel: "Concepts", path: CONCEPTS_PATH, emptyMessage: CONCEPTS_EMPTY_MESSAGE },
    ...VOCABULARY_TAB_CASES.map(({ tabLabel, path, emptyMessage }) => ({
      tabLabel,
      path,
      emptyMessage,
    })),
  ];
