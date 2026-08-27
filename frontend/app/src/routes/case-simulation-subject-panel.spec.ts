import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { baseState, buildRequiredField, renderPanel } from "./case-simulation-subject-panel.test-support";

// Proof for task/subject-derivation/subject-panel's own criteria 1-4 (the subject-type field,
// the requester field, each derived required field's own label/connector/capability annotation,
// and a capability's own input_schema hint), mounted directly against CaseSimulationSubjectPanel
// with a built SimulationSubjectState -- this component is props-driven, wired to nothing yet
// (its own header comment). Criterion 5 (the add-attribute control) is proven in
// case-simulation-subject-panel-attributes.spec.ts, and criterion 6 plus the loading/error/
// empty-list inferences in case-simulation-subject-panel-json-view.spec.ts. Shared fixtures and
// the render helper live in case-simulation-subject-panel.test-support.ts, whose own header
// comment carries this proof's fixture and network-stubbing conventions.

afterEach(() => {
  vi.unstubAllGlobals();
});

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

describe("CaseSimulationSubjectPanel -- each derived required field is labeled and annotated (criterion 3)", () => {
  it("labels a required field with its own attribute name, shows its own value, and calls its own onChange when edited", async () => {
    const onChange = vi.fn();
    await renderPanel(
      baseState({ requiredFields: [buildRequiredField({ attribute: "account-id", value: "12345", onChange })] }),
    );

    expect(screen.getByLabelText<HTMLInputElement>("account-id").value).toBe("12345");

    fireEvent.change(screen.getByLabelText("account-id"), { target: { value: "98765" } });

    expect(onChange).toHaveBeenCalledWith("98765");
  });

  it("shows the connector and the capability that asked for a required field, alongside it", async () => {
    await renderPanel(
      baseState({
        requiredFields: [
          buildRequiredField({
            attribute: "account-id",
            connector: "core-banking-connector",
            capability: { name: "check-balance", version: "1.0.0" },
          }),
        ],
      }),
    );

    expect(screen.getByText("← core-banking-connector (check-balance 1.0.0)")).toBeTruthy();
  });

  it("renders one row per required field, each carrying its own attribute/connector/capability annotation", async () => {
    await renderPanel(
      baseState({
        requiredFields: [
          buildRequiredField({
            attribute: "account-id",
            connector: "core-banking-connector",
            capability: { name: "check-balance", version: "1.0.0" },
          }),
          buildRequiredField({
            attribute: "recipient-email",
            connector: "notification-connector",
            capability: { name: "send-email", version: "2.0.0" },
          }),
        ],
      }),
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("← core-banking-connector (check-balance 1.0.0)")).toBeTruthy();
    expect(screen.getByText("← notification-connector (send-email 2.0.0)")).toBeTruthy();
  });
});

describe("CaseSimulationSubjectPanel -- a capability's input_schema hint, where present, is shown as plain text (criterion 4)", () => {
  it("shows the hint text verbatim next to its own required field, prose included, never parsed or reformatted", async () => {
    await renderPanel(
      baseState({
        requiredFields: [
          buildRequiredField({
            attribute: "account-id",
            inputSchemaHint: "A one-line prose note, not a JSON schema.",
          }),
        ],
      }),
    );

    expect(screen.getByText("A one-line prose note, not a JSON schema.")).toBeTruthy();
  });

  it("shows no hint paragraph for a required field whose own inputSchemaHint is empty", async () => {
    await renderPanel(
      baseState({
        requiredFields: [
          buildRequiredField({ attribute: "field-with-hint", inputSchemaHint: "Has a hint." }),
          buildRequiredField({ attribute: "field-without-hint", inputSchemaHint: "" }),
        ],
      }),
    );

    const rows = screen.getAllByRole("listitem");
    const withoutHintRow = rows.find((row) => within(row).queryByText("field-without-hint") !== null);
    if (withoutHintRow === undefined) {
      throw new Error("expected a row for field-without-hint");
    }
    // Counting the row's own <p> elements (via Testing Library's own `selector` matcher option,
    // never raw DOM traversal) is the only way to confirm the hint paragraph is absent, since
    // there is no text left to query for its absence.
    expect(within(withoutHintRow).getAllByText(/./, { selector: "p" })).toHaveLength(1);
  });

  it("treats a whitespace-only inputSchemaHint the same as an empty one", async () => {
    await renderPanel(
      baseState({
        requiredFields: [buildRequiredField({ attribute: "whitespace-hint-field", inputSchemaHint: "   " })],
      }),
    );

    const row = screen.getByRole("listitem");
    expect(within(row).getAllByText(/./, { selector: "p" })).toHaveLength(1);
  });
});
