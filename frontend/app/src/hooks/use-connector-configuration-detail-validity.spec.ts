import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useConnectorConfigurationDetail,
  type ConnectorConfigurationDetailState,
} from "./use-connector-configuration-detail";
import {
  CONFIGURATION_PATH,
  CONNECTOR,
  createWrapper,
  jsonResponse,
  LOADED_CONFIGURATION,
  NON_OBJECT_CONFIGURATIONS,
  readyState,
  stubFetch,
  UPDATED_CONFIGURATION,
} from "./use-connector-configuration-detail.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function useLoggedConnectorConfigurationDetail(
  connector: string,
  log: ConnectorConfigurationDetailState[],
): ConnectorConfigurationDetailState {
  const state = useConnectorConfigurationDetail(connector);
  useEffect(() => {
    log.push(state);
  });
  return state;
}

describe("useConnectorConfigurationDetail -- configurationValid rejects a non-object parsed value right after load (criterion 1)", () => {
  it.each(NON_OBJECT_CONFIGURATIONS)(
    "reads configuration.isValid as false when the loaded configuration parses as $label rather than an object",
    async ({ text }) => {
      stubFetch({
        [CONFIGURATION_PATH]: () => jsonResponse({ connector: CONNECTOR, configuration: text }),
      });
      const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
        wrapper: createWrapper().Wrapper,
      });

      await waitFor(() => expect(result.current.phase).toBe("ready"));

      expect(readyState(result.current).configuration.isValid).toBe(false);
    },
  );
});

describe("useConnectorConfigurationDetail -- configurationValid continues to read true for an object right after load (criterion 2)", () => {
  it("reads configuration.isValid as true when the loaded configuration parses as a JSON object", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.phase).toBe("ready"));

    expect(readyState(result.current).configuration.isValid).toBe(true);
  });
});

describe("useConnectorConfigurationDetail -- the very first render reporting the ready phase already reflects a non-object configuration's invalidity", () => {
  it.each(NON_OBJECT_CONFIGURATIONS)(
    "carries configuration.isValid as false in the render log's first ready entry when the loaded configuration parses as $label rather than an object",
    async ({ text }) => {
      stubFetch({
        [CONFIGURATION_PATH]: () => jsonResponse({ connector: CONNECTOR, configuration: text }),
      });
      const log: ConnectorConfigurationDetailState[] = [];
      renderHook(() => useLoggedConnectorConfigurationDetail(CONNECTOR, log), {
        wrapper: createWrapper().Wrapper,
      });

      await waitFor(() => expect(log.some((entry) => entry.phase === "ready")).toBe(true));

      const firstReady = log.find((entry) => entry.phase === "ready");
      if (!firstReady) {
        throw new Error("expected a ready-phase entry in the render log");
      }
      expect(readyState(firstReady).configuration.isValid).toBe(false);
    },
  );
});

describe("useConnectorConfigurationDetail -- the very first render reporting the ready phase already reflects an object configuration's validity", () => {
  it("carries configuration.isValid as true in the render log's first ready entry when the loaded configuration parses as a JSON object", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const log: ConnectorConfigurationDetailState[] = [];
    renderHook(() => useLoggedConnectorConfigurationDetail(CONNECTOR, log), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(log.some((entry) => entry.phase === "ready")).toBe(true));

    const firstReady = log.find((entry) => entry.phase === "ready");
    if (!firstReady) {
      throw new Error("expected a ready-phase entry in the render log");
    }
    expect(readyState(firstReady).configuration.isValid).toBe(true);
  });
});

describe("useConnectorConfigurationDetail -- configurationValid rejects a non-object parsed value once the operator edits the field (criterion 1)", () => {
  it.each(NON_OBJECT_CONFIGURATIONS)(
    "reads configuration.isValid as false once the field is edited to $label rather than an object",
    async ({ text }) => {
      stubFetch({
        [CONFIGURATION_PATH]: () =>
          jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
      });
      const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
        wrapper: createWrapper().Wrapper,
      });
      await waitFor(() => expect(result.current.phase).toBe("ready"));

      act(() => {
        readyState(result.current).configuration.onChange(text, true);
      });

      expect(readyState(result.current).configuration.isValid).toBe(false);
    },
  );
});

describe("useConnectorConfigurationDetail -- configurationValid continues to read true for an object once the operator edits the field (criterion 2)", () => {
  it("reads configuration.isValid as true once the field is edited to a different JSON object", async () => {
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

    expect(readyState(result.current).configuration.isValid).toBe(true);
  });

  it("recovers configuration.isValid to true once a non-object edit is corrected back to a JSON object", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).configuration.onChange("[1,2,3]", true);
    });
    expect(readyState(result.current).configuration.isValid).toBe(false);

    act(() => {
      readyState(result.current).configuration.onChange(UPDATED_CONFIGURATION, true);
    });

    expect(readyState(result.current).configuration.isValid).toBe(true);
  });
});
