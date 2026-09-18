import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  CAPABILITY_PATH,
  LOADED_CAPABILITY,
  LOADED_INPUT_SCHEMA,
  LOADED_OUTPUT_SCHEMA,
  UPDATED_INPUT_SCHEMA,
  UPDATED_OUTPUT_SCHEMA,
  baseHandlers,
  createFetchStub,
  jsonResponse,
  mountCapabilityDetailScreen,
  parsedPutBody,
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
  it("shows an inline success acknowledgement immediately, holding the just-saved values until the invalidated refetch answers, then adopts that refetch's own answer", async () => {
    let getCallCount = 0;
    const refetchGate: { resolve: ((response: Response) => void) | null } = { resolve: null };
    const fetchMock = createFetchStub(
      baseHandlers(undefined, undefined, {
        [CAPABILITY_PATH]: (method) => {
          if (method === "PUT") {
            return jsonResponse(LOADED_CAPABILITY);
          }
          getCallCount += 1;
          if (getCallCount === 1) {
            return jsonResponse(LOADED_CAPABILITY);
          }
          return new Promise<Response>((resolve) => {
            refetchGate.resolve = resolve;
          });
        },
      }),
    );
    await mountCapabilityDetailScreen(fetchMock);
    const inputSchemaField = await screen.findByLabelText<HTMLTextAreaElement>("Input schema");
    const outputSchemaField = screen.getByLabelText<HTMLTextAreaElement>("Output schema");

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

    expect(JSON.parse(inputSchemaField.value)).toEqual(JSON.parse(UPDATED_INPUT_SCHEMA));
    expect(JSON.parse(outputSchemaField.value)).toEqual(JSON.parse(UPDATED_OUTPUT_SCHEMA));

    refetchGate.resolve?.(jsonResponse(LOADED_CAPABILITY));

    await waitFor(() =>
      expect(JSON.parse(inputSchemaField.value)).toEqual(JSON.parse(LOADED_INPUT_SCHEMA)),
    );
    expect(JSON.parse(outputSchemaField.value)).toEqual(JSON.parse(LOADED_OUTPUT_SCHEMA));
  });

  it("keeps Save enabled immediately after the save succeeds, and re-disables it only once the invalidated query's own refetch answers", async () => {
    let getCallCount = 0;
    const refetchGate: { resolve: ((response: Response) => void) | null } = { resolve: null };
    const fetchMock = createFetchStub(
      baseHandlers(undefined, undefined, {
        [CAPABILITY_PATH]: (method) => {
          if (method === "PUT") {
            return jsonResponse(LOADED_CAPABILITY);
          }
          getCallCount += 1;
          if (getCallCount === 1) {
            return jsonResponse(LOADED_CAPABILITY);
          }
          return new Promise<Response>((resolve) => {
            refetchGate.resolve = resolve;
          });
        },
      }),
    );
    await mountCapabilityDetailScreen(fetchMock);
    const inputSchemaField = await screen.findByLabelText<HTMLTextAreaElement>("Input schema");

    fireEvent.change(inputSchemaField, { target: { value: UPDATED_INPUT_SCHEMA } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByText("Saved.");
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(false);

    refetchGate.resolve?.(jsonResponse({ ...LOADED_CAPABILITY, input_schema: UPDATED_INPUT_SCHEMA }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true),
    );
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
