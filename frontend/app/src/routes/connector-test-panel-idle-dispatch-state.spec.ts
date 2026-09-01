import { afterEach, describe, expect, it, vi } from "vitest";
import { within } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  SUBJECT_TYPE_PATH,
  capabilitiesPage,
  jsonResponse,
  mountTestPanelInEditMode,
  subjectTypeTermsPage,
  testCapability,
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

describe('ConnectorTestPanel — nothing is rendered for the Test result before any dispatch (disclosed inference: an explicit "idle" variant)', () => {
  it("renders no pending, failure or result content until Test is clicked for the first time", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());

    expect(within(dialog).queryByText("Sending test call…")).toBeNull();
    expect(within(dialog).queryByText("Request sent")).toBeNull();
    expect(
      within(dialog).queryByText(
        "The test call could not be sent. Check the selected capability, subject and requester, then try again.",
      ),
    ).toBeNull();
  });
});
