import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  CONNECTORS_PATH,
  connectorConfiguration,
  connectorConfigurationsPage,
  createConnectorConfigurationsFetchStub,
  jsonResponse,
  mountConnectorConfigurationsScreen,
} from "./connector-configurations-screen.test-support";

// Proof for task/connector-configuration-authoring/connector-configuration-create-edit-form's
// own criterion 1 ("A new route reachable from the app's navigation lists every currently
// registered connector configuration by name"), the loading/error/empty states its own
// screen-level behavior presupposes, and the delivery record's own disclosed inference that
// "New connector configuration" renders unconditionally, ahead of the loading/error/empty
// branches. The route-reachability half of criterion 1 (the app's navigation) is proved
// separately in app-shell.spec.ts and route-tree.spec.ts; this file covers the listing itself.
// The New/Edit form Dialog's own behavior (criteria 2-5) lives in the sibling
// connector-configurations-screen-form.spec.ts and connector-configurations-screen-form-save.spec.ts,
// split this way to stay under this project's own max-lines rule (MNT-01). All three share
// connector-configurations-screen.test-support.ts's own fixtures and mounting helper.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ConnectorConfigurationsScreen — listing (criterion 1)", () => {
  it("renders one row per connector configuration GET /v1/connectors returns, each showing its own connector name", async () => {
    const configurations = [
      connectorConfiguration({ connector: "deepl-connector" }),
      connectorConfiguration({ connector: "sendgrid-connector" }),
    ];
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage(configurations)),
    });
    await mountConnectorConfigurationsScreen(fetchMock);

    // StatusTable gives every data row role="button" rather than the implicit "row" once
    // onRowClick is passed (task/connector-capability-detail-editing/connector-configuration-detail-route's
    // own criterion 2 -- see status-table.spec.ts's own header row / data row distinction) -- the
    // header row keeps its own implicit "row" role since it is never clickable, so
    // findAllByRole("row") would now find only that one header row rather than one entry per
    // connector configuration. Querying data rows by their own "button" role, scoped to the table
    // itself (so this screen's own unrelated "New connector configuration" button, also
    // role="button", is never counted alongside them), is this test's own equivalent for what it
    // always verified: one row per connector configuration, each showing its own connector name.
    const table = await screen.findByRole("table");
    const dataRows = within(table).getAllByRole("button");
    expect(dataRows).toHaveLength(2);
    expect(within(dataRows[0]).getByText("deepl-connector")).toBeTruthy();
    expect(within(dataRows[1]).getByText("sendgrid-connector")).toBeTruthy();
  });

  it("renders no row for a connector configuration GET /v1/connectors does not return", async () => {
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () =>
        jsonResponse(connectorConfigurationsPage([connectorConfiguration({ connector: "deepl-connector" })])),
    });
    await mountConnectorConfigurationsScreen(fetchMock);

    await screen.findByText("deepl-connector");
    expect(screen.queryByText("sendgrid-connector")).toBeNull();
  });
});

describe("ConnectorConfigurationsScreen — loading and load-error placeholders", () => {
  it("shows a loading placeholder before GET /v1/connectors responds", async () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    await mountConnectorConfigurationsScreen(fetchMock);

    expect(screen.getByText("Loading connector configurations…")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("shows a generic load-failure message with a Retry action when GET /v1/connectors fails", async () => {
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => {
        throw new Error("network down");
      },
    });
    await mountConnectorConfigurationsScreen(fetchMock);

    expect(await screen.findByText("Connector configurations could not be loaded.")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("re-issues GET /v1/connectors when Retry is clicked, rendering the configurations once that retry succeeds", async () => {
    let callCount = 0;
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => {
        callCount += 1;
        if (callCount === 1) {
          throw new Error("network down");
        }
        return jsonResponse(connectorConfigurationsPage([connectorConfiguration()]));
      },
    });
    await mountConnectorConfigurationsScreen(fetchMock);

    expect(await screen.findByText("Connector configurations could not be loaded.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("deepl-connector")).toBeTruthy();
    expect(screen.queryByText("Connector configurations could not be loaded.")).toBeNull();
  });
});

describe("ConnectorConfigurationsScreen — empty state (API-04)", () => {
  it("renders an explicit empty-state message and no table when GET /v1/connectors returns zero configurations", async () => {
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([])),
    });
    await mountConnectorConfigurationsScreen(fetchMock);

    expect(
      await screen.findByText("No connector configurations are currently registered."),
    ).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
});

describe('ConnectorConfigurationsScreen — "New connector configuration" renders unconditionally (disclosed inference)', () => {
  it("offers the New connector configuration action while the list is still loading", async () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    await mountConnectorConfigurationsScreen(fetchMock);

    expect(screen.getByRole("button", { name: "New connector configuration" })).toBeTruthy();
  });

  it("offers the New connector configuration action after the list fails to load", async () => {
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => {
        throw new Error("network down");
      },
    });
    await mountConnectorConfigurationsScreen(fetchMock);

    await screen.findByText("Connector configurations could not be loaded.");
    expect(screen.getByRole("button", { name: "New connector configuration" })).toBeTruthy();
  });

  it("offers the New connector configuration action, as the one button rendered, when the list is empty", async () => {
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([])),
    });
    await mountConnectorConfigurationsScreen(fetchMock);

    await screen.findByText("No connector configurations are currently registered.");
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "New connector configuration" })).toBeTruthy();
  });
});
