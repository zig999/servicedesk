import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, within } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  SUBJECT_TYPE_PATH,
  capabilitiesPage,
  jsonResponse,
  mountTestPanelInEditMode,
  subjectTypeTermsPage,
  testCapability,
} from "./connector-test-panel.test-support";

// Proof for task/connector-test-panel-placeholder-attributes/reconcile-test-panel-attribute-rows's
// own criteria 1-6: useTestConnectorPanel's onAddAttribute, changed from appending one empty row
// on every click to reconciling the panel's own attribute/value rows against every
// ${subject:<attribute>} placeholder Configuration's own current text embeds
// (use-test-connector-panel.ts's own header comment). Every test here edits the real
// "Configuration" textarea rendered by ConnectorConfigurationFormFields before clicking
// "Add attribute" -- exactly the production route (connector-configuration-detail-ready-view.tsx's
// own header comment: ConnectorTestPanel's own configurationText prop is this route's live
// state.configuration.value), never a mount-time override invented around it.
//
// Also covers this task's own disclosed inferences: a still-matching row keeps its own id
// (observed here as DOM-element identity, since MNT-04's stable key is exactly what a still-
// matching row's own unchanged id preserves -- connector-test-panel-fields.tsx's own
// key={row.id}); two rows that come to share one attribute name resolve to the earlier row's own
// value; and the reconciled row order follows Configuration's own freshly read placeholder order
// rather than the rows' own prior array order.

afterEach(() => {
  vi.unstubAllGlobals();
});

function baseHandlers(): Record<string, () => Response> {
  return {
    [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([testCapability()])),
    [SUBJECT_TYPE_PATH]: () => jsonResponse(subjectTypeTermsPage(["billing-dispute"])),
  };
}

function setConfigurationText(dialog: HTMLElement, text: string): void {
  fireEvent.change(within(dialog).getByLabelText("Configuration"), {
    target: { value: text },
  });
}

function attributeValues(dialog: HTMLElement): readonly string[] {
  return within(dialog)
    .getAllByLabelText<HTMLInputElement>("Attribute")
    .map((input) => input.value);
}

function valueValues(dialog: HTMLElement): readonly string[] {
  return within(dialog)
    .getAllByLabelText<HTMLInputElement>("Value")
    .map((input) => input.value);
}

function clickAddAttribute(dialog: HTMLElement): void {
  fireEvent.click(within(dialog).getByRole("button", { name: "Add attribute" }));
}

describe('ConnectorTestPanel — "Add attribute" adds one row per placeholder with no existing row (criterion 1)', () => {
  it("adds exactly one empty-valued row for each subject-attribute placeholder Configuration's current text names, when no row exists yet", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    setConfigurationText(
      dialog,
      '{"address":"https://api.example.com/${subject:account-id}","body":{"region":"${subject:region}"}}',
    );

    clickAddAttribute(dialog);

    expect(attributeValues(dialog)).toEqual(["account-id", "region"]);
    expect(valueValues(dialog)).toEqual(["", ""]);
  });
});

describe('ConnectorTestPanel — "Add attribute" preserves an existing row\'s value while its placeholder is still present (criterion 2)', () => {
  it("keeps the value already typed into a row whose attribute still names a current placeholder, and does not duplicate it", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    // The default configuration already embeds exactly one ${subject:account-id} placeholder.
    clickAddAttribute(dialog);
    fireEvent.change(within(dialog).getByLabelText("Value"), { target: { value: "12345" } });

    clickAddAttribute(dialog);

    expect(attributeValues(dialog)).toEqual(["account-id"]);
    expect(valueValues(dialog)).toEqual(["12345"]);
  });
});

describe('ConnectorTestPanel — "Add attribute" removes a row whose placeholder is no longer present (criterion 3)', () => {
  it("drops the account-id row and adds the region row once Configuration's text no longer names account-id", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    clickAddAttribute(dialog);
    fireEvent.change(within(dialog).getByLabelText("Value"), { target: { value: "12345" } });

    setConfigurationText(dialog, '{"address":"https://api.example.com/${subject:region}"}');
    clickAddAttribute(dialog);

    expect(attributeValues(dialog)).toEqual(["region"]);
    expect(valueValues(dialog)).toEqual([""]);
  });

  it("removes every row, leaving none, once Configuration's text names no placeholder at all (edge case: an empty collection where one previously existed)", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    clickAddAttribute(dialog);
    fireEvent.change(within(dialog).getByLabelText("Value"), { target: { value: "12345" } });

    setConfigurationText(dialog, '{"apiKey":"secret"}');
    clickAddAttribute(dialog);

    expect(within(dialog).queryAllByLabelText("Attribute")).toHaveLength(0);
    expect(within(dialog).queryAllByLabelText("Value")).toHaveLength(0);
  });
});

describe('ConnectorTestPanel — "Add attribute" excludes ${requester} and ${credential:...} placeholders (criterion 4)', () => {
  it("adds a row only for the ${subject:...} placeholder, never for ${requester} or ${credential:...} in the same text", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    setConfigurationText(
      dialog,
      '{"address":"https://api.example.com/${requester}/${credential:api-key}/${subject:account-id}"}',
    );

    clickAddAttribute(dialog);

    expect(attributeValues(dialog)).toEqual(["account-id"]);
  });
});

