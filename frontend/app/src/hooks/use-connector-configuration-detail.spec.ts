import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useConnectorConfigurationDetail } from "./use-connector-configuration-detail";
import {
  CONFIGURATION_PATH,
  CONNECTOR,
  createWrapper,
  jsonResponse,
  errorResponse,
  LOADED_CONFIGURATION,
  loadErrorState,
  readyState,
  stubFetch,
  UPDATED_CONFIGURATION,
} from "./use-connector-configuration-detail.test-support";

// task/connector-capability-detail-editing/connector-configuration-detail-hook. This file proves
// the hook's own contract directly through renderHook, mirroring
// use-case-attributes-at-a-glance.spec.ts's own established convention for a hook with no view
// of its own: real Response objects through a stubbed global fetch (TST-03 -- only the network
// boundary is replaced), and assertions on nothing but what the hook itself returns (TST-01).
// The fixtures and helpers above live in use-connector-configuration-detail.test-support.ts,
// mirroring new-case-draft-screen.test-support.ts's own established pattern, so this file stays
// under this project's own max-lines rule.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useConnectorConfigurationDetail -- issuing its own GET, independent of the list cache (criterion 1)", () => {
  it("resolves the ready phase from its own direct GET, not from a connector-configurations list query the caller's cache already held for this same connector", async () => {
    const { Wrapper, queryClient } = createWrapper();
    // Seeds exactly the key use-connector-configurations.ts's own list hook reads, with a
    // different configuration for this same connector -- if this hook read from that cache
    // instead of issuing (and consuming) its own GET, the ready phase below would carry this
    // value instead.
    queryClient.setQueryData(["connector-configurations"], {
      data: [{ connector: CONNECTOR, configuration: '{"from":"list-cache"}' }],
    });
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });

    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(readyState(result.current).configuration.value).toBe(LOADED_CONFIGURATION);
  });
});

describe("useConnectorConfigurationDetail -- the loading | load-error | ready phase union (criterion 2)", () => {
  it('reports "loading" before the GET resolves, then "ready" once it does', async () => {
    let resolveGet!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveGet = resolve;
    });
    stubFetch({ [CONFIGURATION_PATH]: () => pending });

    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });

    expect(result.current.phase).toBe("loading");

    resolveGet(jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }));

    await waitFor(() => expect(result.current.phase).toBe("ready"));
  });
});

describe("useConnectorConfigurationDetail -- isDirty against the loaded-or-saved baseline (criterion 3)", () => {
  it("is false immediately after load, before any edit", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(readyState(result.current).isDirty).toBe(false);
  });

  it("becomes true once the configuration JSON text is edited to a materially different value", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).configuration.onChange(UPDATED_CONFIGURATION, true);
    });

    expect(readyState(result.current).isDirty).toBe(true);
  });

  it("becomes true once the connector form field is edited away from its loaded value, even while the configuration text stays unchanged -- proving isDirty also reads react-hook-form's own dirty tracking rather than only the configuration comparison", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).form.setValue("connector", "a-different-connector", {
        shouldDirty: true,
      });
    });

    expect(readyState(result.current).isDirty).toBe(true);
  });
});

describe("useConnectorConfigurationDetail -- comparing configuration text through its minified form (an inference the implementation recorded)", () => {
  it("does not read as dirty when the configuration text is only reformatted to an equivalent pretty-printed value", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    const prettyPrinted = JSON.stringify(JSON.parse(LOADED_CONFIGURATION), null, 2);
    act(() => {
      readyState(result.current).configuration.onChange(prettyPrinted, true);
    });

    expect(readyState(result.current).isDirty).toBe(false);
  });
});

describe("useConnectorConfigurationDetail -- returning to the baseline clears isDirty (criterion 4)", () => {
  it("clears isDirty once the configuration text is edited back to its exact loaded value", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).configuration.onChange(UPDATED_CONFIGURATION, true);
    });
    expect(readyState(result.current).isDirty).toBe(true);

    act(() => {
      readyState(result.current).configuration.onChange(LOADED_CONFIGURATION, true);
    });
    expect(readyState(result.current).isDirty).toBe(false);
  });

  it("clears isDirty once the connector form field is edited back to its exact loaded value", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).form.setValue("connector", "a-different-connector", {
        shouldDirty: true,
      });
    });
    expect(readyState(result.current).isDirty).toBe(true);

    act(() => {
      readyState(result.current).form.setValue("connector", CONNECTOR, { shouldDirty: true });
    });
    expect(readyState(result.current).isDirty).toBe(false);
  });
});

describe("useConnectorConfigurationDetail -- a successful save re-baselines and clears isDirty (criterion 5)", () => {
  it("clears isDirty right after a successful save, with no further edits", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: (method) =>
        method === "PUT"
          ? jsonResponse({ connector: CONNECTOR, configuration: UPDATED_CONFIGURATION })
          : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).configuration.onChange(UPDATED_CONFIGURATION, true);
    });
    expect(readyState(result.current).isDirty).toBe(true);

    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(readyState(result.current).isDirty).toBe(false));
  });
});

describe("useConnectorConfigurationDetail -- re-baselining from the values submitted, not the PUT response body (an inference the implementation recorded)", () => {
  it("keeps the submitted configuration text as the new baseline even when the PUT response answers configuration as an object rather than the submitted string", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: (method) =>
        method === "PUT"
          ? // Simulates the sibling backend bug this task's own Notes name: the PUT response
            // still answers `configuration` as an object rather than the JSON-string wire
            // shape only GET was fixed for.
            jsonResponse({ connector: CONNECTOR, configuration: { unexpected: "shape" } })
          : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).configuration.onChange(UPDATED_CONFIGURATION, true);
    });

    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(readyState(result.current).isDirty).toBe(false));
    expect(readyState(result.current).configuration.value).toBe(UPDATED_CONFIGURATION);
  });
});

describe("useConnectorConfigurationDetail -- a successful save invalidates both queries (criterion 6)", () => {
  it("invalidates both the connector-configurations list query and its own connector-configuration query once the save succeeds", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    stubFetch({
      [CONFIGURATION_PATH]: (method) =>
        method === "PUT"
          ? jsonResponse({ connector: CONNECTOR, configuration: UPDATED_CONFIGURATION })
          : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).configuration.onChange(UPDATED_CONFIGURATION, true);
    });
    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(readyState(result.current).isDirty).toBe(false));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["connector-configurations"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["connector-configuration", CONNECTOR],
    });
  });
});

describe("useConnectorConfigurationDetail -- reporting load-error with a retry action (criterion 7)", () => {
  it("reports the load-error phase, with a retryLoad function, when the GET fails", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.phase).toBe("load-error"));
    expect(typeof loadErrorState(result.current).retryLoad).toBe("function");
  });

  it("reports the load-error phase when the identified connector configuration does not exist", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () => errorResponse("ConnectorConfigurationNotFoundError", 404),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.phase).toBe("load-error"));
  });

  it("reissues the GET when retryLoad is called, resolving to ready once the failure clears", async () => {
    let shouldFail = true;
    const fetchMock = stubFetch({
      [CONFIGURATION_PATH]: () =>
        shouldFail
          ? errorResponse("SomeUpstreamError", 500)
          : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
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
