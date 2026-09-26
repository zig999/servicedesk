import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { createElement, type ReactNode } from "react";
import { toast } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useGlossaryConcepts, useRemoveGlossaryConcept } from "./use-glossary-concepts";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function newQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
});

describe("useGlossaryConcepts", () => {
  it("issues a GET to /v1/glossary/concepts and returns each concept's own name, accepts and ttl intact", async () => {
    const concepts = [
      { name: "billing-dispute", accepts: ["customer-account"], ttl: 3600 },
      { name: "fraud-flag", accepts: ["customer-account", "merchant"], ttl: 60 },
    ];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: concepts }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useGlossaryConcepts(), {
      wrapper: createWrapper(newQueryClient()),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/v1/glossary/concepts");
    expect(result.current.concepts).toEqual(concepts);
  });

  it("reads each concept's own description off the concepts listing verbatim, including an empty string for a legacy concept (criterion 1)", async () => {
    const concepts = [
      {
        name: "billing-dispute",
        accepts: ["customer-account"],
        ttl: 3600,
        description: "Tracks a customer-raised dispute over a billing charge.",
      },
      { name: "legacy-concept", accepts: [], ttl: 60, description: "" },
    ];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: concepts }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useGlossaryConcepts(), {
      wrapper: createWrapper(newQueryClient()),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.concepts).toEqual(concepts);
  });

  it("returns an empty concepts array, rather than throwing or leaving it undefined, when the concepts page holds none yet", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useGlossaryConcepts(), {
      wrapper: createWrapper(newQueryClient()),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.concepts).toEqual([]);
  });

  it("reports isError, with concepts staying empty, when the request fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useGlossaryConcepts(), {
      wrapper: createWrapper(newQueryClient()),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.concepts).toEqual([]);
  });

  it("caches under its own key, [\"glossary\", \"concepts-with-ttl\"], distinct from use-concept-options.ts's own [\"glossary\", \"concepts\"] key (disclosed inference)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ data: [{ name: "billing-dispute", accepts: [], ttl: 60 }] }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const queryClient = newQueryClient();

    const { result } = renderHook(() => useGlossaryConcepts(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(queryClient.getQueryData(["glossary", "concepts-with-ttl"])).toBeDefined();
    expect(queryClient.getQueryData(["glossary", "concepts"])).toBeUndefined();
  });
});

type ApiErrorBody = {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
};

function refusalResponse(error: ApiErrorBody, status: number): Response {
  return jsonResponse({ error }, status);
}

function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

const CONCEPT_IN_USE_ERROR: ApiErrorBody = {
  code: "ConceptInUseError",
  message: "the concept is still referenced",
  details: { name: "billing-dispute", reference: "capability" },
};

const VALIDATION_ERROR: ApiErrorBody = {
  code: "VALIDATION_ERROR",
  message: "the request failed validation",
  details: ["path segment malformed"],
};

const INTERNAL_ERROR: ApiErrorBody = {
  code: "INTERNAL_ERROR",
  message: "an unexpected error occurred",
};

const UNRECOGNISED_CODE_ERROR: ApiErrorBody = {
  code: "SomeDomainErrorThisSurfaceDoesNotMap",
  message: "something the surface has no mapping for",
};

async function issueRemoval(name: string, response: Response): Promise<void> {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  const { result } = renderHook(() => useRemoveGlossaryConcept(), {
    wrapper: createWrapper(newQueryClient()),
  });

  act(() => {
    result.current.remove(name);
  });

  await waitFor(() => expect(result.current.isRemoving).toBe(false));
}

function latestSuccessMessage(): string {
  const calls = vi.mocked(toast.success).mock.calls;
  const argument = calls[calls.length - 1]?.[0];
  if (typeof argument !== "string") {
    throw new Error(
      "useRemoveGlossaryConcept proof: expected toast.success's own argument to be a string",
    );
  }
  return argument;
}

function latestErrorMessage(): string {
  const calls = vi.mocked(toast.error).mock.calls;
  const argument = calls[calls.length - 1]?.[0];
  if (typeof argument !== "string") {
    throw new Error(
      "useRemoveGlossaryConcept proof: expected toast.error's own argument to be a string",
    );
  }
  return argument;
}

async function captureRemovalFailureMessage(response: Response): Promise<string> {
  await issueRemoval("billing-dispute", response);
  const message = latestErrorMessage();
  vi.mocked(toast.error).mockClear();
  return message;
}

