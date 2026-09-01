import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  createFetchStub,
  mountConnectorConfigurationCreateScreen,
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

describe("ConnectorConfigurationCreateScreen -- a link back to the list (criterion 12)", () => {
  it("renders a 'Back to connector configurations' link to /connectors", async () => {
    const fetchMock = createFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);

    const link = await screen.findByRole("link", { name: "Back to connector configurations" });
    expect(link.getAttribute("href")).toBe("/connectors");
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
