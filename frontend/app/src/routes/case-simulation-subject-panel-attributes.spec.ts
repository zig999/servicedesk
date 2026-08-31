import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { baseState, buildRequiredField, renderPanel } from "./case-simulation-subject-panel.test-support";

// Proof for task/subject-derivation/subject-panel's own criterion 5 (the "add attribute"
// control offers only glossary-drawn attribute names, satisfying
// rules/investigation/a-subject-attribute-is-drawn-from-the-glossary), mounted directly against
// CaseSimulationSubjectPanel. Criteria 1-4 are proven in case-simulation-subject-panel.spec.ts
// and criterion 6 plus the loading/error/empty-list inferences in
// case-simulation-subject-panel-json-view.spec.ts. Shared fixtures and the render helper live in
// case-simulation-subject-panel.test-support.ts, whose own header comment carries this proof's
// fixture and network-stubbing conventions.
//
// task/subject-input-requirements/exclude-already-required-attributes-from-the-add-control's own
// five criteria, and its own UNDERDETERMINED note over state.addedAttributes, are proven in the
// last describe blocks below, appended to this same file rather than a new sibling (MNT-01's own
// three-hundred-line ceiling, checked against this file's own line count, still leaves room).

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
    // requiredFields is overridden to [] here, rather than left at baseState's own default
    // (which names "account-id", one of the two mocked vocabulary terms): this task's own sibling,
    // task/subject-input-requirements/exclude-already-required-attributes-from-the-add-control,
    // now excludes a requirement-named attribute from these same options, so this criterion-5
    // proof (task/subject-derivation/subject-panel) needs no requirement in play to state its own
    // claim -- that filter's own proof lives in the last describe blocks of this file.
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

// Proof for task/subject-input-requirements/exclude-already-required-attributes-from-the-add-control's
// own criteria (rules/investigation/a-composed-subject-presents-every-case-input-requirement,
// rules/investigation/a-subject-attribute-is-drawn-from-the-glossary,
// rules/investigation/a-subject-holds-one-value-per-attribute), mounted the same way as the rest
// of this file. Criterion 4 (useGlossaryVocabularyOptions still answers with the whole vocabulary
// for its other consumers) is a non-regression claim about a different component
// (glossary-browser-screen.tsx, not this panel) and is already proven by
// glossary-browser-screen-vocabulary-tabs.spec.ts's own it.each over VOCABULARY_TAB_CASES, whose
// "Subject attributes" case mounts glossary-browser-screen.tsx against a stubbed
// GET /v1/glossary/subject-attribute returning three terms and asserts all three render as
// rows -- proving that other caller still receives useGlossaryVocabularyOptions("subject-attribute")'s
// own unfiltered options after this task's own filtering was added inside this file's own
// component; no new test for it is written here.

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
