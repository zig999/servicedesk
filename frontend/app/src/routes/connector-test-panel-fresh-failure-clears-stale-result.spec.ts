import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, within } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  SUBJECT_TYPE_PATH,
  TEST_CONNECTOR_PATH,
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

describe("ConnectorTestPanel — a later failed call clears an earlier call's own successful rendering entirely", () => {
  it("shows only the fresh failure message once a second dispatch fails, with none of the first dispatch's own request/response content left on screen", async () => {
    let testConnectorCallCount = 0;
    const { dialog } = await mountTestPanelInEditMode({
      ...baseHandlers(),
      [TEST_CONNECTOR_PATH]: () => {
        testConnectorCallCount += 1;
        if (testConnectorCallCount === 1) {
          return jsonResponse(testConnectorResult());
        }
        return jsonResponse(
          { error: { code: "CaseNotFoundError", message: "raw backend message nobody sees" } },
          404,
        );
      },
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
    await within(dialog).findByText("Request sent");
    expect(within(dialog).getByText("Response received")).toBeTruthy();

    fireEvent.click(testButton);
    await within(dialog).findByText(
      "The test call could not be sent. Check the selected capability, subject and requester, then try again.",
    );

    expect(within(dialog).queryByText("Request sent")).toBeNull();
    expect(within(dialog).queryByText("Response received")).toBeNull();
    expect(dialog.textContent).not.toContain("Status: 200");
  });
});
