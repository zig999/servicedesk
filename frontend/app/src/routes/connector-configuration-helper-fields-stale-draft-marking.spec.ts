import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectorConfigurationHelperFields } from "./connector-configuration-helper-fields";
import type { ConnectorConfigurationHelperState } from "../hooks/use-connector-configuration-helper";
import type { ConnectorConfigurationDraft } from "../hooks/use-draft-connector-configuration-from-openapi";

const DISTINCTIVE_CONFIGURATION_TEXT = '{"address":"https://api.example.com/v2/translate","distinctive":true}';

const BASE_DRAFT: ConnectorConfigurationDraft = {
  connector: "deepl-connector",
  configuration: DISTINCTIVE_CONFIGURATION_TEXT,
  unresolved: [],
  generated_credentials: [],
  status_readings: [],
  response_fields: [],
  reading_notes: [],
};

function stateWith(overrides: Partial<ConnectorConfigurationHelperState> = {}): ConnectorConfigurationHelperState {
  return {
    connector: "deepl-connector",
    link: "https://api.example.com/openapi.json",
    onLinkChange: () => {},
    operations: [],
    operationsOutcome: { kind: "idle" },
    onChooseOperation: () => {},
    path: "/v2/translate",
    onPathChange: () => {},
    method: "POST",
    onMethodChange: () => {},
    onRequestDraft: () => {},
    outcome: { kind: "drafted", draft: BASE_DRAFT },
    ...overrides,
  };
}

function renderFields(
  state: ConnectorConfigurationHelperState,
  onApply: (configurationText: string) => void = () => {},
) {
  return render(createElement(ConnectorConfigurationHelperFields, { state, onApply }));
}

describe("ConnectorConfigurationHelperFields -- a stale drafted disclosure states its staleness beside the drafted configuration (criteria 4, 5, 6)", () => {
  it("renders a staleness statement when state.stale is true", () => {
    renderFields(stateWith({ stale: true }));

    expect(screen.getByText(/stale/i)).toBeTruthy();
  });
});

describe("ConnectorConfigurationHelperFields -- a drafted disclosure that is not stale states nothing about staleness", () => {
  it("renders no staleness statement when state.stale is false", () => {
    renderFields(stateWith({ stale: false }));

    expect(screen.queryByText(/stale/i)).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- a stale draft is not discarded and the act applying it stays offered (criterion 7)", () => {
  it("keeps the drafted configuration visible, offers the Apply act enabled, and applies the draft's own unchanged configuration text, even while the draft is stale", () => {
    const onApply = vi.fn();
    renderFields(stateWith({ stale: true }), onApply);

    expect(screen.getByText(DISTINCTIVE_CONFIGURATION_TEXT)).toBeTruthy();

    const button = screen.getByRole("button", { name: "Apply" });
    expect(button.hasAttribute("disabled")).toBe(false);

    button.click();

    expect(onApply).toHaveBeenCalledWith(DISTINCTIVE_CONFIGURATION_TEXT);
  });
});
