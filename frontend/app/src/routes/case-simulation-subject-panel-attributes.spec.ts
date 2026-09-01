import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { baseState, buildRequiredField, renderPanel } from "./case-simulation-subject-panel.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseSimulationSubjectPanel -- the add-attribute control offers only glossary-drawn attribute names, never a typed one (criterion 5, rules/investigation/a-subject-attribute-is-drawn-from-the-glossary)", () => {
  it("renders each added-attribute row's own Attribute field as a combobox, never a free-text input", async () => {
    await renderPanel(baseState({ addedAttributes: [{ id: "row-1", attribute: "", value: "" }] }));

    const attributeControl = screen.getByLabelText("Attribute");
    expect(attributeControl.tagName).toBe("BUTTON");
    expect(attributeControl.getAttribute("role")).toBe("combobox");
  });

  it("offers exactly the subject-attribute vocabulary's own current terms as options, when no requirement names any of them", async () => {

    await renderPanel(
      baseState({ requiredFields: [], addedAttributes: [{ id: "row-1", attribute: "", value: "" }] }),
    );

    fireEvent.click(screen.getByLabelText("Attribute"));
    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    expect(options.map((option) => option.textContent)).toEqual(["account-id", "email"]);
  });

  it("calls state.onAttributeChange with the row's own id and the picked attribute name", async () => {
    const onAttributeChange = vi.fn();
    await renderPanel(
      baseState({ addedAttributes: [{ id: "row-1", attribute: "", value: "" }], onAttributeChange }),
    );

    fireEvent.click(screen.getByLabelText("Attribute"));
    const listbox = screen.getByRole("listbox");
    fireEvent.mouseDown(within(listbox).getByRole("option", { name: "email" }));

    expect(onAttributeChange).toHaveBeenCalledWith("row-1", "attribute", "email");
  });

  it("calls state.onAttributeChange with the row's own id and the value typed into its own Value field", async () => {
    const onAttributeChange = vi.fn();
    await renderPanel(
      baseState({
        addedAttributes: [{ id: "row-1", attribute: "account-id", value: "" }],
        onAttributeChange,
      }),
    );

    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "12345" } });

    expect(onAttributeChange).toHaveBeenCalledWith("row-1", "value", "12345");
  });

  it("calls state.onAddAttribute when '+ attribute' is clicked", async () => {
    const onAddAttribute = vi.fn();
    await renderPanel(baseState({ onAddAttribute }));

    fireEvent.click(screen.getByRole("button", { name: "+ attribute" }));

    expect(onAddAttribute).toHaveBeenCalledTimes(1);
  });

  it("calls state.onRemoveAttribute with exactly the id of the row whose own Remove action was clicked, never by position (edge case)", async () => {
    const onRemoveAttribute = vi.fn();
    await renderPanel(
      baseState({
        addedAttributes: [
          { id: "row-1", attribute: "account-id", value: "1" },
          { id: "row-2", attribute: "email", value: "2" },
        ],
        onRemoveAttribute,
      }),
    );

    const removeButtons = screen.getAllByRole("button", { name: "Remove attribute" });
    fireEvent.click(removeButtons[1]);

    expect(onRemoveAttribute).toHaveBeenCalledWith("row-2");
  });

  it("renders no Remove-attribute button when the curator has added no rows yet (edge case)", async () => {
    await renderPanel(baseState({ addedAttributes: [] }));

    expect(screen.queryByRole("button", { name: "Remove attribute" })).toBeNull();
    expect(screen.getByRole("button", { name: "+ attribute" })).toBeTruthy();
  });
});

describe("CaseSimulationSubjectPanel -- the add-attribute control excludes every attribute name state.requiredFields already names (criteria 1 and 3: the same assertion that proves no excluded option is offered also proves none can be picked and added a second time through this control, since onAttributeChange can only ever be invoked with an option this Select actually renders)", () => {
  it("removes the required attribute's own name from the Select's own options, leaving only the vocabulary term no requirement names", async () => {
    await renderPanel(
      baseState({
        requiredFields: [buildRequiredField({ attribute: "account-id", required: true })],
        addedAttributes: [{ id: "row-1", attribute: "", value: "" }],
      }),
    );

    fireEvent.click(screen.getByLabelText("Attribute"));
    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    expect(options.map((option) => option.textContent)).toEqual(["email"]);
  });
});

describe("CaseSimulationSubjectPanel -- every option the filtered Select still offers stays glossary-drawn, the control itself never becoming free text (criterion 2)", () => {
  it("keeps the Attribute field a Select-typed combobox, not an Input, once a required attribute has been filtered out of its options", async () => {
    await renderPanel(
      baseState({
        requiredFields: [buildRequiredField({ attribute: "account-id", required: true })],
        addedAttributes: [{ id: "row-1", attribute: "", value: "" }],
      }),
    );

    const attributeControl = screen.getByLabelText("Attribute");
    expect(attributeControl.tagName).toBe("BUTTON");
    expect(attributeControl.getAttribute("role")).toBe("combobox");
  });
});

describe("CaseSimulationSubjectPanel -- the control offers no option, rather than falling back to the unfiltered vocabulary, once the requirement set already names every attribute the vocabulary holds (criterion 5, edge case)", () => {
  it("opens an empty listbox when every subject-attribute vocabulary term is already named by a requirement", async () => {
    await renderPanel(
      baseState({
        requiredFields: [
          buildRequiredField({ attribute: "account-id", required: true }),
          buildRequiredField({ attribute: "email", required: false }),
        ],
        addedAttributes: [{ id: "row-1", attribute: "", value: "" }],
      }),
    );

    fireEvent.click(screen.getByLabelText("Attribute"));
    const listbox = screen.getByRole("listbox");

    expect(within(listbox).queryAllByRole("option")).toHaveLength(0);
  });
});

describe("CaseSimulationSubjectPanel -- an attribute already picked through an earlier added-attribute row stays offered in a later row's own Select (UNDERDETERMINED, from the specification -- every criterion of this task scopes the exclusion to state.requiredFields alone, and none of the attribute-provenance/one-value-per-attribute rules this task implements names state.addedAttributes either; an implementation that also excluded an attribute already typed into an earlier row would still satisfy every criterion as written)", () => {
  it("still offers an attribute already typed into an earlier row as an option for a later, still-unfilled row", async () => {
    await renderPanel(
      baseState({
        requiredFields: [buildRequiredField({ attribute: "account-id", required: true })],
        addedAttributes: [
          { id: "row-1", attribute: "email", value: "ops@example.com" },
          { id: "row-2", attribute: "", value: "" },
        ],
      }),
    );

    const attributeControls = screen.getAllByLabelText("Attribute");
    fireEvent.click(attributeControls[1]);
    const listbox = screen.getByRole("listbox");

    expect(within(listbox).getAllByRole("option").map((option) => option.textContent)).toEqual(["email"]);
  });
});
