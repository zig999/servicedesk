import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  LOADED_CONFIGURATION,
  UPDATED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  mountConnectorConfigurationDetailScreen,
  prettyPrinted,
  putCallCount,
} from "./connector-configuration-detail-screen.test-support";

// Proof for task/connector-capability-detail-editing/connector-configuration-detail-route's own
// criterion 5 (the discard-changes control) and the disclosed inference that "originally loaded
// values" moves to what was just saved once a save succeeds, plus
// task/detail-screen-corrections/discard-confirmation-dialog's own criteria 1, 2, 3 and 7 (the
// confirmation Dialog now inserted between this screen's own trigger and the reset it used to
// fire immediately). Criteria 1/3/6/8 of the route task live in
// connector-configuration-detail-screen.spec.ts and criterion 4/7's save behavior lives in
// connector-configuration-detail-screen-save.spec.ts -- split this way to stay under this
// project's own max-lines rule (MNT-01). All three share
// connector-configuration-detail-screen.test-support.ts's own fixtures and mounting helper.
//
// The Discard trigger and the Dialog's own destructive confirm button carry the exact same
// accessible name ("Discard changes"), so every assertion on the confirm button is scoped
// within the Dialog itself -- mirroring case-version-editor-screen-discard.test-support.ts's own
// discardConfirmButton precedent for an identically-worded trigger/confirm pair.

afterEach(() => {
  vi.unstubAllGlobals();
});

async function mountReady(): Promise<{
  fetchMock: ReturnType<typeof createFetchStub>;
  configurationField: HTMLTextAreaElement;
}> {
  const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
  await mountConnectorConfigurationDetailScreen(fetchMock);
  const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");
  // `findByLabelText` resolves the instant the label appears -- the same render the load
  // effect's own setState produces -- which can be before JsonTextareaField's own
  // pretty-print-on-load effect (a second, cascading render) has committed. Firing a
  // `fireEvent.change` immediately after can then interleave with that still-pending effect:
  // its own stale closure (over the raw, not-yet-prettified `value`) commits after the
  // operator's own edit already advanced `selfInitiatedRef`'s state, misreading the fresh
  // edit as an external load and reformatting it -- observed directly by instrumenting
  // json-textarea-field.tsx's own effect and handleConfigurationChange with console.log and
  // running this file in isolation (task/detail-screen-corrections/discard-confirmation-dialog's
  // own investigation once two production-code fixes at the effect/onChange-identity level
  // left the same four failures unchanged, byte for byte). Waiting here for the field's own
  // settled, already-proven pretty-print-on-load value before any test proceeds closes that
  // window; every test below now starts from a fully cascaded state, matching what a real
  // browser reaches before any operator interaction is physically possible.
  await waitFor(() => expect(configurationField.value).toBe(prettyPrinted(LOADED_CONFIGURATION)));
  return { fetchMock, configurationField };
}

/** Opens the Discard confirmation Dialog from its own trigger, and waits for it to actually
 * mount -- mirrors case-version-editor-release.test-support.ts's own openReleaseDialog and
 * case-version-editor-screen-discard.test-support.ts's own openDiscardDialog convention. */
async function openDiscardDialog(): Promise<void> {
  fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
  await screen.findByRole("dialog");
}

function discardConfirmButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Discard changes" });
}

function keepEditingButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Keep editing" });
}

describe("ConnectorConfigurationDetailScreen -- Discard changes (criterion 5)", () => {
  it("disables the Discard control while there is nothing to discard", async () => {
    await mountReady();

    expect(
      screen.getByRole("button", { name: "Discard changes" }).hasAttribute("disabled"),
    ).toBe(true);
  });

  it("enables the Discard control once the configuration is edited", async () => {
    const { configurationField } = await mountReady();

    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    expect(
      screen.getByRole("button", { name: "Discard changes" }).hasAttribute("disabled"),
    ).toBe(false);
  });
});

