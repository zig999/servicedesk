import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from "sonner";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  CONCEPTS_PATH,
  CONCEPTS_RESPONSE,
  CONCEPT_NAME,
  baseHandlers,
  capabilityPutPath,
  createFetchStub,
  errorResponse,
  fillValidForm,
  jsonResponse,
  parsedPutBody,
  putCallCount,
} from "./capability-create-screen.test-support";
import { mountCapabilityCreateScreenWithFooterSlot } from "./capability-create-screen-footer-portal.test-support";
import { CAPABILITY_FORM_ID } from "./capability-form-fields";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
  vi.mocked(toast.success).mockClear();
});

const SAVE_BUTTON = { name: "Save" };
const CANCEL_BUTTON = { name: "Cancel" };
const NAME = "footer-portal-capability";
const VERSION = "3.2.1";

describe("the save control's form owner survives the footer portal (criterion 1)", () => {
  it("keeps the screen's own form as the Save button's form owner even though the button renders outside that form's DOM subtree", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityCreateScreenWithFooterSlot(fetchMock);

    const saveButton = await screen.findByRole<HTMLButtonElement>("button", SAVE_BUTTON);
    const formOwner = saveButton.form;

    expect(formOwner?.id).toBe(CAPABILITY_FORM_ID);
    expect(formOwner?.contains(saveButton)).toBe(false);
  });
});

describe("activating save with the footer slot present issues the register-capability request carrying the whole contract (criterion 2)", () => {
  it("issues PUT /v1/capabilities/{name}/{version} carrying nature, both schemas, timeout, connector and concept, with no declared attribute dropped", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE),
      [capabilityPutPath(NAME, VERSION)]: () => jsonResponse({ name: NAME, version: VERSION }),
    });
    await mountCapabilityCreateScreenWithFooterSlot(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({
      name: NAME,
      version: VERSION,
      nature: "mutating",
      timeout: "5000",
      connector: "some-connector",
      inputSchema: '{"a":1}',
      outputSchema: '{"b":2}',
      concept: CONCEPT_NAME,
    });

    fireEvent.click(await screen.findByRole("button", SAVE_BUTTON));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          input === capabilityPutPath(NAME, VERSION) &&
          (init?.method ?? "GET").toUpperCase() === "PUT",
      ),
    ).toBe(true);
    expect(parsedPutBody(fetchMock)).toEqual({
      nature: "mutating",
      input_schema: '{"a":1}',
      output_schema: '{"b":2}',
      timeout: 5000,
      connector: "some-connector",
      concept: CONCEPT_NAME,
    });
  });
});

describe("a registration answered as made with the footer slot present lands the operator on the capability's own surface (criterion 3)", () => {
  it("navigates to /capabilities/<name>/<version> once the registry answers success, rather than leaving the operator on the authoring surface", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE),
      [capabilityPutPath(NAME, VERSION)]: () => jsonResponse({ name: NAME, version: VERSION }),
    });
    const router = await mountCapabilityCreateScreenWithFooterSlot(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ name: NAME, version: VERSION, concept: CONCEPT_NAME });

    fireEvent.click(await screen.findByRole("button", SAVE_BUTTON));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(`/capabilities/${NAME}/${VERSION}`),
    );
    expect(await screen.findByText("Capability Detail Placeholder")).toBeTruthy();
  });
});

describe("activating abandon with the footer slot present writes nothing (criterion 4)", () => {
  it("issues no register-capability request, even after every field of the entry was filled in", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [capabilityPutPath(NAME, VERSION)]: () => jsonResponse({ name: NAME, version: VERSION }),
      }),
    );
    await mountCapabilityCreateScreenWithFooterSlot(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ name: NAME, version: VERSION, concept: CONCEPT_NAME });

    fireEvent.click(await screen.findByRole("button", CANCEL_BUTTON));

    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("activating abandon with the footer slot present returns to the surface authoring was reached from (criterion 4)", () => {
  it("navigates back to the surface the create screen was reached from, once an entry was composed", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    const openedFrom = `/capabilities/${NAME}/${VERSION}`;
    const router = await mountCapabilityCreateScreenWithFooterSlot(fetchMock, [
      openedFrom,
      "/capabilities/new",
    ]);
    await screen.findByLabelText("Connector");
    fillValidForm({ name: NAME, version: VERSION, concept: CONCEPT_NAME });
    expect(router.state.location.pathname).toBe("/capabilities/new");

    fireEvent.click(screen.getByRole("button", CANCEL_BUTTON));

    await waitFor(() => expect(router.state.location.pathname).toBe(openedFrom));
  });
});

describe("a refusal answered with the footer slot present states the outcome rather than leaving the entry unanswered (task's own UNDERDETERMINED note on refusal handling)", () => {
  it("shows a message naming the refusal and keeps the operator on the authoring surface, rather than dispatching in silence -- an implementation that states nothing on a refusal would fail this", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE),
      [capabilityPutPath(NAME, VERSION)]: () => errorResponse("ConceptAlreadyAnsweredError", 409),
    });
    const router = await mountCapabilityCreateScreenWithFooterSlot(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ name: NAME, version: VERSION, concept: CONCEPT_NAME });

    fireEvent.click(await screen.findByRole("button", SAVE_BUTTON));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Another capability already answers this concept; each concept resolves to exactly one capability.",
      ),
    );
    expect(router.state.location.pathname).toBe("/capabilities/new");
  });
});
