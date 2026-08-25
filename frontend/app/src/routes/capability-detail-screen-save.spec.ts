import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  LOADED_INPUT_SCHEMA,
  UPDATED_INPUT_SCHEMA,
  UPDATED_OUTPUT_SCHEMA,
  baseHandlers,
  createFetchStub,
  mountCapabilityDetailScreen,
  parsedPutBody,
  prettyPrinted,
  putCallCount,
} from "./capability-detail-screen.test-support";

// Proof for task/connector-capability-detail-editing/capability-detail-route's own criterion 4
// (Save gated on isDirty, over both JSON schema fields and the react-hook-form portion) and
// criterion 7 (a successful save's own acknowledgement and reflected values). Criteria 1/3/6
// live in capability-detail-screen.spec.ts, criterion 8 lives in
// capability-detail-screen-invalid-schema.spec.ts, and criterion 5's discard behavior lives in
// capability-detail-screen-discard.spec.ts -- split this way to stay under this project's own
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

describe("CapabilityDetailScreen -- Save is gated on isDirty (criterion 4)", () => {
  it("disables Save immediately after load, before any edit", async () => {
    await mountReady();

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
  });

  it("enables Save once input_schema is edited to a materially different value", async () => {
    const { inputSchemaField } = await mountReady();

    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(false);
  });

  it("enables Save once output_schema is edited to a materially different value", async () => {
    const { outputSchemaField } = await mountReady();

    fireEvent.change(outputSchemaField, { target: { value: UPDATED_OUTPUT_SCHEMA } });

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(false);
  });

  it("enables Save once a plain form field (Connector) is edited", async () => {
    const { connectorField } = await mountReady();

    fireEvent.change(connectorField, { target: { value: "a-different-connector" } });

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(false);
  });

  it("re-disables Save once the edited input_schema is returned to its exact originally loaded value", async () => {
    const { inputSchemaField } = await mountReady();

    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(false);

    fireEvent.change(inputSchemaField, { target: { value: prettyPrinted(LOADED_INPUT_SCHEMA) } });

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
  });
});

describe("CapabilityDetailScreen -- a successful save (criterion 7)", () => {
  it("shows an inline success acknowledgement and keeps the screen showing the just-saved values", async () => {
    const { inputSchemaField, outputSchemaField, fetchMock } = await mountReady();

    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });
    fireEvent.change(outputSchemaField, { target: { value: UPDATED_OUTPUT_SCHEMA } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual(
      expect.objectContaining({
        input_schema: UPDATED_INPUT_SCHEMA,
        output_schema: UPDATED_OUTPUT_SCHEMA,
      }),
    );
    expect(await screen.findByRole("status")).toBeTruthy();
    expect(screen.getByText("Saved.")).toBeTruthy();
    // Compared as parsed data rather than as an exact string, mirroring
    // connector-configuration-detail-screen-save.spec.ts's own identical reasoning: what
    // criterion 7 itself states is that the screen reflects the just-saved *values*, not one
    // particular formatting of them.
    expect(JSON.parse(inputSchemaField.value)).toEqual(JSON.parse(UPDATED_INPUT_SCHEMA));
    expect(JSON.parse(outputSchemaField.value)).toEqual(JSON.parse(UPDATED_OUTPUT_SCHEMA));
  });

  it("re-disables Save immediately after the save succeeds, with no further edits", async () => {
    const { inputSchemaField } = await mountReady();

    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByText("Saved.");
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
  });

  it("clears the acknowledgement once the operator edits again, so it never outlives the values it acknowledged", async () => {
    const { inputSchemaField } = await mountReady();

    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText("Saved.");

    fireEvent.change(inputSchemaField, { target: { value: '{"type":"object","further":true}' } });

    expect(screen.queryByText("Saved.")).toBeNull();
  });
});
