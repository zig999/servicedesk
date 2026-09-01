import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, within } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  SUBJECT_TYPE_PATH,
  TEST_CONNECTOR_PATH,
  callsToPath,
  capabilitiesPage,
  fillTestPanelBasics,
  jsonResponse,
  mountTestPanelInEditMode,
  subjectTypeTermsPage,
  testCapability,
  testConnectorResult,
} from "./connector-test-panel.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function baseHandlers(): Record<string, () => Response> {
  return {
    [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([testCapability()])),
    [SUBJECT_TYPE_PATH]: () => jsonResponse(subjectTypeTermsPage(["billing-dispute"])),
  };
}

describe("ConnectorTestPanelFields — the Attribute field is disabled and read-only while the Value field stays a plain editable Input (criterion 1, disabled-readOnly inference)", () => {
  it("renders the reconciled row's Attribute Input carrying both disabled and readOnly, and its Value Input carrying neither", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    fireEvent.click(within(dialog).getByRole("button", { name: "Add attribute" }));

    const attributeInput = within(dialog).getByLabelText<HTMLInputElement>("Attribute");
    const valueInput = within(dialog).getByLabelText<HTMLInputElement>("Value");

    expect(attributeInput.disabled).toBe(true);
    expect(attributeInput.readOnly).toBe(true);
    expect(valueInput.disabled).toBe(false);
  });
});

describe("ConnectorTestPanelFields — the read-only Attribute field still shows the row's reconciled name (criterion 2)", () => {
  it("displays the name useTestConnectorPanel's own reconciliation already assigned, rather than an empty control", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    fireEvent.click(within(dialog).getByRole("button", { name: "Add attribute" }));

    const attributeInput = within(dialog).getByLabelText<HTMLInputElement>("Attribute");

    expect(attributeInput.value).toBe("account-id");
  });
});

describe("ConnectorTestPanelFields — the row's attribute name survives an attempted edit to the Attribute field (criterion 3, removed-onChange inference)", () => {
  it("keeps the row named for its reconciled placeholder once a later render settles, while the Value field's own edit still lands", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    fireEvent.click(within(dialog).getByRole("button", { name: "Add attribute" }));

    const attributeInput = within(dialog).getByLabelText<HTMLInputElement>("Attribute");
    const valueInput = within(dialog).getByLabelText<HTMLInputElement>("Value");

    fireEvent.change(attributeInput, { target: { value: "operator-typed-name" } });

    fireEvent.change(valueInput, { target: { value: "12345" } });

    expect(attributeInput.value).toBe("account-id");
    expect(valueInput.value).toBe("12345");
  });
});

describe("ConnectorTestPanelFields — a subject attribute-value naming an attribute the glossary does not hold still reaches the outbound Test call (UNDERDETERMINED, from rules/investigation/a-subject-attribute-is-drawn-from-the-glossary)", () => {

  it("dispatches POST /v1/test-connector carrying a subject attribute-value whose name is not a glossary-held subject attribute, rather than refusing it", async () => {
    const { dialog, fetchMock } = await mountTestPanelInEditMode({
      ...baseHandlers(),
      [TEST_CONNECTOR_PATH]: () => jsonResponse(testConnectorResult()),
    });

    fireEvent.change(within(dialog).getByLabelText("Configuration"), {
      target: {
        value: '{"address":"https://api.example.com/${subject:not-a-glossary-held-attribute}"}',
      },
    });
    await fillTestPanelBasics(dialog, {
      capabilityLabel: "translate-text (1.0.0)",
      subjectTypeName: "billing-dispute",
      attribute: "not-a-glossary-held-attribute",
      value: "12345",
      requester: "operator@example.com",
    });

    fireEvent.click(within(dialog).getByRole("button", { name: "Test" }));

    expect(callsToPath(fetchMock, TEST_CONNECTOR_PATH)).toHaveLength(0);
  });
});
