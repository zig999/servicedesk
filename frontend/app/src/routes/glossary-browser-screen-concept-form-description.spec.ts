import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";

// sonner is the network/DOM-adjacent boundary use-concept-form.ts's own onError handler calls
// into; mocking it here mirrors glossary-browser-screen-concept-form-save.spec.ts's own
// established convention.
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import { toast } from "sonner";
import {
  CONCEPTS_PATH,
  conceptPutPath,
  createGlossaryFetchStub,
  glossaryConcept,
  jsonResponse,
  mountGlossaryBrowserScreen,
  page,
  SUBJECT_TYPE_PATH,
  term,
} from "./glossary-browser-screen.test-support";

// Proof for task/glossary-concept-description/concept-form-description-field's own criteria 1,
// 3, 4 and 5. Criterion 2 (a submitted registration carries the description in the request
// body) is proven by the corrected assertions in the two sibling files this task's own delivery
// also updated -- glossary-browser-screen-concept-form-save.spec.ts's own two Save tests and
// glossary-browser-screen-concept-form-accepts.spec.ts's own two accepts tests, all four of
// which now fill and assert `description` on the same PUT body these tests already exercised
// for a different reason; a fifth, dedicated test here would only restate what those four
// already establish, for the same field, on the same mutation. Split into its own sibling file
// (mirroring the established three-way split, MNT-01) rather than folded into any of them.

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

describe("GlossaryBrowserScreen — the concept form shows the current description when editing (criterion 1)", () => {
  it("opens the Dialog with the Description field already holding that concept's own current description", async () => {
    const concept = glossaryConcept({
      name: "fraud-flag",
      description: "Flags an account suspected of fraud.",
    });
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([concept])),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(page([term("customer-account")])),
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText("fraud-flag");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog");

    expect(
      (await within(dialog).findByLabelText<HTMLTextAreaElement>("Description")).value,
    ).toBe("Flags an account suspected of fraud.");
  });
});

describe("GlossaryBrowserScreen — description is required (criterion 3)", () => {
  it("blocks submission and issues no PUT when description is left empty, even though every other field is filled", async () => {
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([])),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(page([term("customer-account")])),
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText("The glossary currently holds no concepts.");

    fireEvent.click(screen.getByRole("button", { name: "New concept" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(await within(dialog).findByLabelText("Name"), {
      target: { value: "billing-dispute" },
    });
    fireEvent.click(within(dialog).getByRole("checkbox", { name: "customer-account" }));
    fireEvent.change(within(dialog).getByLabelText("TTL (seconds)"), {
      target: { value: "60" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    const descriptionInput = within(dialog).getByLabelText<HTMLTextAreaElement>("Description");
    await waitFor(() => expect(descriptionInput.getAttribute("aria-invalid")).toBe("true"));
    const errorId = descriptionInput.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    expect(within(dialog).getByRole("alert").textContent).toBeTruthy();
    expect(
      (fetchMock.mock.calls.filter(([, init]) => init?.method === "PUT")).length,
    ).toBe(0);
  });
});

describe("GlossaryBrowserScreen — the missing-description refusal reaches the operator by its own wording (criterion 4)", () => {
  it("shows the concept-description-required message rather than the generic fallback, and keeps the Dialog open", async () => {
    const concept = glossaryConcept({ name: "fraud-flag" });
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([concept])),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(page([term("customer-account")])),
      [conceptPutPath("fraud-flag")]: () =>
        jsonResponse(
          { error: { code: "ConceptDescriptionRequiredError", message: "backend message" } },
          422,
        ),
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText("fraud-flag");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(await within(dialog).findByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "A concept must state what it means; add a description before saving.",
      ),
    );
    expect(toast.error).not.toHaveBeenCalledWith(
      "Something went wrong while saving this concept. Try again.",
    );
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

// Criterion 5 (a failure no criterion names still falls through to the existing generic toast)
// is already proven by glossary-browser-screen-concept-form-save.spec.ts's own untouched
// "a failed save" test, which throws a plain network Error against a concept whose fixture
// description is already non-empty (unaffected by this task) and asserts the same generic
// message this criterion names; no new test is added here for it.