describe("ConnectorConfigurationDetailScreen -- opening the Discard confirmation Dialog (discard-confirmation-dialog criteria 1 and 7)", () => {
  it("opens a confirmation Dialog when Discard is clicked, rather than resetting the field immediately", async () => {
    const { configurationField } = await mountReady();
    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    await openDiscardDialog();

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(configurationField.value).toBe(UPDATED_CONFIGURATION);
  });

  it("composes the Dialog from two plain buttons with no typed confirmation input, matching the Release dialog's shape rather than the typed-slug Discard dialog's heavier one (criterion 7)", async () => {
    const { configurationField } = await mountReady();
    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    await openDiscardDialog();
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).queryByRole("textbox")).toBeNull();
    expect(within(dialog).getByRole("button", { name: "Keep editing" })).toBeTruthy();
    expect(discardConfirmButton().hasAttribute("disabled")).toBe(false);
  });
});

describe("ConnectorConfigurationDetailScreen -- confirming Discard resets the form (discard-confirmation-dialog criterion 2)", () => {
  it("closes the Dialog and resets the field back to its originally loaded value once the confirm button is clicked, re-disabling Save and Discard", async () => {
    const { configurationField } = await mountReady();
    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    await openDiscardDialog();
    fireEvent.click(discardConfirmButton());

    // Waited for first and alone: the Dialog's own confirm button shares its accessible name
    // ("Discard changes") with the trigger still mounted beneath it, so the unscoped queries
    // below are only unambiguous once the Dialog itself has actually closed.
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(configurationField.value).toBe(prettyPrinted(LOADED_CONFIGURATION));
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
    expect(
      screen.getByRole("button", { name: "Discard changes" }).hasAttribute("disabled"),
    ).toBe(true);
  });
});

describe("ConnectorConfigurationDetailScreen -- cancelling the Discard confirmation Dialog leaves edits intact (discard-confirmation-dialog criterion 3)", () => {
  it("leaves the field's unsaved edit intact and issues no reset when Keep editing is clicked", async () => {
    const { configurationField } = await mountReady();
    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    await openDiscardDialog();
    fireEvent.click(keepEditingButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(configurationField.value).toBe(UPDATED_CONFIGURATION);
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(false);
  });
});

describe("ConnectorConfigurationDetailScreen -- the Discard confirmation Dialog's own wording and button styling (disclosed inferences)", () => {
  it("titles the Dialog \"Discard changes?\" and describes what will be lost", async () => {
    const { configurationField } = await mountReady();
    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    await openDiscardDialog();
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("Discard changes?")).toBeTruthy();
    expect(
      within(dialog).getByText(
        "Every unsaved change to this connector configuration will be lost. This cannot be undone.",
      ),
    ).toBeTruthy();
  });

  it("styles the confirm button as destructive and Keep editing as a plain, non-destructive control", async () => {
    const { configurationField } = await mountReady();
    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });

    await openDiscardDialog();

    expect(discardConfirmButton().className).toMatch(/destructive/);
    expect(keepEditingButton().className).not.toMatch(/destructive/);
  });
});

describe("ConnectorConfigurationDetailScreen -- discard falls back to what was just saved, not the original pre-save value (disclosed inference)", () => {
  it("resets to the just-saved configuration once a save has succeeded and the confirmation Dialog is confirmed, rather than the value loaded before it", async () => {
    const { configurationField, fetchMock } = await mountReady();

    fireEvent.change(configurationField, { target: { value: UPDATED_CONFIGURATION } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    await screen.findByText("Saved.");

    fireEvent.change(configurationField, { target: { value: '{"key":"further"}' } });
    await openDiscardDialog();
    fireEvent.click(discardConfirmButton());

    // A value discard plays back through configuration.onChange reaches JsonTextareaField as an
    // externally-loaded value (never through its own handleChange/handleBeautify), so it is
    // reformatted the same way any freshly loaded value is
    // (json-textarea-pretty-print-on-load) -- prettyPrinted(UPDATED_CONFIGURATION) is therefore
    // the correct expectation here, not the raw compact string the operator originally typed.
    // If discard fell back to the original pre-save load instead of what was just saved, this
    // would read prettyPrinted(LOADED_CONFIGURATION) instead.
    await waitFor(() =>
      expect(configurationField.value).toBe(prettyPrinted(UPDATED_CONFIGURATION)),
    );
  });
});
