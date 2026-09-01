import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCapabilityDetail } from "./use-capability-detail";
import {
  CAPABILITY_PATH,
  CONCEPTS_PATH,
  CONCEPTS_RESPONSE,
  LOADED_CAPABILITY,
  NAME,
  VERSION,
  createWrapper,
  defaultHandlers,
  errorResponse,
  jsonResponse,
  loadErrorState,
  readyState,
  stubFetch,
} from "./use-capability-detail.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCapabilityDetail -- reporting load-error with a retry action (criterion 7)", () => {
  it("reports the load-error phase, with a retryLoad function, when the GET fails", async () => {
    stubFetch(
      defaultHandlers({ [CAPABILITY_PATH]: () => errorResponse("SomeUpstreamError", 500) }),
    );
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.phase).toBe("load-error"));
    expect(typeof loadErrorState(result.current).retryLoad).toBe("function");
  });

  it("reports the load-error phase when the identified (name, version) capability does not exist", async () => {
    stubFetch(
      defaultHandlers({
        [CAPABILITY_PATH]: () => errorResponse("CapabilityIdentityNotFoundError", 404),
      }),
    );
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.phase).toBe("load-error"));
  });

  it("reissues the GET when retryLoad is called, resolving to ready once the failure clears", async () => {
    let shouldFail = true;
    const fetchMock = stubFetch(
      defaultHandlers({
        [CAPABILITY_PATH]: () =>
          shouldFail ? errorResponse("SomeUpstreamError", 500) : jsonResponse(LOADED_CAPABILITY),
      }),
    );
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("load-error"));
    const callsBeforeRetry = fetchMock.mock.calls.length;

    shouldFail = false;
    act(() => {
      loadErrorState(result.current).retryLoad();
    });

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBeforeRetry));
    await waitFor(() => expect(result.current.phase).toBe("ready"));
  });
});

describe("useCapabilityDetail -- bundling the concept vocabulary into the ready phase (an inference the implementation recorded)", () => {
  it("exposes the concept vocabulary this hook itself reads, once both reads resolve", async () => {
    stubFetch(defaultHandlers());
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(readyState(result.current).conceptOptions).toEqual(CONCEPTS_RESPONSE.data);
  });

  it("reports the load-error phase when the concept vocabulary read fails, even though the capability identity GET itself succeeds", async () => {
    stubFetch(
      defaultHandlers({ [CONCEPTS_PATH]: () => errorResponse("SomeUpstreamError", 500) }),
    );
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.phase).toBe("load-error"));
  });

  it("reissues the concept vocabulary read when retryLoad is called after only that read failed, resolving to ready once it succeeds", async () => {
    let conceptsShouldFail = true;
    stubFetch(
      defaultHandlers({
        [CONCEPTS_PATH]: () =>
          conceptsShouldFail
            ? errorResponse("SomeUpstreamError", 500)
            : jsonResponse(CONCEPTS_RESPONSE),
      }),
    );
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("load-error"));

    conceptsShouldFail = false;
    act(() => {
      loadErrorState(result.current).retryLoad();
    });

    await waitFor(() => expect(result.current.phase).toBe("ready"));
  });
});

describe("useCapabilityDetail -- exposing no isEditingIdentity flag (an inference the implementation recorded)", () => {
  it("does not carry an isEditingIdentity property on its ready-phase state", async () => {
    stubFetch(defaultHandlers());
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect("isEditingIdentity" in readyState(result.current)).toBe(false);
  });
});
