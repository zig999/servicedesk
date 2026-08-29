import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  CONCEPTS_PATH,
  conceptPutPath,
  createGlossaryFetchStub,
  glossaryConcept,
  jsonResponse,
  mountGlossaryBrowserScreen,
  page,
  parsedPutBody,
  putCallCount,
  SUBJECT_TYPE_PATH,
  term,
} from "./glossary-browser-screen.test-support";

// Proof for task/concept-authoring/concept-create-edit-form's own criteria 3 and 4 -- the
// accepts field lets more than one subject type be selected and persists exactly the selected
// set, and submitting with none selected is blocked -- plus the delivery record's own disclosed
// inference that ttl is required client-side with no default, even though the backend accepts
// an absent ttl. Criteria 1, 2 and the name-disabled inference live in the sibling
// glossary-browser-screen-concept-form.spec.ts, and criterion 5 plus the generic-failure-toast
// inference live in glossary-browser-screen-concept-form-save.spec.ts -- split three ways to
// stay under this project's own max-lines rule (MNT-01). All three share
// glossary-browser-screen.test-support.ts's own fixtures and mounting helper.

afterEach(() => {
  vi.unstubAllGlobals();
});

async function openNewConceptDialog(
  fetchMock: Parameters<typeof mountGlossaryBrowserScreen>[0],
): Promise<HTMLElement> {
  await mountGlossaryBrowserScreen(fetchMock);
  await screen.findByText("The glossary currently holds no concepts.");
  fireEvent.click(screen.getByRole("button", { name: "New concept" }));
  return screen.findByRole("dialog");
}

describe("GlossaryBrowserScreen — accepts persists exactly the selected set of subject types (criterion 3)", () => {
  it("submits every checked subject type, in the order each was checked, when more than one is selected", async () => {
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([])),
      [SUBJECT_TYPE_PATH]: () =>
        jsonResponse(
          page([term("customer-account"), term("merchant"), term("onboarding")]),
        ),
      [conceptPutPath("billing-dispute")]: () =>
        jsonResponse({ name: "billing-dispute", accepts: [], ttl: 60 }),
    });
    const dialog = await openNewConceptDialog(fetchMock);

    fireEvent.change(await within(dialog).findByLabelText("Name"), {
      target: { value: "billing-dispute" },
    });
    fireEvent.click(within(dialog).getByRole("checkbox", { name: "customer-account" }));
    fireEvent.click(within(dialog).getByRole("checkbox", { name: "merchant" }));
    fireEvent.change(within(dialog).getByLabelText("TTL (seconds)"), {
      target: { value: "60" },
    });
    // task/glossary-concept-description/concept-form-description-field's own criterion 3:
    // description is now required, so a create submission fills it the same way name/ttl are
    // filled above.
    fireEvent.change(within(dialog).getByLabelText("Description"), {
      target: { value: "Tracks a customer-raised dispute over a billing charge." },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual({
      accepts: ["customer-account", "merchant"],
      ttl: 60,
      description: "Tracks a customer-raised dispute over a billing charge.",
    });
  });

  it("drops exactly the subject type that is unchecked, keeping the rest of an existing concept's own selection intact", async () => {
    const concept = glossaryConcept({
      name: "fraud-flag",
      accepts: ["customer-account", "merchant", "onboarding"],
      ttl: 60,
    });
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([concept])),
      [SUBJECT_TYPE_PATH]: () =>
        jsonResponse(
          page([term("customer-account"), term("merchant"), term("onboarding")]),
        ),
      [conceptPutPath("fraud-flag")]: () =>
        jsonResponse({ name: "fraud-flag", accepts: [], ttl: 60 }),
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText("fraud-flag");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog");

    fireEvent.click(await within(dialog).findByRole("checkbox", { name: "merchant" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    // task/glossary-concept-description/concept-form-description-field's own criterion 2: the
    // submitted body now also carries description, pre-filled from the edited concept's own
    // fixture default, left untouched by this test.
    expect(parsedPutBody(fetchMock)).toEqual({
      accepts: ["customer-account", "onboarding"],
      ttl: 60,
      description: "Tracks a customer-raised dispute over a billing charge.",
    });
  });
});

describe("GlossaryBrowserScreen — accepts is required (criterion 4)", () => {
  it("blocks submission and issues no PUT when no subject type is selected, showing the accepts group's own error", async () => {
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([])),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(page([term("customer-account")])),
    });
    const dialog = await openNewConceptDialog(fetchMock);

    fireEvent.change(await within(dialog).findByLabelText("Name"), {
      target: { value: "billing-dispute" },
    });
    fireEvent.change(within(dialog).getByLabelText("TTL (seconds)"), {
      target: { value: "60" },
    });
    const acceptsGroup = within(dialog).getByRole("group", { name: "Accepts" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(within(acceptsGroup).getByRole("alert")).toBeTruthy());
    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("GlossaryBrowserScreen — ttl is required client-side, with no default (disclosed inference)", () => {
  it("blocks submission and issues no PUT when ttl is left empty, even though a subject type is selected", async () => {
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([])),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(page([term("customer-account")])),
    });
    const dialog = await openNewConceptDialog(fetchMock);

    fireEvent.change(await within(dialog).findByLabelText("Name"), {
      target: { value: "billing-dispute" },
    });
    fireEvent.click(within(dialog).getByRole("checkbox", { name: "customer-account" }));
    // task/glossary-concept-description/concept-form-description-field's own criterion 3:
    // description is now required too, filled here so only ttl is left invalid -- otherwise
    // this test's own single getByRole("alert") below would find two.
    fireEvent.change(within(dialog).getByLabelText("Description"), {
      target: { value: "Tracks a customer-raised dispute over a billing charge." },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    const ttlInput = within(dialog).getByLabelText<HTMLInputElement>("TTL (seconds)");
    await waitFor(() => expect(ttlInput.getAttribute("aria-invalid")).toBe("true"));
    const errorId = ttlInput.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    expect(within(dialog).getByRole("alert").textContent).toBeTruthy();
    expect(putCallCount(fetchMock)).toBe(0);
  });
});
