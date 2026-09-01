import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  LOADED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  mountConnectorConfigurationDetailScreen,
} from "./connector-configuration-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ConnectorConfigurationDetailScreen -- the configuration field keeps its 160px/10rem height (criterion 3)", () => {
  it("renders the Configuration field's Textarea with the shared component's own 10rem default minimum-height class, not the capability screen's taller variant", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    const configurationField = screen.getByLabelText<HTMLTextAreaElement>("Configuration");

    expect(configurationField.className).toContain("min-h-40");

    expect(configurationField.className).not.toContain("min-h-[12.5rem]");
  });
});
