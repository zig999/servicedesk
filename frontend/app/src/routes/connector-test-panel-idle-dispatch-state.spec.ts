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

// Proof for task/connector-test-panel-dispatch-state/discriminate-test-dispatch-outcome's own
// first disclosed inference: testOutcome needs an "idle" variant for the state before any test
// has ever been dispatched -- use-test-connector-panel.ts's own header comment states this is
// this hook's own inference (the task's sole criterion names no label for the pre-dispatch
// state). The test below is the runtime witness that ConnectorTestPanelResult renders nothing
// at all for that state, distinct from every one of the other three (pending, succeeded,
// failed) -- a sibling proof to the type-level tests beside the hook itself
// (src/hooks/use-test-connector-panel.spec.ts) and to the runtime succession test in
// connector-test-panel-fresh-failure-clears-stale-result.spec.ts.

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
