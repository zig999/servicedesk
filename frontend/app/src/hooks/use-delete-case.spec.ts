import { createElement, type ReactElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDeleteCase } from "./use-delete-case";
import { ApiError } from "../services/api-client";

type FetchMock = ReturnType<
  typeof vi.fn<(input: string | URL | Request, init?: RequestInit) => Promise<Response>>
>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

function refusalResponse(code: string, message: string, status: number): Response {
  return jsonResponse({ error: { code, message } }, status);
}

function createWrapper(): {
  Wrapper: (props: { children: ReactNode }) => ReactElement;
  queryClient: QueryClient;
} {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    Wrapper: function Wrapper({ children }: { children: ReactNode }): ReactElement {
      return createElement(QueryClientProvider, { client: queryClient }, children);
    },
  };
}

function apiErrorFrom(error: unknown): ApiError {
  if (!(error instanceof ApiError)) {
    throw new Error("useDeleteCase proof: expected the mutation's own error to be an ApiError");
  }
  return error;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useDeleteCase -- invoking the mutation sends exactly one HTTP DELETE to the slug's own path (criterion 1)", () => {
  it("issues a single DELETE request to /v1/cases/:slug for the slug the mutation was invoked with", async () => {
    const fetchMock: FetchMock = vi.fn().mockResolvedValue(noContentResponse());
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useDeleteCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.mutate("case-alpha");
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/v1/cases/case-alpha");
    expect(init?.method).toBe("DELETE");
  });
});

describe("useDeleteCase -- an HTTP 204 answer with an empty body settles the mutation as succeeded (criterion 2)", () => {
  it("reports isSuccess, with no error and no data, once the DELETE answers 204 with no body", async () => {
    const fetchMock: FetchMock = vi.fn().mockResolvedValue(noContentResponse());
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useDeleteCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.mutate("case-alpha");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe("useDeleteCase -- a succeeded mutation invalidates the query backing the cases listing (criterion 3)", () => {
  it('invalidates the ["cases-list"] query once the delete settles as succeeded', async () => {
    const fetchMock: FetchMock = vi.fn().mockResolvedValue(noContentResponse());
    vi.stubGlobal("fetch", fetchMock);
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDeleteCase(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate("case-alpha");
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cases-list"] });
  });
});

describe("useDeleteCase -- an HTTP 409 answer settles the mutation as failed with an ApiError whose code is CaseHoldsVersionsError (criterion 4)", () => {
  it("reports isError with an ApiError coded CaseHoldsVersionsError when the DELETE answers 409", async () => {
    const fetchMock: FetchMock = vi
      .fn()
      .mockResolvedValue(
        refusalResponse("CaseHoldsVersionsError", "the case still holds versions", 409),
      );
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useDeleteCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.mutate("case-alpha");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(apiErrorFrom(result.current.error).code).toBe("CaseHoldsVersionsError");
  });
});

describe("useDeleteCase -- an HTTP 404 answer settles the mutation as failed with an ApiError whose code is CaseNotFoundError (criterion 5)", () => {
  it("reports isError with an ApiError coded CaseNotFoundError when the DELETE answers 404", async () => {
    const fetchMock: FetchMock = vi
      .fn()
      .mockResolvedValue(refusalResponse("CaseNotFoundError", "no case answers that slug", 404));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useDeleteCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.mutate("unknown-slug");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(apiErrorFrom(result.current.error).code).toBe("CaseNotFoundError");
  });
});

describe("useDeleteCase -- a refusal answered with neither HTTP 204, 409 nor 404 keeps its own wire error code rather than being folded into CaseNotFoundError (UNDERDETERMINED, from the specification -- no criterion says what the mutation settles with for such an answer; fails over an implementation that settles every other non-204 answer as CaseNotFoundError)", () => {
  it("reports the ApiError's own code, INTERNAL_ERROR, unchanged for an HTTP 500 answer -- never CaseNotFoundError", async () => {
    const fetchMock: FetchMock = vi
      .fn()
      .mockResolvedValue(refusalResponse("INTERNAL_ERROR", "an unexpected error occurred", 500));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useDeleteCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.mutate("case-alpha");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    const error = apiErrorFrom(result.current.error);
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.code).not.toBe("CaseNotFoundError");
  });
});
