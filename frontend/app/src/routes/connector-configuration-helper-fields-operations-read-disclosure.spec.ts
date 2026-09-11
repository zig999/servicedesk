import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectorConfigurationHelperFields } from "./connector-configuration-helper-fields";
import type { ConnectorConfigurationHelperState } from "../hooks/use-connector-configuration-helper";

function stateWith(
  overrides: Partial<ConnectorConfigurationHelperState> = {},
): ConnectorConfigurationHelperState {
  return {
    link: "",
    onLinkChange: () => {},
    operations: [],
    operationsOutcome: { kind: "idle" },
    onChooseOperation: () => {},
    path: "",
    onPathChange: () => {},
    method: "",
    onMethodChange: () => {},
    onRequestDraft: () => {},
    outcome: { kind: "idle" },
    ...overrides,
  };
}

function renderFields(state: ConnectorConfigurationHelperState) {
  return render(createElement(ConnectorConfigurationHelperFields, { state, onApply: () => {} }));
}

describe("ConnectorConfigurationHelperFields -- a refused operations read is disclosed as an alert inside the aria-live container (criterion 7)", () => {
  it("renders the operations-read refusal message in a role=alert element carrying text-sm text-destructive", () => {
    renderFields(stateWith({
      operationsOutcome: { kind: "openapi-document-not-readable" },
    }));

    const alert = screen.getByRole("alert");

    expect(alert.textContent).toContain("could not be read as an OpenAPI 3.x document");
    expect(alert.className).toContain("text-sm");
    expect(alert.className).toContain("text-destructive");
  });

  it("renders no operations-read alert while the read is idle", () => {
    renderFields(stateWith({ operationsOutcome: { kind: "idle" } }));

    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- the operations-read refusal and the draft refusal are both disclosed, independently (criteria 4, 8)", () => {
  it("renders both alerts at once when the operations read and the draft request are each refused", () => {
    renderFields(stateWith({
      operationsOutcome: {
        kind: "openapi-document-not-fetched",
        failure: { kind: "network-failure" },
      },
      outcome: { kind: "openapi-document-not-readable" },
    }));

    const alerts = screen.getAllByRole("alert");

    expect(alerts).toHaveLength(2);
    expect(alerts.some((alert) => (alert.textContent ?? "").includes("could not be fetched"))).toBe(true);
    expect(
      alerts.some((alert) => (alert.textContent ?? "").includes("could not be read as an OpenAPI 3.x document")),
    ).toBe(true);
  });
});
