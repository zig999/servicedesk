import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from "sonner";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  connectorPutPath,
  createFetchStub,
  jsonResponse,
  mountConnectorConfigurationCreateScreen,
} from "./connector-configuration-create-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.success).mockClear();
});

async function fillForm(connector: string, configuration: string): Promise<void> {
  const connectorInput = await screen.findByLabelText<HTMLInputElement>("Connector");
  fireEvent.change(connectorInput, { target: { value: connector } });
  const configurationField = screen.getByLabelText<HTMLTextAreaElement>("Configuration");
  fireEvent.change(configurationField, { target: { value: configuration } });
}

describe("ConnectorConfigurationCreateScreen -- a successful registration states its outcome, naming the connector submitted (criterion 4)", () => {
  it("shows a success statement naming the registered connector once the registry answers", async () => {
    const fetchMock = createFetchStub({
      [connectorPutPath("deepl-connector")]: () =>
        jsonResponse({ connector: "deepl-connector", configuration: "{}" }),
    });
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await fillForm("deepl-connector", "{}");

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Connector configuration deepl-connector registered."),
    );
  });
});

describe("ConnectorConfigurationCreateScreen -- states no outcome before the registry has answered (task's own UNDERDETERMINED note)", () => {
  it("shows no success statement while the registration is still pending -- an implementation stating success at the moment Save is pressed would fail this", async () => {
    let resolvePut!: (response: Response) => void;
    const pendingPut = new Promise<Response>((resolve) => {
      resolvePut = resolve;
    });
    const fetchMock = createFetchStub({
      [connectorPutPath("deepl-connector")]: () => pendingPut,
    });
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await fillForm("deepl-connector", "{}");

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true),
    );
    expect(toast.success).not.toHaveBeenCalled();

    resolvePut(jsonResponse({ connector: "deepl-connector", configuration: "{}" }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Connector configuration deepl-connector registered."),
    );
  });
});
