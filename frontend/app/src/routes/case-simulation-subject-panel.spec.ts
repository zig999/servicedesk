import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  baseState,
  buildCapability,
  buildRequiredField,
  renderPanel,
} from "./case-simulation-subject-panel.test-support";

// Proof for task/subject-input-requirements/present-each-requirement-with-its-required-standing's
// own criteria over the requirement-rendering block: an input for every requirement, required and
// optional alike (criterion 1); a required requirement's input shown as required (criterion 2) and
// an optional one shown without that marking (criterion 3); every one of a requirement's own asking
// capabilities shown by its own name, version and connector, plus its own input-schema hint where
// the state carries one (criterion 4); and that the panel reads every one of these straight off the
// state it is passed rather than deriving any of it (criterion 6). Criterion 5 (the explicit empty
// state, and the UNDERDETERMINED note over its own wording) is proven in
// case-simulation-subject-panel-json-view.spec.ts. The subject-type and requester sections below
// predate this task (task/subject-derivation/subject-panel) and are unaffected by it; the
// add-attribute control is proven in case-simulation-subject-panel-attributes.spec.ts. Shared
// fixtures and the render helper live in case-simulation-subject-panel.test-support.ts.

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * The requirement rows only -- a <li> carrying the requirement's own labeled Input -- as
 * opposed to a nested capability <li> underneath it, which carries no control of its own.
 * screen.getAllByRole("listitem") alone returns both levels once a requirement's own
 * capabilities render as a nested <ul>, so every test below that counts or indexes rows uses
 * this filter rather than the raw query.
 */
function requirementRows(): HTMLElement[] {
  return screen.getAllByRole("listitem").filter((item) => within(item).queryByRole("textbox") !== null);
}

describe("CaseSimulationSubjectPanel -- the subject type is drawn from the glossary vocabulary, never typed (criterion 1)", () => {
  it("renders the Type field as a combobox, never a free-text input", async () => {
    await renderPanel(baseState());

    const trigger = screen.getByLabelText("Type");
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("role")).toBe("combobox");
  });

  it("offers exactly the subject-type vocabulary's own current terms as options", async () => {
    await renderPanel(baseState());

    fireEvent.click(screen.getByLabelText("Type"));
    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    expect(options.map((option) => option.textContent)).toEqual(["billing-dispute", "customer-account"]);
  });

  it("shows the given state.subject.type as the Type field's own selected value", async () => {
    await renderPanel(baseState());

    expect(screen.getByLabelText("Type").textContent).toBe("billing-dispute");
  });

  it("leaves the displayed subject type unchanged after picking a different vocabulary option, since the composed hook exposes no setter for it (disclosed inference)", async () => {
    await renderPanel(baseState());

    fireEvent.click(screen.getByLabelText("Type"));
    const listbox = screen.getByRole("listbox");
    fireEvent.mouseDown(within(listbox).getByRole("option", { name: "customer-account" }));

    expect(screen.getByLabelText("Type").textContent).toBe("billing-dispute");
  });
});

describe("CaseSimulationSubjectPanel -- the requester field is part of the region's own state (criterion 2)", () => {
  it("shows state.requester as the Requester field's own value", async () => {
    await renderPanel(baseState({ requester: "ops@example.com" }));

    expect(screen.getByLabelText<HTMLInputElement>("Requester").value).toBe("ops@example.com");
  });

  it("calls state.onRequesterChange with what was typed, rather than holding requester as its own state", async () => {
    const onRequesterChange = vi.fn();
    await renderPanel(baseState({ requester: "", onRequesterChange }));

    fireEvent.change(screen.getByLabelText("Requester"), { target: { value: "curator@example.com" } });

    expect(onRequesterChange).toHaveBeenCalledWith("curator@example.com");
  });
});

