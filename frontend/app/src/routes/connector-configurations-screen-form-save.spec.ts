import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";

// sonner is the toast boundary use-connector-configuration-form.ts's own onError handler calls
// into -- mocking it here (mirroring capabilities-browser-screen-capability-form-save.spec.ts's
// own established convention) intercepts that call directly, so these assertions never depend on
// a real Toaster mounting anything -- connector-configurations-screen.test-support.ts's own
// mounting helper does not mount AppShell/Toaster at all.
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import { toast } from "sonner";
import {
  CONNECTORS_PATH,
  connectorConfiguration,
  connectorConfigurationsPage,
  connectorPutPath,
  createConnectorConfigurationsFetchStub,
  jsonResponse,
  mountConnectorConfigurationsScreen,
  parsedPutBody,
  putCallCount,
} from "./connector-configurations-screen.test-support";

// Proof for task/connector-configuration-authoring/connector-configuration-create-edit-form's
// own criterion 4's own persist half ("the value persisted on save is the minified JSON") and
// criterion 5's own create half ("A successful create ... replaces whatever configuration
// previously answered to that name, and the screen reflects the current configuration
// afterward"), plus the delivery record's own disclosed inference that the one new save-failure
// message (connector-configuration-not-well-formed) is distinguishable from the shared generic
// fallback, and the double-submit guard use-connector-configuration-form.ts's own header comment
// documents -- all now proved through the "New connector configuration" create path alone.
// Criterion 5's own edit half moved to connector-configuration-detail-screen-save.spec.ts's own
// proof: task/connector-capability-detail-editing/connector-configuration-detail-route (criteria
// 2 and 9) removed this screen's own per-row "Edit" button and its in-page edit dialog entirely,
// replacing them with a row click that navigates to the routed detail screen instead
// (connector-configurations-screen.tsx's own header comment) -- the not-well-formed, generic-
// fallback and double-submit-guard tests below used that same removed action only as a shortcut
// to a pre-filled dialog, and are rewritten below to reach the still-available create path
// instead, since none of those three behaviors are specific to edit mode.
// Criteria 2, 3 and 4's own field-wiring half live in the sibling
// connector-configurations-screen-form.spec.ts -- split this way to stay under this project's
// own max-lines rule (MNT-01). Both share connector-configurations-screen.test-support.ts's own
// fixtures and mounting helper.

const GENERIC_MESSAGE =
  "Something went wrong while saving this connector configuration. Try again.";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

describe("ConnectorConfigurationsScreen — a successful create persists the connector configuration and the list reflects it (criterion 5)", () => {
  it("issues PUT /v1/connectors/{connector}, closes the Dialog, and the list shows the new configuration afterward", async () => {
    let configurations: ReturnType<typeof connectorConfiguration>[] = [];
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage(configurations)),
      [connectorPutPath("deepl-connector")]: () => {
        configurations = [
          connectorConfiguration({ connector: "deepl-connector", configuration: "{}" }),
        ];
        return jsonResponse(configurations[0]);
      },
    });
    await mountConnectorConfigurationsScreen(fetchMock);
    await screen.findByText("No connector configurations are currently registered.");

    fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(await within(dialog).findByLabelText("Connector"), {
      target: { value: "deepl-connector" },
    });
    fireEvent.change(within(dialog).getByLabelText("Configuration"), {
      target: { value: "{}" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(await screen.findByText("deepl-connector")).toBeTruthy();
  });
});

// The former "a successful edit replaces the configuration in place and the list reflects it
// (criterion 5)" describe block is retired: task/connector-capability-detail-editing/
// connector-configuration-detail-route (criteria 2 and 9) removed this screen's own per-row
// "Edit" button and its in-page edit dialog entirely, replacing them with a row click that
// navigates to the routed detail screen instead (connector-configurations-screen.tsx's own header
// comment). connector-configuration-detail-screen-save.spec.ts's own "a successful save
// (criterion 7)" describe block already covers the equivalent PUT-with-edited-configuration,
// reflected-afterward behavior for that routed screen.

