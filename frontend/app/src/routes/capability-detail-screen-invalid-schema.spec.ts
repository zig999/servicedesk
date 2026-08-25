import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  INVALID_INPUT_SCHEMA,
  INVALID_OUTPUT_SCHEMA,
  LOADED_INPUT_SCHEMA,
  LOADED_OUTPUT_SCHEMA,
  UPDATED_INPUT_SCHEMA,
  UPDATED_OUTPUT_SCHEMA,
  baseHandlers,
  createFetchStub,
  mountCapabilityDetailScreen,
  putCallCount,
} from "./capability-detail-screen.test-support";

// Proof for task/connector-capability-detail-editing/capability-detail-route's own criterion 8
// (the invalid-loaded-JSON warning), doubled for this screen's own two schema fields
// (input_schema, output_schema) where the sibling connector-configuration-detail-route's single
// configuration field only needed this once -- split into its own file (alongside
// capability-detail-screen.spec.ts, -save.spec.ts and -discard.spec.ts) to stay under this
// project's own max-lines discipline from the start. All four share
// capability-detail-screen.test-support.ts's own fixtures and mounting helper.

const INPUT_SCHEMA_WARNING =
  "This capability's stored input schema is not valid JSON. Correct it before Save can succeed.";
const OUTPUT_SCHEMA_WARNING =
  "This capability's stored output schema is not valid JSON. Correct it before Save can succeed.";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityDetailScreen -- an invalid loaded input_schema is warned about (criterion 8)", () => {
  it("shows a plain warning that the stored input schema is not valid JSON when the loaded value does not parse, without hiding the stored value itself", async () => {
    const fetchMock = createFetchStub(baseHandlers(INVALID_INPUT_SCHEMA, LOADED_OUTPUT_SCHEMA));
    await mountCapabilityDetailScreen(fetchMock);

    const inputSchemaField = await screen.findByLabelText<HTMLTextAreaElement>("Input schema");
    expect(screen.getByText(INPUT_SCHEMA_WARNING)).toBeTruthy();
    // "instead of rendering it silently" (criterion 8's own wording) -- the invalid stored text
    // stays visible beside the warning rather than being blanked or replaced.
    expect(inputSchemaField.value).toBe(INVALID_INPUT_SCHEMA);
  });

  it("shows no such warning while the loaded input_schema is valid JSON", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);

    await screen.findByLabelText("Connector");
    expect(screen.queryByText(INPUT_SCHEMA_WARNING)).toBeNull();
  });

  it("shows the same plain warning once a valid loaded input_schema is edited into invalid JSON, and blocks Save while it stays that way", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    const inputSchemaField = await screen.findByLabelText<HTMLTextAreaElement>("Input schema");

    fireEvent.change(inputSchemaField, { target: { value: INVALID_INPUT_SCHEMA } });

    expect(screen.getByText(INPUT_SCHEMA_WARNING)).toBeTruthy();
    // This route's own plain-wording banner and JsonTextareaField's own parser-message inline
    // error (json-textarea-field.tsx's own "Invalid JSON: <message>") both render, additive to
    // one another rather than one replacing the other (this task's own disclosed inference).
    const alerts = screen.getAllByRole("alert");
    expect(alerts.some((alert) => alert.textContent?.startsWith("Invalid JSON:"))).toBe(true);
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(putCallCount(fetchMock)).toBe(0);
  });

  it("edits away the warning once the input_schema text is corrected back to valid JSON", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    const inputSchemaField = await screen.findByLabelText<HTMLTextAreaElement>("Input schema");

    fireEvent.change(inputSchemaField, { target: { value: INVALID_INPUT_SCHEMA } });
    expect(screen.getByText(INPUT_SCHEMA_WARNING)).toBeTruthy();

    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });

    expect(screen.queryByText(INPUT_SCHEMA_WARNING)).toBeNull();
  });
});

describe("CapabilityDetailScreen -- an invalid loaded output_schema is warned about (criterion 8)", () => {
  it("shows a plain warning that the stored output schema is not valid JSON when the loaded value does not parse, without hiding the stored value itself", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_INPUT_SCHEMA, INVALID_OUTPUT_SCHEMA));
    await mountCapabilityDetailScreen(fetchMock);

    const outputSchemaField = await screen.findByLabelText<HTMLTextAreaElement>("Output schema");
    expect(screen.getByText(OUTPUT_SCHEMA_WARNING)).toBeTruthy();
    expect(outputSchemaField.value).toBe(INVALID_OUTPUT_SCHEMA);
  });

  it("shows no such warning while the loaded output_schema is valid JSON", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);

    await screen.findByLabelText("Connector");
    expect(screen.queryByText(OUTPUT_SCHEMA_WARNING)).toBeNull();
  });

  it("shows the same plain warning once a valid loaded output_schema is edited into invalid JSON, and blocks Save while it stays that way", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    const outputSchemaField = await screen.findByLabelText<HTMLTextAreaElement>("Output schema");

    fireEvent.change(outputSchemaField, { target: { value: INVALID_OUTPUT_SCHEMA } });

    expect(screen.getByText(OUTPUT_SCHEMA_WARNING)).toBeTruthy();
    const alerts = screen.getAllByRole("alert");
    expect(alerts.some((alert) => alert.textContent?.startsWith("Invalid JSON:"))).toBe(true);
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(putCallCount(fetchMock)).toBe(0);
  });

  it("edits away the warning once the output_schema text is corrected back to valid JSON", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    const outputSchemaField = await screen.findByLabelText<HTMLTextAreaElement>("Output schema");

    fireEvent.change(outputSchemaField, { target: { value: INVALID_OUTPUT_SCHEMA } });
    expect(screen.getByText(OUTPUT_SCHEMA_WARNING)).toBeTruthy();

    fireEvent.change(outputSchemaField, { target: { value: UPDATED_OUTPUT_SCHEMA } });

    expect(screen.queryByText(OUTPUT_SCHEMA_WARNING)).toBeNull();
  });
});
