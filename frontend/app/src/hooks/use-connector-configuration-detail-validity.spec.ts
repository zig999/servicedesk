import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useConnectorConfigurationDetail } from "./use-connector-configuration-detail";
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

// task/detail-screen-corrections/configuration-validity-check. Proves configurationValid now
// rejects a syntactically valid JSON value that is not an object
// (rules/integration/a-connector-configuration-holds-a-well-formed-object) -- both right after
// load and once the operator edits the field, the two call sites
// isValidConfigurationObject (use-connector-configuration-detail.ts) now gates -- and that it
// continues to read true for a genuine JSON object at both moments. Split into its own file,
// sharing use-connector-configuration-detail.test-support.ts's own fixtures and helpers with
// use-connector-configuration-detail.spec.ts, to stay under this project's own max-lines rule
// (MNT-01), the same convention connector-configuration-detail-screen.spec.ts's own save/discard
// siblings and use-capability-detail-save.spec.ts already establish.

afterEach(() => {
  vi.unstubAllGlobals();
});

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
