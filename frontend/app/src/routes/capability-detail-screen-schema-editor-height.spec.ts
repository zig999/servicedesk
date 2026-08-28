import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  mountCapabilityDetailScreen,
} from "./capability-detail-screen.test-support";

// Proof for task/capability-detail-layout/schema-editor-height-increase's own criteria 1 and 2:
// the capability form's input-schema and output-schema fields render at a 200px/12.5rem minimum
// height rather than JsonTextareaField's own 160px/10rem default. capability-detail-screen.spec.ts's
// own existing assertions (criterion 6 of a different task) locate these two fields by label text
// and never inspect className or height, so a build that left both fields at the shared
// component's own default height -- or that raised the shared default instead of scoping the
// increase through an opt-in prop -- would satisfy every one of that file's assertions unchanged.
// This file adds the one check those two criteria need and that suite does not make.

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
    // Asserted as an explicit exclusion, not merely "the taller class is present": a build
    // applying both minimum-height classes at once would leave Tailwind's own cascade order,
    // rather than this call site's own tall prop, to decide which height actually wins.
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
