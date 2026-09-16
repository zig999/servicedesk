import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { CapabilitySchemaHelperFields } from "./capability-schema-helper-fields";
import type { CapabilitySchemaHelperState } from "../hooks/use-capability-schema-helper";
import type { OpenApiOperation } from "../hooks/use-openapi-document-operations";
import type { CapabilitySchemaDraft } from "../hooks/use-draft-capability-schema-from-openapi";

function operation(path: string, method: string): OpenApiOperation {
  return { path, method };
}

function stateWith(
  overrides: Partial<CapabilitySchemaHelperState> = {},
): CapabilitySchemaHelperState {
  return {
    link: "",
    onLinkChange: () => {},
    operations: [],
    operationsOutcome: { kind: "idle" },
    onRetryOperationsRead: () => {},
    chosenOperation: undefined,
    onChooseOperation: () => {},
    onRequestDraft: () => {},
    outcome: { kind: "idle" },
    ...overrides,
  };
}

function renderFields(state: CapabilitySchemaHelperState) {
  return render(createElement(CapabilitySchemaHelperFields, { state }));
}

function openOperationSelect(): void {
  fireEvent.click(screen.getByLabelText("Operação"));
}

function normalized(element: HTMLElement): string {
  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
}

function draftedOutcomeState(draft: CapabilitySchemaDraft): CapabilitySchemaHelperState {
  return stateWith({
    outcome: {
      kind: "drafted",
      link: "https://api.example.com/openapi.json",
      path: "/v2/translate",
      method: "POST",
      draft,
    },
  });
}

describe("CapabilitySchemaHelperFields -- the operation Select offers every operation the state lists, none dropped (criterion 3)", () => {
  it("opens onto exactly one option per entry in state.operations, both entries represented", () => {
    renderFields(stateWith({ operations: [operation("/items", "GET"), operation("/items", "POST")] }));

    openOperationSelect();
    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    expect(options).toHaveLength(2);
    expect(options.some((option) => (option.textContent ?? "").includes("GET"))).toBe(true);
    expect(options.some((option) => (option.textContent ?? "").includes("POST"))).toBe(true);
  });
});

describe("CapabilitySchemaHelperFields -- an operation is named only by choosing one of the listed entries (criterion 4)", () => {
  it("invokes onChooseOperation once with the exact chosen entry, not a distractor sharing the same path", () => {
    const distractor = operation("/items", "GET");
    const chosen = operation("/items", "POST");
    const onChooseOperation = vi.fn();
    renderFields(stateWith({ operations: [distractor, chosen], onChooseOperation }));

    openOperationSelect();
    const options = within(screen.getByRole("listbox")).getAllByRole("option");
    const chosenOption = options.find((option) => (option.textContent ?? "").includes("POST"));
    if (chosenOption === undefined) {
      throw new Error("capability-schema-helper-fields proof: expected an option for the POST entry to be rendered");
    }
    fireEvent.mouseDown(chosenOption);

    expect(onChooseOperation).toHaveBeenCalledTimes(1);
    expect(onChooseOperation).toHaveBeenCalledWith(chosen);
  });

  it("renders no textbox whose accessible name refers to a path", () => {
    renderFields(stateWith({ operations: [operation("/items", "GET")] }));

    expect(screen.queryByRole("textbox", { name: /path/i })).toBeNull();
  });

  it("renders no textbox whose accessible name refers to a method", () => {
    renderFields(stateWith({ operations: [operation("/items", "GET")] }));

    expect(screen.queryByRole("textbox", { name: /method/i })).toBeNull();
  });
});

describe("CapabilitySchemaHelperFields -- the request act stands only over a chosen operation, stating in its own place that it waits on one otherwise, and dispatches once it is chosen (criteria 5, 6, 7)", () => {
  it("renders the waiting message and no request button while unchosen, and an enabled request button dispatching onRequestDraft once an operation is chosen", () => {
    const { unmount: unmountUnchosen } = renderFields(stateWith({ chosenOperation: undefined }));
    expect(screen.queryByRole("button", { name: "Solicitar rascunho de schema" })).toBeNull();
    expect(screen.getByText("Escolha uma operação para solicitar um rascunho de schema.")).toBeTruthy();
    unmountUnchosen();

    const onRequestDraft = vi.fn();
    const chosen = operation("/v2/translate", "POST");
    renderFields(stateWith({ chosenOperation: chosen, onRequestDraft }));
    expect(screen.queryByText("Escolha uma operação para solicitar um rascunho de schema.")).toBeNull();
    const button = screen.getByRole("button", { name: "Solicitar rascunho de schema" });
    expect(button.hasAttribute("disabled")).toBe(false);

    fireEvent.click(button);
    expect(onRequestDraft).toHaveBeenCalledTimes(1);
  });
});

describe("CapabilitySchemaHelperFields -- a drafted answer's whole draft is stated: both schema texts and every unresolved item by its own name and its own reason, the two reasons held apart even for a name repeated under both, and no name or reason beyond what the answer carried (criteria 1, 2, 3, 4, 5, 6, 7, 8; rule rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator)", () => {
  it("renders both schema texts verbatim and exactly the three unresolved items the answer carried, each labeled under its own reason", () => {
    const draft: CapabilitySchemaDraft = {
      input_schema: "INPUT_SCHEMA_MARKER_7f3a",
      output_schema: "OUTPUT_SCHEMA_MARKER_9c1e",
      unresolved: [
        { name: "alpha", reason: "schema-not-reducible-to-a-type" },
        { name: "alpha", reason: "name-claimed-by-another-parameter" },
        { name: "beta", reason: "name-claimed-by-another-parameter" },
      ],
    };

    renderFields(draftedOutcomeState(draft));

    expect(screen.getByText("INPUT_SCHEMA_MARKER_7f3a")).toBeTruthy();
    expect(screen.getByText("OUTPUT_SCHEMA_MARKER_9c1e")).toBeTruthy();

    const items = screen.getAllByRole("listitem").map(normalized);
    expect(items).toHaveLength(3);

    const [firstAlpha, secondAlpha, betaItem] = items;
    if (firstAlpha === undefined || secondAlpha === undefined || betaItem === undefined) {
      throw new Error("capability-schema-helper-fields proof: expected three unresolved list items");
    }
    expect(firstAlpha.startsWith("alpha:")).toBe(true);
    expect(secondAlpha.startsWith("alpha:")).toBe(true);
    expect(betaItem.startsWith("beta:")).toBe(true);

    const firstAlphaLabel = firstAlpha.slice("alpha:".length).trim();
    const secondAlphaLabel = secondAlpha.slice("alpha:".length).trim();
    const betaLabel = betaItem.slice("beta:".length).trim();

    expect(firstAlphaLabel.length).toBeGreaterThan(0);
    expect(secondAlphaLabel.length).toBeGreaterThan(0);
    expect(firstAlphaLabel).not.toBe(secondAlphaLabel);
    expect(secondAlphaLabel).toBe(betaLabel);
  });
});

describe("CapabilitySchemaHelperFields -- an answer carrying no unresolved item states none (criterion 9)", () => {
  it("renders no unresolved list item when the answer's unresolved list is empty", () => {
    const draft: CapabilitySchemaDraft = {
      input_schema: "{}",
      output_schema: "{}",
      unresolved: [],
    };

    renderFields(draftedOutcomeState(draft));

    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
