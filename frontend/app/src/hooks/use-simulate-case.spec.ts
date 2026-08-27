import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSimulateCase } from "./use-simulate-case";
import {
  SIMULATE_PATH,
  createWrapper,
  draftCaseRef,
  errorResponse,
  jsonResponse,
  releasedCaseRef,
  requestBody,
  simulateResult,
  stubFetch,
} from "./use-simulate-case.test-support";

// Proof for task/simulation-cockpit/use-simulate-case's own criteria 1, 5, 6 and 7, and two of
// its recorded inferences (the request body's own wire shape, and the absence of a computed
// can-simulate flag). Criteria 2-4 (the typed response shape) live in the sibling
// use-simulate-case-response-shape.spec.ts.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSimulateCase -- open to either a draft or a released case version (criterion 1)", () => {
  it("succeeds through the identical POST /v1/simulate call whether the case version is a draft or a released one", async () => {
    const capturedCalls: Array<{ method: string; body: unknown }> = [];
    stubFetch({
      [SIMULATE_PATH]: (method, body) => {
        capturedCalls.push({ method, body });
        return jsonResponse(simulateResult());
      },
    });
    const { result } = renderHook(() => useSimulateCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.onSimulate(requestBody(draftCaseRef()));
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    act(() => {
      result.current.onSimulate(requestBody(releasedCaseRef()));
    });
    await waitFor(() => expect(capturedCalls).toHaveLength(2));

    expect(capturedCalls[0].method).toBe("POST");
    expect(capturedCalls[1].method).toBe("POST");
    expect(capturedCalls[0].body).toEqual(requestBody(draftCaseRef()));
    expect(capturedCalls[1].body).toEqual(requestBody(releasedCaseRef()));
  });
});

describe("useSimulateCase -- writes no investigation (criterion 5)", () => {
  it("invalidates no query and calls no endpoint besides /v1/simulate for a successful dispatch", async () => {
    const fetchMock = stubFetch({ [SIMULATE_PATH]: () => jsonResponse(simulateResult()) });
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useSimulateCase(), { wrapper: Wrapper });

    act(() => {
      result.current.onSimulate(requestBody(draftCaseRef()));
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toBe(SIMULATE_PATH);
  });
});

describe("useSimulateCase -- a dispatch failure resolves through uiStateForApiError, never a hand-checked error code (criterion 6)", () => {
  it("resolves a domain-coded refusal and a bare network failure to the identical fallback message, and never the backend's own raw text", async () => {
    const { result } = renderHook(() => useSimulateCase(), { wrapper: createWrapper().Wrapper });

    stubFetch({
      [SIMULATE_PATH]: () =>
        errorResponse("CaseNotFoundError", 404, "raw backend message nobody sees"),
    });
    act(() => {
      result.current.onSimulate(requestBody(draftCaseRef()));
    });
    await waitFor(() => expect(result.current.simulateError).not.toBeNull());
    const domainCodedMessage = result.current.simulateError;
    expect(domainCodedMessage).not.toBe("raw backend message nobody sees");
    expect(result.current.result).toBeNull();

    stubFetch({
      [SIMULATE_PATH]: () => {
        throw new TypeError("network unreachable");
      },
    });
    act(() => {
      result.current.onSimulate(requestBody(draftCaseRef()));
    });
    await waitFor(() => expect(result.current.simulateError).not.toBeNull());

    expect(result.current.simulateError).toBe(domainCodedMessage);
    expect(result.current.result).toBeNull();
  });

  it("keeps simulateError null when the response carries an inconclusive verdict, since that is a returned evaluation rather than a dispatch failure", async () => {
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(simulateResult()) });
    const { result } = renderHook(() => useSimulateCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.onSimulate(requestBody(draftCaseRef()));
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(result.current.simulateError).toBeNull();
    expect(result.current.result?.evaluations.some((one) => one.verdict === "inconclusive")).toBe(
      true,
    );
  });
});

describe("useSimulateCase -- exposes a pending status a caller can gate a second dispatch against (criterion 7)", () => {
  it("reports isSimulating while a dispatch is in flight and drops a second dispatch fired before the first settles", async () => {
    let resolveFetch: ((value: Response) => void) | undefined;
    const pending = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    const capturedCalls: unknown[] = [];
    stubFetch({
      [SIMULATE_PATH]: (_method, body) => {
        capturedCalls.push(body);
        return pending;
      },
    });
    const { result } = renderHook(() => useSimulateCase(), { wrapper: createWrapper().Wrapper });

    expect(result.current.isSimulating).toBe(false);

    act(() => {
      result.current.onSimulate(requestBody(draftCaseRef()));
      result.current.onSimulate(requestBody(draftCaseRef()));
    });

    await waitFor(() => expect(result.current.isSimulating).toBe(true));
    expect(capturedCalls).toHaveLength(1);

    resolveFetch?.(jsonResponse(simulateResult()));
    await waitFor(() => expect(result.current.isSimulating).toBe(false));
    expect(result.current.result).not.toBeNull();
  });
});

describe("useSimulateCase -- the request body's own wire shape (a recorded inference)", () => {
  it("dispatches the request body as exactly {case, subject, requester}, matching this task's own recorded inference", async () => {
    const capturedBodies: unknown[] = [];
    stubFetch({
      [SIMULATE_PATH]: (_method, body) => {
        capturedBodies.push(body);
        return jsonResponse(simulateResult());
      },
    });
    const { result } = renderHook(() => useSimulateCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.onSimulate(requestBody(draftCaseRef()));
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(capturedBodies).toEqual([requestBody(draftCaseRef())]);
  });
});

describe("useSimulateCase -- no computed can-simulate flag (a recorded inference)", () => {
  it("exposes exactly {result, isSimulating, simulateError, onSimulate} before any dispatch, with no computed can-simulate boolean of its own", () => {
    const { result } = renderHook(() => useSimulateCase(), { wrapper: createWrapper().Wrapper });

    expect(Object.keys(result.current).sort()).toEqual(
      ["isSimulating", "onSimulate", "result", "simulateError"].sort(),
    );
  });
});
