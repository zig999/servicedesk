import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  LOADED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  mountConnectorConfigurationDetailScreen,
} from "./connector-configuration-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ConnectorConfigurationDetailReadyView -- the Actions footer holds only Save and the trailing controls, never the connector test panel (criterion 2)", () => {
  it("renders the Test heading outside the Actions group, alongside Save rather than inside it", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    expect(screen.getByRole("heading", { name: "Test" })).toBeTruthy();
    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).queryByRole("heading", { name: "Test" })).toBeNull();
  });
});
