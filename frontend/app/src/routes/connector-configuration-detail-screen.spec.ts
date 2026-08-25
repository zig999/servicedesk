import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  CONFIGURATION_PATH,
  CONNECTOR,
  INVALID_CONFIGURATION,
  LOADED_CONFIGURATION,
  SUBJECT_TYPE_PATH,
  UPDATED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  errorResponse,
  mountConnectorConfigurationDetailScreen,
  prettyPrinted,
  putCallCount,
} from "./connector-configuration-detail-screen.test-support";

// Proof for task/connector-capability-detail-editing/connector-configuration-detail-route's own
// criteria 1 ("shows that connector configuration's full record, loaded through the new hook"),
// 3 ("a control that returns the operator to the connector-configurations list"), 6 ("the
// existing connector-configuration-form-fields.tsx markup and the existing ConnectorTestPanel are
// reused unchanged") and 8 (the invalid-JSON warning). Criterion 4/7's save/discard behavior lives
// in the sibling connector-configuration-detail-screen-save.spec.ts and
// connector-configuration-detail-screen-discard.spec.ts -- split this way to stay under this
// project's own max-lines rule (MNT-01). All three share
// connector-configuration-detail-screen.test-support.ts's own fixtures and mounting helper.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ConnectorConfigurationDetailScreen -- shows the loaded record (criterion 1)", () => {
  it("renders the connector's own identity and its configuration, both read from the GET this route's own hook issues", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);

    expect(await screen.findByRole("heading", { name: `Connector ${CONNECTOR}` })).toBeTruthy();
    const connectorInput = screen.getByLabelText<HTMLInputElement>("Connector");
    expect(connectorInput.value).toBe(CONNECTOR);
    const configurationField = screen.getByLabelText<HTMLTextAreaElement>("Configuration");
    await waitFor(() =>
      expect(configurationField.value).toBe(prettyPrinted(LOADED_CONFIGURATION)),
    );

    // Proves this reached the screen through the network read this route's own hook issues,
    // rather than a value this screen invented or copied from somewhere else.
    expect(
      fetchMock.mock.calls.some(([input]) => input === CONFIGURATION_PATH),
    ).toBe(true);
  });
});

describe("ConnectorConfigurationDetailScreen -- a control returns to the list (criterion 3)", () => {
  it("navigates back to the connector-configurations list when Back to connector configurations is clicked", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    const router = await mountConnectorConfigurationDetailScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    fireEvent.click(screen.getByRole("link", { name: "Back to connector configurations" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
  });

  it("keeps the same control available when the load fails (edge case: a dependency that fails)", async () => {
    const fetchMock = createFetchStub({
      [CONFIGURATION_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    await mountConnectorConfigurationDetailScreen(fetchMock);

    expect(await screen.findByRole("button", { name: "Retry" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Back to connector configurations" }),
    ).toBeTruthy();
  });
});

describe("ConnectorConfigurationDetailScreen -- reuses the existing form fields and ConnectorTestPanel unchanged (criterion 6)", () => {
  it("renders the shared Connector/Configuration/Save fields and mounts the real ConnectorTestPanel, which issues its own two independent reads", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);

    await screen.findByLabelText("Configuration");
    expect(screen.getByLabelText("Connector")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();

    expect(await screen.findByRole("heading", { name: "Test" })).toBeTruthy();
    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([input]) => input === CAPABILITIES_PATH)).toBe(true),
    );
    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([input]) => input === SUBJECT_TYPE_PATH)).toBe(true),
    );
  });
});

describe("ConnectorConfigurationDetailScreen -- an invalid loaded configuration is warned about (criterion 8)", () => {
  it("shows a plain warning that the stored configuration is not valid JSON when the loaded value does not parse", async () => {
    const fetchMock = createFetchStub(baseHandlers(INVALID_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);

    await screen.findByLabelText("Configuration");
    expect(
      screen.getByText(
        "This connector configuration's stored value is not valid JSON. Correct it before Save can succeed.",
      ),
    ).toBeTruthy();
  });

  it("shows no such warning while the loaded configuration is valid JSON", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);

    await screen.findByLabelText("Configuration");
    expect(
      screen.queryByText(
        "This connector configuration's stored value is not valid JSON. Correct it before Save can succeed.",
      ),
    ).toBeNull();
  });

  it("shows the same plain warning once a valid loaded configuration is edited into invalid JSON, and disables Save while it stays that way", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");

    fireEvent.change(configurationField, { target: { value: INVALID_CONFIGURATION } });

    expect(
      screen.getByText(
        "This connector configuration's stored value is not valid JSON. Correct it before Save can succeed.",
      ),
    ).toBeTruthy();
    // This route's own plain-wording banner and JsonTextareaField's own parser-message inline
    // error (json-textarea-field.tsx's own "Invalid JSON: <message>") both render, additive to
    // one another rather than one replacing the other (this task's own disclosed inference).
    const alerts = screen.getAllByRole("alert");
    expect(alerts.some((alert) => alert.textContent?.startsWith("Invalid JSON:"))).toBe(true);
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(putCallCount(fetchMock)).toBe(0);
  });

  it("edits away the warning once the text is corrected back to valid JSON", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");

    fireEvent.change(configurationField, { target: { value: INVALID_CONFIGURATION } });
    expect(
      screen.getByText(
        "This connector configuration's stored value is not valid JSON. Correct it before Save can succeed.",
      ),
    ).toBeTruthy();

    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    expect(
      screen.queryByText(
        "This connector configuration's stored value is not valid JSON. Correct it before Save can succeed.",
      ),
    ).toBeNull();
  });
});
