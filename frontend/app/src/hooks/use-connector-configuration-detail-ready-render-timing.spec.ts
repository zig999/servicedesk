import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
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
  readyState,
  stubFetch,
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

function firstReadyEntry(
  log: readonly ConnectorConfigurationDetailState[],
): ConnectorConfigurationDetailState {
  const entry = log.find((candidate) => candidate.phase === "ready");
  if (!entry) {
    throw new Error("expected a ready-phase entry in the render log");
  }
  return entry;
}

describe("useConnectorConfigurationDetail -- the very first render reporting the ready phase already carries the loaded configuration text (criterion 3, this task)", () => {
  it("carries configuration.value equal to the loaded configuration in the render log's first ready entry", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const log: ConnectorConfigurationDetailState[] = [];
    renderHook(() => useLoggedConnectorConfigurationDetail(CONNECTOR, log), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(log.some((entry) => entry.phase === "ready")).toBe(true));

    expect(readyState(firstReadyEntry(log)).configuration.value).toBe(LOADED_CONFIGURATION);
  });
});

describe("useConnectorConfigurationDetail -- the connector name lands together with the configuration text once a different connector's own record loads into the same hook instance (an underdetermined note in this task)", () => {
  it("carries the newly loaded connector's own name in form.getValues('connector'), not the previous connector's, in the render log's first ready entry that already shows the new configuration text", async () => {
    const OTHER_CONNECTOR = "another-connector";
    const OTHER_CONFIGURATION_PATH = `/v1/connectors/${OTHER_CONNECTOR}`;
    const OTHER_CONFIGURATION = '{"key":"other"}';
    stubFetch({
      [CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
      [OTHER_CONFIGURATION_PATH]: () =>
        jsonResponse({ connector: OTHER_CONNECTOR, configuration: OTHER_CONFIGURATION }),
    });
    const log: ConnectorConfigurationDetailState[] = [];
    const { rerender } = renderHook(
      ({ connector }: { connector: string }) =>
        useLoggedConnectorConfigurationDetail(connector, log),
      { wrapper: createWrapper().Wrapper, initialProps: { connector: CONNECTOR } },
    );
    await waitFor(() => expect(log.some((entry) => entry.phase === "ready")).toBe(true));

    log.length = 0;
    rerender({ connector: OTHER_CONNECTOR });

    await waitFor(() =>
      expect(
        log.some(
          (entry) =>
            entry.phase === "ready" && readyState(entry).configuration.value === OTHER_CONFIGURATION,
        ),
      ).toBe(true),
    );

    const firstReadyForOther = log.find(
      (entry) =>
        entry.phase === "ready" && readyState(entry).configuration.value === OTHER_CONFIGURATION,
    );
    if (!firstReadyForOther) {
      throw new Error(
        "expected a ready-phase entry carrying the newly loaded connector's configuration",
      );
    }
    expect(readyState(firstReadyForOther).form.getValues("connector")).toBe(OTHER_CONNECTOR);
  });
});
