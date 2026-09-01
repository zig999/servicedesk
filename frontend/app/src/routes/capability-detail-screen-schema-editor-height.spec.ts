import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  mountCapabilityDetailScreen,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityDetailScreen -- the input-schema field renders 200px/12.5rem tall (criterion 1)", () => {
  it("renders the Input schema field's Textarea with the 12.5rem minimum-height class, not the shared component's own 10rem default", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const inputSchemaField = screen.getByLabelText<HTMLTextAreaElement>("Input schema");

    expect(inputSchemaField.className).toContain("min-h-[12.5rem]");

    expect(inputSchemaField.className).not.toContain("min-h-40");
  });
});

describe("CapabilityDetailScreen -- the output-schema field renders 200px/12.5rem tall (criterion 2)", () => {
  it("renders the Output schema field's Textarea with the 12.5rem minimum-height class, not the shared component's own 10rem default", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const outputSchemaField = screen.getByLabelText<HTMLTextAreaElement>("Output schema");

    expect(outputSchemaField.className).toContain("min-h-[12.5rem]");
    expect(outputSchemaField.className).not.toContain("min-h-40");
  });
});
