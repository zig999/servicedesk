import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  LOADED_INPUT_SCHEMA,
  LOADED_OUTPUT_SCHEMA,
  UPDATED_INPUT_SCHEMA,
  UPDATED_OUTPUT_SCHEMA,
  baseHandlers,
  createFetchStub,
  mountCapabilityDetailScreen,
  prettyPrinted,
  putCallCount,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

async function mountReady(): Promise<{
  fetchMock: ReturnType<typeof createFetchStub>;
  inputSchemaField: HTMLTextAreaElement;
  outputSchemaField: HTMLTextAreaElement;
  connectorField: HTMLInputElement;
}> {
  const fetchMock = createFetchStub(baseHandlers());
  await mountCapabilityDetailScreen(fetchMock);
  const inputSchemaField = await screen.findByLabelText<HTMLTextAreaElement>("Input schema");
  const outputSchemaField = screen.getByLabelText<HTMLTextAreaElement>("Output schema");
  const connectorField = screen.getByLabelText<HTMLInputElement>("Connector");

  await waitFor(() => {
    expect(inputSchemaField.value).toBe(prettyPrinted(LOADED_INPUT_SCHEMA));
    expect(outputSchemaField.value).toBe(prettyPrinted(LOADED_OUTPUT_SCHEMA));
  });
  return { fetchMock, inputSchemaField, outputSchemaField, connectorField };
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

describe("CapabilityDetailScreen -- Discard changes (criterion 5)", () => {
  it("disables the Discard control while there is nothing to discard", async () => {
    await mountReady();

    expect(
      screen.getByRole("button", { name: "Discard changes" }).hasAttribute("disabled"),
    ).toBe(true);
  });

  it("enables the Discard control once either schema or a form field is edited", async () => {
    const { inputSchemaField, outputSchemaField, connectorField } = await mountReady();

    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });
    fireEvent.change(outputSchemaField, { target: { value: UPDATED_OUTPUT_SCHEMA } });
    fireEvent.change(connectorField, { target: { value: "a-different-connector" } });

    expect(
      screen.getByRole("button", { name: "Discard changes" }).hasAttribute("disabled"),
    ).toBe(false);
  });
});

describe("CapabilityDetailScreen -- opening the Discard confirmation Dialog (discard-confirmation-dialog criteria 4 and 7)", () => {
  it("opens a confirmation Dialog when Discard is clicked, rather than resetting the fields immediately", async () => {
    const { inputSchemaField } = await mountReady();
    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });

    await openDiscardDialog();

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(inputSchemaField.value).toBe(UPDATED_INPUT_SCHEMA);
  });

  it("composes the Dialog from two plain buttons with no typed confirmation input, matching the Release dialog's shape rather than the typed-slug Discard dialog's heavier one (criterion 7)", async () => {
    const { inputSchemaField } = await mountReady();
    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });

    await openDiscardDialog();
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).queryByRole("textbox")).toBeNull();
    expect(within(dialog).getByRole("button", { name: "Keep editing" })).toBeTruthy();
    expect(discardConfirmButton().hasAttribute("disabled")).toBe(false);
  });
});

describe("CapabilityDetailScreen -- confirming Discard resets the form (discard-confirmation-dialog criterion 5)", () => {
  it("closes the Dialog and resets every edited field back to its originally loaded value once the confirm button is clicked, re-disabling Save and Discard", async () => {
    const { inputSchemaField, outputSchemaField, connectorField } = await mountReady();

    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });
    fireEvent.change(outputSchemaField, { target: { value: UPDATED_OUTPUT_SCHEMA } });
    fireEvent.change(connectorField, { target: { value: "a-different-connector" } });

    await openDiscardDialog();
    fireEvent.click(discardConfirmButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(inputSchemaField.value).toBe(prettyPrinted(LOADED_INPUT_SCHEMA));
    expect(outputSchemaField.value).toBe(prettyPrinted(LOADED_OUTPUT_SCHEMA));
    expect(connectorField.value).toBe("some-connector");
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
    expect(
      screen.getByRole("button", { name: "Discard changes" }).hasAttribute("disabled"),
    ).toBe(true);
  });
});

describe("CapabilityDetailScreen -- cancelling the Discard confirmation Dialog leaves edits intact (discard-confirmation-dialog criterion 6)", () => {
  it("leaves every edited field's unsaved edit intact and issues no reset when Keep editing is clicked", async () => {
    const { inputSchemaField, outputSchemaField, connectorField } = await mountReady();

    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });
    fireEvent.change(outputSchemaField, { target: { value: UPDATED_OUTPUT_SCHEMA } });
    fireEvent.change(connectorField, { target: { value: "a-different-connector" } });

    await openDiscardDialog();
    fireEvent.click(keepEditingButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(inputSchemaField.value).toBe(UPDATED_INPUT_SCHEMA);
    expect(outputSchemaField.value).toBe(UPDATED_OUTPUT_SCHEMA);
    expect(connectorField.value).toBe("a-different-connector");
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(false);
  });
});

describe("CapabilityDetailScreen -- the Discard confirmation Dialog's own wording and button styling (disclosed inferences)", () => {
  it("titles the Dialog \"Discard changes?\" and describes what will be lost", async () => {
    const { inputSchemaField } = await mountReady();
    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });

    await openDiscardDialog();
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("Discard changes?")).toBeTruthy();
    expect(
      within(dialog).getByText(
        "Every unsaved change to this capability will be lost. This cannot be undone.",
      ),
    ).toBeTruthy();
  });

  it("styles the confirm button as destructive and Keep editing as a plain, non-destructive control", async () => {
    const { inputSchemaField } = await mountReady();
    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });

    await openDiscardDialog();

    expect(discardConfirmButton().className).toMatch(/destructive/);
    expect(keepEditingButton().className).not.toMatch(/destructive/);
  });
});

describe("CapabilityDetailScreen -- discard falls back to what was just saved, not the original pre-save values (disclosed inference)", () => {
  it("resets both schema fields to their just-saved values once a save has succeeded and the confirmation Dialog is confirmed, rather than the values loaded before it", async () => {
    const { inputSchemaField, outputSchemaField, fetchMock } = await mountReady();

    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });
    fireEvent.change(outputSchemaField, { target: { value: UPDATED_OUTPUT_SCHEMA } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    await screen.findByText("Saved.");

    fireEvent.change(inputSchemaField, { target: { value: '{"type":"object","further":true}' } });
    fireEvent.change(outputSchemaField, { target: { value: '{"type":"string","further":true}' } });
    await openDiscardDialog();
    fireEvent.click(discardConfirmButton());

    await waitFor(() =>
      expect(inputSchemaField.value).toBe(prettyPrinted(UPDATED_INPUT_SCHEMA)),
    );
    expect(outputSchemaField.value).toBe(prettyPrinted(UPDATED_OUTPUT_SCHEMA));
  });
});
