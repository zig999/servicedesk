import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
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

// Proof for task/connector-capability-detail-editing/capability-detail-route's own criterion 5
// (the discard-changes control, resetting every field including both JSON schema fields).
// Criteria 1/3/6 live in capability-detail-screen.spec.ts, criterion 8 lives in
// capability-detail-screen-invalid-schema.spec.ts, and criterion 4/7's save behavior lives in
// capability-detail-screen-save.spec.ts -- split this way to stay under this project's own
// max-lines discipline from the start. All four share capability-detail-screen.test-support.ts's
// own fixtures and mounting helper.

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
  return { fetchMock, inputSchemaField, outputSchemaField, connectorField };
}

describe("CapabilityDetailScreen -- Discard changes (criterion 5)", () => {
  it("disables the Discard control while there is nothing to discard", async () => {
    await mountReady();

    expect(
      screen.getByRole("button", { name: "Discard changes" }).hasAttribute("disabled"),
    ).toBe(true);
  });

  it("enables Discard once either schema or a form field is edited, and resets every one of them back to its originally loaded value when clicked, re-disabling Save", async () => {
    const { inputSchemaField, outputSchemaField, connectorField } = await mountReady();

    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });
    fireEvent.change(outputSchemaField, { target: { value: UPDATED_OUTPUT_SCHEMA } });
    fireEvent.change(connectorField, { target: { value: "a-different-connector" } });
    expect(
      screen.getByRole("button", { name: "Discard changes" }).hasAttribute("disabled"),
    ).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));

    expect(inputSchemaField.value).toBe(prettyPrinted(LOADED_INPUT_SCHEMA));
    expect(outputSchemaField.value).toBe(prettyPrinted(LOADED_OUTPUT_SCHEMA));
    expect(connectorField.value).toBe("some-connector");
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
    expect(
      screen.getByRole("button", { name: "Discard changes" }).hasAttribute("disabled"),
    ).toBe(true);
  });
});

describe("CapabilityDetailScreen -- discard falls back to what was just saved, not the original pre-save values (disclosed inference)", () => {
  it("resets both schema fields to their just-saved values once a save has succeeded, rather than the values loaded before it", async () => {
    const { inputSchemaField, outputSchemaField, fetchMock } = await mountReady();

    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });
    fireEvent.change(outputSchemaField, { target: { value: UPDATED_OUTPUT_SCHEMA } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    await screen.findByText("Saved.");

    fireEvent.change(inputSchemaField, { target: { value: '{"type":"object","further":true}' } });
    fireEvent.change(outputSchemaField, { target: { value: '{"type":"string","further":true}' } });
    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));

    // A value discard plays back through inputSchema/outputSchema.onChange reaches
    // JsonTextareaField as an externally-loaded value (never through its own
    // handleChange/handleBeautify), so it is reformatted the same way any freshly loaded value
    // is (json-textarea-pretty-print-on-load) -- prettyPrinted(UPDATED_*_SCHEMA) is therefore
    // the correct expectation here, not the raw compact string the operator originally typed.
    // If discard fell back to the values originally loaded rather than what was just saved,
    // these would read prettyPrinted(LOADED_INPUT_SCHEMA)/prettyPrinted(LOADED_OUTPUT_SCHEMA)
    // instead.
    expect(inputSchemaField.value).toBe(prettyPrinted(UPDATED_INPUT_SCHEMA));
    expect(outputSchemaField.value).toBe(prettyPrinted(UPDATED_OUTPUT_SCHEMA));
  });
});
