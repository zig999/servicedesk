import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  ACTION_PATH,
  CONCEPTS_EMPTY_MESSAGE,
  CONCEPTS_PATH,
  createGlossaryFetchStub,
  jsonResponse,
  mountGlossaryBrowserScreen,
  OUTCOME_PATH,
  page,
  RECIPIENT_PATH,
  SUBJECT_ATTRIBUTE_PATH,
  SUBJECT_TYPE_PATH,
  term,
  VOCABULARY_TAB_CASES,
} from "./glossary-browser-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GlossaryBrowserScreen — five term-vocabulary tabs, listing by name (criteria 3-7)", () => {
  it.each(VOCABULARY_TAB_CASES)(
    "renders one row per term GET $path returns, by name, in the $tabLabel tab",
    async ({ tabLabel, path }) => {
      const terms = [term("alpha"), term("beta"), term("gamma")];
      const fetchMock = createGlossaryFetchStub({ [path]: () => jsonResponse(page(terms)) });
      await mountGlossaryBrowserScreen(fetchMock);
      await screen.findByText(CONCEPTS_EMPTY_MESSAGE);

      fireEvent.click(screen.getByRole("tab", { name: tabLabel }));

      const rows = await screen.findAllByRole("row");

      expect(rows).toHaveLength(4);
      expect(within(rows[1]).getByText("alpha")).toBeTruthy();
      expect(within(rows[2]).getByText("beta")).toBeTruthy();
      expect(within(rows[3]).getByText("gamma")).toBeTruthy();
    },
  );
});

describe("GlossaryBrowserScreen — five term-vocabulary tabs, empty state (edge case)", () => {
  it.each(VOCABULARY_TAB_CASES)(
    "renders its own explicit empty-state message and no table when GET $path returns zero terms, in the $tabLabel tab",
    async ({ tabLabel, path, emptyMessage }) => {
      const fetchMock = createGlossaryFetchStub({ [path]: () => jsonResponse(page([])) });
      await mountGlossaryBrowserScreen(fetchMock);
      await screen.findByText(CONCEPTS_EMPTY_MESSAGE);

      fireEvent.click(screen.getByRole("tab", { name: tabLabel }));

      expect(await screen.findByText(emptyMessage)).toBeTruthy();
      expect(screen.queryByRole("table")).toBeNull();
    },
  );
});

describe("GlossaryBrowserScreen — five term-vocabulary tabs, generic load-failure plus Retry (disclosed inference)", () => {
  it.each(VOCABULARY_TAB_CASES)(
    "shows $errorMessage plus a Retry button when GET $path fails, and Retry re-issues the same request, in the $tabLabel tab",
    async ({ tabLabel, path, errorMessage }) => {
      const fetchMock = createGlossaryFetchStub({
        [path]: () => {
          throw new Error("network down");
        },
      });
      await mountGlossaryBrowserScreen(fetchMock);
      await screen.findByText(CONCEPTS_EMPTY_MESSAGE);

      fireEvent.click(screen.getByRole("tab", { name: tabLabel }));

      expect(await screen.findByText(errorMessage)).toBeTruthy();
      const callsToThisPathBeforeRetry = fetchMock.mock.calls.filter(
        (call) => call[0] === path,
      ).length;

      fireEvent.click(screen.getByRole("button", { name: "Retry" }));

      await waitFor(() => {
        const callsAfterRetry = fetchMock.mock.calls.filter((call) => call[0] === path).length;
        expect(callsAfterRetry).toBeGreaterThan(callsToThisPathBeforeRetry);
      });
    },
  );
});

describe("GlossaryBrowserScreen — switching tabs (edge case)", () => {
  it("renders the newly active tab's own data in place of the previously active tab's, and issues no request for the other four vocabulary paths", async () => {
    const outcomes = [term("resolved"), term("pending")];
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([])),
      [OUTCOME_PATH]: () => jsonResponse(page(outcomes)),
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText(CONCEPTS_EMPTY_MESSAGE);

    fireEvent.click(screen.getByRole("tab", { name: "Outcomes" }));

    expect(await screen.findByText("resolved")).toBeTruthy();
    expect(await screen.findByText("pending")).toBeTruthy();
    expect(screen.queryByText(CONCEPTS_EMPTY_MESSAGE)).toBeNull();

    const requestedPaths = fetchMock.mock.calls.map((call) =>
      typeof call[0] === "string" ? call[0] : call[0].toString(),
    );
    expect(requestedPaths).toContain(CONCEPTS_PATH);
    expect(requestedPaths).toContain(OUTCOME_PATH);
    expect(requestedPaths).not.toContain(SUBJECT_TYPE_PATH);
    expect(requestedPaths).not.toContain(SUBJECT_ATTRIBUTE_PATH);
    expect(requestedPaths).not.toContain(ACTION_PATH);
    expect(requestedPaths).not.toContain(RECIPIENT_PATH);
  });
});
