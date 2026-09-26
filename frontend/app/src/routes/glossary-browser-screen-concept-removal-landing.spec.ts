import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  CONCEPTS_PATH,
  createGlossaryFetchStub,
  glossaryConcept,
  jsonResponse,
  mountGlossaryBrowserScreen,
  page,
} from "./glossary-browser-screen.test-support";

function conceptRemovalPath(name: string): string {
  return `${CONCEPTS_PATH}/${encodeURIComponent(name)}`;
}

function findConceptRow(name: string): HTMLElement {
  return screen.getByRole("row", { name: new RegExp(name) });
}

function clickRemoveTrigger(name: string): void {
  fireEvent.click(within(findConceptRow(name)).getByRole("button", { name: "Remove" }));
}

function confirmRemoval(): void {
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Remove" }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GlossaryBrowserScreen — concepts listing reflects a successful removal (criterion 2)", () => {
  it("drops the removed concept's row from the listing once its removal answers 204, while an unrelated concept's row stays listed under its own name", async () => {
    let concepts = [
      glossaryConcept({ name: "billing-dispute" }),
      glossaryConcept({ name: "fraud-flag" }),
    ];
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page(concepts)),
      [conceptRemovalPath("billing-dispute")]: () => {
        concepts = concepts.filter((concept) => concept.name !== "billing-dispute");
        return new Response(null, { status: 204 });
      },
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText("billing-dispute");
    await screen.findByText("fraud-flag");

    clickRemoveTrigger("billing-dispute");
    await screen.findByRole("dialog");
    confirmRemoval();

    await waitFor(() =>
      expect(screen.queryByRole("row", { name: /billing-dispute/i })).toBeNull(),
    );
    expect(screen.getByRole("row", { name: /fraud-flag/i })).toBeTruthy();
  });
});

describe("GlossaryBrowserScreen — the operator stays on the concepts tab after a removal succeeds (criterion 1)", () => {
  it("keeps the Concepts tab selected, with the panel's own New concept control still present, once a removal answers 204", async () => {
    let concepts = [
      glossaryConcept({ name: "billing-dispute" }),
      glossaryConcept({ name: "fraud-flag" }),
    ];
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page(concepts)),
      [conceptRemovalPath("billing-dispute")]: () => {
        concepts = concepts.filter((concept) => concept.name !== "billing-dispute");
        return new Response(null, { status: 204 });
      },
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText("billing-dispute");

    clickRemoveTrigger("billing-dispute");
    await screen.findByRole("dialog");
    confirmRemoval();

    await waitFor(() => expect(screen.queryByRole("row", { name: /billing-dispute/i })).toBeNull());

    expect(screen.getByRole("tab", { name: /Concepts/ }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(screen.getByRole("button", { name: "New concept" })).toBeTruthy();
  });
});

describe("GlossaryBrowserScreen — no surface addressed by the removed identity survives the removal (underdetermined, from the specification)", () => {
  it("shows the removed concept's own name nowhere on the screen once its removal answers 204, not only absent from the listing's own rows", async () => {
    let concepts = [
      glossaryConcept({ name: "billing-dispute" }),
      glossaryConcept({ name: "fraud-flag" }),
    ];
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page(concepts)),
      [conceptRemovalPath("billing-dispute")]: () => {
        concepts = concepts.filter((concept) => concept.name !== "billing-dispute");
        return new Response(null, { status: 204 });
      },
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText("billing-dispute");

    clickRemoveTrigger("billing-dispute");
    await screen.findByRole("dialog");
    confirmRemoval();

    expect(await screen.findByRole("row", { name: /fraud-flag/i })).toBeTruthy();
    expect(screen.queryByText("billing-dispute")).toBeNull();
  });
});
