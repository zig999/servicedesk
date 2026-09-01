import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  SUBJECT_TYPE_PATH,
  capabilitiesPage,
  jsonResponse,
  mountTestPanelInEditMode,
  subjectTypeTermsPage,
  testCapability,
} from "./connector-test-panel.test-support";

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

  it("adds a row already named for Configuration's own placeholder, and lets the operator type its value (reconciliation)", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());

    fireEvent.click(within(dialog).getByRole("button", { name: "Add attribute" }));
    const attributeInput = within(dialog).getByLabelText<HTMLInputElement>("Attribute");
    const valueInput = within(dialog).getByLabelText<HTMLInputElement>("Value");
    expect(attributeInput.value).toBe("account-id");

    fireEvent.change(valueInput, { target: { value: "12345" } });

    expect(attributeInput.value).toBe("account-id");
    expect(valueInput.value).toBe("12345");
  });

  it("removes exactly the row whose own Remove action was clicked, leaving the other rows' own values intact (stable-row-identity inference)", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());

    fireEvent.change(within(dialog).getByLabelText("Configuration"), {
      target: {
        value:
          '{"address":"https://api.example.com/${subject:first-attribute}","query":{"a":"${subject:second-attribute}"},"headers":{"h":"${subject:third-attribute}"}}',
      },
    });

    const saveButton = within(dialog).getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(saveButton.hasAttribute("disabled")).toBe(true);
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Add attribute" }));

    const attributeInputs = within(dialog).getAllByLabelText<HTMLInputElement>("Attribute");
    const valueInputs = within(dialog).getAllByLabelText<HTMLInputElement>("Value");
    expect(attributeInputs.map((input) => input.value)).toEqual([
      "first-attribute",
      "second-attribute",
      "third-attribute",
    ]);
    fireEvent.change(valueInputs[0], { target: { value: "first-value" } });
    fireEvent.change(valueInputs[1], { target: { value: "second-value" } });
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
