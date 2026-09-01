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
import { CONNECTORS_PATH } from "./connector-configurations-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function baseHandlers(): Record<string, () => Response> {
  return {
    [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([testCapability()])),
    [SUBJECT_TYPE_PATH]: () => jsonResponse(subjectTypeTermsPage(["billing-dispute"])),
  };
}

describe("ConnectorTestPanel — nothing displayed is persisted anywhere the rest of the app could read back (criterion 7)", () => {
  it("issues no further read of the connectors, capabilities or subject-type vocabulary after a completed test call", async () => {
    const { dialog, fetchMock } = await mountTestPanelInEditMode({
      ...baseHandlers(),
      [TEST_CONNECTOR_PATH]: () => jsonResponse(testConnectorResult()),
    });

    await fillTestPanelBasics(dialog, {
      capabilityLabel: "translate-text (1.0.0)",
      subjectTypeName: "billing-dispute",
      attribute: "account-id",
      value: "12345",
      requester: "operator@example.com",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Test" }));
    await within(dialog).findByText("Request sent");

    expect(callsToPath(fetchMock, CONNECTORS_PATH)).toHaveLength(1);
    expect(callsToPath(fetchMock, CAPABILITIES_PATH)).toHaveLength(1);
    expect(callsToPath(fetchMock, SUBJECT_TYPE_PATH)).toHaveLength(1);
    expect(callsToPath(fetchMock, TEST_CONNECTOR_PATH)).toHaveLength(1);
  });
});

describe("ConnectorTestPanel — a dispatch failure of the test call itself resolves to one generic message (disclosed inference)", () => {
  it("shows the fixed generic dispatch-failure message rather than the backend's own raw error text, even for a mapped error code", async () => {
    const { dialog } = await mountTestPanelInEditMode({
      ...baseHandlers(),
      [TEST_CONNECTOR_PATH]: () =>
        jsonResponse(
          { error: { code: "CaseNotFoundError", message: "raw backend message nobody sees" } },
          404,
        ),
    });

    await fillTestPanelBasics(dialog, {
      capabilityLabel: "translate-text (1.0.0)",
      subjectTypeName: "billing-dispute",
      attribute: "account-id",
      value: "12345",
      requester: "operator@example.com",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Test" }));

    expect(
      await within(dialog).findByText(
        "The test call could not be sent. Check the selected capability, subject and requester, then try again.",
      ),
    ).toBeTruthy();
    expect(within(dialog).queryByText(/raw backend message nobody sees/)).toBeNull();
  });
});

describe("ConnectorTestPanel — Test stays disabled until every required field is filled (edge case: an operation against a state that forbids it)", () => {
  it("renders the Test button disabled, and issues no call, before any field has been filled", async () => {
    const { dialog, fetchMock } = await mountTestPanelInEditMode(baseHandlers());

    const testButton = within(dialog).getByRole("button", { name: "Test" });
    expect(testButton.hasAttribute("disabled")).toBe(true);

    fireEvent.click(testButton);

    expect(callsToPath(fetchMock, TEST_CONNECTOR_PATH)).toHaveLength(0);
  });
});

describe("ConnectorTestPanel — one dispatch per test run (edge case: two operations against one subject at once)", () => {
  it("issues only one POST /v1/test-connector call when Test is clicked twice before the first call settles", async () => {
    let resolvePost: ((value: Response) => void) | undefined;
    const pending = new Promise<Response>((resolve) => {
      resolvePost = resolve;
    });
    const { dialog, fetchMock } = await mountTestPanelInEditMode({
      ...baseHandlers(),
      [TEST_CONNECTOR_PATH]: () => pending,
    });

    await fillTestPanelBasics(dialog, {
      capabilityLabel: "translate-text (1.0.0)",
      subjectTypeName: "billing-dispute",
      attribute: "account-id",
      value: "12345",
      requester: "operator@example.com",
    });
    const testButton = within(dialog).getByRole("button", { name: "Test" });
    fireEvent.click(testButton);
    fireEvent.click(testButton);
    resolvePost?.(jsonResponse(testConnectorResult()));
    await within(dialog).findByText("Request sent");

    expect(callsToPath(fetchMock, TEST_CONNECTOR_PATH)).toHaveLength(1);
  });
});
