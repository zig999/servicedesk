import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  CONCEPT_OPTIONS_PATH,
  capabilitiesPage,
  capability,
  conceptOptionsPage,
  createCapabilitiesFetchStub,
  jsonResponse,
  mountCapabilitiesScreen,
} from "./capabilities-browser-screen.test-support";

// Proof for task/capability-authoring/capability-create-edit-form's own criteria 1 and 2 --
// the "New capability" action opening a blank form, and each row's own "Edit" action opening
// the same form pre-filled with that row's own current values -- replacing this screen's prior
// read-only row-selection detail panel (CapabilityDetailPanel, the `selectedKey` state, this
// file's own prior delivery: task/glossary-and-capabilities-browser/
// capabilities-browser-screen's own criteria 2-5) entirely, plus the delivery record's own
// disclosed inferences that name/version are disabled (not merely pre-filled) while editing,
// that nature defaults to "read-only" in create mode, that a row itself is now inert (only its
// own Edit button opens anything), and the dialog's own loading/load-error phases over the
// concept single-select's own vocabulary (EDG-01/EDG-02, "a dependency that fails or answers
// slowly"). This file replaces its own prior delivery's coverage of the now-removed detail
// panel rather than sitting beside a still-relevant version of it, since that panel's own
// describe blocks (region role, aria-live mount point, composite-key disambiguation) have
// nothing left to assert once CapabilityDetailPanel and selectedKey are gone. Criteria 3, 4
// live in the sibling capabilities-browser-screen-capability-form-schema.spec.ts, and criteria
// 5, 6 live in capabilities-browser-screen-capability-form-save.spec.ts -- split this way to
// stay under this project's own max-lines rule (MNT-01). All three share
// capabilities-browser-screen.test-support.ts's own fixtures, mounting helper and
// selectOption() helper.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CapabilitiesBrowserScreen — "New capability" opens a blank form (criterion 1)', () => {
  it("opens a Dialog with every named field empty except nature's own read-only default, and no detail panel renders alongside it", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("No capabilities are currently registered.");

    fireEvent.click(screen.getByRole("button", { name: "New capability" }));

    const dialog = await screen.findByRole("dialog");
    const nameInput = await within(dialog).findByLabelText<HTMLInputElement>("Name");
    expect(nameInput.value).toBe("");
    expect(nameInput.hasAttribute("disabled")).toBe(false);

    const versionInput = within(dialog).getByLabelText<HTMLInputElement>("Version");
    expect(versionInput.value).toBe("");
    expect(versionInput.hasAttribute("disabled")).toBe(false);

    expect(within(dialog).getByLabelText<HTMLTextAreaElement>("Input schema").value).toBe("");
    expect(within(dialog).getByLabelText<HTMLTextAreaElement>("Output schema").value).toBe("");
    expect(within(dialog).getByLabelText<HTMLInputElement>("Timeout (ms)").value).toBe("");
    expect(within(dialog).getByLabelText<HTMLInputElement>("Connector").value).toBe("");
    expect(within(dialog).getByLabelText("Concept")).toBeTruthy();

    // criterion 2's own "replacing the existing read-only detail panel": no such panel
    // renders alongside the new form.
    expect(screen.queryByRole("region")).toBeNull();
  });

  it('pre-selects Nature to "read-only" rather than leaving it unselected (disclosed inference)', async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("No capabilities are currently registered.");

    fireEvent.click(screen.getByRole("button", { name: "New capability" }));

    const dialog = await screen.findByRole("dialog");
    const natureTrigger = await within(dialog).findByLabelText("Nature");
    expect(natureTrigger.textContent).toBe("read-only");
  });
});

