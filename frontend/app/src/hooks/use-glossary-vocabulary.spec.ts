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

describe('useGlossaryVocabularyOptions("subject-attribute")', () => {
  it("issues a GET to /v1/glossary/subject-attribute and maps the page's terms to {value, label} options, called with the literal typed with no cast", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ data: [{ name: "eligibility" }, { name: "risk-tier" }] }));
    vi.stubGlobal("fetch", fetchMock);

    const vocabulary: GlossaryVocabulary = "subject-attribute";
    const { result } = renderHook(() => useGlossaryVocabularyOptions(vocabulary), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/v1/glossary/subject-attribute");
    expect(result.current.options).toEqual([
      { value: "eligibility", label: "eligibility" },
      { value: "risk-tier", label: "risk-tier" },
    ]);
  });

  it("returns an empty options array, rather than throwing or leaving it undefined, when the subject-attribute page holds no terms yet", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useGlossaryVocabularyOptions("subject-attribute"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.options).toEqual([]);
  });

  it("reports isError, with options staying empty, when the subject-attribute request fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useGlossaryVocabularyOptions("subject-attribute"), {
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
