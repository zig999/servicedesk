import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useGlossaryVocabularyOptions, type GlossaryVocabulary } from "./use-glossary-vocabulary";

// Sibling to use-glossary-vocabulary.ts -- the hook carried no spec file of its own before
// this widening (task/glossary-and-capabilities-browser/widen-glossary-vocabulary-union), only
// indirect coverage through several screens' own test-support fixtures (e.g.
// hypothesis-revision-screen.test-support.ts's baseHandlers, which never exercise
// "subject-attribute" at all). This file proves the hook's own contract directly through
// renderHook, matching api-client.spec.ts's own convention of stubbing only the network
// boundary (real Response objects through a stubbed global fetch, so apiFetch()'s own JSON
// handling runs unmodified) rather than mounting a whole screen the hook has no view of its own.

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

// Built once per test and captured in this closure, not constructed inline inside the returned
// component's own body -- a QueryClient built there would be rebuilt on every render the
// provider tree undergoes, discarding its cache mid-test.
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

    // No cast: GlossaryVocabulary itself must admit this literal for the assignment below (and
    // the call it feeds) to typecheck. The project's own `tsc --noEmit` step is what actually
    // enforces that -- vitest strips types before running and would not itself fail here if the
    // union regressed to four members, which this proof's own record discloses under untested.
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
