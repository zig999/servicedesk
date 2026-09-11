import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ConnectorConfigurationHelperFields } from "./connector-configuration-helper-fields";
import type { ConnectorConfigurationHelperState } from "../hooks/use-connector-configuration-helper";
import type {
  ConnectorConfigurationDraft,
  DraftConnectorConfigurationRequestOutcome,
} from "../hooks/use-draft-connector-configuration-from-openapi";

function baseState(outcome: DraftConnectorConfigurationRequestOutcome): ConnectorConfigurationHelperState {
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
    outcome,
  };
}

function renderHelperFields(
  outcome: DraftConnectorConfigurationRequestOutcome,
  onApply: (configurationText: string) => void = () => {},
) {
  return render(
    createElement(ConnectorConfigurationHelperFields, { state: baseState(outcome), onApply }),
  );
}

const BASE_DRAFT: ConnectorConfigurationDraft = {
  connector: "deepl-connector",
  configuration: "{}",
  unresolved: [],
  generated_credentials: [],
};

const DISTINCTIVE_CONFIGURATION_TEXT =
  '{"address":"https://api.example.com/v2/translate","distinctive":true}';

describe("ConnectorConfigurationHelperFields -- no Apply is offered while idle (criterion 7)", () => {
  it("renders no Apply button while the outcome is idle", () => {
    renderHelperFields({ kind: "idle" });

    expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- no Apply is offered while a request is pending (criterion 7)", () => {
  it("renders no Apply button while the outcome is pending", () => {
    renderHelperFields({ kind: "pending" });

    expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- no Apply is offered over a refused request (criterion 7)", () => {
  it("renders no Apply button when the outcome is a refusal", () => {
    renderHelperFields({ kind: "openapi-document-not-readable" });

    expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- Apply is offered once a draft has been answered (criterion 7)", () => {
  it("renders an Apply button once the outcome is drafted", () => {
    renderHelperFields({ kind: "drafted", draft: BASE_DRAFT });

    expect(screen.getByRole("button", { name: "Apply" })).toBeTruthy();
  });
});

describe("ConnectorConfigurationHelperFields -- clicking Apply carries the draft's own configuration text, unmodified (criterion 1, callback half)", () => {
  it("invokes onApply exactly once with the draft's own configuration text", () => {
    const onApply = vi.fn();
    renderHelperFields(
      { kind: "drafted", draft: { ...BASE_DRAFT, configuration: DISTINCTIVE_CONFIGURATION_TEXT } },
      onApply,
    );

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith(DISTINCTIVE_CONFIGURATION_TEXT);
  });
});

describe("ConnectorConfigurationHelperFields -- a prior drafted Apply affordance is withdrawn once a later request is refused (criterion 7, stale-draft edge case)", () => {
  it("stops offering Apply once the outcome moves from drafted to a refusal", () => {
    const { rerender } = renderHelperFields({
      kind: "drafted",
      draft: { ...BASE_DRAFT, configuration: DISTINCTIVE_CONFIGURATION_TEXT },
    });
    expect(screen.getByRole("button", { name: "Apply" })).toBeTruthy();

    rerender(
      createElement(ConnectorConfigurationHelperFields, {
        state: baseState({ kind: "openapi-document-not-readable" }),
        onApply: () => {},
      }),
    );

    expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
  });
});
