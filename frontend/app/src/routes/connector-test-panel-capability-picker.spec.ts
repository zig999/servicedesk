import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  SUBJECT_TYPE_PATH,
  awaitCapabilitiesSettled,
  capabilitiesPage,
  jsonResponse,
  mountTestPanelInEditMode,
  selectOptionAsync,
  subjectTypeTermsPage,
  testCapability,
} from "./connector-test-panel.test-support";
import {
  CONNECTORS_PATH,
  connectorConfigurationsPage,
  createConnectorConfigurationsFetchStub,
  mountConnectorConfigurationsScreen,
} from "./connector-configurations-screen.test-support";

// Proof for task/connector-configuration-authoring/test-connector-debug-panel's own criterion 1
// ("The Test section's capability picker offers only capabilities currently registered with this
// connector configuration's name as their connector"), its own disclosed composite-key
// (name@version) inference, the empty-match and dependency-failure edge cases that criterion's
// own dependency (useCapabilities) raises, and the explicit "only in edit mode" fact this task's
// own dialog wiring states. Criterion 2 and the requester field live in the sibling
// connector-test-panel-subject-and-attributes.spec.ts; criteria 4-7 in
// connector-test-panel-request-response.spec.ts and connector-test-panel-dispatch-safety.spec.ts.
//
// The chosen capability's own input_schema read-only reference display (unrelated to the removed
// sample-input field) is covered here too: the composite-key test above already proves it renders
// the selected capability's own schema, and the fallback test below proves it degrades for an
// input_schema that does not itself parse as JSON.
//
// task/connector-test-panel-placeholder-attributes/deduplicate-configuration-object-check's own
// criterion 2 closes a coverage gap left by reconcile-test-panel-attribute-rows: this file never
// exercised "Add attribute" at all before the describe block near the bottom below, so
// reconcile-test-panel-attribute-rows's own criterion 7 ("every existing consumer of
// onAddAttribute keeps observing correct behavior") was vacuous specifically for this file. The
// reconciliation behavior itself (a click reconciles rows against every ${subject:<attribute>}
// placeholder Configuration's own text currently embeds) is proved in full, including the
// stable-row-identity and no-extra-network-request cases, by the sibling
// connector-test-panel-subject-and-attributes.spec.ts; the test below establishes only that this
// file's own context reaches the same behavior, not a second full account of it.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ConnectorTestPanel — the capability picker offers only capabilities naming this connector (criterion 1)", () => {
  it("offers the matching capability and omits one registered against a different connector", async () => {
    const { dialog } = await mountTestPanelInEditMode({
      [CAPABILITIES_PATH]: () =>
        jsonResponse(
          capabilitiesPage([
            testCapability({
              name: "translate-text",
              version: "1.0.0",
              connector: "deepl-connector",
            }),
            testCapability({
              name: "resize-image",
              version: "2.0.0",
              connector: "other-connector",
            }),
          ]),
        ),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(subjectTypeTermsPage(["billing-dispute"])),
    });

    fireEvent.click(within(dialog).getByLabelText("Capability"));
    const listbox = await screen.findByRole("listbox");
    await within(listbox).findByRole("option", { name: "translate-text (1.0.0)" });

    expect(within(listbox).queryByRole("option", { name: /resize-image/ })).toBeNull();
  });

  it("offers no option at all once the read resolves, when no capability currently names this connector (edge case: empty match)", async () => {
    const { dialog } = await mountTestPanelInEditMode({
      [CAPABILITIES_PATH]: () =>
        jsonResponse(capabilitiesPage([testCapability({ connector: "other-connector" })])),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(subjectTypeTermsPage(["billing-dispute"])),
    });
    await awaitCapabilitiesSettled();

    fireEvent.click(within(dialog).getByLabelText("Capability"));
    const listbox = await screen.findByRole("listbox");

    expect(within(listbox).queryAllByRole("option")).toHaveLength(0);
  });

  it("keys capability options by name and version together, offering two capabilities that share a name as distinct, independently selectable options (composite-key inference)", async () => {
    const { dialog } = await mountTestPanelInEditMode({
      [CAPABILITIES_PATH]: () =>
        jsonResponse(
          capabilitiesPage([
            testCapability({
              name: "translate-text",
              version: "1.0.0",
              input_schema: '{"kind":"TranslateTextInputV1"}',
            }),
            testCapability({
              name: "translate-text",
              version: "2.0.0",
              input_schema: '{"kind":"TranslateTextInputV2"}',
            }),
          ]),
        ),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(subjectTypeTermsPage(["billing-dispute"])),
    });

    await selectOptionAsync("Capability", "translate-text (2.0.0)");

    expect(await within(dialog).findByText(/TranslateTextInputV2/)).toBeTruthy();
    expect(within(dialog).queryByText(/TranslateTextInputV1/)).toBeNull();
  });

  it("shows an alert rather than silently offering no options when the capabilities read itself fails (edge case: a dependency that fails)", async () => {
    const { dialog } = await mountTestPanelInEditMode({
      [CAPABILITIES_PATH]: () =>
        jsonResponse({ error: { code: "InternalError", message: "boom" } }, 500),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(subjectTypeTermsPage(["billing-dispute"])),
    });

    expect(
      await within(dialog).findByText(
        "Could not load the capabilities registered with this connector.",
      ),
    ).toBeTruthy();
  });
});

