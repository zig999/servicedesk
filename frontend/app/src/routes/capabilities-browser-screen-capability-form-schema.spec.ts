import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  CONCEPT_OPTIONS_PATH,
  capabilitiesPage,
  capability,
  capabilityPutPath,
  conceptOptionsPage,
  createCapabilitiesFetchStub,
  jsonResponse,
  mountCapabilitiesScreen,
  parsedPutBody,
  putCallCount,
  selectOption,
} from "./capabilities-browser-screen.test-support";

// Proof for task/capability-authoring/capability-create-edit-form's own criteria 3 and 4 --
// input_schema/output_schema are edited through the shared JSON beautify/minify textarea and
// the value persisted on save is the minified JSON, and the concept field selects exactly one
// existing concept with no way to associate more than one at once. Criteria 1, 2 and their own
// disclosed inferences live in the sibling capabilities-browser-screen-detail.spec.ts, and
// criteria 5, 6 live in capabilities-browser-screen-capability-form-save.spec.ts -- split this
// way to stay under this project's own max-lines rule (MNT-01). All three share
// capabilities-browser-screen.test-support.ts's own fixtures, mounting helper and
// selectOption() helper.

afterEach(() => {
  vi.unstubAllGlobals();
});

async function openNewCapabilityDialog(
  fetchMock: Parameters<typeof mountCapabilitiesScreen>[0],
): Promise<HTMLElement> {
  await mountCapabilitiesScreen(fetchMock);
  await screen.findByText("No capabilities are currently registered.");
  fireEvent.click(screen.getByRole("button", { name: "New capability" }));
  return screen.findByRole("dialog");
}

function fillRequiredScalarFields(dialog: HTMLElement, name: string, version: string): void {
  fireEvent.change(within(dialog).getByLabelText("Name"), { target: { value: name } });
  fireEvent.change(within(dialog).getByLabelText("Version"), { target: { value: version } });
  fireEvent.change(within(dialog).getByLabelText("Connector"), {
    target: { value: "deepl-connector" },
  });
}

describe("CapabilitiesBrowserScreen — the schema fields persist minified JSON on save (criterion 3)", () => {
  it("persists JSON.stringify(JSON.parse(text)) for both schema fields, not the beautified display text", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
      [capabilityPutPath("translate-text", "1.0.0")]: () =>
        jsonResponse(capability({ name: "translate-text", version: "1.0.0" })),
    });
    const dialog = await openNewCapabilityDialog(fetchMock);
    await within(dialog).findByLabelText("Name");

    fillRequiredScalarFields(dialog, "translate-text", "1.0.0");
    selectOption("Concept", "translation");
    fireEvent.change(within(dialog).getByLabelText("Input schema"), {
      target: { value: '{\n  "kind": "TranslateTextInput"\n}' },
    });
    fireEvent.change(within(dialog).getByLabelText("Output schema"), {
      target: { value: '{\n  "kind": "TranslateTextOutput"\n}' },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual(
      expect.objectContaining({
        input_schema: '{"kind":"TranslateTextInput"}',
        output_schema: '{"kind":"TranslateTextOutput"}',
      }),
    );
  });
});

describe("CapabilitiesBrowserScreen — an invalid schema blocks submission (criterion 3's own presupposition)", () => {
  it("disables Save and issues no PUT while the input schema is not syntactically valid JSON", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
    });
    const dialog = await openNewCapabilityDialog(fetchMock);
    await within(dialog).findByLabelText("Name");

    fillRequiredScalarFields(dialog, "translate-text", "1.0.0");
    selectOption("Concept", "translation");
    fireEvent.change(within(dialog).getByLabelText("Input schema"), {
      target: { value: "{not valid json" },
    });
    fireEvent.change(within(dialog).getByLabelText("Output schema"), {
      target: { value: "{}" },
    });

    const saveButton = within(dialog).getByRole("button", { name: "Save" });
    expect(saveButton.hasAttribute("disabled")).toBe(true);
    fireEvent.click(saveButton);

    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("CapabilitiesBrowserScreen — concept is a single select (criterion 4)", () => {
  it("renders concept as a combobox and offers no checkbox or other multi-select control for it", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () =>
        jsonResponse(conceptOptionsPage(["translation", "image-processing"])),
    });
    const dialog = await openNewCapabilityDialog(fetchMock);
    await within(dialog).findByLabelText("Name");

    expect(within(dialog).getByLabelText("Concept").getAttribute("role")).toBe("combobox");
    expect(within(dialog).queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("replaces the prior selection rather than adding to it when a second concept is chosen, so exactly one concept is ever persisted", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () =>
        jsonResponse(conceptOptionsPage(["translation", "image-processing"])),
      [capabilityPutPath("resize-image", "2.0.0")]: () =>
        jsonResponse(capability({ name: "resize-image", version: "2.0.0" })),
    });
    const dialog = await openNewCapabilityDialog(fetchMock);
    await within(dialog).findByLabelText("Name");

    fillRequiredScalarFields(dialog, "resize-image", "2.0.0");
    fireEvent.change(within(dialog).getByLabelText("Input schema"), { target: { value: "{}" } });
    fireEvent.change(within(dialog).getByLabelText("Output schema"), { target: { value: "{}" } });
    selectOption("Concept", "translation");
    selectOption("Concept", "image-processing");

    expect(within(dialog).getByLabelText("Concept").textContent).toBe("image-processing");

    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual(expect.objectContaining({ concept: "image-processing" }));
  });

  it("renders the Concept select with no selectable option when the glossary currently holds no concepts (edge case: empty collection)", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage([])),
    });
    const dialog = await openNewCapabilityDialog(fetchMock);
    const conceptTrigger = await within(dialog).findByLabelText("Concept");

    fireEvent.click(conceptTrigger);
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).queryAllByRole("option")).toHaveLength(0);
  });
});

describe("CapabilitiesBrowserScreen — concept is required (criterion 4's own presupposition)", () => {
  it("blocks submission and issues no PUT when no concept is selected", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
    });
    const dialog = await openNewCapabilityDialog(fetchMock);
    await within(dialog).findByLabelText("Name");

    fillRequiredScalarFields(dialog, "translate-text", "1.0.0");
    fireEvent.change(within(dialog).getByLabelText("Input schema"), { target: { value: "{}" } });
    fireEvent.change(within(dialog).getByLabelText("Output schema"), { target: { value: "{}" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(within(dialog).getByRole("alert")).toBeTruthy());
    expect(putCallCount(fetchMock)).toBe(0);
  });
});
