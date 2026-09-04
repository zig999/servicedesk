import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import { OUTCOME_TERMS } from "./case-version-editor-screen.test-support";
import {
  CONCEPTS_PATH,
  createFetchStub,
  DRAFT_RECORD,
  jsonResponse,
  mountCaseVersionEditor,
  openReleaseDialog,
  releaseHandlers,
  sequentialHandler,
  VERSION_PATH,
} from "./case-version-editor-release.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseVersionEditorScreen — the checklist's own manifest item (criterion 2, empty manifest)", () => {
  it("marks the manifest item unsatisfied with a zero count on an empty manifest, while the concept item stays satisfied vacuously", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse({ ...DRAFT_RECORD, manifest: [] }),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getAllByRole("listitem")).toHaveLength(3);
    expect(
      within(dialog).getByText(/!\s*Manifest holds at least one hypothesis \(0\)/),
    ).toBeTruthy();
    expect(
      within(dialog).getByText(/✓\s*Every collected concept accepts the case subject/),
    ).toBeTruthy();
  });
});

describe("CaseVersionEditorScreen — the checklist's own fallback-terms item (criterion 2, re-reading the glossary)", () => {
  it("re-reads GET /v1/glossary/outcome when the Dialog opens, and marks the fallback item unsatisfied once the fallback's own outcome term is no longer offered", async () => {
    const outcomeWithoutResolved = { data: [{ name: "pending" }, { name: "rejected" }] };
    const fetchMock = createFetchStub(
      releaseHandlers({
        "GET /v1/glossary/outcome": sequentialHandler([OUTCOME_TERMS, outcomeWithoutResolved]),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();

    await waitFor(() => {
      expect(
        within(screen.getByRole("dialog")).getByText(/!\s*Fallback resolution is set/),
      ).toBeTruthy();
    });

    const outcomeCalls = fetchMock.mock.calls.filter(
      ([input]) => (typeof input === "string" ? input : input.toString()) === "/v1/glossary/outcome",
    );
    expect(outcomeCalls.length).toBe(2);
  });
});

describe("CaseVersionEditorScreen — the checklist's own concept item (criterion 2, rules/knowledge/a-concept-accepts-the-declared-subject-type)", () => {
  it("marks the concept item unsatisfied when a re-read concept no longer accepts the version's own subject, independently of the other two items", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`GET ${CONCEPTS_PATH}`]: () =>
          jsonResponse({ data: [{ name: "late-payment", accepts: ["some-other-subject"] }] }),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getAllByRole("listitem")).toHaveLength(3);
    expect(
      within(dialog).getByText(/!\s*Every collected concept accepts the case subject/),
    ).toBeTruthy();
    expect(within(dialog).getByText(/✓\s*Manifest holds at least one hypothesis \(1\)/)).toBeTruthy();
    expect(within(dialog).getByText(/✓\s*Fallback resolution is set/)).toBeTruthy();
  });

  it("marks the concept item unsatisfied, never a distinct fourth item, when a manifested concept no longer exists at all in the freshly re-read glossary", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({ [`GET ${CONCEPTS_PATH}`]: () => jsonResponse({ data: [] }) }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getAllByRole("listitem")).toHaveLength(3);
    expect(
      within(dialog).getByText(/!\s*Every collected concept accepts the case subject/),
    ).toBeTruthy();
  });
});

describe("CaseVersionEditorScreen — the checklist's own concept item for an entry with no collects field (this task's own inference)", () => {
  it("marks the concept item unsatisfied, not crashing and not vacuously satisfied, for a manifest entry whose hypothesis_revision carries no collects array at all", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse({ ...DRAFT_RECORD, manifest: [{ hypothesis_revision: {} }] }),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getAllByRole("listitem")).toHaveLength(3);
    expect(
      within(dialog).getByText(/!\s*Every collected concept accepts the case subject/),
    ).toBeTruthy();
    expect(
      within(dialog).queryByText(/✓\s*Every collected concept accepts the case subject/),
    ).toBeNull();
  });
});

describe("CaseVersionEditorScreen — a checklist dependency that never successfully reads", () => {
  it("treats a checklist dependency that fails every read as unsatisfied rather than crashing the Dialog", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`GET ${CONCEPTS_PATH}`]: () => {
          throw new Error("network down");
        },
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getAllByRole("listitem")).toHaveLength(3);
    expect(
      within(dialog).getByText(/!\s*Every collected concept accepts the case subject/),
    ).toBeTruthy();
  });
});
