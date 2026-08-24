import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  SUBJECT_TYPE_PATH,
  capabilitiesPage,
  jsonResponse,
  mountTestPanelInEditMode,
  subjectTypeTermsPage,
  testCapability,
} from "./connector-test-panel.test-support";

// Proof for task/connector-configuration-authoring/test-connector-debug-panel's own criterion 2
// ("lets the operator pick a subject type and type that subject's attribute-values directly,
// with no list of existing subjects offered to select from"), its own disclosed
// stable-row-identity inference (each attribute row's own locally generated id, never the
// array's index), and the requester-is-free-text inference. Criterion 1 lives in the sibling
// connector-test-panel-capability-picker.spec.ts.

afterEach(() => {
  vi.unstubAllGlobals();
});

function baseHandlers(): Record<string, () => Response> {
  return {
    [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([testCapability()])),
    [SUBJECT_TYPE_PATH]: () =>
      jsonResponse(subjectTypeTermsPage(["billing-dispute", "customer-account"])),
  };
}

describe("ConnectorTestPanel — the subject type is drawn from the subject-type glossary vocabulary (criterion 2)", () => {
  it("offers exactly the subject-type vocabulary's own current terms as options, once the read resolves", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());

    fireEvent.click(within(dialog).getByLabelText("Subject type"));
    const listbox = await screen.findByRole("listbox");
    await within(listbox).findByRole("option", { name: "billing-dispute" });

    const options = within(listbox).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "billing-dispute",
      "customer-account",
    ]);
  });
});

describe("ConnectorTestPanel — attribute-values are typed by hand, never selected from an existing subject (criterion 2)", () => {
  it("lets the operator add an attribute row and type its own attribute name and value", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());

    fireEvent.click(within(dialog).getByRole("button", { name: "Add attribute" }));
    const attributeInput = within(dialog).getByLabelText<HTMLInputElement>("Attribute");
    const valueInput = within(dialog).getByLabelText<HTMLInputElement>("Value");
    fireEvent.change(attributeInput, { target: { value: "account-id" } });
    fireEvent.change(valueInput, { target: { value: "12345" } });

    expect(attributeInput.value).toBe("account-id");
    expect(valueInput.value).toBe("12345");
  });

  it("removes exactly the row whose own Remove action was clicked, leaving the other rows' own values intact (stable-row-identity inference)", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    const addButton = within(dialog).getByRole("button", { name: "Add attribute" });
    fireEvent.click(addButton);
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    const attributeInputs = within(dialog).getAllByLabelText<HTMLInputElement>("Attribute");
    const valueInputs = within(dialog).getAllByLabelText<HTMLInputElement>("Value");
    fireEvent.change(attributeInputs[0], { target: { value: "first-attribute" } });
    fireEvent.change(valueInputs[0], { target: { value: "first-value" } });
    fireEvent.change(attributeInputs[1], { target: { value: "second-attribute" } });
    fireEvent.change(valueInputs[1], { target: { value: "second-value" } });
    fireEvent.change(attributeInputs[2], { target: { value: "third-attribute" } });
    fireEvent.change(valueInputs[2], { target: { value: "third-value" } });

    const removeButtons = within(dialog).getAllByRole("button", { name: "Remove attribute" });
    fireEvent.click(removeButtons[1]);

    const remainingAttributes = within(dialog)
      .getAllByLabelText<HTMLInputElement>("Attribute")
      .map((input) => input.value);
    const remainingValues = within(dialog)
      .getAllByLabelText<HTMLInputElement>("Value")
      .map((input) => input.value);
    expect(remainingAttributes).toEqual(["first-attribute", "third-attribute"]);
    expect(remainingValues).toEqual(["first-value", "third-value"]);
  });

  it("issues no network request beyond the panel's own two dependent reads while a subject is assembled by hand", async () => {
    const { dialog, fetchMock } = await mountTestPanelInEditMode(baseHandlers());
    const callsBeforeTyping = fetchMock.mock.calls.length;

    fireEvent.click(within(dialog).getByRole("button", { name: "Add attribute" }));
    fireEvent.change(within(dialog).getByLabelText("Attribute"), {
      target: { value: "account-id" },
    });
    fireEvent.change(within(dialog).getByLabelText("Value"), { target: { value: "12345" } });

    expect(fetchMock.mock.calls.length).toBe(callsBeforeTyping);
  });

  it("renders the attribute-value row as plain text inputs, not a combobox offering existing subjects to pick from", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());

    fireEvent.click(within(dialog).getByRole("button", { name: "Add attribute" }));
    const valueInput = within(dialog).getByLabelText("Value");

    expect(valueInput.tagName).toBe("INPUT");
    expect(valueInput.getAttribute("role")).not.toBe("combobox");
  });
});

describe("ConnectorTestPanel — requester is collected as a plain free-text field (disclosed inference)", () => {
  it("renders Requester as a plain text input, and reflects whatever the operator types into it", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());

    const requesterInput = within(dialog).getByLabelText<HTMLInputElement>("Requester");
    expect(requesterInput.tagName).toBe("INPUT");
    expect(requesterInput.getAttribute("role")).not.toBe("combobox");

    fireEvent.change(requesterInput, { target: { value: "operator@example.com" } });

    expect(requesterInput.value).toBe("operator@example.com");
  });
});
