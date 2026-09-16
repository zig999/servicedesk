import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { CapabilitySchemaHelperFields } from "./capability-schema-helper-fields";
import type { CapabilitySchemaHelperState } from "../hooks/use-capability-schema-helper";
import type { OpenApiOperation } from "../hooks/use-openapi-document-operations";
import type {
  CapabilitySchemaDraft,
  DraftCapabilitySchemaRequestOutcome,
} from "../hooks/use-draft-capability-schema-from-openapi";

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

const NOT_FETCHED_REFUSAL: DraftCapabilitySchemaRequestOutcome = {
  kind: "openapi-document-not-fetched",
  link: "https://api.example.com/openapi.json",
  path: "/v2/translate",
  method: "POST",
};
const NOT_READABLE_REFUSAL: DraftCapabilitySchemaRequestOutcome = {
  kind: "openapi-document-not-readable",
  link: "https://api.example.com/openapi.json",
  path: "/v2/translate",
  method: "POST",
};
const OPERATION_NOT_FOUND_REFUSAL: DraftCapabilitySchemaRequestOutcome = {
  kind: "openapi-operation-not-found",
  link: "https://api.example.com/openapi.json",
  path: "/v2/translate",
  method: "PATCH",
};
const UNRECOGNIZED_REFUSAL: DraftCapabilitySchemaRequestOutcome = { kind: "unrecognized-failure" };

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

describe("CapabilitySchemaHelperFields -- an unfetchable OpenAPI link's refusal states that no draft was generated, distinctly from the other two named conditions (criterion 1)", () => {
  it("renders the not-fetched refusal as an alert stating no draft was generated", () => {
    renderFields(stateWith({ outcome: NOT_FETCHED_REFUSAL }));

    const alertText = screen.getByRole("alert").textContent ?? "";
    expect(alertText).toContain("Nenhum rascunho de esquema foi gerado");
    expect(alertText).toContain("não foi possível obter o link");
  });
});

describe("CapabilitySchemaHelperFields -- an unreadable OpenAPI document's refusal states that no draft was generated, distinctly from the other two named conditions (criterion 2)", () => {
  it("renders the not-readable refusal as an alert stating no draft was generated", () => {
    renderFields(stateWith({ outcome: NOT_READABLE_REFUSAL }));

    const alertText = screen.getByRole("alert").textContent ?? "";
    expect(alertText).toContain("Nenhum rascunho de esquema foi gerado");
    expect(alertText).toContain("não pôde ser lido como um documento OpenAPI 3.x");
  });
});

describe("CapabilitySchemaHelperFields -- an operation-not-found refusal states that no draft was generated and names the operation's own method and path, distinctly from the other two named conditions (criterion 3)", () => {
  it("renders the operation-not-found refusal as an alert stating no draft was generated and naming the method and path", () => {
    renderFields(stateWith({ outcome: OPERATION_NOT_FOUND_REFUSAL }));

    const alertText = screen.getByRole("alert").textContent ?? "";
    expect(alertText).toContain("Nenhum rascunho de esquema foi gerado");
    expect(alertText).toContain("PATCH");
    expect(alertText).toContain("/v2/translate");
  });
});

describe("CapabilitySchemaHelperFields -- an answer naming none of the three conditions states an unrecognised failure, reusing none of the three named refusal sentences (criterion 4)", () => {
  it("renders a fallback alert stating no draft was generated for a reason the surface does not recognise", () => {
    renderFields(stateWith({ outcome: UNRECOGNIZED_REFUSAL }));

    const alertText = screen.getByRole("alert").textContent ?? "";
    expect(alertText).toContain("Nenhum rascunho de esquema foi gerado");
    expect(alertText).not.toContain("não foi possível obter o link");
    expect(alertText).not.toContain("não pôde ser lido como um documento OpenAPI 3.x");
    expect(alertText).not.toContain("não declara nenhuma operação");
  });
});

describe("CapabilitySchemaHelperFields -- each of the four refusal readings is stated apart from the other three, and none of them renders any part of a draft beside it (criterion 5; rule rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator)", () => {
  it("renders a pairwise-distinct alert for each of the four refusal outcomes, none of them alongside a drafted input schema, output schema or unresolved-item section", () => {
    const cases: readonly DraftCapabilitySchemaRequestOutcome[] = [
      NOT_FETCHED_REFUSAL,
      NOT_READABLE_REFUSAL,
      OPERATION_NOT_FOUND_REFUSAL,
      UNRECOGNIZED_REFUSAL,
    ];

    const alertTexts = cases.map((outcome) => {
      const { unmount } = renderFields(stateWith({ outcome }));
      const alertText = screen.getByRole("alert").textContent ?? "";
      expect(alertText).toContain("Nenhum rascunho de esquema foi gerado");
      expect(screen.queryByText("Esquema de entrada rascunhado")).toBeNull();
      expect(screen.queryByText("Esquema de saída rascunhado")).toBeNull();
      expect(screen.queryByText("Não resolvidos")).toBeNull();
      unmount();
      return alertText;
    });

    expect(new Set(alertTexts).size).toBe(cases.length);
  });
});

describe("CapabilitySchemaHelperFields -- no refusal is stated while a schema draft request stands unanswered, whether none has been dispatched or one is in flight (criteria 6, 7; rule rules/integration/no-schema-draft-refusal-is-stated-before-the-operation-answers)", () => {
  it("renders no alert for an idle outcome and none for a pending outcome", () => {
    const { unmount } = renderFields(stateWith({ outcome: { kind: "idle" } }));
    expect(screen.queryByRole("alert")).toBeNull();
    unmount();

    renderFields(stateWith({ outcome: { kind: "pending" } }));
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
