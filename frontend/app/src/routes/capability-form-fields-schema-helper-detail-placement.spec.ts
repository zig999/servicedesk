import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { baseHandlers, createFetchStub, mountCapabilityDetailScreen } from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityFormFields -- the capability detail screen presents the Schema Helper beneath its Input schema and Output schema fields, inline in the same form and never a separate screen or dialog (criterion 2)", () => {
  it("renders the Schema Helper positioned after the Output schema field, with no dialog on the page", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    const outputSchemaField = await screen.findByLabelText("Output schema");

    const heading = screen.getByRole("heading", { name: "Assistente de Schema" });

    expect(
      Boolean(outputSchemaField.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
