import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useGlossaryVocabularyOptions, type GlossaryVocabulary } from "./use-glossary-vocabulary";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GlossaryVocabulary -- a closed union of exactly outcome, action, recipient and subject-type", () => {
  it("refuses a fifth, unheld vocabulary name at compile time", () => {
    // @ts-expect-error -- the glossary no longer publishes this vocabulary, so it does not belong to GlossaryVocabulary
    const unheldVocabulary: GlossaryVocabulary = "subject-attribute";
    expect(unheldVocabulary).toBe("subject-attribute");
  });
});

describe("useGlossaryVocabularyOptions, edge states re-pointed to a surviving vocabulary", () => {
  it("returns an empty options array, rather than throwing or leaving it undefined, when the page holds no terms yet", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useGlossaryVocabularyOptions("outcome"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.options).toEqual([]);
  });

  it("reports isError, with options staying empty, when the request fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useGlossaryVocabularyOptions("outcome"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.options).toEqual([]);
  });
});

type ExistingVocabularyCase = {
  vocabulary: GlossaryVocabulary;
  terms: { name: string }[];
};

const EXISTING_VOCABULARY_CASES: ExistingVocabularyCase[] = [
  { vocabulary: "outcome", terms: [{ name: "resolved" }, { name: "pending" }] },
  { vocabulary: "action", terms: [{ name: "escalate" }, { name: "notify" }] },
  { vocabulary: "recipient", terms: [{ name: "supervisor" }, { name: "customer" }] },
  { vocabulary: "subject-type", terms: [{ name: "billing-dispute" }] },
];

describe("useGlossaryVocabularyOptions, the four pre-existing vocabularies", () => {
  it.each(EXISTING_VOCABULARY_CASES)(
    "still issues a GET to /v1/glossary/$vocabulary and maps its own terms to {value, label} options, unaffected by the fifth vocabulary's addition",
    async ({ vocabulary, terms }) => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: terms }));
      vi.stubGlobal("fetch", fetchMock);

      const { result } = renderHook(() => useGlossaryVocabularyOptions(vocabulary), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(fetchMock.mock.calls[0]?.[0]).toBe(`/v1/glossary/${vocabulary}`);
      expect(result.current.options).toEqual(
        terms.map((term) => ({ value: term.name, label: term.name })),
      );
    },
  );
});
