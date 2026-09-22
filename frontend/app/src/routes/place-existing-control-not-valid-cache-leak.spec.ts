import { afterEach, describe, expect, it, vi } from "vitest";
// This test walks the not-valid reading against a read-did-not-complete reading, and against a
// query cache seeded from an earlier successful, released read, inside a single test body;
// automatic cleanup only runs between separate it()s, not between renders inside one, so each
// mount past the first unmounts the prior render itself before mounting again.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup, screen } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import {
  apiErrorResponse,
  CASE_HYPOTHESES_PATH,
  createFetchStub,
  mountManifestScreen,
  SLUG,
  TWO_ENTRY_MANIFEST,
  VERSION,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

const LOADING_CANDIDATES_MESSAGE = "Loading this case's hypotheses…";
const LOAD_ERROR_TEXT = "Unable to load this manifest right now.";
const NOT_VALID_TEXT = `Version ${VERSION} of this case does not read back as a case.`;

function pendingCaseHypotheses(): Promise<Response> {
  return new Promise<Response>(() => {});
}

function notValidResponse(): Response {
  return apiErrorResponse("CaseVersionNotValidError", 409, "validation failed");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "VersionManifestScreen -- the not-valid statement names the version, told apart from a read " +
    "that did not complete, and leaks no content from a released version cached by an earlier " +
    "successful read (criteria 3, 4; " +
    "rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case)",
  () => {
    it("states the version-keyed not-valid statement on a fresh refusal without the read-did-not-complete text, states the read-did-not-complete text on an unrelated failure without the not-valid text, and states only the not-valid text -- offering the placing control still -- when the same read is refused after a released version with manifest entries was already cached", async () => {
      const freshNotValidFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: notValidResponse,
        [`GET ${CASE_HYPOTHESES_PATH}`]: pendingCaseHypotheses,
      });
      await mountManifestScreen(freshNotValidFetch);
      await screen.findByText(NOT_VALID_TEXT);
      expect(screen.queryByText(LOAD_ERROR_TEXT)).toBeNull();
      expect(screen.queryByRole("table")).toBeNull();
      expect(screen.queryByLabelText("H1")).toBeNull();

      cleanup();
      vi.unstubAllGlobals();

      const loadErrorFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => {
          throw new Error("network down");
        },
        [`GET ${CASE_HYPOTHESES_PATH}`]: pendingCaseHypotheses,
      });
      await mountManifestScreen(loadErrorFetch);
      await screen.findByText(LOAD_ERROR_TEXT);
      expect(screen.queryByText(NOT_VALID_TEXT)).toBeNull();

      cleanup();
      vi.unstubAllGlobals();

      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      queryClient.setQueryData(["case-version", SLUG, VERSION], {
        state: "released",
        manifest: TWO_ENTRY_MANIFEST.manifest,
      });
      const staleCacheFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: notValidResponse,
        [`GET ${CASE_HYPOTHESES_PATH}`]: pendingCaseHypotheses,
      });
      await mountManifestScreen(staleCacheFetch, undefined, queryClient);
      await screen.findByText(NOT_VALID_TEXT);
      expect(screen.queryByLabelText("H1")).toBeNull();
      expect(screen.queryByLabelText("H2")).toBeNull();
      expect(
        screen.getByText(LOADING_CANDIDATES_MESSAGE),
        "expected the placing control still offered -- the released state left over from the " +
          "earlier cached read must not withhold it",
      ).toBeTruthy();

      cleanup();
      vi.unstubAllGlobals();
    });
  },
);
