import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  CONNECTORS_PATH,
  connectorConfigurationsPage,
  createConnectorConfigurationsFetchStub,
  jsonResponse,
  mountConnectorConfigurationsScreen,
  putCallCount,
} from "./connector-configurations-screen.test-support";

// Proof for task/connector-configuration-authoring/connector-configuration-create-edit-form's
// own criterion 2 and criterion 4's own field wiring -- the "New connector configuration" action
// opening a blank form for connector and configuration, and the configuration field edited
// through the shared JSON beautify/minify textarea. Criteria 4's own minified-persist half and
// criterion 5 (save behavior) live in the sibling connector-configurations-screen-form-save.spec.ts
// -- split this way to stay under this project's own max-lines rule (MNT-01). Both share
// connector-configurations-screen.test-support.ts's own fixtures and mounting helper.
//
// Criterion 3 (each row's own Edit action opening the same form, pre-filled) and the
// disclosed-inference test over its own disabled connector field are retired below --
// task/connector-capability-detail-editing/connector-configuration-detail-route (criteria 2 and 9)
// removed this screen's own per-row "Edit" button and its in-page edit dialog entirely, replacing
// them with a row click that navigates to the routed detail screen instead
// (connector-configurations-screen.tsx's own header comment). That routed screen's own proof --
// connector-configuration-detail-screen.spec.ts -- already covers the equivalent pre-filled,
// disabled-identity and pretty-printed-on-load behavior this screen no longer has any UI left to
// reach.

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

describe("ConnectorConfigurationsScreen — editing a connector configuration disables the connector field (disclosed inference)", () => {
  it("leaves the connector field enabled while creating, unlike the edit-mode case connector-configuration-detail-screen.spec.ts's own proof covers", async () => {
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
