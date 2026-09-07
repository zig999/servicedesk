import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  createFetchStub as createCreateScreenFetchStub,
  mountConnectorConfigurationCreateScreen,
} from "./connector-configuration-create-screen.test-support";
import {
  LOADED_CONFIGURATION,
  baseHandlers as detailScreenBaseHandlers,
  createFetchStub as createDetailScreenFetchStub,
  mountConnectorConfigurationDetailScreen,
} from "./connector-configuration-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ConnectorConfigurationFormFields -- the action row is one Actions group rather than a plain trailing row (criterion 1)", () => {
  it("renders Save inside a group named Actions", async () => {
    const fetchMock = createCreateScreenFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("button", { name: "Save" })).toBeTruthy();
  });
});

describe("ConnectorConfigurationFormFields -- whatever a screen passes through trailingActions renders beside Save, inside that same group (criterion 2)", () => {
  it("renders the create screen's own Cancel and Connectors controls beside Save, inside the Actions group", async () => {
    const fetchMock = createCreateScreenFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("button", { name: "Save" })).toBeTruthy();
    expect(within(footer).getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(within(footer).getByRole("link", { name: "Connectors" })).toBeTruthy();
  });

  it("renders the detail surface's own Discard and Cancel controls beside Save, inside the same Actions group", async () => {
    const fetchMock = createDetailScreenFetchStub(detailScreenBaseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("button", { name: "Save" })).toBeTruthy();
    expect(within(footer).getByRole("button", { name: "Discard changes" })).toBeTruthy();
    expect(within(footer).getByText("Cancel")).toBeTruthy();
  });
});

describe("ConnectorConfigurationCreateScreen -- the footer Connectors link is the screen's only route to the listing (criterion 1, criterion 8)", () => {
  it("renders exactly one link on the screen, the footer's Connectors link, resolving to /connectors", async () => {
    const fetchMock = createCreateScreenFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    const footer = screen.getByRole("group", { name: "Actions" });
    const links = screen.getAllByRole("link");

    expect(links).toHaveLength(1);
    expect(within(footer).getByRole("link", { name: "Connectors" })).toBe(links[0]);
    expect(links[0].getAttribute("href")).toBe("/connectors");
  });
});