describe("CaseSimulationSubjectPanel -- an input is rendered for every requirement the state exposes, required and optional alike (criterion 1)", () => {
  it("renders a labeled input for a required requirement and for an optional one, neither filtered out", async () => {
    await renderPanel(
      baseState({
        requiredFields: [
          buildRequiredField({ attribute: "account-id", required: true }),
          buildRequiredField({ attribute: "notes", required: false }),
        ],
      }),
    );

    expect(screen.getByLabelText<HTMLInputElement>("account-id")).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>("notes")).toBeTruthy();
    expect(requirementRows()).toHaveLength(2);
  });
});

describe("CaseSimulationSubjectPanel -- a required requirement's own input is shown as required (criterion 2)", () => {
  it("carries the native required attribute, and a visible asterisk on its own label", async () => {
    await renderPanel(
      baseState({ requiredFields: [buildRequiredField({ attribute: "account-id", required: true })] }),
    );

    expect(screen.getByLabelText<HTMLInputElement>("account-id").required).toBe(true);
    const [row] = requirementRows();
    expect(within(row).getByText("*")).toBeTruthy();
  });
});

describe("CaseSimulationSubjectPanel -- an optional requirement's own input is rendered without that marking (criterion 3)", () => {
  it("carries no required attribute and no asterisk", async () => {
    await renderPanel(
      baseState({ requiredFields: [buildRequiredField({ attribute: "notes", required: false })] }),
    );

    expect(screen.getByLabelText<HTMLInputElement>("notes").required).toBe(false);
    const [row] = requirementRows();
    expect(within(row).queryByText("*")).toBeNull();
  });
});

describe("CaseSimulationSubjectPanel -- a required marking never becomes a client-side dispatch-blocking gate (UNDERDETERMINED, from the specification -- rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses: the composed subject's own required marking must not disable or block either dispatch while a required input is empty)", () => {
  it("renders no disabled control anywhere in the panel while a required requirement is left empty", async () => {
    await renderPanel(
      baseState({
        requiredFields: [buildRequiredField({ attribute: "account-id", required: true, value: "" })],
      }),
    );

    expect(screen.getByLabelText<HTMLInputElement>("account-id").disabled).toBe(false);
    for (const button of screen.getAllByRole("button")) {
      expect(button.hasAttribute("disabled")).toBe(false);
    }
  });
});

describe("CaseSimulationSubjectPanel -- every asking capability for a requirement is shown by its own name, version and connector, never only one (criterion 4)", () => {
  it("shows a single asking capability's own connector, name and version", async () => {
    await renderPanel(
      baseState({
        requiredFields: [
          buildRequiredField({
            attribute: "account-id",
            capabilities: [
              buildCapability({ name: "check-balance", version: "1.0.0", connector: "core-banking-connector" }),
            ],
          }),
        ],
      }),
    );

    expect(screen.getByText("← core-banking-connector (check-balance 1.0.0)")).toBeTruthy();
  });

  it("shows every one of two or more asking capabilities, each with its own name, version and connector -- never only the first (multi-capability rendering)", async () => {
    await renderPanel(
      baseState({
        requiredFields: [
          buildRequiredField({
            attribute: "account-id",
            capabilities: [
              buildCapability({ name: "check-balance", version: "1.0.0", connector: "core-banking-connector" }),
              buildCapability({ name: "check-balance", version: "2.0.0", connector: "core-banking-connector-v2" }),
              buildCapability({ name: "verify-identity", version: "3.1.0", connector: "identity-connector" }),
            ],
          }),
        ],
      }),
    );

    expect(screen.getByText("← core-banking-connector (check-balance 1.0.0)")).toBeTruthy();
    expect(screen.getByText("← core-banking-connector-v2 (check-balance 2.0.0)")).toBeTruthy();
    expect(screen.getByText("← identity-connector (verify-identity 3.1.0)")).toBeTruthy();
  });

  it("renders no capability list under a requirement whose own capabilities array is empty (edge case: no currently-registered capability resolves)", async () => {
    await renderPanel(
      baseState({ requiredFields: [buildRequiredField({ attribute: "account-id", capabilities: [] })] }),
    );

    const [row] = requirementRows();
    expect(within(row).queryByRole("list")).toBeNull();
  });
});