describe("ConnectorTestPanel — the input schema reference falls back to raw text for invalid JSON", () => {
  it("falls back to the raw stored text for an input_schema that is not itself valid JSON (disclosed inference)", async () => {
    const { dialog } = await mountTestPanelInEditMode({
      [CAPABILITIES_PATH]: () =>
        jsonResponse(capabilitiesPage([testCapability({ input_schema: "not valid json {" })])),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(subjectTypeTermsPage(["billing-dispute"])),
    });

    await selectOptionAsync("Capability", "translate-text (1.0.0)");

    expect(await within(dialog).findByText("not valid json {")).toBeTruthy();
  });
});

describe("ConnectorTestPanel — Add attribute reconciles to a row already named for Configuration's own placeholder (task/connector-test-panel-placeholder-attributes/deduplicate-configuration-object-check, criterion 2)", () => {
  // Configuration's text is edited to a placeholder distinct from
  // mountTestPanelInEditMode's own default ("account-id", already asserted by the sibling
  // connector-test-panel-subject-and-attributes.spec.ts's own reconciliation test) so this
  // test's own assertion stands on its own rather than coupled to that default. If "Add
  // attribute" regressed to the old append-one-empty-row behavior, the row this test finds
  // would carry an empty Attribute value instead of "picker-panel-subject-id", and the
  // assertion below would fail.
  it("adds a row already named for Configuration's own placeholder, not an empty row", async () => {
    const { dialog } = await mountTestPanelInEditMode({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([testCapability()])),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(subjectTypeTermsPage(["billing-dispute"])),
    });

    fireEvent.change(within(dialog).getByLabelText("Configuration"), {
      target: {
        value: '{"address":"https://api.example.com/${subject:picker-panel-subject-id}"}',
      },
    });
    // task/connector-test-panel-tests-register-configuration/save-configuration-edits-before-
    // reconciling: "Add attribute" reconciles against the connector's own registered
    // configuration text, not an unsaved edit, so this edit is saved first -- awaited by
    // waitFor-polling the "Save" button's own `disabled` attribute (gated on state.isDirty,
    // connector-configuration-form-fields.tsx's own isSaveDisabled expression) turning true,
    // not the "Saved." acknowledgement text: use-connector-configuration-detail-view.ts's own
    // wasSubmitSuccessfulRef never resets once justSaved clears, a real, pre-existing
    // production defect out of this task's own scope (fuller rationale in the sibling
    // connector-test-panel-attribute-reconciliation.spec.ts's own saveConfiguration helper, and
    // disclosed in this task's own returned proof record). Save's own `disabled` attribute never
    // routes through that ref -- it reflects state.isDirty directly, cleared in the same commit
    // the mutation's onSuccess re-baselines configurationBaseline from, one render before
    // registeredConfigurationText itself updates.
    const saveButton = within(dialog).getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(saveButton.hasAttribute("disabled")).toBe(true);
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Add attribute" }));

    const attributeInput = within(dialog).getByLabelText<HTMLInputElement>("Attribute");
    expect(attributeInput.value).toBe("picker-panel-subject-id");
  });
});

describe("ConnectorConfigurationFormDialog — the Test section renders only in edit mode", () => {
  it("renders no Test section, and issues no read for it, while creating a new connector configuration", async () => {
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([])),
    });
    await mountConnectorConfigurationsScreen(fetchMock);
    await screen.findByText("No connector configurations are currently registered.");

    fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));
    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByLabelText("Connector");

    expect(within(dialog).queryByRole("heading", { name: "Test" })).toBeNull();
    const requestedPaths = fetchMock.mock.calls.map(([input]) =>
      typeof input === "string" ? input : input.toString(),
    );
    expect(requestedPaths).not.toContain(CAPABILITIES_PATH);
    expect(requestedPaths).not.toContain(SUBJECT_TYPE_PATH);
  });
});
