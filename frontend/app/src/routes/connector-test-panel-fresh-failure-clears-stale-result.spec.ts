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

// Proof for task/connector-test-panel-dispatch-state/discriminate-test-dispatch-outcome's own
// (sole) criterion, at the runtime this hook's implementation record discloses as its own
// second inference: testOutcome is tracked as useTestConnectorPanel's own local state, set
// explicitly to one variant at each dispatch stage, rather than derived inline from
// useMutation's own isPending/data/error (react-query keeps `data` from the previous
// successful call around while a later call is pending or has errored). A test asserting the
// type's own structure lives beside the hook itself
// (src/hooks/use-test-connector-panel.spec.ts); this file is the runtime witness that the
// concrete defect that inference exists to prevent -- a prior call's own successful rendering
// still on screen beside a later call's own failure -- does not in fact happen once two calls
// are dispatched through this panel in succession.
//
// This is the edge case "two operations against one subject at once" read sequentially rather
// than concurrently (the concurrent reading -- two clicks before either settles -- is proven in
// connector-test-panel-dispatch-safety.spec.ts's own "one dispatch per test run" test).

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
