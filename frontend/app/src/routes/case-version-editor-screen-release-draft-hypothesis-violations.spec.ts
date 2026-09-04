import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  createFetchStub,
  jsonResponse,
  mountCaseVersionEditor,
  openReleaseDialog,
  releaseCallCount,
  releaseConfirmButton,
  releaseHandlers,
  RELEASED_RECORD,
  RELEASE_PATH,
  versionGetCallCount,
} from "./case-version-editor-release.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function draftHypothesisViolation(hypothesisName: string): string {
  return `the hypothesis "${hypothesisName}" is manifested at a revision that is not released`;
}

function notReleasableResponse(violations: readonly string[]) {
  return jsonResponse(
    {
      error: {
        code: "CaseVersionNotReleasableError",
        message: "not releasable",
        details: { violations },
      },
    },
    422,
  );
}

describe("CaseVersionEditorScreen — a release refused for manifested draft hypothesis-revisions", () => {
  it("renders one entry per still-draft hypothesis the refusal named, none dropped or collapsed, in place of the checklist", async () => {
    const violations = [
      draftHypothesisViolation("collections-outreach"),
      draftHypothesisViolation("hardship-plan"),
    ];
    const fetchMock = createFetchStub(
      releaseHandlers({ [`POST ${RELEASE_PATH}`]: () => notReleasableResponse(violations) }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    fireEvent.click(releaseConfirmButton());

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByRole("alert")).toBeTruthy());
    const alert = within(dialog).getByRole("alert");

    violations.forEach((violation) => {
      expect(within(alert).getByText((content) => content.includes(violation))).toBeTruthy();
    });
    expect(within(alert).getAllByRole("listitem")).toHaveLength(2);
    expect(within(dialog).queryByText(/Manifest holds at least one hypothesis/)).toBeNull();
  });

  it("renders a manifested-hypothesis violation together with a violation of another release rule in the same list", async () => {
    const hypothesisViolation = draftHypothesisViolation("collections-outreach");
    const otherRuleViolation = "Fallback recipient no longer exists in the glossary";
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`POST ${RELEASE_PATH}`]: () =>
          notReleasableResponse([hypothesisViolation, otherRuleViolation]),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    fireEvent.click(releaseConfirmButton());

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByRole("alert")).toBeTruthy());
    const alert = within(dialog).getByRole("alert");

    expect(
      within(alert).getByText((content) => content.includes(hypothesisViolation)),
    ).toBeTruthy();
    expect(
      within(alert).getByText((content) => content.includes(otherRuleViolation)),
    ).toBeTruthy();
    expect(within(alert).getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders two list entries, not one, when the same still-draft hypothesis reaches the refusal twice with an identical violation string", async () => {
    const repeatedViolation = draftHypothesisViolation("collections-outreach");
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`POST ${RELEASE_PATH}`]: () =>
          notReleasableResponse([repeatedViolation, repeatedViolation]),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    fireEvent.click(releaseConfirmButton());

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByRole("alert")).toBeTruthy());
    const alert = within(dialog).getByRole("alert");

    expect(within(alert).getAllByRole("listitem")).toHaveLength(2);
    expect(within(alert).getAllByText((content) => content.includes(repeatedViolation))).toHaveLength(2);
  });

  it("leaves the case version reading as a draft with Release still offered after the refusal, so a second attempt succeeds with no reload in between", async () => {
    const violations = [draftHypothesisViolation("collections-outreach")];
    let postCalls = 0;
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`POST ${RELEASE_PATH}`]: () => {
          postCalls += 1;
          return postCalls === 1 ? notReleasableResponse(violations) : jsonResponse(RELEASED_RECORD);
        },
      }),
    );
    await mountCaseVersionEditor(fetchMock);
    expect(versionGetCallCount(fetchMock)).toBe(1);

    await openReleaseDialog();
    fireEvent.click(releaseConfirmButton());

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByRole("alert")).toBeTruthy());

    expect(versionGetCallCount(fetchMock)).toBe(1);
    expect(screen.getByLabelText("Title").hasAttribute("disabled")).toBe(false);
    expect(releaseConfirmButton().hasAttribute("disabled")).toBe(false);

    fireEvent.click(releaseConfirmButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(releaseCallCount(fetchMock)).toBe(2);
  });
});
