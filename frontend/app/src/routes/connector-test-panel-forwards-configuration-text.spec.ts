import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { render, screen } from "@testing-library/react";

// Proof for task/connector-test-panel-placeholder-attributes/route-configuration-text-to-test-panel's
// own criterion 2 ("ConnectorTestPanel forwards configurationText into
// useTestConnectorPanel(connector, configurationText)").
//
// useTestConnectorPanel holds configurationText in a ref it deliberately never reads
// (use-test-connector-panel.ts's own header comment), so nothing about the real hook's own return
// value differs by configurationText -- there is no rendered difference to observe through the
// real hook at all. The only way to observe what ConnectorTestPanel actually forwards is a
// stand-in for the hook that echoes its own two received arguments back into a field the real
// ConnectorTestPanelFields already renders (Requester, a plain <Input>), so this test reads a
// rendered value off the DOM rather than a recorded call.
//
// This departs from TST-03 ("A stand-in replaces a boundary the component does not own -- the
// network, storage, the clock -- and never the component's own rendering logic"):
// useTestConnectorPanel is none of those three boundaries. Disclosed as this file's own
// divergence -- nothing else makes this plumbing observable, since the value is unread by design.
vi.mock("../hooks/use-test-connector-panel", () => ({
  useTestConnectorPanel: (connector: string, configurationText: string) => ({
    capabilityOptions: [],
    isLoadingCapabilities: false,
    isCapabilitiesError: false,
    selectedCapabilityKey: null,
    selectedCapability: undefined,
    onSelectCapability: () => {},
    subjectTypeOptions: [],
    subjectType: "",
    onSubjectTypeChange: () => {},
    attributes: [],
    onAddAttribute: () => {},
    onRemoveAttribute: () => {},
    onAttributeChange: () => {},
    requester: `received:${connector}:${configurationText}`,
    onRequesterChange: () => {},
    canTest: false,
    testOutcome: { kind: "idle" as const },
    onTest: () => {},
  }),
}));

import { ConnectorTestPanel } from "./connector-test-panel";

describe("ConnectorTestPanel — forwards configurationText into useTestConnectorPanel (criterion 2)", () => {
  it("forwards exactly its own connector and configurationText props as useTestConnectorPanel's two positional arguments", () => {
    render(
      createElement(ConnectorTestPanel, {
        connector: "deepl-connector",
        configurationText: '{"key":"value"}',
      }),
    );

    const requesterInput = screen.getByLabelText<HTMLInputElement>("Requester");
    expect(requesterInput.value).toBe('received:deepl-connector:{"key":"value"}');
  });

  it("forwards an empty configurationText exactly as an empty string, not as undefined or a placeholder (edge case: empty input)", () => {
    render(
      createElement(ConnectorTestPanel, {
        connector: "deepl-connector",
        configurationText: "",
      }),
    );

    const requesterInput = screen.getByLabelText<HTMLInputElement>("Requester");
    expect(requesterInput.value).toBe("received:deepl-connector:");
  });

  it("forwards a re-rendered configurationText prop into the hook's own second argument again, not only at first mount (its own live value)", () => {
    const { rerender } = render(
      createElement(ConnectorTestPanel, {
        connector: "deepl-connector",
        configurationText: '{"key":"value"}',
      }),
    );

    rerender(
      createElement(ConnectorTestPanel, {
        connector: "deepl-connector",
        configurationText: '{"key":"updated"}',
      }),
    );

    const requesterInput = screen.getByLabelText<HTMLInputElement>("Requester");
    expect(requesterInput.value).toBe('received:deepl-connector:{"key":"updated"}');
  });
});
