import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ConnectorConfigurationHelperFields } from "./connector-configuration-helper-fields";
import type { ConnectorConfigurationHelperState } from "../hooks/use-connector-configuration-helper";
import type { OpenApiOperation } from "../hooks/use-openapi-document-operations";

function operation(path: string, method: string): OpenApiOperation {
  return { path, method };
}

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

function openOperationSelect(): void {
  fireEvent.click(screen.getByLabelText("Operation"));
}

describe("ConnectorConfigurationHelperFields -- the Select offers every operation the state lists, none dropped (criterion 1, domain/integration/openapi-document-operations)", () => {
  it("opens onto exactly one option per entry in state.operations, both entries represented", () => {
    renderFields(
      stateWith({ operations: [operation("/items", "GET"), operation("/items", "POST")] }),
    );

    openOperationSelect();
    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    expect(options).toHaveLength(2);
    expect(options.some((option) => (option.textContent ?? "").includes("GET"))).toBe(true);
    expect(options.some((option) => (option.textContent ?? "").includes("POST"))).toBe(true);
  });
});

describe("ConnectorConfigurationHelperFields -- an option's label states both the entry's path and its method (criterion 2, domain/integration/openapi-operation)", () => {
  it("shows the entry's own path and its own method together on the option", () => {
    renderFields(stateWith({ operations: [operation("/v2/translate", "POST")] }));

    openOperationSelect();
    const option = screen.getByRole("option");
    const label = option.textContent ?? "";

    expect(label).toContain("/v2/translate");
    expect(label).toContain("POST");
  });
});

describe("ConnectorConfigurationHelperFields -- choosing an option calls the state's operation choice with that exact entry (criterion 3)", () => {
  it("invokes onChooseOperation once with the chosen entry, not a distractor sharing the same path", () => {
    const distractor = operation("/items", "GET");
    const chosen = operation("/items", "POST");
    const onChooseOperation = vi.fn();
    renderFields(stateWith({ operations: [distractor, chosen], onChooseOperation }));

    openOperationSelect();
    const options = within(screen.getByRole("listbox")).getAllByRole("option");
    const chosenOption = options.find((option) => (option.textContent ?? "").includes("POST"));
    if (chosenOption === undefined) {
      throw new Error("expected an option for the POST entry to be rendered");
    }
    fireEvent.mouseDown(chosenOption);

    expect(onChooseOperation).toHaveBeenCalledTimes(1);
    expect(onChooseOperation).toHaveBeenCalledWith(chosen);
  });
});

describe("ConnectorConfigurationHelperFields -- no free-text control for an operation path is rendered (criterion 4)", () => {
  it("renders no textbox whose accessible name refers to a path", () => {
    renderFields(stateWith({ operations: [operation("/items", "GET")] }));

    expect(screen.queryByRole("textbox", { name: /path/i })).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- no free-text control for an operation method is rendered (criterion 5)", () => {
  it("renders no textbox whose accessible name refers to a method", () => {
    renderFields(stateWith({ operations: [operation("/items", "GET")] }));

    expect(screen.queryByRole("textbox", { name: /method/i })).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- no path or method value can be supplied when the state offers no entries (criterion 6)", () => {
  it("opens onto no selectable option at all when state.operations is empty", () => {
    renderFields(stateWith({ operations: [] }));

    openOperationSelect();
    const listbox = screen.getByRole("listbox");

    expect(within(listbox).queryAllByRole("option")).toHaveLength(0);
  });
});

describe("ConnectorConfigurationHelperFields -- the OpenAPI document link field and the draft request control stay on the surface (criterion 7)", () => {
  it("still renders the OpenAPI document link input and the Request Draft button", () => {
    renderFields(stateWith());

    expect(screen.getByLabelText("OpenAPI document link")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Request Draft" })).toBeTruthy();
  });
});

describe("ConnectorConfigurationHelperFields -- a listed operation's method is not upper-cased when the state's own entry names it lower-case (UNDERDETERMINED, from rules/integration/an-openapi-operations-method-is-upper-cased)", () => {
  it("states the method upper-cased on the option regardless of the case the entry itself holds", () => {
    renderFields(stateWith({ operations: [operation("/items", "get")] }));

    openOperationSelect();
    const label = screen.getByRole("option").textContent ?? "";

    expect(label).toContain("GET");
  });
});
