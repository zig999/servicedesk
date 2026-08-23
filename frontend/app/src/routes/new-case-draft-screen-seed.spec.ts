import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  jsonResponse,
  mountNewCaseDraft,
  RELEASED_VERSION_RECORD,
  SUBJECT_TYPE_TERMS,
  versionPath,
  VERSIONS_PATH,
  wasCalledWith,
} from "./new-case-draft-screen.test-support";

// Seeding coverage for task/version-editor/seed-new-draft-from-latest-released
// (criteria 1 and 2, plus the "highest-numbered released entry" and
// "no premature blank-form flash" inferences its own delivery record
// discloses). POST-body coverage for that same task lives in
// new-case-draft-screen-seed-post.spec.ts, split out to stay under this
// project's own max-lines rule; both share new-case-draft-screen.test-support.ts.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("NewCaseDraftScreen — seeding from the case's own latest released version", () => {
  it("pre-populates title, when_to_use, subject, fallback outcome/referral and consolidation register from the case's own latest released version, read via GET /v1/cases/{slug}/versions/{version}", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [{ version: 4, state: "released" }] }),
        [`GET ${versionPath(4)}`]: () => jsonResponse(RELEASED_VERSION_RECORD),
      }),
    );
    await mountNewCaseDraft(fetchMock);

    expect(await screen.findByDisplayValue(RELEASED_VERSION_RECORD.title)).toBeTruthy();
    expect(screen.getByDisplayValue(RELEASED_VERSION_RECORD.when_to_use)).toBeTruthy();
    const subjectInput = screen.getByDisplayValue(RELEASED_VERSION_RECORD.subject);
    expect(subjectInput.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(RELEASED_VERSION_RECORD.consolidation_register)).toBeTruthy();
    expect(screen.getByText(RELEASED_VERSION_RECORD.fallback.outcome)).toBeTruthy();
    expect(screen.getByText(RELEASED_VERSION_RECORD.fallback.referral.action)).toBeTruthy();
    expect(screen.getByText(RELEASED_VERSION_RECORD.fallback.referral.recipient)).toBeTruthy();
    expect(wasCalledWith(fetchMock, "GET", versionPath(4))).toBe(true);
    // Criterion 2's own copy is the mirror image of criterion 1: it must not
    // appear once the form was actually seeded from a released version.
    expect(screen.queryByText("This is the case's first version.")).toBeNull();
  });

  it("treats the case's own latest released version as the highest-numbered released entry, not the last entry the version list names nor a higher-numbered draft", async () => {
    const higherRecord = { ...RELEASED_VERSION_RECORD, title: "From version four" };
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSIONS_PATH}`]: () =>
          jsonResponse({
            data: [
              { version: 2, state: "released" },
              { version: 5, state: "draft" },
              { version: 4, state: "released" },
            ],
          }),
        [`GET ${versionPath(4)}`]: () => jsonResponse(higherRecord),
      }),
    );
    await mountNewCaseDraft(fetchMock);

    // Neither the lower-numbered released entry (2) nor the higher-numbered
    // but still-draft entry (5) is a registered fetch key -- reading either
    // one instead would leave that query erroring and the screen stuck on
    // "Unable to load this form right now.", so this assertion fails loudly
    // rather than silently seeding from the wrong version.
    expect(await screen.findByDisplayValue(higherRecord.title)).toBeTruthy();
    expect(wasCalledWith(fetchMock, "GET", versionPath(2))).toBe(false);
    expect(wasCalledWith(fetchMock, "GET", versionPath(5))).toBe(false);
  });

  it("leaves the form blank with the subject pre-set from the glossary and shows first-version copy when the case's version history holds no released version", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [{ version: 3, state: "draft" }] }),
      }),
    );
    await mountNewCaseDraft(fetchMock);

    const subjectInput = await screen.findByDisplayValue(SUBJECT_TYPE_TERMS.data[0].name);
    expect(subjectInput.hasAttribute("disabled")).toBe(true);
    const titleInput = screen.getByLabelText<HTMLInputElement>("Title");
    expect(titleInput.value).toBe("");
    expect(screen.getByText("This is the case's first version.")).toBeTruthy();
  });

  it("keeps the loading placeholder shown while the case's own latest released version is still being read, rather than flashing the blank form first", async () => {
    let resolveVersionRecord: (response: Response) => void = () => {};
    const versionRecordPromise = new Promise<Response>((resolve) => {
      resolveVersionRecord = resolve;
    });
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [{ version: 4, state: "released" }] }),
        [`GET ${versionPath(4)}`]: () => versionRecordPromise,
      }),
    );
    await mountNewCaseDraft(fetchMock);

    // Waits until the version list has resolved and this hook's own
    // conditional read has actually started (proving the two are sequenced,
    // not racing) before asserting the screen is still in its loading phase.
    await waitFor(() => {
      expect(wasCalledWith(fetchMock, "GET", versionPath(4))).toBe(true);
    });
    expect(screen.getByText("Loading…")).toBeTruthy();
    expect(screen.queryByLabelText("Title")).toBeNull();

    await act(async () => {
      resolveVersionRecord(jsonResponse(RELEASED_VERSION_RECORD));
    });
    expect(await screen.findByDisplayValue(RELEASED_VERSION_RECORD.title)).toBeTruthy();
  });

  it("shows the load-error phase with a retry action when reading the case's own version list fails", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSIONS_PATH}`]: () => {
          throw new Error("network down");
        },
      }),
    );
    await mountNewCaseDraft(fetchMock);

    expect(await screen.findByText("Unable to load this form right now.")).toBeTruthy();
    const callsBeforeRetry = fetchMock.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBeforeRetry);
    });
  });

  it("shows the load-error phase when reading the found released version's own record fails", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [{ version: 4, state: "released" }] }),
        [`GET ${versionPath(4)}`]: () => {
          throw new Error("network down");
        },
      }),
    );
    await mountNewCaseDraft(fetchMock);

    expect(await screen.findByText("Unable to load this form right now.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });
});
