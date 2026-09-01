import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";

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
  parsedPutBody,
  putCallCount,
  SUBJECT_TYPE_PATH,
  term,
} from "./glossary-browser-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

describe("GlossaryBrowserScreen — a successful create registers the concept and the Concepts tab reflects it (criterion 5)", () => {
  it("issues PUT /v1/glossary/concepts/{name} at the typed name, closes the Dialog, and the Concepts tab shows the new concept afterward", async () => {
    let concepts: ReturnType<typeof glossaryConcept>[] = [];
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page(concepts)),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(page([term("customer-account")])),
      [conceptPutPath("billing-dispute")]: () => {
        concepts = [
          glossaryConcept({ name: "billing-dispute", accepts: ["customer-account"], ttl: 300 }),
        ];
        return jsonResponse(concepts[0]);
      },
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
      target: { value: "300" },
    });

    fireEvent.change(within(dialog).getByLabelText("Description"), {
      target: { value: "Tracks a customer-raised dispute over a billing charge." },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual({
      accepts: ["customer-account"],
      ttl: 300,
      description: "Tracks a customer-raised dispute over a billing charge.",
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(await screen.findByText("billing-dispute")).toBeTruthy();
  });
});

describe("GlossaryBrowserScreen — a successful edit replaces the concept at the same name and the Concepts tab reflects it (criterion 5)", () => {
  it("issues PUT /v1/glossary/concepts/{name} at the existing name with the edited accepts and ttl, and the Concepts tab shows the change afterward", async () => {
    let concepts = [glossaryConcept({ name: "fraud-flag", accepts: ["customer-account"], ttl: 60 })];
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page(concepts)),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(page([term("customer-account"), term("merchant")])),
      [conceptPutPath("fraud-flag")]: () => {
        concepts = [
          glossaryConcept({
            name: "fraud-flag",
            accepts: ["customer-account", "merchant"],
            ttl: 120,
          }),
        ];
        return jsonResponse(concepts[0]);
      },
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText("fraud-flag");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(await within(dialog).findByRole("checkbox", { name: "merchant" }));
    fireEvent.change(within(dialog).getByLabelText("TTL (seconds)"), {
      target: { value: "120" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));

    expect(parsedPutBody(fetchMock)).toEqual({
      accepts: ["customer-account", "merchant"],
      ttl: 120,
      description: "Tracks a customer-raised dispute over a billing charge.",
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(await screen.findByText("customer-account, merchant")).toBeTruthy();
    expect(await screen.findByText("120s")).toBeTruthy();
  });
});

describe("GlossaryBrowserScreen — a failed save (disclosed inference: no new error-ui-state entry)", () => {
  it("shows the shared generic save-failure toast and keeps the Dialog open, since register-concept throws no domain error", async () => {
    const concept = glossaryConcept({ name: "fraud-flag" });
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([concept])),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(page([term("customer-account")])),
      [conceptPutPath("fraud-flag")]: () => {
        throw new Error("network down");
      },
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText("fraud-flag");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(await within(dialog).findByLabelText("TTL (seconds)"), {
      target: { value: "90" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong while saving this concept. Try again.",
      );
    });
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

describe("GlossaryBrowserScreen — saving twice in quick succession (edge case)", () => {
  it("issues exactly one PUT when Save is clicked twice before the first request resolves", async () => {
    let resolvePut: (response: Response) => void = () => {};
    const putPromise = new Promise<Response>((resolve) => {
      resolvePut = resolve;
    });
    const concept = glossaryConcept({ name: "fraud-flag" });
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([concept])),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(page([term("customer-account")])),
      [conceptPutPath("fraud-flag")]: () => putPromise,
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText("fraud-flag");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog");
    const saveButton = await within(dialog).findByRole("button", { name: "Save" });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));

    await act(async () => {
      resolvePut(jsonResponse(concept));
    });
  });
});