describe('ConnectorTestPanel — "Add attribute" collapses one placeholder name repeated across sections to a single row (criterion 5)', () => {
  it("adds exactly one row for account-id even though its placeholder repeats in the address, the query, the headers and the body", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    setConfigurationText(
      dialog,
      JSON.stringify({
        address: "https://api.example.com/${subject:account-id}",
        query: { a: "${subject:account-id}" },
        headers: { h: "${subject:account-id}" },
        body: { b: "${subject:account-id}" },
      }),
    );

    clickAddAttribute(dialog);

    expect(attributeValues(dialog)).toEqual(["account-id"]);
  });
});

describe('ConnectorTestPanel — "Add attribute" leaves existing rows untouched when Configuration\'s text does not parse as a JSON object (criterion 6)', () => {
  it("leaves the existing row's own attribute and value exactly as they were, when Configuration's text fails to parse as JSON at all", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    clickAddAttribute(dialog);
    fireEvent.change(within(dialog).getByLabelText("Value"), { target: { value: "12345" } });

    setConfigurationText(dialog, "{not valid json");
    clickAddAttribute(dialog);

    expect(attributeValues(dialog)).toEqual(["account-id"]);
    expect(valueValues(dialog)).toEqual(["12345"]);
  });

  it("leaves the existing row untouched when Configuration's text parses to a JSON array rather than an object", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    clickAddAttribute(dialog);
    fireEvent.change(within(dialog).getByLabelText("Value"), { target: { value: "12345" } });

    setConfigurationText(dialog, '["${subject:account-id}"]');
    clickAddAttribute(dialog);

    expect(attributeValues(dialog)).toEqual(["account-id"]);
    expect(valueValues(dialog)).toEqual(["12345"]);
  });

  it("leaves rows exactly as they were when Configuration's text is empty (edge case: empty input)", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    clickAddAttribute(dialog);
    fireEvent.change(within(dialog).getByLabelText("Value"), { target: { value: "12345" } });

    setConfigurationText(dialog, "");
    clickAddAttribute(dialog);

    expect(attributeValues(dialog)).toEqual(["account-id"]);
    expect(valueValues(dialog)).toEqual(["12345"]);
  });
});

describe("ConnectorTestPanel — a still-matching row keeps its own identity across a reconciliation (disclosed inference: existing rows keep their own id)", () => {
  it("keeps rendering the very same Value input for a row whose placeholder is still present, rather than replacing it with a new element", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    clickAddAttribute(dialog);
    const valueInputBefore = within(dialog).getByLabelText<HTMLInputElement>("Value");
    fireEvent.change(valueInputBefore, { target: { value: "12345" } });

    clickAddAttribute(dialog);
    const valueInputAfter = within(dialog).getByLabelText<HTMLInputElement>("Value");

    expect(valueInputAfter).toBe(valueInputBefore);
    expect(valueInputAfter.value).toBe("12345");
  });
});

describe("ConnectorTestPanel — the first row keeps a name two rows come to share (disclosed inference: first occurrence wins the tie)", () => {
  it("keeps the earlier row's own value and drops the later duplicate's, once two rows share one attribute name", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    setConfigurationText(
      dialog,
      '{"address":"https://api.example.com/${subject:account-id}","body":{"r":"${subject:region}"}}',
    );
    clickAddAttribute(dialog);

    expect(attributeValues(dialog)).toEqual(["account-id", "region"]);
    const valueInputs = within(dialog).getAllByLabelText<HTMLInputElement>("Value");
    fireEvent.change(valueInputs[0], { target: { value: "111" } });
    fireEvent.change(valueInputs[1], { target: { value: "222" } });

    // The Attribute field no longer takes an onChange (now read-only,
    // task/connector-test-panel-attribute-readonly), so the two rows are made to
    // share one attribute name by editing Configuration's own text instead: the
    // placeholder that used to name "region" now names "account-id" too, the very
    // name the earlier row already carries.
    setConfigurationText(
      dialog,
      '{"address":"https://api.example.com/${subject:account-id}","body":{"r":"${subject:account-id}"}}',
    );

    clickAddAttribute(dialog);

    expect(attributeValues(dialog)).toEqual(["account-id"]);
    expect(
      within(dialog)
        .getAllByLabelText<HTMLInputElement>("Value")
        .map((input) => input.value),
    ).toEqual(["111"]);
  });
});

describe("ConnectorTestPanel — reconciled rows follow Configuration's own current placeholder order (disclosed inference: order follows the fresh placeholder read, not prior row order)", () => {
  it("re-orders the rows to match the placeholder order Configuration's text currently declares, even though that order differs from the rows' own prior order", async () => {
    const { dialog } = await mountTestPanelInEditMode(baseHandlers());
    setConfigurationText(
      dialog,
      '{"address":"https://api.example.com/${subject:alpha}","body":{"b":"${subject:beta}"}}',
    );
    clickAddAttribute(dialog);

    expect(attributeValues(dialog)).toEqual(["alpha", "beta"]);
    let valueInputs = within(dialog).getAllByLabelText<HTMLInputElement>("Value");
    fireEvent.change(valueInputs[0], { target: { value: "A" } });
    fireEvent.change(valueInputs[1], { target: { value: "B" } });

    // Configuration's text now names the very same two attributes, but with beta declared
    // before alpha (the address now carries beta, the body now carries alpha) -- the rows
    // themselves were never reordered by anyone.
    setConfigurationText(
      dialog,
      '{"address":"https://api.example.com/${subject:beta}","body":{"a":"${subject:alpha}"}}',
    );
    clickAddAttribute(dialog);

    expect(attributeValues(dialog)).toEqual(["beta", "alpha"]);
    valueInputs = within(dialog).getAllByLabelText<HTMLInputElement>("Value");
    expect(valueInputs.map((input) => input.value)).toEqual(["B", "A"]);
  });
});