describe("CaseSimulationSubjectPanel -- a capability's own input-schema hint, where present, is shown verbatim next to it (criterion 4)", () => {
  it("shows the hint text verbatim next to its own capability, prose included, never parsed or reformatted", async () => {
    await renderPanel(
      baseState({
        requiredFields: [
          buildRequiredField({
            attribute: "account-id",
            capabilities: [buildCapability({ inputSchemaHint: "A one-line prose note, not a JSON schema." })],
          }),
        ],
      }),
    );

    expect(screen.getByText(/A one-line prose note, not a JSON schema\./)).toBeTruthy();
  });

  it("shows no hint text for a capability whose own inputSchemaHint is empty", async () => {
    await renderPanel(
      baseState({
        requiredFields: [
          buildRequiredField({ attribute: "account-id", capabilities: [buildCapability({ inputSchemaHint: "" })] }),
        ],
      }),
    );

    const [row] = requirementRows();
    expect(within(row).queryByText(/—/)).toBeNull();
  });

  it("treats a whitespace-only inputSchemaHint the same as an empty one", async () => {
    await renderPanel(
      baseState({
        requiredFields: [
          buildRequiredField({
            attribute: "account-id",
            capabilities: [buildCapability({ inputSchemaHint: "   " })],
          }),
        ],
      }),
    );

    const [row] = requirementRows();
    expect(within(row).queryByText(/—/)).toBeNull();
  });

  it("shows each capability's own hint only, never mixed with another capability's, when two capabilities are present", async () => {
    await renderPanel(
      baseState({
        requiredFields: [
          buildRequiredField({
            attribute: "account-id",
            capabilities: [
              buildCapability({ name: "check-balance", version: "1.0.0", inputSchemaHint: "First hint." }),
              buildCapability({ name: "send-email", version: "2.0.0", inputSchemaHint: "Second hint." }),
            ],
          }),
        ],
      }),
    );

    const firstEntryText = screen.getByText("← core-banking-connector (check-balance 1.0.0)");
    const secondEntryText = screen.getByText("← core-banking-connector (send-email 2.0.0)");
    // Confirming each capability's own hint sits beside its own entry, and no other, is only
    // checkable by reading the enclosing <li>'s own text, mirroring
    // case-simulation-subject-panel-json-view.spec.ts's own established convention for reading a
    // raw DOM ancestor.
    // eslint-disable-next-line testing-library/no-node-access
    const firstItem = firstEntryText.closest("li");
    // eslint-disable-next-line testing-library/no-node-access
    const secondItem = secondEntryText.closest("li");

    expect(firstItem?.textContent).toContain("First hint.");
    expect(firstItem?.textContent).not.toContain("Second hint.");
    expect(secondItem?.textContent).toContain("Second hint.");
    expect(secondItem?.textContent).not.toContain("First hint.");
  });
});

describe("CaseSimulationSubjectPanel -- the panel recomputes no requirement, no required flag and no annotation, reading each from the state it is passed (criterion 6)", () => {
  it("renders requirements in the order the state gives them, each with its own required marking held independently of the others", async () => {
    await renderPanel(
      baseState({
        requiredFields: [
          buildRequiredField({ attribute: "notes", required: false }),
          buildRequiredField({ attribute: "account-id", required: true }),
        ],
      }),
    );

    const rows = requirementRows();
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByLabelText("notes")).toBeTruthy();
    expect(within(rows[0]).queryByText("*")).toBeNull();
    expect(within(rows[1]).getByLabelText("account-id")).toBeTruthy();
    expect(within(rows[1]).getByText("*")).toBeTruthy();
  });
});
