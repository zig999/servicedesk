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

describe("ConnectorConfigurationHelperFields -- the outstanding-read statement is disclosed as plain text, apart from an alert (drafted-answer-disclosure/operations-read-states criterion 1)", () => {
  it("renders the outstanding-read message with no alert role", () => {
    renderFields(stateWith({ operationsOutcome: { kind: "pending" } }));

    expect(screen.getByText("The named link's operations are being read…")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- the no-operations-declared statement is disclosed as plain text, apart from an alert (drafted-answer-disclosure/operations-read-states criterion 2)", () => {
  it("renders the no-operations-declared message with no alert role", () => {
    renderFields(stateWith({ operationsOutcome: { kind: "operations", operations: [] } }));

    expect(screen.getByText("The fetched document declares no operation.")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- the outstanding-read and no-operations-declared statements are each apart from one another and from every refusal (drafted-answer-disclosure/operations-read-states criteria 3, 4; demonstrates rules/integration/the-configuration-helper-states-an-operations-read-outstanding-and-a-document-declaring-no-operation)", () => {
  it("renders five pairwise-distinct statements across the outstanding read, the no-operations document, and the three refusals, only the refusals as alerts", () => {
    const outcomesUnderTest: Array<{
      readonly outcome: ConnectorConfigurationHelperState["operationsOutcome"];
      readonly expectAlert: boolean;
    }> = [
      { outcome: { kind: "pending" }, expectAlert: false },
      { outcome: { kind: "operations", operations: [] }, expectAlert: false },
      {
        outcome: { kind: "openapi-document-not-fetched", failure: { kind: "network-failure" } },
        expectAlert: true,
      },
      { outcome: { kind: "openapi-document-not-readable" }, expectAlert: true },
      { outcome: { kind: "unrecognized-failure" }, expectAlert: true },
    ];

    const texts = outcomesUnderTest.map(({ outcome, expectAlert }) => {
      const { container, unmount } = renderFields(stateWith({ operationsOutcome: outcome }));

      expect(screen.queryByRole("alert") !== null).toBe(expectAlert);

      const text = (container.textContent ?? "").trim();
      unmount();
      return text;
    });

    expect(texts.every((text) => text.length > 0)).toBe(true);
    expect(new Set(texts).size).toBe(texts.length);
  });
});
