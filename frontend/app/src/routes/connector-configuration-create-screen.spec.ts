import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  createFetchStub,
  mountConnectorConfigurationCreateScreen,
  putCallCount,
} from "./connector-configuration-create-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ConnectorConfigurationCreateScreen -- routing (criteria 1 and 2)", () => {
  it("renders the create screen's own content when navigating to /connectors/new", async () => {
    const fetchMock = createFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);

    expect(
      await screen.findByRole("heading", { name: "New connector configuration" }),
    ).toBeTruthy();
  });

  it("does not render the connector configuration detail screen for a connector named 'new'", async () => {
    const fetchMock = createFetchStub();
    const router = await mountConnectorConfigurationCreateScreen(fetchMock);

    await screen.findByRole("heading", { name: "New connector configuration" });
    expect(screen.queryByText("Connector Detail Placeholder")).toBeNull();
    expect(router.state.location.pathname).toBe("/connectors/new");
  });
});

describe("ConnectorConfigurationCreateScreen -- the connector field is editable (criterion 3)", () => {
  it("renders the Connector input without the disabled attribute", async () => {
    const fetchMock = createFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);

    const connectorInput = await screen.findByLabelText<HTMLInputElement>("Connector");
    expect(connectorInput.disabled).toBe(false);
  });
});

describe("ConnectorConfigurationCreateScreen -- composes the shared form-fields component (criterion 4)", () => {
  it("links the Connector field's validation error through aria-describedby, exactly as ConnectorConfigurationFormFields' own FormField renders it", async () => {
    const fetchMock = createFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);
    const connectorInput = await screen.findByLabelText<HTMLInputElement>("Connector");
    const configurationField = screen.getByLabelText<HTMLTextAreaElement>("Configuration");
    fireEvent.change(configurationField, { target: { value: "{}" } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByText("String must contain at least 1 character(s)");
    expect(connectorInput.getAttribute("aria-invalid")).toBe("true");
    expect(connectorInput.getAttribute("aria-describedby")).toBe("connector-error");
  });
});

describe("ConnectorConfigurationCreateScreen -- the shared create/edit hook's own create-mode default (criterion 5)", () => {
  it("disables Save by default when the screen first mounts, since a blank configuration is not valid JSON either", async () => {
    const fetchMock = createFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
  });
});

describe("ConnectorConfigurationCreateScreen -- no loading or load-error phase (disclosed inference)", () => {
  it("renders the form fields immediately on mount rather than gating them behind a loading state", async () => {
    const fetchMock = createFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);

    expect(screen.getByLabelText("Configuration")).toBeTruthy();
    expect(screen.queryByText(/loading/i)).toBeNull();
  });
});

describe("ConnectorConfigurationCreateScreen -- a route back to the list (criterion 12)", () => {
  it("renders the footer's Connectors link to /connectors", async () => {
    const fetchMock = createFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    const footer = screen.getByRole("group", { name: "Actions" });
    const link = within(footer).getByRole("link", { name: "Connectors" });
    expect(link.getAttribute("href")).toBe("/connectors");
  });
});

describe("ConnectorConfigurationCreateScreen -- the footer Connectors link registers nothing before it navigates (UNDERDETERMINED note: a-connector-configuration-surface-offers-a-route-to-the-listing leaves open whether the route submits before landing on the listing)", () => {
  it("navigates to /connectors on Connectors without issuing any PUT request -- an implementation that submits register-connector before navigating would fail this", async () => {
    const fetchMock = createFetchStub();
    const router = await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    const footer = screen.getByRole("group", { name: "Actions" });
    fireEvent.click(within(footer).getByRole("link", { name: "Connectors" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("ConnectorConfigurationCreateScreen -- the route does not turn on how the operator arrived (UNDERDETERMINED note: both route criteria are satisfiable by a reading that varies with arrival)", () => {
  it("renders the footer's Connectors link when the screen is loaded directly at /connectors/new, carrying no navigation state recording arrival from the listing -- an implementation that renders the route only on an arrival-from-listing state would fail this", async () => {
    const fetchMock = createFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock, "/connectors/new");
    await screen.findByLabelText("Configuration");

    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("link", { name: "Connectors" })).toBeTruthy();
  });
});

describe("ConnectorConfigurationCreateScreen -- carries no discard control (UNDERDETERMINED note: no criterion distinguishes which controls the shared footer carries on the create screen)", () => {
  it("renders no Discard changes control", async () => {
    const fetchMock = createFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    expect(screen.queryByRole("button", { name: "Discard changes" })).toBeNull();
  });
});

describe("ConnectorConfigurationCreateScreen -- renders no connector test panel (criterion 13)", () => {
  it("renders no Test section", async () => {
    const fetchMock = createFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    expect(screen.queryByRole("heading", { name: "Test" })).toBeNull();
  });
});