describe("ConnectorConfigurationsScreen — the persisted value is the minified JSON, not the beautified display text (criterion 4)", () => {
  it("persists JSON.stringify(JSON.parse(text)) for the configuration field", async () => {
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([])),
      [connectorPutPath("deepl-connector")]: () =>
        jsonResponse(connectorConfiguration({ connector: "deepl-connector" })),
    });
    await mountConnectorConfigurationsScreen(fetchMock);
    await screen.findByText("No connector configurations are currently registered.");

    fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(await within(dialog).findByLabelText("Connector"), {
      target: { value: "deepl-connector" },
    });
    fireEvent.change(within(dialog).getByLabelText("Configuration"), {
      target: { value: '{\n  "apiKey": "secret"\n}' },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual({ configuration: '{"apiKey":"secret"}' });
  });
});

describe("ConnectorConfigurationsScreen — an invalid configuration blocks submission (criterion 4's own presupposition)", () => {
  it("disables Save and issues no PUT while the configuration is not syntactically valid JSON", async () => {
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([])),
    });
    await mountConnectorConfigurationsScreen(fetchMock);
    await screen.findByText("No connector configurations are currently registered.");

    fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(await within(dialog).findByLabelText("Connector"), {
      target: { value: "deepl-connector" },
    });
    fireEvent.change(within(dialog).getByLabelText("Configuration"), {
      target: { value: "{not valid json" },
    });

    const saveButton = within(dialog).getByRole("button", { name: "Save" });
    expect(saveButton.hasAttribute("disabled")).toBe(true);
    fireEvent.click(saveButton);

    expect(putCallCount(fetchMock)).toBe(0);
  });

  it("disables Save by default when the New connector configuration form first opens, since a blank field is not valid JSON either", async () => {
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([])),
    });
    await mountConnectorConfigurationsScreen(fetchMock);
    await screen.findByText("No connector configurations are currently registered.");

    fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));
    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByLabelText("Configuration");

    expect(within(dialog).getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(
      true,
    );
  });
});

describe("ConnectorConfigurationsScreen — a not-well-formed refusal reaches the operator as a specific message (disclosed inference)", () => {
  it("shows ConnectorConfigurationNotWellFormedError's own message, distinguishable from the generic fallback, and keeps the Dialog open", async () => {
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([])),
      [connectorPutPath("deepl-connector")]: () =>
        jsonResponse(
          {
            error: {
              code: "ConnectorConfigurationNotWellFormedError",
              message: "configuration must be well-formed",
            },
          },
          422,
        ),
    });
    await mountConnectorConfigurationsScreen(fetchMock);
    await screen.findByText("No connector configurations are currently registered.");

    fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(await within(dialog).findByLabelText("Connector"), {
      target: { value: "deepl-connector" },
    });
    fireEvent.change(within(dialog).getByLabelText("Configuration"), {
      target: { value: "{}" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "This configuration is not syntactically valid JSON.",
      ),
    );
    expect(toast.error).not.toHaveBeenCalledWith(GENERIC_MESSAGE);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

describe("ConnectorConfigurationsScreen — an unmapped save failure falls back to the generic message", () => {
  it("shows the shared generic save-failure toast for a failure error-ui-state.ts does not name", async () => {
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([])),
      [connectorPutPath("deepl-connector")]: () => {
        throw new Error("network down");
      },
    });
    await mountConnectorConfigurationsScreen(fetchMock);
    await screen.findByText("No connector configurations are currently registered.");

    fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(await within(dialog).findByLabelText("Connector"), {
      target: { value: "deepl-connector" },
    });
    fireEvent.change(within(dialog).getByLabelText("Configuration"), {
      target: { value: "{}" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(GENERIC_MESSAGE));
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

describe("ConnectorConfigurationsScreen — saving twice in quick succession (edge case)", () => {
  it("issues exactly one PUT when Save is clicked twice before the first request resolves", async () => {
    let resolvePut: (response: Response) => void = () => {};
    const putPromise = new Promise<Response>((resolve) => {
      resolvePut = resolve;
    });
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([])),
      [connectorPutPath("deepl-connector")]: () => putPromise,
    });
    await mountConnectorConfigurationsScreen(fetchMock);
    await screen.findByText("No connector configurations are currently registered.");

    fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(await within(dialog).findByLabelText("Connector"), {
      target: { value: "deepl-connector" },
    });
    fireEvent.change(within(dialog).getByLabelText("Configuration"), {
      target: { value: "{}" },
    });
    const saveButton = within(dialog).getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));

    await act(async () => {
      resolvePut(jsonResponse(connectorConfiguration({ connector: "deepl-connector" })));
    });
  });
});
