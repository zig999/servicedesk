import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  CAPABILITY_PATH,
  LOADED_INPUT_SCHEMA,
  LOADED_OUTPUT_SCHEMA,
  NAME,
  VERSION,
  baseHandlers,
  createFetchStub,
  errorResponse,
  mountCapabilityDetailScreen,
  prettyPrinted,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityDetailScreen -- shows the loaded record (criterion 1)", () => {
  it("renders the capability's own identity and every declared field, all read from the GET this route's own hook issues by both name and version", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);

    expect(
      await screen.findByRole("heading", { name: `Capability ${NAME} ${VERSION}` }),
    ).toBeTruthy();
    const nameInput = screen.getByLabelText<HTMLInputElement>("Name");
    expect(nameInput.value).toBe(NAME);
    expect(nameInput.hasAttribute("disabled")).toBe(true);
    const versionInput = screen.getByLabelText<HTMLInputElement>("Version");
    expect(versionInput.value).toBe(VERSION);
    expect(versionInput.hasAttribute("disabled")).toBe(true);
    expect(screen.getByLabelText("Nature").textContent).toBe("read-only");
    expect(screen.getByLabelText<HTMLInputElement>("Connector").value).toBe("some-connector");
    expect(screen.getByLabelText("Concept").textContent).toBe("some-concept");
    expect(screen.getByLabelText<HTMLInputElement>("Timeout (ms)").value).toBe("30");
    const inputSchemaField = screen.getByLabelText<HTMLTextAreaElement>("Input schema");
    const outputSchemaField = screen.getByLabelText<HTMLTextAreaElement>("Output schema");
    await waitFor(() => expect(inputSchemaField.value).toBe(prettyPrinted(LOADED_INPUT_SCHEMA)));
    await waitFor(() => expect(outputSchemaField.value).toBe(prettyPrinted(LOADED_OUTPUT_SCHEMA)));

    expect(fetchMock.mock.calls.some(([input]) => input === CAPABILITY_PATH)).toBe(true);
  });
});

describe("CapabilityDetailScreen -- a control returns to the list (criterion 3)", () => {
  it("navigates back to the capabilities list when Back to capabilities is clicked", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    const router = await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    fireEvent.click(screen.getByRole("link", { name: "Back to capabilities" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
  });

  it("keeps the same control available when the load fails (edge case: a dependency that fails)", async () => {
    const fetchMock = createFetchStub({
      [CAPABILITY_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    await mountCapabilityDetailScreen(fetchMock);

    expect(await screen.findByRole("button", { name: "Retry" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to capabilities" })).toBeTruthy();
  });
});

describe("CapabilityDetailScreen -- reuses the existing capability-form-fields.tsx markup unchanged (criterion 6)", () => {
  it("renders every field capability-form-dialog.tsx already composes through CapabilityFormFields, plus the Save button", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);

    await screen.findByLabelText("Connector");
    expect(screen.getByLabelText("Name")).toBeTruthy();
    expect(screen.getByLabelText("Version")).toBeTruthy();
    expect(screen.getByLabelText("Nature")).toBeTruthy();
    expect(screen.getByLabelText("Input schema")).toBeTruthy();
    expect(screen.getByLabelText("Output schema")).toBeTruthy();
    expect(screen.getByLabelText("Timeout (ms)")).toBeTruthy();
    expect(screen.getByLabelText("Concept")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });
});
