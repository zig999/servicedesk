import { afterEach, describe, expect, it, vi } from "vitest";
// This test walks the manifest builder through every reading its own offering rule names --
// pending, failed, refused for validation, draft (empty and non-empty) and released -- inside a
// single test body; automatic cleanup only runs between separate it()s, not between renders
// inside one, so each mount past the first unmounts the prior render itself before mounting
// again.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup, screen } from "@testing-library/react";
import {
  apiErrorResponse,
  CASE_HYPOTHESES_PATH,
  createFetchStub,
  entry,
  jsonResponse,
  mountManifestScreen,
  VERSION,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

const LOADING_CANDIDATES_MESSAGE = "Loading this case's hypotheses…";
const LOAD_ERROR_TEXT = "Unable to load this manifest right now.";
const NOT_VALID_TEXT = `Version ${VERSION} of this case does not read back as a case.`;

function pendingCaseHypotheses(): Promise<Response> {
  return new Promise<Response>(() => {});
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "PlaceExistingHypothesisControl -- offered on every reading but a released version " +
    "(criteria 1, 2, 3, 11; " +
    "rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions)",
  () => {
    it("renders the placing control's own offer alongside the pending indication, the read-did-not-complete statement, the not-valid statement, an empty draft and a non-empty draft, and withholds it only once the version reads back released", async () => {
      const pendingFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => new Promise<Response>(() => {}),
        [`GET ${CASE_HYPOTHESES_PATH}`]: pendingCaseHypotheses,
      });
      await mountManifestScreen(pendingFetch);
      expect(screen.getByText("Loading manifest…")).toBeTruthy();
      expect(screen.getByText(LOADING_CANDIDATES_MESSAGE)).toBeTruthy();

      cleanup();
      vi.unstubAllGlobals();

      const failedFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => {
          throw new Error("network down");
        },
        [`GET ${CASE_HYPOTHESES_PATH}`]: pendingCaseHypotheses,
      });
      await mountManifestScreen(failedFetch);
      await screen.findByText(LOAD_ERROR_TEXT);
      expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
      expect(screen.getByText(LOADING_CANDIDATES_MESSAGE)).toBeTruthy();

      cleanup();
      vi.unstubAllGlobals();

      const notValidFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () =>
          apiErrorResponse("CaseVersionNotValidError", 409, "validation failed"),
        [`GET ${CASE_HYPOTHESES_PATH}`]: pendingCaseHypotheses,
      });
      await mountManifestScreen(notValidFetch);
      await screen.findByText(NOT_VALID_TEXT);
      expect(screen.getByText(LOADING_CANDIDATES_MESSAGE)).toBeTruthy();

      cleanup();
      vi.unstubAllGlobals();

      const emptyDraftFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse({ state: "draft", manifest: [] }),
        [`GET ${CASE_HYPOTHESES_PATH}`]: pendingCaseHypotheses,
      });
      await mountManifestScreen(emptyDraftFetch);
      await screen.findByRole("heading", { name: /Manifest/ });
      expect(screen.getByText(LOADING_CANDIDATES_MESSAGE)).toBeTruthy();

      cleanup();
      vi.unstubAllGlobals();

      const draftFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse({ state: "draft", manifest: [entry(1, "H1", 2)] }),
        [`GET ${CASE_HYPOTHESES_PATH}`]: pendingCaseHypotheses,
      });
      await mountManifestScreen(draftFetch);
      await screen.findByLabelText("H1");
      expect(screen.getByText(LOADING_CANDIDATES_MESSAGE)).toBeTruthy();

      cleanup();
      vi.unstubAllGlobals();

      const releasedFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse({ state: "released", manifest: [entry(1, "H1", 2)] }),
        [`GET ${CASE_HYPOTHESES_PATH}`]: pendingCaseHypotheses,
      });
      await mountManifestScreen(releasedFetch);
      await screen.findByLabelText("H1");
      expect(
        screen.queryByText(LOADING_CANDIDATES_MESSAGE),
        "expected the placing control withheld once the version reads back released",
      ).toBeNull();
    });
  },
);
