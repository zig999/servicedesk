import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";

// Proof for task/connector-test-panel-placeholder-attributes/route-configuration-text-to-test-panel's
// own criterion 1 ("ConnectorConfigurationDetailReadyView passes its own live
// state.configuration.value text into ConnectorTestPanel through a new configurationText prop").
//
// useTestConnectorPanel holds configurationText in a ref it deliberately never reads
// (use-test-connector-panel.ts's own header comment: this task's own scope is pure plumbing, and
// reading it is a distinct, not-yet-cut change), so nothing this task's own change does is visible
// anywhere in the rendered app today. The only way to observe the value this route actually
// forwards is to replace ConnectorTestPanel itself with a stand-in that renders its own received
// props as plain text, and read that text off the DOM -- a rendered value, not a recorded call.
//
// This departs from TST-03 ("A stand-in replaces a boundary the component does not own -- the
// network, storage, the clock -- and never the component's own rendering logic"):
// ConnectorTestPanel is none of those three boundaries. Disclosed as this file's own divergence:
// nothing else makes this plumbing observable, since the value is unread by design and this
// task's own rationale states its outcome is demonstrable only by "the value ... reaching the
// hook" -- exactly what this stand-in exposes as rendered text instead of a call recorded on a spy.
//
// The stub carries a stable data-testid rather than being located by its own rendered text:
// state.configuration.value is pretty-printed JSON (embedded newlines), and
// screen.findByText/getByText compares against a whitespace-collapsed reading of the DOM's own
// text content, so a multi-line expected string can never match -- reading textContent off the
// testid'd node directly compares the exact string this route forwarded, newlines included.
vi.mock("./connector-test-panel", () => ({
  ConnectorTestPanel: (props: { connector: string; configurationText: string }) =>
    createElement(
      "p",
      { "data-testid": "connector-test-panel-stub" },
      `connector-test-panel-stub-received:${props.connector}:${props.configurationText}`,
    ),
}));

import {
  CONNECTOR,
  LOADED_CONFIGURATION,
  UPDATED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  mountConnectorConfigurationDetailScreen,
  prettyPrinted,
} from "./connector-configuration-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ConnectorConfigurationDetailReadyView — forwards its own live Configuration text into ConnectorTestPanel (criterion 1)", () => {
  it("passes the loaded configuration's own current text as configurationText, scoped to this route's own connector", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);

    await waitFor(() => {
      expect(screen.getByTestId("connector-test-panel-stub").textContent).toBe(
        `connector-test-panel-stub-received:${CONNECTOR}:${prettyPrinted(LOADED_CONFIGURATION)}`,
      );
    });
  });

  it("passes the edited text once the operator changes Configuration, rather than only the value loaded at mount (its own live value)", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");

    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    // json-textarea-field.tsx's own load-detection effect re-renders this same edit through its
    // pretty-print path too (empirically confirmed against this suite's own fixture: a syntactically
    // valid edit ends up pretty-printed exactly like a freshly loaded value), so the live value this
    // route forwards is the pretty-printed form, not the raw text fireEvent.change assigned.
    await waitFor(() => {
      expect(screen.getByTestId("connector-test-panel-stub").textContent).toBe(
        `connector-test-panel-stub-received:${CONNECTOR}:${prettyPrinted(UPDATED_CONFIGURATION)}`,
      );
    });
  });
});
