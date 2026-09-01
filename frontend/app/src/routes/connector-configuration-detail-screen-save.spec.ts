import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  LOADED_CONFIGURATION,
  UPDATED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  mountConnectorConfigurationDetailScreen,
  parsedPutBody,
  prettyPrinted,
  putCallCount,
} from "./connector-configuration-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

async function mountReady(): Promise<{
  fetchMock: ReturnType<typeof createFetchStub>;
  configurationField: HTMLTextAreaElement;
}> {
  const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
  await mountConnectorConfigurationDetailScreen(fetchMock);
  const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");
  return { fetchMock, configurationField };
}

describe("ConnectorConfigurationDetailScreen -- Save is gated on isDirty (criterion 4)", () => {
  it("disables Save immediately after load, before any edit", async () => {
    await mountReady();

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
  });

  it("enables Save once the configuration is edited to a materially different value", async () => {
    const { configurationField } = await mountReady();

    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(false);
  });

  it("re-disables Save once the edited configuration is returned to its exact originally loaded value", async () => {
    const { configurationField } = await mountReady();

    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(false);

    fireEvent.change(configurationField, {
      target: { value: prettyPrinted(LOADED_CONFIGURATION) },
    });

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
  });
});

describe("ConnectorConfigurationDetailScreen -- a successful save (criterion 7)", () => {
  it("shows an inline success acknowledgement and keeps the screen showing the just-saved value", async () => {
    const { configurationField, fetchMock } = await mountReady();

    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual({ configuration: UPDATED_CONFIGURATION });
    expect(await screen.findByRole("status")).toBeTruthy();
    expect(screen.getByText("Saved.")).toBeTruthy();

    expect(JSON.parse(configurationField.value)).toEqual(JSON.parse(UPDATED_CONFIGURATION));
  });

  it("re-disables Save immediately after the save succeeds, with no further edits", async () => {
    const { configurationField } = await mountReady();

    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByText("Saved.");
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
  });

  it("clears the acknowledgement once the operator edits again, so it never outlives the values it acknowledged", async () => {
    const { configurationField } = await mountReady();

    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText("Saved.");

    fireEvent.change(configurationField, { target: { value: '{"key":"further"}' } });

    expect(screen.queryByText("Saved.")).toBeNull();
  });
});