describe("CapabilitiesBrowserScreen — each row's own Edit action opens the same form, pre-filled (criterion 2)", () => {
  it("opens a Dialog whose fields already hold that row's own current values, and no detail panel renders alongside it", async () => {
    const target = capability({
      name: "translate-text",
      version: "3.2.1",
      nature: "mutating",
      input_schema: '{"kind":"TranslateTextInputV3"}',
      output_schema: '{"kind":"TranslateTextOutputV3"}',
      timeout: 9000,
      connector: "deepl-connector",
      concept: "translation",
    });
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([target])),
      [CONCEPT_OPTIONS_PATH]: () =>
        jsonResponse(conceptOptionsPage(["translation", "image-processing"])),
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("translate-text");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const dialog = await screen.findByRole("dialog");
    expect(await within(dialog).findByText('Edit capability "translate-text"')).toBeTruthy();
    expect((await within(dialog).findByLabelText<HTMLInputElement>("Name")).value).toBe(
      "translate-text",
    );
    expect(within(dialog).getByLabelText<HTMLInputElement>("Version").value).toBe("3.2.1");
    expect(within(dialog).getByLabelText<HTMLTextAreaElement>("Input schema").value).toBe(
      '{"kind":"TranslateTextInputV3"}',
    );
    expect(within(dialog).getByLabelText<HTMLTextAreaElement>("Output schema").value).toBe(
      '{"kind":"TranslateTextOutputV3"}',
    );
    expect(within(dialog).getByLabelText<HTMLInputElement>("Timeout (ms)").value).toBe("9000");
    expect(within(dialog).getByLabelText<HTMLInputElement>("Connector").value).toBe(
      "deepl-connector",
    );
    expect(within(dialog).getByLabelText("Nature").textContent).toBe("mutating");
    expect(within(dialog).getByLabelText("Concept").textContent).toBe("translation");

    expect(screen.queryByRole("region")).toBeNull();
  });
});

describe("CapabilitiesBrowserScreen — editing a capability disables name and version (disclosed inference)", () => {
  it("renders Name and Version disabled while editing, so neither can be changed", async () => {
    const target = capability({ name: "translate-text", version: "1.0.0" });
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([target])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("translate-text");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const dialog = await screen.findByRole("dialog");
    expect(
      (await within(dialog).findByLabelText<HTMLInputElement>("Name")).hasAttribute("disabled"),
    ).toBe(true);
    expect(
      within(dialog).getByLabelText<HTMLInputElement>("Version").hasAttribute("disabled"),
    ).toBe(true);
  });
});

describe("CapabilitiesBrowserScreen — a row itself is inert; only its own Edit action opens anything (disclosed inference)", () => {
  it("opens no dialog and shows no detail panel when a row's own cell, rather than its Edit button, is clicked", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([capability()])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
    });
    await mountCapabilitiesScreen(fetchMock);

    const nameCell = await screen.findByText("translate-text");
    fireEvent.click(nameCell);

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("region")).toBeNull();
  });
});

describe("CapabilitiesBrowserScreen — the form's own concept vocabulary, loading and load-error (edge case: a dependency that answers slowly or fails)", () => {
  it("shows a loading placeholder inside the Dialog before the concept vocabulary arrives", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () => new Promise<Response>(() => {}),
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("No capabilities are currently registered.");

    fireEvent.click(screen.getByRole("button", { name: "New capability" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Loading…")).toBeTruthy();
    expect(within(dialog).queryByLabelText("Name")).toBeNull();
  });

  it("shows a load-failure message with a Retry action inside the Dialog when the concept vocabulary fails to load, and Retry re-issues that same request", async () => {
    let attempts = 0;
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () => {
        attempts += 1;
        throw new Error("network down");
      },
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("No capabilities are currently registered.");

    fireEvent.click(screen.getByRole("button", { name: "New capability" }));

    const dialog = await screen.findByRole("dialog");
    expect(await within(dialog).findByText("Unable to load concepts.")).toBeTruthy();
    const attemptsBeforeRetry = attempts;

    fireEvent.click(within(dialog).getByRole("button", { name: "Retry" }));

    await within(dialog).findByText("Unable to load concepts.");
    expect(attempts).toBeGreaterThan(attemptsBeforeRetry);
  });
});
