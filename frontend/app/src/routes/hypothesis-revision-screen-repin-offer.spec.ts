import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  fillValidForm,
  H1_REVISIONS,
  HYPOTHESES_PATH,
  jsonResponse,
  MANIFEST_PATH,
  mountHypothesisForm,
  mountIsolatedRevise,
  revisePath,
  revisionsPath,
  SUBJECT_TYPE,
  VERSION_PATH,
} from "./hypothesis-revision-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const SAVE_BUTTON = { name: "Save hypothesis" };
const MANIFEST_BUILDER_BUTTON = { name: "Open Manifest Builder" };

function caseVersionWithPin(hypothesisName: string, pinnedRevision: number) {
  return {
    subject: SUBJECT_TYPE,
    manifest: [
      { hypothesis_revision: { hypothesis: { name: hypothesisName }, revision: pinnedRevision } },
    ],
  };
}

describe("a save that answers the same revision the draft's manifest entry already pinned (criterion 1)", () => {
  it("offers no manifest-builder step", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(caseVersionWithPin("H1", 2)),
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS),
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "H1", revision: 2 }, 201),
      }),
    );
    await mountIsolatedRevise(fetchMock, revisePath("H1"));
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    await waitFor(() => {
      expect(screen.queryByRole("button", SAVE_BUTTON)).toBeNull();
    });
    expect(screen.queryByRole("button", MANIFEST_BUILDER_BUTTON)).toBeNull();
  });
});

describe("a save that answers the same revision the draft's manifest entry already pinned (criterion 2)", () => {
  it("still states the hypothesis was saved as that revision number", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(caseVersionWithPin("H1", 2)),
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS),
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "H1", revision: 2 }, 201),
      }),
    );
    await mountIsolatedRevise(fetchMock, revisePath("H1"));
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    expect(await screen.findByText('Hypothesis "H1" saved as revision 2.')).toBeTruthy();
  });
});

describe("a save that answers a revision higher than the one the draft's manifest entry pinned (criteria 3 and 7)", () => {
  it("offers the manifest-builder step even though the save's response carries no field distinguishing an overwrite from a created revision", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(caseVersionWithPin("H1", 2)),
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS),
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "H1", revision: 3 }, 201),
      }),
    );
    await mountIsolatedRevise(fetchMock, revisePath("H1"));
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    expect(await screen.findByRole("button", MANIFEST_BUILDER_BUTTON)).toBeTruthy();
  });
});

describe("a save that answers a revision higher than the one the draft's manifest entry pinned (the saved revision number is stated in this branch too)", () => {
  it("states the saved revision number after a save that moved the pin forward, not only after one that left it in place", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(caseVersionWithPin("H1", 2)),
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS),
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "H1", revision: 3 }, 201),
      }),
    );
    await mountIsolatedRevise(fetchMock, revisePath("H1"));
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    expect(await screen.findByText('Hypothesis "H1" saved as revision 3.')).toBeTruthy();
  });
});

describe("activating the offered manifest-builder step (criterion 4)", () => {
  it("navigates to the manifest of the draft case version the screen was opened on", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(caseVersionWithPin("H1", 2)),
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS),
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "H1", revision: 3 }, 201),
      }),
    );
    const router = await mountHypothesisForm(fetchMock, revisePath("H1"));
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    fireEvent.click(await screen.findByRole("button", MANIFEST_BUILDER_BUTTON));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(MANIFEST_PATH);
    });
  });
});

describe("a save of a hypothesis that had no entry in the draft's manifest (criterion 5)", () => {
  it("offers the manifest-builder step", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "Brand New", revision: 1 }, 201),
      }),
    );
    await mountHypothesisForm(fetchMock);
    await fillValidForm("Brand New");
    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    expect(await screen.findByRole("button", MANIFEST_BUILDER_BUTTON)).toBeTruthy();
  });
});

describe("three successive saves of the same hypothesis that each answer the revision its manifest entry already pins (criterion 6)", () => {
  for (const attempt of [1, 2, 3]) {
    it(`leaves the screen offering no manifest-builder step after save number ${attempt}`, async () => {
      const fetchMock = createFetchStub(
        baseHandlers({
          [`GET ${VERSION_PATH}`]: () => jsonResponse(caseVersionWithPin("H1", 2)),
          [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS),
          [`POST ${HYPOTHESES_PATH}`]: () =>
            jsonResponse({ hypothesis_name: "H1", revision: 2 }, 201),
        }),
      );

      await mountIsolatedRevise(fetchMock, revisePath("H1"));
      await fillValidForm();
      fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

      await waitFor(() => {
        expect(screen.queryByRole("button", SAVE_BUTTON)).toBeNull();
      });
      expect(screen.queryByRole("button", MANIFEST_BUILDER_BUTTON)).toBeNull();
    });
  }
});
