import { createElement } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { GlossaryBrowserScreen } from "./glossary-browser-screen";
import type { GlossaryConcept } from "../hooks/use-glossary-concepts";

// Shared fixtures, fetch stub and mounting helper for task/glossary-and-capabilities-browser/
// glossary-browser-screen's proof, split across glossary-browser-screen.spec.ts (the six-tab
// strip, the Concepts tab's own listing/formatting/loading/error/empty coverage, and the two
// no-control criteria checked across all six tabs) and
// glossary-browser-screen-vocabulary-tabs.spec.ts (the five term-vocabulary tabs' own
// listing/empty/error coverage plus tab-switching) -- mirroring
// capabilities-browser-screen.test-support.ts's own established split, to keep each file under
// this project's own max-lines rule (MNT-01).
//
// GlossaryBrowserScreen calls no router hook at all (no useParams, no Link, no useNavigate --
// confirmed by reading glossary-browser-screen.tsx in full), so unlike case-detail-screen's own
// test-support modules this one needs no createMemoryHistory/RouterProvider scaffolding, only a
// QueryClientProvider for its own six hook calls (one per tab).

export const CONCEPTS_PATH = "/v1/glossary/concepts";
export const SUBJECT_TYPE_PATH = "/v1/glossary/subject-type";
export const SUBJECT_ATTRIBUTE_PATH = "/v1/glossary/subject-attribute";
export const OUTCOME_PATH = "/v1/glossary/outcome";
export const ACTION_PATH = "/v1/glossary/action";
export const RECIPIENT_PATH = "/v1/glossary/recipient";

export const CONCEPTS_EMPTY_MESSAGE = "The glossary currently holds no concepts.";
export const CONCEPTS_ERROR_MESSAGE = "Unable to load the glossary's concepts.";

type FetchFn = (input: string | URL | Request) => Promise<Response>;

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

/** The page envelope every one of the six hooks below reads only `data` out of. */
export function page(data: readonly unknown[]): unknown {
  return { data, total: data.length, limit: 20, offset: 0, pageCount: 1 };
}

/** One full-fidelity concept fixture carrying every field domain/glossary/concept declares. */
export function glossaryConcept(overrides: Partial<GlossaryConcept> = {}): GlossaryConcept {
  return {
    name: "billing-dispute",
    accepts: ["customer-account"],
    ttl: 3600,
    ...overrides,
  };
}

export function term(name: string): { readonly name: string } {
  return { name };
}

/**
 * A fetch stub answering exactly the six glossary paths above. Any path this stub was not
 * explicitly given a handler for falls back to an empty, successful page rather than throwing
 * -- unlike capabilities-browser-screen.test-support.ts's own createCapabilitiesFetchStub,
 * this screen's own Concepts tab is mounted (and its own GET /v1/glossary/concepts query
 * fires) on every render regardless of which tab a test focuses on, since "concepts" is the
 * Tabs' own defaultValue: a test exercising only one of the other five tabs would otherwise
 * have to stub a request its own assertions never look at.
 */
export function createGlossaryFetchStub(
  handlers: Partial<Record<string, () => Response | Promise<Response>>>,
): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request): Promise<Response> => {
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

/**
 * The five term-vocabulary tabs (criteria 3-7), each one's own endpoint and its own declared
 * empty/error copy -- read directly out of glossary-browser-screen.tsx's own five
 * VocabularyPanel instantiations, not re-derived independently, since this proof asserts that
 * each tab's own already-visible, already-distinct copy actually renders, not a wording no
 * criterion states.
 */
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

/** Concepts plus the five term-vocabulary tabs, each one's own path and empty-state copy --
 * used by the two cross-tab no-control loops (criteria 8 and 9). */
export const ALL_TAB_CASES: readonly { tabLabel: string; path: string; emptyMessage: string }[] =
  [
    { tabLabel: "Concepts", path: CONCEPTS_PATH, emptyMessage: CONCEPTS_EMPTY_MESSAGE },
    ...VOCABULARY_TAB_CASES.map(({ tabLabel, path, emptyMessage }) => ({
      tabLabel,
      path,
      emptyMessage,
    })),
  ];
