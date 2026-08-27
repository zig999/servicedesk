import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  ARRAY_CONFIGURATION,
  CAPABILITIES_PATH,
  CONFIGURATION_PATH,
  CONNECTOR,
  INVALID_CONFIGURATION,
  LOADED_CONFIGURATION,
  NULL_CONFIGURATION,
  SUBJECT_TYPE_PATH,
  UPDATED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  errorResponse,
  mountConnectorConfigurationDetailScreen,
  prettyPrinted,
  putCallCount,
} from "./connector-configuration-detail-screen.test-support";

// Proof for task/connector-configuration-warning-text/warning-states-the-object-requirement, a
// corrective increment over INVALID_CONFIGURATION_WARNING (connector-configuration-detail-ready-
// view.tsx): the warning must state the registry's actual requirement (a JSON object) rather than
// a JSON-syntax claim that reads false for two of the three isValid=false shapes -- a
// syntactically valid array and a syntactically valid null, alongside the pre-existing unparsable-
// text case. INVALID_CONFIGURATION_WARNING below mirrors that constant's own corrected text
// exactly, so a future edit to the wording is caught here rather than by a stale duplicate
// literal.
const INVALID_CONFIGURATION_WARNING =
  "This connector configuration's stored value must be a JSON object. Correct it before Save can succeed.";

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
  it("shows the plain warning, stating the value must be a JSON object, when the loaded value does not parse as JSON at all (corrective criterion 1)", async () => {
    const fetchMock = createFetchStub(baseHandlers(INVALID_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);

    await screen.findByLabelText("Configuration");
    expect(screen.getByText(INVALID_CONFIGURATION_WARNING)).toBeTruthy();
  });

  it("shows no such warning while the loaded configuration is valid JSON", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);

    await screen.findByLabelText("Configuration");
    expect(screen.queryByText(INVALID_CONFIGURATION_WARNING)).toBeNull();
  });

  it("shows the same plain warning once a valid loaded configuration is edited into unparsable text, and disables Save while it stays that way", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");

    fireEvent.change(configurationField, { target: { value: INVALID_CONFIGURATION } });

    expect(screen.getByText(INVALID_CONFIGURATION_WARNING)).toBeTruthy();
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
    expect(screen.getByText(INVALID_CONFIGURATION_WARNING)).toBeTruthy();

    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    expect(screen.queryByText(INVALID_CONFIGURATION_WARNING)).toBeNull();
  });
});

// Proof for task/connector-configuration-warning-text/warning-states-the-object-requirement's own
// criteria 1-4: a syntactically valid array and a syntactically valid null are both
// isValid=false (use-connector-configuration-detail.ts's own isValidConfigurationObject, read
// unmodified) but neither one fails JSON syntax -- the warning must not claim otherwise, and must
// instead state the actual requirement. Each case edits a validly loaded configuration into the
// non-object shape (rather than loading it directly) so the Save-blocked assertion is not merely
// the trivial "Save starts disabled before any edit" fact every load exhibits regardless of
// validity -- once edited, the field differs from its baseline (isDirty is true), so Save staying
// disabled here is evidence the invalidity itself is what blocks it, the same thing the
// pre-existing unparsable-text edit case above already establishes.
describe.each([
  { label: "a syntactically valid JSON array", text: ARRAY_CONFIGURATION },
  { label: "syntactically valid JSON null", text: NULL_CONFIGURATION },
])(
  "ConnectorConfigurationDetailScreen -- the warning states the object requirement rather than a JSON-syntax claim, for $label (corrective criteria 1-4)",
  ({ text }) => {
    it("does not claim the value is not valid JSON, states it must be a JSON object, and blocks Save, once a validly loaded configuration is edited into this shape", async () => {
      const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
      await mountConnectorConfigurationDetailScreen(fetchMock);
      const configurationField =
        await screen.findByLabelText<HTMLTextAreaElement>("Configuration");

      fireEvent.change(configurationField, { target: { value: text } });

      expect(screen.getByText(INVALID_CONFIGURATION_WARNING)).toBeTruthy();
      expect(
        screen.queryByText(
          "This connector configuration's stored value is not valid JSON. Correct it before Save can succeed.",
        ),
      ).toBeNull();
      expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      expect(putCallCount(fetchMock)).toBe(0);
    });
  },
);
