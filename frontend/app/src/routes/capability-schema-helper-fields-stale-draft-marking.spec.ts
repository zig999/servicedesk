import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CapabilitySchemaHelperFields } from "./capability-schema-helper-fields";
import type { CapabilitySchemaHelperState } from "../hooks/use-capability-schema-helper";
import type { CapabilitySchemaDraft } from "../hooks/use-draft-capability-schema-from-openapi";

const DISTINCTIVE_DRAFT: CapabilitySchemaDraft = {
  input_schema: "DISTINCTIVE_INPUT_SCHEMA_MARKER_a91c",
  output_schema: "DISTINCTIVE_OUTPUT_SCHEMA_MARKER_c38f",
  unresolved: [],
};

function stateWith(overrides: Partial<CapabilitySchemaHelperState> = {}): CapabilitySchemaHelperState {
  return {
    link: "https://api.example.com/openapi.json",
    onLinkChange: () => {},
    operations: [],
    operationsOutcome: { kind: "idle" },
    onRetryOperationsRead: () => {},
    chosenOperation: undefined,
    onChooseOperation: () => {},
    onRequestDraft: () => {},
    outcome: {
      kind: "drafted",
      link: "https://api.example.com/openapi.json",
      path: "/v2/translate",
      method: "POST",
      draft: DISTINCTIVE_DRAFT,
    },
    ...overrides,
  };
}

function renderFields(
  state: CapabilitySchemaHelperState,
  overrides: {
    onApplyInputSchema?: (inputSchema: string) => void;
    onApplyOutputSchema?: (outputSchema: string) => void;
  } = {},
) {
  return render(
    createElement(CapabilitySchemaHelperFields, {
      state,
      onApplyInputSchema: overrides.onApplyInputSchema ?? vi.fn(),
      onApplyOutputSchema: overrides.onApplyOutputSchema ?? vi.fn(),
    }),
  );
}

describe("CapabilitySchemaHelperFields -- a stale drafted disclosure states its staleness beside the drafted schema, and a disclosure that is not stale states nothing about it (criteria 3, 4, 5)", () => {
  it("renders the stale statement when state.stale is true, and renders none when state.stale is false", () => {
    const { unmount } = renderFields(stateWith({ stale: true }));
    expect(screen.getByText(/desatualizado/i)).toBeTruthy();
    unmount();

    renderFields(stateWith({ stale: false }));
    expect(screen.queryByText(/desatualizado/i)).toBeNull();
  });
});

describe("CapabilitySchemaHelperFields -- a draft stated as stale still offers the act applying its input_schema and the act applying its output_schema (criterion 6)", () => {
  it("keeps both Apply buttons rendered and enabled while the draft is stale, each applying its own schema text unchanged", () => {
    const onApplyInputSchema = vi.fn();
    const onApplyOutputSchema = vi.fn();
    renderFields(stateWith({ stale: true }), { onApplyInputSchema, onApplyOutputSchema });

    const buttons = screen.getAllByRole("button", { name: "Aplicar" });
    expect(buttons).toHaveLength(2);
    expect(buttons.every((button) => !button.hasAttribute("disabled"))).toBe(true);

    const [inputButton, outputButton] = buttons;
    if (inputButton === undefined || outputButton === undefined) {
      throw new Error("capability-schema-helper-fields stale-draft-marking proof: expected two Aplicar buttons");
    }
    inputButton.click();
    outputButton.click();

    expect(onApplyInputSchema).toHaveBeenCalledWith(DISTINCTIVE_DRAFT.input_schema);
    expect(onApplyOutputSchema).toHaveBeenCalledWith(DISTINCTIVE_DRAFT.output_schema);
  });
});
