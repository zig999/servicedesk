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

  await waitFor(() => expect(configurationField.value).toBe(prettyPrinted(LOADED_CONFIGURATION)));
  return { fetchMock, configurationField };
}

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

    await waitFor(() =>
      expect(configurationField.value).toBe(prettyPrinted(UPDATED_CONFIGURATION)),
    );
  });
});
