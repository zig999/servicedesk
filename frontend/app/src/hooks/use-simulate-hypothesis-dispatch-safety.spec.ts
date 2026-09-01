import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSimulateHypothesis } from "./use-simulate-hypothesis";
import {
  REQUESTER,
  SIMULATE_PATH,
  SLUG,
  SUBJECT,
  VERSION,
  createWrapper,
  errorResponse,
  jsonResponse,
  simulateHypothesisResult,
  stubFetch,
} from "./use-simulate-hypothesis.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSimulateHypothesis — nothing it dispatches invalidates any cached query (criterion 4, rules/investigation/a-simulation-writes-no-investigation's frontend half)", () => {
  it("never calls invalidateQueries on the surrounding QueryClient across a full successful dispatch", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(simulateHypothesisResult()) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), { wrapper: Wrapper });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("never calls invalidateQueries when the dispatch fails either", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    stubFetch({ [SIMULATE_PATH]: () => errorResponse("SomeUpstreamError", 500) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), { wrapper: Wrapper });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.simulationError).not.toBeNull());

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe("useSimulateHypothesis — a dispatch failure resolves through uiStateForApiError's own convention, not a hand-checked error code (criterion 5)", () => {
  it("resolves the same fallback message for two backend error codes that map to different uiStateForApiError kinds, since neither is hand-checked at this call site", async () => {
    stubFetch({
      [SIMULATE_PATH]: () => errorResponse("CaseNotFoundError", 404),
    });
    const { result: firstResult } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    act(() => {
      firstResult.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(firstResult.current.simulationError).not.toBeNull());
    const firstMessage = firstResult.current.simulationError;

    vi.unstubAllGlobals();
    stubFetch({
      [SIMULATE_PATH]: () => errorResponse("SomeFutureBackendError", 500),
    });
    const { result: secondResult } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    act(() => {
      secondResult.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(secondResult.current.simulationError).not.toBeNull());
    const secondMessage = secondResult.current.simulationError;

    expect(firstMessage).toBe(secondMessage);
    expect(firstMessage).toBe(
      "The simulation could not be sent. Check the selected hypothesis and subject, then try again.",
    );
  });

  it("resolves simulationError to a non-null message even for a failure that never reached the backend as an ApiError at all", async () => {
    stubFetch({
      [SIMULATE_PATH]: () => {
        throw new TypeError("network down");
      },
    });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.simulationError).not.toBeNull());

    expect(result.current.simulationError).toBe(
      "The simulation could not be sent. Check the selected hypothesis and subject, then try again.",
    );
  });
});

describe("useSimulateHypothesis — isSimulating reflects the mutation's pending state and gates a second concurrent dispatch (criterion 6)", () => {
  it("starts at false, becomes true while the dispatch is in flight, and returns to false once it settles", async () => {
    let resolveFetch: ((response: Response) => void) | undefined;
    const pending = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    stubFetch({ [SIMULATE_PATH]: () => pending });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    expect(result.current.isSimulating).toBe(false);

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.isSimulating).toBe(true));

    resolveFetch?.(jsonResponse(simulateHypothesisResult()));
    await waitFor(() => expect(result.current.isSimulating).toBe(false));
  });

  it("dispatches only one POST when onSimulate is called twice before the first call settles (edge case: two operations against one subject at once)", async () => {
    let resolveFetch: ((response: Response) => void) | undefined;
    const pending = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    const fetchMock = stubFetch({ [SIMULATE_PATH]: () => pending });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.isSimulating).toBe(true));

    expect(fetchMock.mock.calls.length).toBe(1);

    resolveFetch?.(jsonResponse(simulateHypothesisResult()));
    await waitFor(() => expect(result.current.isSimulating).toBe(false));
  });

  it("allows a fresh dispatch once a previous one has failed, rather than staying permanently gated", async () => {
    let shouldFail = true;
    const fetchMock = stubFetch({
      [SIMULATE_PATH]: () =>
        shouldFail ? errorResponse("SomeUpstreamError", 500) : jsonResponse(simulateHypothesisResult()),
    });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.simulationError).not.toBeNull());

    shouldFail = false;
    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(fetchMock.mock.calls.length).toBe(2);
  });
});

describe("useSimulateHypothesis — refuses to dispatch for an incomplete hypothesis name or subject (edge case: an operation against a state that forbids it)", () => {
  it("issues no request when the hypothesis name is blank", () => {
    const fetchMock = stubFetch({
      [SIMULATE_PATH]: () => jsonResponse(simulateHypothesisResult()),
    });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("   ", SUBJECT, REQUESTER);
    });

    expect(fetchMock.mock.calls.length).toBe(0);
    expect(result.current.isSimulating).toBe(false);
  });

  it("issues no request when the subject carries no attributes", () => {
    const fetchMock = stubFetch({
      [SIMULATE_PATH]: () => jsonResponse(simulateHypothesisResult()),
    });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", { type: "billing-dispute", attributes: [] }, REQUESTER);
    });

    expect(fetchMock.mock.calls.length).toBe(0);
  });
});
