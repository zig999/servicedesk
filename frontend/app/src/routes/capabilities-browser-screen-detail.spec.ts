import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  CONCEPT_OPTIONS_PATH,
  capabilitiesPage,
  conceptOptionsPage,
  createCapabilitiesFetchStub,
  jsonResponse,
  mountCapabilitiesScreen,
} from "./capabilities-browser-screen.test-support";

// Proof for task/capability-authoring/capability-create-edit-form's own criterion 1 -- the
// "New capability" action opening a blank form -- replacing this screen's prior read-only
// row-selection detail panel (CapabilityDetailPanel, the `selectedKey` state, this file's own
// prior delivery: task/glossary-and-capabilities-browser/capabilities-browser-screen's own
// criteria 2-5) entirely, plus the delivery record's own disclosed inferences that nature
// defaults to "read-only" in create mode, and the dialog's own loading/load-error phases over
// the concept single-select's own vocabulary (EDG-01/EDG-02, "a dependency that fails or
// answers slowly"). This file replaces its own prior delivery's coverage of the now-removed
// detail panel rather than sitting beside a still-relevant version of it, since that panel's
// own describe blocks (region role, aria-live mount point, composite-key disambiguation) have
// nothing left to assert once CapabilityDetailPanel and selectedKey are gone.
//
// Criterion 2 (each row's own Edit action opening the same form, pre-filled), the disclosed
// inferences that name/version are disabled while editing and that a row itself was inert
// (only its own Edit action opened anything), and the json-textarea-pretty-print-on-load
// coverage reached through that same Edit dialog are all retired below --
// task/connector-capability-detail-editing/capability-detail-route (criteria 2 and 9) removed
// this screen's own per-row "Edit" button and its in-page edit dialog entirely, replacing them
// with a row click that navigates to the routed detail screen instead
// (capabilities-browser-screen.tsx's own header comment), mirroring
// connector-configurations-screen.tsx's own identical convention. That routed screen's own
// proof -- capability-detail-screen.spec.ts -- already covers the equivalent pre-filled,
// disabled-identity and pretty-printed-on-load behavior this screen no longer has any UI left
// to reach; the "a row itself is inert" assertion is not merely unreachable but now false (a
// row click navigates instead of doing nothing), so it is retired rather than rewritten.
//
// Criteria 3, 4 live in the sibling capabilities-browser-screen-capability-form-schema.spec.ts,
// and criteria 5, 6 live in capabilities-browser-screen-capability-form-save.spec.ts -- split
// this way to stay under this project's own max-lines rule (MNT-01). All three share
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
