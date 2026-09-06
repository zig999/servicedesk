import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  connectorPutPath,
  createFetchStub,
  jsonResponse,
  mountConnectorConfigurationCreateScreen,
  putCallCount,
} from "./connector-configuration-create-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ConnectorConfigurationCreateScreen -- offers no discard control, having read no registration (criterion 6)", () => {
  it("renders no Discard changes control", async () => {
    const fetchMock = createFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    expect(screen.queryByRole("button", { name: "Discard changes" })).toBeNull();
  });
});

describe("ConnectorConfigurationCreateScreen -- the footer's Cancel abandons authoring without registering (criterion 7; UNDERDETERMINED note: the listing route is never rendered as a control that submits the form)", () => {
  it("issues no PUT and returns to the connector-configurations listing when Cancel is clicked, even after the form was filled in -- a Cancel wired to submit before navigating would fail this", async () => {
    const fetchMock = createFetchStub({
      [connectorPutPath("deepl-connector")]: () =>
        jsonResponse({ connector: "deepl-connector", configuration: "{}" }),
    });
    const router = await mountConnectorConfigurationCreateScreen(fetchMock);
    const connectorInput = await screen.findByLabelText<HTMLInputElement>("Connector");
    fireEvent.change(connectorInput, { target: { value: "deepl-connector" } });
    const configurationField = screen.getByLabelText<HTMLTextAreaElement>("Configuration");
    fireEvent.change(configurationField, { target: { value: "{}" } });

    fireEvent.click(screen.getByRole("link", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
    expect(putCallCount(fetchMock)).toBe(0);
  });
});
