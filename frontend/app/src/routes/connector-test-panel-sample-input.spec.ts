import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, within } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  SUBJECT_TYPE_PATH,
  capabilitiesPage,
  jsonResponse,
  mountTestPanelInEditMode,
  selectOptionAsync,
  subjectTypeTermsPage,
  testCapability,
} from "./connector-test-panel.test-support";

// Proof for task/connector-configuration-authoring/test-connector-debug-panel's own criterion 3
// ("The sample input field is edited through the shared JSON beautify/minify textarea, scoped to
// the chosen capability's own input_schema"), its own disclosed "defaults to {} rather than
// blank" inference, and its own disclosed "falls back to the raw stored string" inference for a
// capability whose input_schema does not itself parse. Criteria 1-2 live in the sibling
// connector-test-panel-capability-picker.spec.ts and connector-test-panel-subject-and-attributes.spec.ts.

afterEach(() => {
  vi.unstubAllGlobals();
});

function baseHandlers(inputSchema: string): Record<string, () => Response> {
  return {
    [CAPABILITIES_PATH]: () =>
      jsonResponse(capabilitiesPage([testCapability({ input_schema: inputSchema })])),
    [SUBJECT_TYPE_PATH]: () => jsonResponse(subjectTypeTermsPage(["billing-dispute"])),
  };
}

describe("ConnectorTestPanel — the sample input is the shared JSON beautify/minify textarea (criterion 3)", () => {
  it("renders a Beautify control beside the Sample input field, the shared control's own signature affordance", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers('{"kind":"TranslateTextInput"}'));

    await within(dialog).findByLabelText("Sample input");

    const beautifyButtons = within(dialog).getAllByRole("button", { name: "Beautify" });
    expect(beautifyButtons).toHaveLength(2);
    expect(beautifyButtons[1]).toBeTruthy();
  });

  it("reflects whatever the operator types into the Sample input field", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers('{"kind":"TranslateTextInput"}'));

    const sampleInput = within(dialog).getByLabelText<HTMLTextAreaElement>("Sample input");
    fireEvent.change(sampleInput, { target: { value: '{"text":"hello"}' } });

    expect(sampleInput.value).toBe('{"text":"hello"}');
  });

  it("shows the chosen capability's own input_schema, pretty-printed, as a read-only reference", async () => {
    const { dialog } = await mountTestPanelInEditMode(
      baseHandlers('{"kind":"TranslateTextInput"}'),
    );

    await selectOptionAsync("Capability", "translate-text (1.0.0)");

    expect(await within(dialog).findByText(/"kind": "TranslateTextInput"/)).toBeTruthy();
  });

  it("falls back to the raw stored text for an input_schema that is not itself valid JSON (disclosed inference)", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers("not valid json {"));

    await selectOptionAsync("Capability", "translate-text (1.0.0)");

    expect(await within(dialog).findByText("not valid json {")).toBeTruthy();
  });
});

describe("ConnectorTestPanel — the sample input defaults to a valid empty object (disclosed inference)", () => {
  it("starts the Sample input field at \"{}\" rather than blank, before any capability is even selected", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers('{"kind":"TranslateTextInput"}'));

    const sampleInput = within(dialog).getByLabelText<HTMLTextAreaElement>("Sample input");

    expect(sampleInput.value).toBe("{}");
  });
});
