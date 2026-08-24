import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  CONCEPTS_PATH,
  createGlossaryFetchStub,
  glossaryConcept,
  jsonResponse,
  mountGlossaryBrowserScreen,
  page,
  SUBJECT_TYPE_PATH,
  term,
} from "./glossary-browser-screen.test-support";

// Proof for task/concept-authoring/concept-create-edit-form's own criteria 1 and 2 -- the
// "New concept" action opening a blank form, and each row's own "Edit" action opening the same
// form pre-filled -- plus the delivery record's own disclosed inference that the name field is
// disabled (not merely pre-filled) while editing, and the dialog's own loading/load-error
// phases over the accepts multi-select's own subject-type vocabulary (EDG-01/EDG-02, "a
// dependency that fails or answers slowly"). Criteria 3, 4 and the ttl-required inference live
// in the sibling glossary-browser-screen-concept-form-accepts.spec.ts, and criterion 5 plus the
// generic-failure-toast inference live in glossary-browser-screen-concept-form-save.spec.ts --
// split three ways to stay under this project's own max-lines rule (MNT-01). All three share
// glossary-browser-screen.test-support.ts's own fixtures and mounting helper.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GlossaryBrowserScreen — "New concept" opens a blank form (criterion 1)', () => {
  it("opens a Dialog with an empty, enabled name field, an unchecked accepts checkbox per subject type, and an empty ttl field", async () => {
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([])),
      [SUBJECT_TYPE_PATH]: () =>
        jsonResponse(page([term("customer-account"), term("merchant")])),
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText("The glossary currently holds no concepts.");

    fireEvent.click(screen.getByRole("button", { name: "New concept" }));

    const dialog = await screen.findByRole("dialog");
    const nameInput = await within(dialog).findByLabelText<HTMLInputElement>("Name");
    expect(nameInput.value).toBe("");
    expect(nameInput.hasAttribute("disabled")).toBe(false);

    expect(
      within(dialog).getByRole<HTMLInputElement>("checkbox", { name: "customer-account" })
        .checked,
    ).toBe(false);
    expect(
      within(dialog).getByRole<HTMLInputElement>("checkbox", { name: "merchant" }).checked,
    ).toBe(false);

    const ttlInput = within(dialog).getByLabelText<HTMLInputElement>("TTL (seconds)");
    expect(ttlInput.value).toBe("");
  });
});

describe("GlossaryBrowserScreen — each concept's own edit action opens the same form, pre-filled (criterion 2)", () => {
  it("opens a Dialog whose name, accepts and ttl fields already hold that row's own current values", async () => {
    const concept = glossaryConcept({
      name: "fraud-flag",
      accepts: ["customer-account", "merchant"],
      ttl: 120,
    });
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([concept])),
      [SUBJECT_TYPE_PATH]: () =>
        jsonResponse(
          page([term("customer-account"), term("merchant"), term("onboarding")]),
        ),
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText("fraud-flag");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const dialog = await screen.findByRole("dialog");
    expect(
      (await within(dialog).findByLabelText<HTMLInputElement>("Name")).value,
    ).toBe("fraud-flag");
    expect(within(dialog).getByLabelText<HTMLInputElement>("TTL (seconds)").value).toBe("120");
    expect(
      within(dialog).getByRole<HTMLInputElement>("checkbox", { name: "customer-account" })
        .checked,
    ).toBe(true);
    expect(
      within(dialog).getByRole<HTMLInputElement>("checkbox", { name: "merchant" }).checked,
    ).toBe(true);
    expect(
      within(dialog).getByRole<HTMLInputElement>("checkbox", { name: "onboarding" }).checked,
    ).toBe(false);
  });
});

describe("GlossaryBrowserScreen — editing a concept disables its name field (disclosed inference)", () => {
  it("renders the Name field disabled while editing, so the concept's own name cannot be changed", async () => {
    const concept = glossaryConcept({ name: "fraud-flag" });
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([concept])),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(page([term("customer-account")])),
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText("fraud-flag");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const dialog = await screen.findByRole("dialog");
    expect(
      (await within(dialog).findByLabelText<HTMLInputElement>("Name")).hasAttribute("disabled"),
    ).toBe(true);
  });
});

describe("GlossaryBrowserScreen — the concept form's own accepts vocabulary, loading and load-error (edge case: a dependency that answers slowly or fails)", () => {
  it("shows a loading placeholder inside the Dialog before the subject-type vocabulary arrives", async () => {
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([])),
      [SUBJECT_TYPE_PATH]: () => new Promise<Response>(() => {}),
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText("The glossary currently holds no concepts.");

    fireEvent.click(screen.getByRole("button", { name: "New concept" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Loading…")).toBeTruthy();
    expect(within(dialog).queryByLabelText("Name")).toBeNull();
  });

  it("shows a load-failure message with a Retry action inside the Dialog when the subject-type vocabulary fails to load, and Retry re-issues that same request", async () => {
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([])),
      [SUBJECT_TYPE_PATH]: () => {
        throw new Error("network down");
      },
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText("The glossary currently holds no concepts.");

    fireEvent.click(screen.getByRole("button", { name: "New concept" }));

    const dialog = await screen.findByRole("dialog");
    expect(await within(dialog).findByText("Unable to load subject types.")).toBeTruthy();
    const callsBeforeRetry = fetchMock.mock.calls.filter(
      ([url]) => (typeof url === "string" ? url : url.toString()) === SUBJECT_TYPE_PATH,
    ).length;

    fireEvent.click(within(dialog).getByRole("button", { name: "Retry" }));

    await within(dialog).findByText("Unable to load subject types.");
    const callsAfterRetry = fetchMock.mock.calls.filter(
      ([url]) => (typeof url === "string" ? url : url.toString()) === SUBJECT_TYPE_PATH,
    ).length;
    expect(callsAfterRetry).toBeGreaterThan(callsBeforeRetry);
  });
});
