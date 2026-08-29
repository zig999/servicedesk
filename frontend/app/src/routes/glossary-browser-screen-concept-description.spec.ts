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

// Proof for task/glossary-concept-description/browser-description-and-legacy-marker's own
// criteria 2 ("The Concepts tab renders each concept's description"), 3 ("A concept whose
// description is empty is rendered with a visible marker distinguishing it from described
// concepts") and 4 ("A concept whose description is empty renders no invented description
// text"), plus the delivery record's own disclosed inference that the Description column sits
// second, right after Name. Split into its own sibling file, mirroring this same screen's own
// established split (glossary-browser-screen-vocabulary-tabs.spec.ts, the three
// glossary-browser-screen-concept-form*.spec.ts files) to keep this task's own proof separate
// from glossary-browser-screen.spec.ts's own, delivered before it, and to stay under this
// project's own max-lines rule (MNT-01). All share glossary-browser-screen.test-support.ts's own
// fixtures and mounting helper -- unaffected by this task's own extraction of the Concepts tab's
// body into glossary-concepts-panel.tsx, since that helper mounts GlossaryBrowserScreen itself,
// never the panel component directly.

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

    // Proves the marker is a fixed literal never derived from either concept's own name or
    // data: if it were computed per-concept (e.g. folding the concept's own name into the
    // label), these two would differ.
    expect(descriptionCells).toEqual(["Awaiting description", "Awaiting description"]);
  });
});
