import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  CONNECTORS_PATH,
  callsToPath,
  connectorConfiguration,
  connectorConfigurationsPage,
  createConnectorConfigurationsFetchStub,
  jsonResponse,
  mountConnectorConfigurationsScreen,
  putCallCount,
} from "./connector-configurations-screen.test-support";

// Proof for task/connector-configuration-authoring/connector-configuration-create-edit-form's
// own criteria 2, 3 and 4's own field wiring -- the "New connector configuration" action opening
// a blank form for connector and configuration, each row's own Edit action opening the same form
// pre-filled with that row's own current name and configuration, the configuration field edited
// through the shared JSON beautify/minify textarea, and the delivery record's own disclosed
// inference that connector is disabled (not merely pre-filled) in edit mode. Criteria 4's own
// minified-persist half and criterion 5 (save behavior) live in the sibling
// connector-configurations-screen-form-save.spec.ts -- split this way to stay under this
// project's own max-lines rule (MNT-01). Both share connector-configurations-screen.test-support.ts's
// own fixtures and mounting helper.

afterEach(() => {
  vi.unstubAllGlobals();
});

async function mountEmptyScreen(
  handlers: Partial<Record<string, () => Response | Promise<Response>>> = {},
): Promise<void> {
  const fetchMock = createConnectorConfigurationsFetchStub({
    [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([])),
    ...handlers,
  });
  await mountConnectorConfigurationsScreen(fetchMock);
  await screen.findByText("No connector configurations are currently registered.");
}

describe('ConnectorConfigurationsScreen — "New connector configuration" opens a blank form (criterion 2)', () => {
  it("opens a Dialog titled for a new connector configuration, with connector empty and enabled", async () => {
    await mountEmptyScreen();

    fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("New connector configuration")).toBeTruthy();
    const connectorInput = await within(dialog).findByLabelText<HTMLInputElement>("Connector");
    expect(connectorInput.value).toBe("");
    expect(connectorInput.hasAttribute("disabled")).toBe(false);
  });

  it("renders the configuration field empty through the shared Configuration control", async () => {
    await mountEmptyScreen();

    fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));

    const dialog = await screen.findByRole("dialog");
    const configurationField = await within(dialog).findByLabelText<HTMLTextAreaElement>(
      "Configuration",
    );
    expect(configurationField.value).toBe("");
  });
});

describe("ConnectorConfigurationsScreen — each row's own Edit action opens the same form, pre-filled (criterion 3)", () => {
  it("opens a Dialog whose connector and configuration fields already hold that row's own current values", async () => {
    const target = connectorConfiguration({
      connector: "deepl-connector",
      configuration: '{"apiKey":"secret"}',
    });
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([target])),
    });
    await mountConnectorConfigurationsScreen(fetchMock);
    await screen.findByText("deepl-connector");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const dialog = await screen.findByRole("dialog");
    expect(await within(dialog).findByText('Edit connector configuration "deepl-connector"')).toBeTruthy();
    expect(
      (await within(dialog).findByLabelText<HTMLInputElement>("Connector")).value,
    ).toBe("deepl-connector");
    expect(
      within(dialog).getByLabelText<HTMLTextAreaElement>("Configuration").value,
    ).toBe('{"apiKey":"secret"}');
  });

  it("issues no second network request beyond the initial GET /v1/connectors when a row's own Edit action is opened", async () => {
    const target = connectorConfiguration({ connector: "deepl-connector" });
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([target])),
    });
    await mountConnectorConfigurationsScreen(fetchMock);
    await screen.findByText("deepl-connector");
    expect(callsToPath(fetchMock, CONNECTORS_PATH)).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await screen.findByRole("dialog");

    expect(callsToPath(fetchMock, CONNECTORS_PATH)).toHaveLength(1);
  });
});

describe("ConnectorConfigurationsScreen — editing a connector configuration disables the connector field (disclosed inference)", () => {
  it("renders the connector field disabled while editing, so its identity cannot be changed", async () => {
    const target = connectorConfiguration({ connector: "deepl-connector" });
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([target])),
    });
    await mountConnectorConfigurationsScreen(fetchMock);
    await screen.findByText("deepl-connector");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const dialog = await screen.findByRole("dialog");
    const connectorInput = await within(dialog).findByLabelText<HTMLInputElement>("Connector");
    expect(connectorInput.hasAttribute("disabled")).toBe(true);
  });

  it("leaves the connector field enabled while creating, unlike the edit-mode case above", async () => {
    await mountEmptyScreen();

    fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));

    const dialog = await screen.findByRole("dialog");
    const connectorInput = await within(dialog).findByLabelText<HTMLInputElement>("Connector");
    expect(connectorInput.hasAttribute("disabled")).toBe(false);
  });
});

describe("ConnectorConfigurationsScreen — the configuration field is the shared JSON beautify/minify textarea (criterion 4)", () => {
  it("offers a Beautify control beside the configuration field, the shared control's own signature affordance", async () => {
    await mountEmptyScreen();

    fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));

    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByLabelText("Configuration");
    expect(within(dialog).getByRole("button", { name: "Beautify" })).toBeTruthy();
  });
});

describe("ConnectorConfigurationsScreen — connector is required (schema presupposition)", () => {
  it("blocks submission and issues no PUT when connector is left blank", async () => {
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([])),
    });
    await mountConnectorConfigurationsScreen(fetchMock);
    await screen.findByText("No connector configurations are currently registered.");

    fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));
    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByLabelText("Connector");
    fireEvent.change(within(dialog).getByLabelText("Configuration"), {
      target: { value: "{}" },
    });

    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await screen.findByRole("alert");
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(putCallCount(fetchMock)).toBe(0);
  });
});
