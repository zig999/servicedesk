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

// Proof for task/connector-configuration-authoring/test-connector-debug-panel's own criteria 4,
// 5 and 6 -- clicking "Test" displays the raw request actually sent, a completed call displays
// the raw response actually received, and a failed or timed-out call displays the raw error or
// timeout rather than a parsed or summarized result. Criterion 7 and the dispatch-failure
// inference live in the sibling connector-test-panel-dispatch-safety.spec.ts.

afterEach(() => {
  vi.unstubAllGlobals();
});

function baseHandlers(): Record<string, () => Response> {
  return {
    [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([testCapability()])),
    [SUBJECT_TYPE_PATH]: () => jsonResponse(subjectTypeTermsPage(["billing-dispute"])),
  };
}

async function fillAndDispatch(dialog: HTMLElement): Promise<void> {
  await fillTestPanelBasics(dialog, {
    capabilityLabel: "translate-text (1.0.0)",
    subjectTypeName: "billing-dispute",
    attribute: "account-id",
    value: "12345",
    requester: "operator@example.com",
  });
  fireEvent.click(within(dialog).getByRole("button", { name: "Test" }));
}

describe('ConnectorTestPanel — clicking "Test" displays the raw request actually sent (criterion 4)', () => {
  it("shows the method, resolved address, headers and body exactly as the response echoed them back", async () => {
    const { dialog } = await mountTestPanelInEditMode({
      ...baseHandlers(),
      [TEST_CONNECTOR_PATH]: () =>
        jsonResponse(
          testConnectorResult({
            request: {
              method: "POST",
              address: "https://api.deepl.example/v2/translate?resolved=1",
              headers: { "x-api-key": "[REDACTED]" },
              body: { subject: "billing-dispute" },
            },
          }),
        ),
    });

    await fillAndDispatch(dialog);
    await within(dialog).findByText("Request sent");

    expect(dialog.textContent).toContain("Method: POST");
    expect(dialog.textContent).toContain(
      "Address: https://api.deepl.example/v2/translate?resolved=1",
    );
    expect(dialog.textContent).toContain('"x-api-key": "[REDACTED]"');
    expect(dialog.textContent).toContain('"subject": "billing-dispute"');
  });
});

describe("ConnectorTestPanel — a completed call displays the raw response actually received (criterion 5)", () => {
  it("shows the status, elapsed time, headers and body exactly as the response carried them", async () => {
    const { dialog } = await mountTestPanelInEditMode({
      ...baseHandlers(),
      [TEST_CONNECTOR_PATH]: () =>
        jsonResponse(
          testConnectorResult({
            response: {
              kind: "response",
              status: 201,
              headers: { "x-request-id": "abc-123" },
              body: { ok: true },
              elapsedMs: 987,
            },
          }),
        ),
    });

    await fillAndDispatch(dialog);
    await within(dialog).findByText("Response received");

    expect(dialog.textContent).toContain("Status: 201");
    expect(dialog.textContent).toContain("Elapsed: 987ms");
    expect(dialog.textContent).toContain('"x-request-id": "abc-123"');
    expect(dialog.textContent).toContain('"ok": true');
  });
});

describe("ConnectorTestPanel — a timed-out call displays the raw timeout, never a parsed or summarized result (criterion 6)", () => {
  it("shows only the elapsed time for a timed-out call, with no status or body rendered as though a response had arrived", async () => {
    const { dialog } = await mountTestPanelInEditMode({
      ...baseHandlers(),
      [TEST_CONNECTOR_PATH]: () =>
        jsonResponse(testConnectorResult({ response: { kind: "timed-out", elapsedMs: 5000 } })),
    });

    await fillAndDispatch(dialog);
    await within(dialog).findByText("Timed out after 5000ms");

    expect(dialog.textContent).not.toContain("Status:");
  });
});

describe("ConnectorTestPanel — a failed call displays the raw error, never a parsed or summarized result (criterion 6)", () => {
  it("shows the raw error message and elapsed time verbatim, with no status or body rendered as though a response had arrived", async () => {
    const { dialog } = await mountTestPanelInEditMode({
      ...baseHandlers(),
      [TEST_CONNECTOR_PATH]: () =>
        jsonResponse(
          testConnectorResult({
            response: { kind: "error", message: "ECONNRESET: socket hang up", elapsedMs: 12 },
          }),
        ),
    });

    await fillAndDispatch(dialog);
    await within(dialog).findByText("ECONNRESET: socket hang up");

    expect(dialog.textContent).toContain("Elapsed: 12ms");
    expect(dialog.textContent).not.toContain("Status:");
  });
});

// Proof for task/connector-test-panel-dispatch-state/discriminate-test-dispatch-outcome's own
// criterion -- TestConnectorPanelState's testOutcome union can no longer represent, simultaneously,
// a result from a previous successful call and an error from a more recent failed call. This is the
// concrete, observable consequence of that type-level guarantee: dispatch a call that succeeds
// (asserting the panel shows that success's own result), then dispatch a second call that fails
// (asserting the panel now shows ONLY the failure message, with no trace of the stale success --
// its own status, headers or body -- anywhere in the rendered output). The three-independent-fields
// shape this task replaced could fail exactly this way: TanStack Query does not clear
// mutation.data when a later mutate() call fails, so a `result` field fed from mutation.data and a
// `testError` field fed from the failure could both be non-null at once and both render.
describe("ConnectorTestPanel — a later failed call discards a stale successful result entirely, leaving no trace of it in the rendered output (task/connector-test-panel-dispatch-state/discriminate-test-dispatch-outcome)", () => {
  it("renders only the failure message once a second dispatch fails, with nothing of the first call's own successful result still visible", async () => {
    let dispatchCount = 0;
    const { dialog } = await mountTestPanelInEditMode({
      ...baseHandlers(),
      [TEST_CONNECTOR_PATH]: () => {
        dispatchCount += 1;
        if (dispatchCount === 1) {
          return jsonResponse(
            testConnectorResult({
              response: {
                kind: "response",
                status: 200,
                headers: { "x-request-id": "first-call" },
                body: { translation: "hola" },
                elapsedMs: 42,
              },
            }),
          );
        }
        return jsonResponse(
          { error: { code: "InternalError", message: "raw backend message nobody sees" } },
          500,
        );
      },
    });

    await fillAndDispatch(dialog);
    await within(dialog).findByText("Request sent");
    expect(dialog.textContent).toContain("Status: 200");
    expect(dialog.textContent).toContain('"translation": "hola"');

    fireEvent.click(within(dialog).getByRole("button", { name: "Test" }));
    await within(dialog).findByText(
      "The test call could not be sent. Check the selected capability, subject and requester, then try again.",
    );

    expect(dialog.textContent).not.toContain("Request sent");
    expect(dialog.textContent).not.toContain("Response received");
    expect(dialog.textContent).not.toContain("Status: 200");
    expect(dialog.textContent).not.toContain("hola");
    expect(dialog.textContent).not.toContain("raw backend message nobody sees");
  });
});
