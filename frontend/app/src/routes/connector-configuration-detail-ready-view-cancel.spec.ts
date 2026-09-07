import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  LOADED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  mountConnectorConfigurationDetailScreen,
  putCallCount,
} from "./connector-configuration-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ConnectorConfigurationDetailReadyView -- the footer's Cancel abandons authoring without registering (criterion 7; UNDERDETERMINED note: the listing route is never rendered as a control that submits the form)", () => {
  it("issues no PUT and returns to the connector-configurations listing when Cancel is clicked, even with unsaved edits -- a Cancel wired to submit before navigating would fail this", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    const router = await mountConnectorConfigurationDetailScreen(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");
    fireEvent.change(configurationField, { target: { value: '{"key":"changed"}' } });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
    expect(putCallCount(fetchMock)).toBe(0);
  });
});
