import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseHandlers as createScreenBaseHandlers,
  capabilityPutPath,
  createFetchStub as createCreateScreenFetchStub,
  fillValidForm,
  jsonResponse,
  mountCapabilityCreateScreen,
  parsedPutBody,
  putCallCount,
} from "./capability-create-screen.test-support";
import {
  CAPABILITY_PATH,
  LOADED_CAPABILITY,
  baseHandlers as detailScreenBaseHandlers,
  createFetchStub as createDetailScreenFetchStub,
  mountCapabilityDetailScreen,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityFormFields -- Payload notes renders as a control bound to the form's payload_notes field, inside the same FormField wrapper the other attribute fields use, reaching the registration screen (criteria 1, 2, 6)", () => {
  it("binds a uniquely labeled Payload notes control to the payload_notes field, with no error region shown absent an error", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);

    const control = await screen.findByLabelText<HTMLTextAreaElement>("Payload notes");

    expect(control.name).toBe("payload_notes");
    expect(control.getAttribute("aria-describedby")).toBeNull();
  });
});

describe("CapabilityFormFields -- free text typed into Payload notes becomes the form's own payload_notes value, submitted through it (criterion 3)", () => {
  it("submits exactly the free text typed into Payload notes", async () => {
    const TYPED_NOTES = "an operator's own account of what this observation actually returns";
    const fetchMock = createCreateScreenFetchStub(
      createScreenBaseHandlers({
        [capabilityPutPath("translate-text", "1.0.0")]: () =>
          jsonResponse({ name: "translate-text", version: "1.0.0" }),
      }),
    );
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm();
    fireEvent.change(screen.getByLabelText("Payload notes"), {
      target: { value: TYPED_NOTES },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual(
      expect.objectContaining({ payload_notes: TYPED_NOTES }),
    );
  });
});

describe("CapabilityFormFields -- Payload notes accepts text spanning more than one line (criterion 4)", () => {
  it("renders a native multi-line textarea control for Payload notes, rather than a single-line input", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);

    const control = await screen.findByLabelText<HTMLTextAreaElement>("Payload notes");

    expect(control.tagName).toBe("TEXTAREA");
  });
});

describe("CapabilityFormFields -- Payload notes presents the value the form holds, and nothing where the form holds none, reaching the capability detail surface (criteria 5, 7)", () => {
  it("presents the identity read's own payload_notes content, where the read answered with content", async () => {
    const SEEDED_NOTES = "an operator's own account of what this observation actually returns";
    const fetchMock = createDetailScreenFetchStub(
      detailScreenBaseHandlers(undefined, undefined, {
        [CAPABILITY_PATH]: () =>
          jsonResponse({ ...LOADED_CAPABILITY, payload_notes: SEEDED_NOTES }),
      }),
    );
    await mountCapabilityDetailScreen(fetchMock);

    const control = await screen.findByLabelText<HTMLTextAreaElement>("Payload notes");
    expect(control.value).toBe(SEEDED_NOTES);
  });

  it("presents no payload_notes content, where the read answered with none", async () => {
    const fetchMock = createDetailScreenFetchStub(detailScreenBaseHandlers());
    await mountCapabilityDetailScreen(fetchMock);

    const control = await screen.findByLabelText<HTMLTextAreaElement>("Payload notes");
    expect(control.value).toBe("");
  });
});
