import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  jsonResponse,
  mountNewCaseDraft,
  postCallCount,
  SUBJECT_TYPE_TERMS,
} from "./new-case-draft-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("NewCaseDraftScreen", () => {
  it("renders a blank form with no version's content pre-loaded, other than the subject field pre-set from the glossary", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountNewCaseDraft(fetchMock);

    const subjectInput = await screen.findByDisplayValue(SUBJECT_TYPE_TERMS.data[0].name);
    expect(subjectInput.hasAttribute("disabled")).toBe(false);

    const titleInput = await screen.findByLabelText<HTMLInputElement>("Title");
    const whenToUseInput = screen.getByLabelText<HTMLTextAreaElement>("When to use");
    expect(titleInput.value).toBe("");
    expect(whenToUseInput.value).toBe("");
  });

  it("pre-sets the subject field to the one subject-type value GET /v1/glossary/subject-type currently returns", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        "GET /v1/glossary/subject-type": () => jsonResponse({ data: [{ name: "onboarding" }] }),
      }),
    );
    await mountNewCaseDraft(fetchMock);

    expect(await screen.findByDisplayValue("onboarding")).toBeTruthy();
  });

  it("does not pre-set the subject field when the subject-type vocabulary currently returns no terms", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({ "GET /v1/glossary/subject-type": () => jsonResponse({ data: [] }) }),
    );
    await mountNewCaseDraft(fetchMock);

    const subjectInput = await screen.findByLabelText<HTMLInputElement>("Subject type");
    expect(subjectInput.value).toBe("");
  });

  it("shows a loading placeholder before the glossary vocabularies arrive", async () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    await mountNewCaseDraft(fetchMock);

    expect(screen.getByText("Loading…")).toBeTruthy();
    expect(screen.queryByLabelText("Title")).toBeNull();
  });

  it("shows a failure placeholder with a retry action when a glossary vocabulary fails to load", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        "GET /v1/glossary/subject-type": () => {
          throw new Error("network down");
        },
      }),
    );
    await mountNewCaseDraft(fetchMock);

    expect(await screen.findByText("Unable to load this form right now.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("does not issue POST /v1/cases when Save is clicked before any required field is filled in", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountNewCaseDraft(fetchMock);

    await screen.findByLabelText("Title");
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(
        screen.getAllByText("String must contain at least 1 character(s)").length,
      ).toBeGreaterThan(0);
    });
    expect(postCallCount(fetchMock)).toBe(0);
  });
});
