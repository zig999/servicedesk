import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { baseState, renderPanel } from "./case-simulation-subject-panel.test-support";

// Proof for task/subject-derivation/subject-panel's own criterion 5 (the "add attribute"
// control offers only glossary-drawn attribute names, satisfying
// rules/investigation/a-subject-attribute-is-drawn-from-the-glossary), mounted directly against
// CaseSimulationSubjectPanel. Criteria 1-4 are proven in case-simulation-subject-panel.spec.ts
// and criterion 6 plus the loading/error/empty-list inferences in
// case-simulation-subject-panel-json-view.spec.ts. Shared fixtures and the render helper live in
// case-simulation-subject-panel.test-support.ts, whose own header comment carries this proof's
// fixture and network-stubbing conventions.

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

  it("offers exactly the subject-attribute vocabulary's own current terms as options", async () => {
    await renderPanel(baseState({ addedAttributes: [{ id: "row-1", attribute: "", value: "" }] }));

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
