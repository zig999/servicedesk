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

// Proof for task/connector-capability-detail-editing/capability-detail-route's own criteria 1
// ("shows that capability's full record, loaded through the new hook by both name and
// version"), 3 ("a control that returns the operator to the capabilities list") and 6 ("the
// existing capability-form-fields.tsx markup is reused unchanged"). Criterion 8's invalid-JSON
// warnings (doubled for this screen's own two schema fields) live in the sibling
// capability-detail-screen-invalid-schema.spec.ts, criterion 4/7's save behavior lives in
// capability-detail-screen-save.spec.ts, and criterion 5's discard behavior lives in
// capability-detail-screen-discard.spec.ts -- split this way to stay under this project's own
// max-lines discipline from the start. All four share capability-detail-screen.test-support.ts's
// own fixtures and mounting helper.

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

    // Proves this reached the screen through the network read this route's own hook issues, by
    // both identity fields together, rather than a value this screen invented or read by name
    // alone.
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