describe("useRemoveGlossaryConcept -- states the answered outcome of a submitted removal", () => {
  it("states success naming the removed concept's own name when the removal answers with HTTP 204 (criterion 1)", async () => {
    await issueRemoval("billing-dispute", noContentResponse());

    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(latestSuccessMessage()).toContain("billing-dispute");
  });

  it("states that nothing was removed and that something still names the concept when refused with ConceptInUseError (criteria 2, 3)", async () => {
    const message = await captureRemovalFailureMessage(refusalResponse(CONCEPT_IN_USE_ERROR, 409));

    expect(message.toLowerCase()).toContain("nothing was removed");
    expect(message.toLowerCase()).toContain("still names");
  });

  it("states a different message for a ConceptInUseError refusal than for an HTTP 400 VALIDATION_ERROR refusal (criterion 4)", async () => {
    const conceptInUseMessage = await captureRemovalFailureMessage(
      refusalResponse(CONCEPT_IN_USE_ERROR, 409),
    );
    const validationMessage = await captureRemovalFailureMessage(
      refusalResponse(VALIDATION_ERROR, 400),
    );

    expect(validationMessage).not.toBe(conceptInUseMessage);
  });

  it("states a different message for a ConceptInUseError refusal than for an HTTP 500 INTERNAL_ERROR refusal (criterion 5)", async () => {
    const conceptInUseMessage = await captureRemovalFailureMessage(
      refusalResponse(CONCEPT_IN_USE_ERROR, 409),
    );
    const internalErrorMessage = await captureRemovalFailureMessage(
      refusalResponse(INTERNAL_ERROR, 500),
    );

    expect(internalErrorMessage).not.toBe(conceptInUseMessage);
  });

  it.each([
    {
      label: "an HTTP 400 VALIDATION_ERROR refusal (criterion 6)",
      response: refusalResponse(VALIDATION_ERROR, 400),
    },
    {
      label: "an HTTP 500 INTERNAL_ERROR refusal (criterion 7)",
      response: refusalResponse(INTERNAL_ERROR, 500),
    },
    {
      label: "a refusal with an error code the surface does not recognise (criterion 8)",
      response: refusalResponse(UNRECOGNISED_CODE_ERROR, 422),
    },
  ])("states that nothing was removed for $label", async ({ response }) => {
    const message = await captureRemovalFailureMessage(response);
    expect(message.toLowerCase()).toContain("nothing was removed");
  });

  it("states a different message for a refusal with an unrecognised error code than for a ConceptInUseError refusal (criterion 9)", async () => {
    const conceptInUseMessage = await captureRemovalFailureMessage(
      refusalResponse(CONCEPT_IN_USE_ERROR, 409),
    );
    const unrecognisedMessage = await captureRemovalFailureMessage(
      refusalResponse(UNRECOGNISED_CODE_ERROR, 422),
    );

    expect(unrecognisedMessage).not.toBe(conceptInUseMessage);
  });

  it("states neither success nor refusal while the removal has not been answered (criterion 10)", async () => {
    let resolvePending: (response: Response) => void = () => {};
    const pending = new Promise<Response>((resolve) => {
      resolvePending = resolve;
    });
    const fetchMock = vi.fn().mockReturnValue(pending);
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useRemoveGlossaryConcept(), {
      wrapper: createWrapper(newQueryClient()),
    });

    act(() => {
      result.current.remove("billing-dispute");
    });
    await waitFor(() => expect(result.current.isRemoving).toBe(true));

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();

    await act(async () => {
      resolvePending(noContentResponse());
    });
    await waitFor(() => expect(result.current.isRemoving).toBe(false));
    expect(toast.success).toHaveBeenCalledTimes(1);
  });
});

describe("useRemoveGlossaryConcept -- the refusal statement merges HTTP 400 VALIDATION_ERROR, HTTP 500 INTERNAL_ERROR and an unrecognised error code into one identical generic statement (UNDERDETERMINED, from the specification -- a-submitted-removal-states-its-outcome-to-the-operator's own condition apart from every other condition; the implementation's own disclosed reading -- see concept-removal-outcome-disclosure.md's inferences)", () => {
  it("produces one identical generic statement for all three, keeping it apart only from ConceptInUseError's own statement", async () => {
    const validationMessage = await captureRemovalFailureMessage(
      refusalResponse(VALIDATION_ERROR, 400),
    );
    const internalErrorMessage = await captureRemovalFailureMessage(
      refusalResponse(INTERNAL_ERROR, 500),
    );
    const unrecognisedMessage = await captureRemovalFailureMessage(
      refusalResponse(UNRECOGNISED_CODE_ERROR, 422),
    );
    const conceptInUseMessage = await captureRemovalFailureMessage(
      refusalResponse(CONCEPT_IN_USE_ERROR, 409),
    );

    expect(validationMessage).toBe(internalErrorMessage);
    expect(validationMessage).toBe(unrecognisedMessage);
    expect(validationMessage).not.toBe(conceptInUseMessage);
  });
});

describe("useRemoveGlossaryConcept -- the ConceptInUseError statement names the concept, never the reported reference (UNDERDETERMINED, from the specification -- a-registered-concept-is-never-removed's own reported reference; the implementation's own disclosed reading -- see concept-removal-outcome-disclosure.md's inferences)", () => {
  it("states the identical message for a refusal reporting a capability reference and for one reporting an evidence reference", async () => {
    const capabilityReference: ApiErrorBody = {
      ...CONCEPT_IN_USE_ERROR,
      details: { name: "billing-dispute", reference: "capability" },
    };
    const evidenceReference: ApiErrorBody = {
      ...CONCEPT_IN_USE_ERROR,
      details: { name: "billing-dispute", reference: "evidence" },
    };

    const capabilityMessage = await captureRemovalFailureMessage(
      refusalResponse(capabilityReference, 409),
    );
    const evidenceMessage = await captureRemovalFailureMessage(
      refusalResponse(evidenceReference, 409),
    );

    expect(evidenceMessage).toBe(capabilityMessage);
  });
});
