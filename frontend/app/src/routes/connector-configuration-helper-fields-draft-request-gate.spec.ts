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

describe("ConnectorConfigurationHelperFields -- the draft-request act stands only over a named connector and a chosen operation, stating which of the two it waits on otherwise (criteria 1-5; rules/integration/a-draft-request-is-offered-only-over-a-named-connector-and-a-chosen-operation; UNDERDETERMINED whitespace entry)", () => {
  it("renders no act and states which precondition is missing for each way the gate can be unmet, and renders the enabled act once both stand", () => {
    const { unmount: unmountMissingConnectorEmpty } = renderFields(
      stateWith({ connector: "", path: "/v2/translate", method: "POST" }),
    );
    expect(screen.queryByRole("button", { name: "Request Draft" })).toBeNull();
    expect(screen.getByText("The request waits on a connector name.")).toBeTruthy();
    unmountMissingConnectorEmpty();

    const { unmount: unmountMissingConnectorWhitespace } = renderFields(
      stateWith({ connector: "   ", path: "/v2/translate", method: "POST" }),
    );
    expect(screen.queryByRole("button", { name: "Request Draft" })).toBeNull();
    expect(screen.getByText("The request waits on a connector name.")).toBeTruthy();
    unmountMissingConnectorWhitespace();

    const { unmount: unmountMissingOperation } = renderFields(
      stateWith({ connector: "deepl-connector", path: "", method: "" }),
    );
    expect(screen.queryByRole("button", { name: "Request Draft" })).toBeNull();
    expect(screen.getByText("The request waits on a chosen operation.")).toBeTruthy();
    unmountMissingOperation();

    const { unmount: unmountBothSatisfied } = renderFields(
      stateWith({ connector: "deepl-connector", path: "/v2/translate", method: "POST" }),
    );
    const button = screen.getByRole("button", { name: "Request Draft" });
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(screen.queryByText("The request waits on a connector name.")).toBeNull();
    expect(screen.queryByText("The request waits on a chosen operation.")).toBeNull();
    unmountBothSatisfied();
  });
});
