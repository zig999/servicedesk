import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  ACTION_PATH,
  ALL_TAB_CASES,
  ALL_TAB_LABELS,
  CONCEPTS_EMPTY_MESSAGE,
  CONCEPTS_PATH,
  createGlossaryFetchStub,
  jsonResponse,
  mountGlossaryBrowserScreen,
  OUTCOME_PATH,
  page,
  RECIPIENT_PATH,
  SUBJECT_TYPE_PATH,
  VOCABULARY_TAB_CASES,
} from "./glossary-browser-screen.test-support";

const SUBJECT_ATTRIBUTE_PATH = "/v1/glossary/subject-attribute";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GlossaryBrowserScreen — no read of the retired subject-attribute vocabulary, from any tab (criteria 2 and 5)", () => {
  it("never requests the subject-attribute vocabulary, and every path it does request is one of the glossary's five held endpoints", async () => {
    const fetchMock = createGlossaryFetchStub({
      [CONCEPTS_PATH]: () => jsonResponse(page([])),
      [SUBJECT_TYPE_PATH]: () => jsonResponse(page([])),
      [OUTCOME_PATH]: () => jsonResponse(page([])),
      [ACTION_PATH]: () => jsonResponse(page([])),
      [RECIPIENT_PATH]: () => jsonResponse(page([])),
    });
    await mountGlossaryBrowserScreen(fetchMock);
    await screen.findByText(CONCEPTS_EMPTY_MESSAGE);

    for (const { tabLabel, emptyMessage } of VOCABULARY_TAB_CASES) {
      fireEvent.click(screen.getByRole("tab", { name: tabLabel }));
      await screen.findByText(emptyMessage);
    }

    const requestedPaths = new Set(
      fetchMock.mock.calls.map(([input]) =>
        typeof input === "string" ? input : input.toString(),
      ),
    );

    expect(requestedPaths.has(SUBJECT_ATTRIBUTE_PATH)).toBe(false);
    expect(requestedPaths).toEqual(
      new Set([CONCEPTS_PATH, SUBJECT_TYPE_PATH, OUTCOME_PATH, ACTION_PATH, RECIPIENT_PATH]),
    );
  });
});

describe("GlossaryBrowserScreen — the test support's shared fixtures hold no Subject attributes entry (criterion 6)", () => {
  it("excludes Subject attributes from ALL_TAB_LABELS, VOCABULARY_TAB_CASES and ALL_TAB_CASES", () => {
    expect(ALL_TAB_LABELS).not.toContain("Subject attributes");
    expect(VOCABULARY_TAB_CASES.some((tabCase) => tabCase.tabLabel === "Subject attributes")).toBe(
      false,
    );
    expect(
      VOCABULARY_TAB_CASES.some((tabCase) => tabCase.path.includes("subject-attribute")),
    ).toBe(false);
    expect(ALL_TAB_CASES.some((tabCase) => tabCase.tabLabel === "Subject attributes")).toBe(false);
    expect(ALL_TAB_CASES.some((tabCase) => tabCase.path.includes("subject-attribute"))).toBe(
      false,
    );
  });
});
