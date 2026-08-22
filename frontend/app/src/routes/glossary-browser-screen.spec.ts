import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  ALL_TAB_CASES,
  ALL_TAB_LABELS,
  CONCEPTS_EMPTY_MESSAGE,
  CONCEPTS_ERROR_MESSAGE,
  CONCEPTS_PATH,
  createGlossaryFetchStub,
  glossaryConcept,
  jsonResponse,
  mountGlossaryBrowserScreen,
  page,
} from "./glossary-browser-screen.test-support";

// Six-tab listing (criterion 1), the Concepts tab's own listing, formatting and
// loading/error/empty coverage (criterion 2 plus the ttl-suffix and accepts-join inferences its
// own delivery record discloses), and the two no-control criteria (8 and 9), checked across all
// six tabs. The five term-vocabulary tabs' own listing/empty/error coverage and tab-switching
// live in the sibling glossary-browser-screen-vocabulary-tabs.spec.ts, to stay under this
// project's own max-lines rule (MNT-01); both share glossary-browser-screen.test-support.ts's
// own fixtures and mounting helper.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GlossaryBrowserScreen — six tabs (criterion 1)", () => {
  it("renders six tabs labeled Concepts, Subject types, Subject attributes, Outcomes, Actions and Recipients, with Concepts selected by default", async () => {
    const fetchMock = createGlossaryFetchStub({ [CONCEPTS_PATH]: () => jsonResponse(page([])) });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText(CONCEPTS_EMPTY_MESSAGE);

    for (const label of ALL_TAB_LABELS) {
      expect(screen.getByRole("tab", { name: label })).toBeTruthy();
    }
    expect(screen.getByRole("tab", { name: "Concepts" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    for (const label of ALL_TAB_LABELS.slice(1)) {
      expect(screen.getByRole("tab", { name: label }).getAttribute("aria-selected")).toBe(
        "false",
      );
    }
  });
});

describe("GlossaryBrowserScreen — Concepts tab listing (criterion 2)", () => {
  it("renders one row per concept GET /v1/glossary/concepts returns, each showing its own name, accepts and ttl", async () => {
    const concepts = [
      glossaryConcept({ name: "billing-dispute", accepts: ["customer-account"], ttl: 3600 }),
      glossaryConcept({ name: "fraud-flag", accepts: ["customer-account", "merchant"], ttl: 60 }),
    ];
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page(concepts)),
    });
    await mountGlossaryBrowserScreen(fetchMock);

    const rows = await screen.findAllByRole("row");
    // header + one row per concept.
    expect(rows).toHaveLength(3);
    expect(within(rows[1]).getByText("billing-dispute")).toBeTruthy();
    expect(within(rows[1]).getByText("customer-account")).toBeTruthy();
    expect(within(rows[1]).getByText("3600s")).toBeTruthy();
    expect(within(rows[2]).getByText("fraud-flag")).toBeTruthy();
    expect(within(rows[2]).getByText("customer-account, merchant")).toBeTruthy();
    expect(within(rows[2]).getByText("60s")).toBeTruthy();
  });
});

describe("GlossaryBrowserScreen — Concepts tab formatting (disclosed inferences)", () => {
  it("suffixes a concept's own ttl with 's' rather than rendering a bare number", async () => {
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([glossaryConcept({ ttl: 42 })])),
    });
    await mountGlossaryBrowserScreen(fetchMock);

    expect(await screen.findByText("42s")).toBeTruthy();
    expect(screen.queryByText("42")).toBeNull();
  });

  it("renders a concept's own accepts list as one comma-joined string cell, not one cell per accepted subject type", async () => {
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () =>
        jsonResponse(page([glossaryConcept({ accepts: ["alpha", "beta", "gamma"] })])),
    });
    await mountGlossaryBrowserScreen(fetchMock);

    expect(await screen.findByText("alpha, beta, gamma")).toBeTruthy();
    expect(screen.queryByText("alpha")).toBeNull();
  });
});

describe("GlossaryBrowserScreen — Concepts tab loading and load-error (EDG-02)", () => {
  it("shows a loading placeholder before GET /v1/glossary/concepts responds", async () => {
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => new Promise<Response>(() => {}),
    });
    await mountGlossaryBrowserScreen(fetchMock);

    expect(screen.getByText("Loading concepts…")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("shows a generic load-failure message plus a Retry button when GET /v1/glossary/concepts fails, and Retry re-issues the same request", async () => {
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => {
        throw new Error("network down");
      },
    });
    await mountGlossaryBrowserScreen(fetchMock);

    expect(await screen.findByText(CONCEPTS_ERROR_MESSAGE)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
    const callsBeforeRetry = fetchMock.mock.calls.length;

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBeforeRetry));
  });
});

describe("GlossaryBrowserScreen — Concepts tab empty state (edge case)", () => {
  it("renders an explicit empty-state message and no table when GET /v1/glossary/concepts returns zero concepts", async () => {
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([])),
    });
    await mountGlossaryBrowserScreen(fetchMock);

    expect(await screen.findByText(CONCEPTS_EMPTY_MESSAGE)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
});

describe("GlossaryBrowserScreen — no mutating controls, in any tab (criterion 8)", () => {
  it.each(ALL_TAB_CASES)(
    "renders no control that creates, edits or deletes a term or concept, in the $tabLabel tab",
    async ({ tabLabel, path, emptyMessage }) => {
      const fetchMock = createGlossaryFetchStub({ [path]: () => jsonResponse(page([])) });
      await mountGlossaryBrowserScreen(fetchMock);
      await screen.findByText(CONCEPTS_EMPTY_MESSAGE);

      if (tabLabel !== "Concepts") {
        fireEvent.click(screen.getByRole("tab", { name: tabLabel }));
        await screen.findByText(emptyMessage);
      }

      expect(screen.queryAllByRole("textbox")).toHaveLength(0);
      expect(screen.queryAllByRole("combobox")).toHaveLength(0);
      expect(screen.queryByRole("button", { name: /create|edit|delete/i })).toBeNull();
    },
  );
});

describe("GlossaryBrowserScreen — no pagination controls, in any tab (criterion 9)", () => {
  it.each(ALL_TAB_CASES)(
    "renders no pagination control in the $tabLabel tab",
    async ({ tabLabel, path, emptyMessage }) => {
      const fetchMock = createGlossaryFetchStub({ [path]: () => jsonResponse(page([])) });
      await mountGlossaryBrowserScreen(fetchMock);
      await screen.findByText(CONCEPTS_EMPTY_MESSAGE);

      if (tabLabel !== "Concepts") {
        fireEvent.click(screen.getByRole("tab", { name: tabLabel }));
        await screen.findByText(emptyMessage);
      }

      expect(screen.queryByRole("navigation")).toBeNull();
      expect(screen.queryByRole("button", { name: /next|previous|page \d/i })).toBeNull();
    },
  );
});
