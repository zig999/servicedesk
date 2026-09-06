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
  it("renders the create screen's own Cancel control beside Save, inside the Actions group", async () => {
    const fetchMock = createCreateScreenFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("button", { name: "Save" })).toBeTruthy();
    expect(within(footer).getByRole("link", { name: "Cancel" })).toBeTruthy();
  });

  it("renders the detail surface's own Discard and Cancel controls beside Save, inside the same Actions group", async () => {
    const fetchMock = createDetailScreenFetchStub(detailScreenBaseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("button", { name: "Save" })).toBeTruthy();
    expect(within(footer).getByRole("button", { name: "Discard changes" })).toBeTruthy();
    expect(within(footer).getByRole("link", { name: "Cancel" })).toBeTruthy();
  });
});

describe("ConnectorConfigurationCreateScreen -- Cancel and the pre-existing listing route stay two distinct controls (disclosed inference)", () => {
  it("renders both a top-of-screen 'Back to connector configurations' link and a separate footer Cancel link, though both resolve to the same destination today", async () => {
    const fetchMock = createCreateScreenFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    const backLink = screen.getByRole("link", { name: "Back to connector configurations" });
    const footer = screen.getByRole("group", { name: "Actions" });
    const cancelLink = within(footer).getByRole("link", { name: "Cancel" });

    expect(backLink).not.toBe(cancelLink);
    expect(backLink.getAttribute("href")).toBe("/connectors");
    expect(cancelLink.getAttribute("href")).toBe("/connectors");
  });
});
