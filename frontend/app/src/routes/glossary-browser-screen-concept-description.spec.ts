import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  CONCEPTS_PATH,
  createGlossaryFetchStub,
  glossaryConcept,
  jsonResponse,
  mountGlossaryBrowserScreen,
  page,
} from "./glossary-browser-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GlossaryBrowserScreen — the Description column sits second, right after Name (disclosed inference)", () => {
  it("renders the Concepts tab's header row as Name, Description, Accepts, TTL, in that order", async () => {
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([glossaryConcept()])),
    });
    await mountGlossaryBrowserScreen(fetchMock);

    const headerRow = (await screen.findAllByRole("row"))[0];
    const headers = within(headerRow)
      .getAllByRole("columnheader")
      .map((cell) => cell.textContent);
    expect(headers).toEqual(["Name", "Description", "Accepts", "TTL", ""]);
  });
});

describe("GlossaryBrowserScreen — the Concepts tab shows each concept's own description (criterion 2)", () => {
  it("renders each concept's own description text in its own row", async () => {
    const concepts = [
      glossaryConcept({
        name: "billing-dispute",
        description: "Tracks a customer-raised dispute over a billing charge.",
      }),
      glossaryConcept({
        name: "fraud-flag",
        description: "Flags an account suspected of fraud.",
      }),
    ];
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page(concepts)),
    });
    await mountGlossaryBrowserScreen(fetchMock);

    const rows = await screen.findAllByRole("row");
    expect(
      within(rows[1]).getByText("Tracks a customer-raised dispute over a billing charge."),
    ).toBeTruthy();
    expect(within(rows[2]).getByText("Flags an account suspected of fraud.")).toBeTruthy();
  });
});

describe("GlossaryBrowserScreen — a concept whose description is empty is visibly marked, distinct from a described concept (criterion 3)", () => {
  it("shows a described concept's own description as plain text and an empty-description concept as an 'Awaiting description' status-dot marker instead", async () => {
    const concepts = [
      glossaryConcept({
        name: "billing-dispute",
        description: "Tracks a customer-raised dispute over a billing charge.",
      }),
      glossaryConcept({ name: "legacy-concept", description: "" }),
    ];
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page(concepts)),
    });
    await mountGlossaryBrowserScreen(fetchMock);

    const rows = await screen.findAllByRole("row");
    expect(
      within(rows[1]).getByText("Tracks a customer-raised dispute over a billing charge."),
    ).toBeTruthy();
    expect(within(rows[1]).queryByText("Awaiting description")).toBeNull();

    expect(within(rows[2]).getByText("Awaiting description")).toBeTruthy();
    // eslint-disable-next-line testing-library/no-node-access -- mirrors this app's own precedent (status-table.spec.ts); the status marker's color dot is aria-hidden and decorative, unreachable by any RTL query.
    expect(rows[2].querySelector(".bg-muted-foreground")).not.toBeNull();
  });
});

describe("GlossaryBrowserScreen — an empty description renders no invented, concept-specific text (criterion 4)", () => {
  it("renders the identical, fixed 'Awaiting description' marker for two differently-named concepts that share an empty description", async () => {
    const concepts = [
      glossaryConcept({ name: "legacy-alpha", description: "" }),
      glossaryConcept({ name: "legacy-beta", description: "" }),
    ];
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page(concepts)),
    });
    await mountGlossaryBrowserScreen(fetchMock);

    const rows = await screen.findAllByRole("row");
    const descriptionCells = [rows[1], rows[2]].map(
      (row) => within(row).getAllByRole("cell")[1]?.textContent,
    );

    expect(descriptionCells).toEqual(["Awaiting description", "Awaiting description"]);
  });
});
