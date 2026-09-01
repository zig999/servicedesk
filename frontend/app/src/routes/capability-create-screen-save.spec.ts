import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import { toast } from "sonner";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  CONCEPTS_PATH,
  CONCEPTS_RESPONSE,
  CONCEPT_NAME,
  capabilityPutPath,
  createFetchStub,
  errorResponse,
  fillValidForm,
  jsonResponse,
  mountCapabilityCreateScreen,
  parsedPutBody,
  putCallCount,
} from "./capability-create-screen.test-support";

const NAME = "translate-text";
const VERSION = "1.0.0";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

describe("CapabilityCreateScreen -- dispatches at the name and version typed into the form (criterion 8)", () => {
  it("issues PUT /v1/capabilities/{name}/{version} at the name and version just typed", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE),
      [capabilityPutPath(NAME, VERSION)]: () => jsonResponse({ name: NAME, version: VERSION }),
    });
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ name: NAME, version: VERSION });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          input === capabilityPutPath(NAME, VERSION) &&
          (init?.method ?? "GET").toUpperCase() === "PUT",
      ),
    ).toBe(true);
  });

  it("issues the PUT at a different URL when a different name and version are typed, rather than a fixed destination", async () => {
    const otherName = "another-capability";
    const otherVersion = "2.0.0";
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE),
      [capabilityPutPath(otherName, otherVersion)]: () =>
        jsonResponse({ name: otherName, version: otherVersion }),
    });
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ name: otherName, version: otherVersion });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(
      fetchMock.mock.calls.some(([input]) => input === capabilityPutPath(otherName, otherVersion)),
    ).toBe(true);
  });
});

describe("CapabilityCreateScreen -- blocks dispatch while a declared schema is not valid JSON (criterion 9)", () => {
  it("keeps Save disabled and dispatches no PUT while the input schema is not valid JSON", async () => {
    const fetchMock = createFetchStub({ [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE) });
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ inputSchema: "{not valid json" });

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(putCallCount(fetchMock)).toBe(0);
  });

  it("keeps Save disabled and dispatches no PUT while the output schema is not valid JSON", async () => {
    const fetchMock = createFetchStub({ [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE) });
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ outputSchema: "{also not valid" });

    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("CapabilityCreateScreen -- a concept-already-answered refusal is reported without leaving the screen (criterion 10)", () => {
  it("shows the registry's own distinguishable message and keeps the operator on the create screen", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE),
      [capabilityPutPath(NAME, VERSION)]: () => errorResponse("ConceptAlreadyAnsweredError", 409),
    });
    const router = await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ name: NAME, version: VERSION });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Another capability already answers this concept; each concept resolves to exactly one capability.",
      ),
    );
    expect(router.state.location.pathname).toBe("/capabilities/new");
    expect(screen.getByRole("heading", { name: "New capability" })).toBeTruthy();
  });
});

describe("CapabilityCreateScreen -- never refuses a concept itself before dispatching (criterion 11)", () => {
  it("dispatches the registration for whatever concept is selected, without any message shown before the registry itself answers", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE),
      [capabilityPutPath(NAME, VERSION)]: () => jsonResponse({ name: NAME, version: VERSION }),
    });
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ name: NAME, version: VERSION });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe("CapabilityCreateScreen -- a successful save navigates to the created capability's own detail route (criterion 12)", () => {
  it("navigates to /capabilities/<name>/<version> once the registration succeeds, rather than staying on the create route", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE),
      [capabilityPutPath(NAME, VERSION)]: () => jsonResponse({ name: NAME, version: VERSION }),
    });
    const router = await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ name: NAME, version: VERSION });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(`/capabilities/${NAME}/${VERSION}`),
    );
    expect(await screen.findByText("Capability Detail Placeholder")).toBeTruthy();
  });
});

describe("CapabilityCreateScreen -- the dispatched registration carries every field the form composes, not only name/version/schemas/concept (task's own UNDERDETERMINED note)", () => {
  it("submits nature, timeout and connector in the PUT body alongside input_schema, output_schema and concept -- an implementation dispatching only the latter three (plus name/version in the URL) would fail this", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE),
      [capabilityPutPath(NAME, VERSION)]: () => jsonResponse({ name: NAME, version: VERSION }),
    });
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({
      name: NAME,
      version: VERSION,
      nature: "mutating",
      timeout: "5000",
      connector: "deepl-connector",
      inputSchema: '{"a":1}',
      outputSchema: '{"b":2}',
      concept: CONCEPT_NAME,
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual({
      nature: "mutating",
      input_schema: '{"a":1}',
      output_schema: '{"b":2}',
      timeout: 5000,
      connector: "deepl-connector",
      concept: CONCEPT_NAME,
    });
  });
});
