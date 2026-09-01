import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { render, screen } from "@testing-library/react";

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
