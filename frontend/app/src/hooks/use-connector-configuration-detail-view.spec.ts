import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useConnectorConfigurationDetailView } from "./use-connector-configuration-detail-view";
import {
  CONFIGURATION_PATH,
  CONNECTOR,
  FURTHER_CONFIGURATION,
  LOADED_CONFIGURATION,
  UPDATED_CONFIGURATION,
  createWrapper,
  errorResponse,
  jsonResponse,
  readyState,
  stubFetch,
} from "./use-connector-configuration-detail-view.test-support";

// task/connector-capability-detail-editing/connector-configuration-detail-route's own hook-level
// proof for the two behaviors this composition hook adds over the already-delivered
// useConnectorConfigurationDetail: onDiscard (criterion 5) and justSaved (criterion 7). Mirrors
// use-connector-configuration-detail.spec.ts's own established convention -- renderHook, real
// Response objects through a stubbed global fetch, assertions on nothing but what this hook
// itself returns (TST-01). The screen-level wiring of these two fields into markup (the Discard
// button, the "Saved." acknowledgement) is proved separately in
// connector-configuration-detail-screen-discard.spec.ts and
// connector-configuration-detail-screen-save.spec.ts.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useConnectorConfigurationDetailView -- onDiscard resets every field to the most recently loaded-or-saved values (criterion 5)", () => {
  it("resets the edited configuration text back to its loaded value and clears isDirty", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetailView(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).configuration.onChange(UPDATED_CONFIGURATION, true);
    });
    expect(readyState(result.current).isDirty).toBe(true);

    act(() => {
      readyState(result.current).onDiscard();
    });

    expect(readyState(result.current).configuration.value).toBe(LOADED_CONFIGURATION);
    expect(readyState(result.current).isDirty).toBe(false);
  });

  it("resets the connector field back to this route's own identity through form.reset", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetailView(CONNECTOR), {
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
      readyState(result.current).onDiscard();
    });

    expect(readyState(result.current).form.getValues("connector")).toBe(CONNECTOR);
    expect(readyState(result.current).isDirty).toBe(false);
  });
});

describe("useConnectorConfigurationDetailView -- onDiscard resets to what was just saved rather than the original pre-save value (an inference the implementation recorded)", () => {
  it("discards back to the just-saved configuration after a successful save, not the value loaded before it", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: (method) =>
        method === "PUT"
          ? jsonResponse({ connector: CONNECTOR, configuration: UPDATED_CONFIGURATION })
          : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetailView(CONNECTOR), {
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

    act(() => {
      readyState(result.current).configuration.onChange(FURTHER_CONFIGURATION, true);
    });
    expect(readyState(result.current).isDirty).toBe(true);

    act(() => {
      readyState(result.current).onDiscard();
    });

    // If discard fell back to the value originally loaded rather than the value just saved,
    // this would read LOADED_CONFIGURATION instead.
    expect(readyState(result.current).configuration.value).toBe(UPDATED_CONFIGURATION);
  });
});

describe("useConnectorConfigurationDetailView -- justSaved (criterion 7)", () => {
  it("is false before any save has happened", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetailView(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    expect(readyState(result.current).justSaved).toBe(false);
  });

  it("becomes true the instant a save succeeds", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: (method) =>
        method === "PUT"
          ? jsonResponse({ connector: CONNECTOR, configuration: UPDATED_CONFIGURATION })
          : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetailView(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).configuration.onChange(UPDATED_CONFIGURATION, true);
    });
    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(readyState(result.current).justSaved).toBe(true));
  });

  it("clears once the operator edits again after a save, so the acknowledgement never outlives what it acknowledged", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: (method) =>
        method === "PUT"
          ? jsonResponse({ connector: CONNECTOR, configuration: UPDATED_CONFIGURATION })
          : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetailView(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).configuration.onChange(UPDATED_CONFIGURATION, true);
    });
    act(() => {
      readyState(result.current).onSubmit();
    });
    await waitFor(() => expect(readyState(result.current).justSaved).toBe(true));

    act(() => {
      readyState(result.current).configuration.onChange(FURTHER_CONFIGURATION, true);
    });

    expect(readyState(result.current).justSaved).toBe(false);
  });

  it("stays false while a save is still pending, only turning true once that same save actually resolves (edge case: a slow dependency)", async () => {
    let resolvePut!: (response: Response) => void;
    const pendingPut = new Promise<Response>((resolve) => {
      resolvePut = resolve;
    });
    stubFetch({
      [CONFIGURATION_PATH]: (method) =>
        method === "PUT"
          ? pendingPut
          : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetailView(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).configuration.onChange(UPDATED_CONFIGURATION, true);
    });
    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(readyState(result.current).isSubmitting).toBe(true));
    expect(readyState(result.current).justSaved).toBe(false);

    await act(async () => {
      resolvePut(jsonResponse({ connector: CONNECTOR, configuration: UPDATED_CONFIGURATION }));
    });
    await waitFor(() => expect(readyState(result.current).justSaved).toBe(true));
  });
});

// task/connector-test-panel-reads-registered-configuration/thread-registered-configuration-into-test-panel's
// own criterion 1: the "ready" phase exposes registeredConfigurationText, the most recently
// loaded-or-saved configuration text -- the same snapshot onDiscard already reads above -- as a
// field distinct from configuration.value (the live, possibly-unsaved edit).
describe("useConnectorConfigurationDetailView -- registeredConfigurationText is the most recently loaded-or-saved configuration text, distinct from configuration.value (criterion 1)", () => {
  it("equals the just-loaded configuration text immediately after this connector's own record loads", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetailView(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    expect(readyState(result.current).registeredConfigurationText).toBe(LOADED_CONFIGURATION);
  });

  it("stays at the last loaded-or-saved text after an edit that has not been saved, diverging from configuration.value's own edited value", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetailView(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).configuration.onChange(UPDATED_CONFIGURATION, true);
    });

    // If registeredConfigurationText mirrored the live edit instead of the last registered
    // snapshot, this would read UPDATED_CONFIGURATION instead -- the same value
    // configuration.value now carries.
    expect(readyState(result.current).registeredConfigurationText).toBe(LOADED_CONFIGURATION);
    expect(readyState(result.current).configuration.value).toBe(UPDATED_CONFIGURATION);
  });

  it("updates to the just-saved text once a save succeeds", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: (method) =>
        method === "PUT"
          ? jsonResponse({ connector: CONNECTOR, configuration: UPDATED_CONFIGURATION })
          : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetailView(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).configuration.onChange(UPDATED_CONFIGURATION, true);
    });
    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() =>
      expect(readyState(result.current).registeredConfigurationText).toBe(UPDATED_CONFIGURATION),
    );
  });

  it("stays at the last loaded-or-saved text when a save fails, rather than the edit that failed to save (edge case: a dependency that fails)", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: (method) =>
        method === "PUT"
          ? errorResponse("SomeUpstreamError", 500)
          : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetailView(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).configuration.onChange(UPDATED_CONFIGURATION, true);
    });
    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(readyState(result.current).isSubmitting).toBe(false));
    expect(readyState(result.current).registeredConfigurationText).toBe(LOADED_CONFIGURATION);
    expect(readyState(result.current).isDirty).toBe(true);
  });
});
