import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, within } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  SUBJECT_TYPE_PATH,
  TEST_CONNECTOR_PATH,
  callsToPath,
  capabilitiesPage,
  fillTestPanelBasics,
  jsonResponse,
  mountTestPanelInEditMode,
  subjectTypeTermsPage,
  testCapability,
  testConnectorResult,
} from "./connector-test-panel.test-support";

// Proof for task/connector-test-panel-attribute-readonly/make-attribute-field-readonly's own
// criteria 1-3, its own two disclosed inferences (disabled+readOnly on a plain TUI Input rather
// than some other non-editable form, and removing the Attribute Input's onChange prop entirely
// rather than keeping it wired behind `disabled`), and the task's own UNDERDETERMINED note over
// rules/investigation/a-subject-attribute-is-drawn-from-the-glossary.
//
// Criterion 4 ("existing tests covering Add attribute's reconciliation behavior keep passing")
// is answered by the pre-existing test files themselves continuing to exercise the same
// assertions, not by anything new here -- see this proof's own `contested` entry over a fourth
// existing file (connector-test-panel-attribute-reconciliation.spec.ts) the task's own criterion
// 4 never names and whose own tie-break test relies on the exact UI interaction criterion 3 now
// removes.

afterEach(() => {
  vi.unstubAllGlobals();
});

function baseHandlers(): Record<string, () => Response> {
  return {
    [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([testCapability()])),
    [SUBJECT_TYPE_PATH]: () => jsonResponse(subjectTypeTermsPage(["billing-dispute"])),
  };
}

describe("ConnectorTestPanelFields — the Attribute field is disabled and read-only while the Value field stays a plain editable Input (criterion 1, disabled-readOnly inference)", () => {
  it("renders the reconciled row's Attribute Input carrying both disabled and readOnly, and its Value Input carrying neither", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    fireEvent.click(within(dialog).getByRole("button", { name: "Add attribute" }));

    const attributeInput = within(dialog).getByLabelText<HTMLInputElement>("Attribute");
    const valueInput = within(dialog).getByLabelText<HTMLInputElement>("Value");

    expect(attributeInput.disabled).toBe(true);
    expect(attributeInput.readOnly).toBe(true);
    expect(valueInput.disabled).toBe(false);
  });
});

describe("ConnectorTestPanelFields — the read-only Attribute field still shows the row's reconciled name (criterion 2)", () => {
  it("displays the name useTestConnectorPanel's own reconciliation already assigned, rather than an empty control", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    fireEvent.click(within(dialog).getByRole("button", { name: "Add attribute" }));

    const attributeInput = within(dialog).getByLabelText<HTMLInputElement>("Attribute");

    expect(attributeInput.value).toBe("account-id");
  });
});

describe("ConnectorTestPanelFields — the row's attribute name survives an attempted edit to the Attribute field (criterion 3, removed-onChange inference)", () => {
  it("keeps the row named for its reconciled placeholder once a later render settles, while the Value field's own edit still lands", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    fireEvent.click(within(dialog).getByRole("button", { name: "Add attribute" }));

    const attributeInput = within(dialog).getByLabelText<HTMLInputElement>("Attribute");
    const valueInput = within(dialog).getByLabelText<HTMLInputElement>("Value");

    // Dispatched the same way a caller with no onChange to call it through would have to --
    // there is no handler left wired to the Attribute Input for this to reach.
    fireEvent.change(attributeInput, { target: { value: "operator-typed-name" } });
    // A legitimate edit on the sibling Value field forces ConnectorTestPanelFields to re-render
    // from the row's own current state -- if the attempted edit above had actually reached
    // onAttributeChange(row.id, "attribute", ...), this row's own attribute would now read
    // "operator-typed-name" once that render settles; it still reading the original placeholder
    // name below is what proves the row's attribute name itself never changed.
    fireEvent.change(valueInput, { target: { value: "12345" } });

    expect(attributeInput.value).toBe("account-id");
    expect(valueInput.value).toBe("12345");
  });
});

describe("ConnectorTestPanelFields — a subject attribute-value naming an attribute the glossary does not hold still reaches the outbound Test call (UNDERDETERMINED, from rules/investigation/a-subject-attribute-is-drawn-from-the-glossary)", () => {
  // This task's own ## Notes name exactly this implementation as one every criterion above
  // passes against while rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  // still refuses the attribute-value it lets through: the read-only field renders and submits
  // the reconciled placeholder name verbatim, with nothing anywhere (this component, its hook,
  // or any other file this task touches) checking that name against the subject-attribute
  // glossary vocabulary. The caller settled this by leaving that rule uncovered by this epic
  // rather than answered by a criterion here (task's own Notes) -- this test still states what
  // the rule requires, so the gap it names is a red assertion in this proof rather than a
  // silent one nobody can find.
  it("dispatches POST /v1/test-connector carrying a subject attribute-value whose name is not a glossary-held subject attribute, rather than refusing it", async () => {
    const { dialog, fetchMock } = await mountTestPanelInEditMode({
      ...baseHandlers(),
      [TEST_CONNECTOR_PATH]: () => jsonResponse(testConnectorResult()),
    });

    fireEvent.change(within(dialog).getByLabelText("Configuration"), {
      target: {
        value: '{"address":"https://api.example.com/${subject:not-a-glossary-held-attribute}"}',
      },
    });
    await fillTestPanelBasics(dialog, {
      capabilityLabel: "translate-text (1.0.0)",
      subjectTypeName: "billing-dispute",
      attribute: "not-a-glossary-held-attribute",
      value: "12345",
      requester: "operator@example.com",
    });

    fireEvent.click(within(dialog).getByRole("button", { name: "Test" }));

    expect(callsToPath(fetchMock, TEST_CONNECTOR_PATH)).toHaveLength(0);
  });
});
