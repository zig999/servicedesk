import { afterEach, describe, expect, it, vi } from "vitest";
// This test walks the loading, load-error and not-valid readings, and the answered-empty and
// still-pending case-hypotheses reads, inside a single test body; automatic cleanup only runs
// between separate it()s, not between renders inside one, so each mount past the first unmounts
// the prior render itself before mounting again.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import {
  apiErrorResponse,
  CASE_HYPOTHESES_PATH,
  caseHypothesesResponse,
  createFetchStub,
  jsonResponse,
  mountManifestScreen,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

const NO_FURTHER_HYPOTHESES_MESSAGE =
  "This case holds no further composed hypothesis to place in this version's manifest.";
const LOADING_CANDIDATES_MESSAGE = "Loading this case's hypotheses…";

function pendingCaseHypotheses(): Promise<Response> {
  return new Promise<Response>(() => {});
}

function notValidResponse(): Response {
  return apiErrorResponse("CaseVersionNotValidError", 409, "validation failed");
}

async function candidateNamesAt(fetchMock: ReturnType<typeof createFetchStub>): Promise<string[]> {
  await mountManifestScreen(fetchMock);
  const trigger = await screen.findByLabelText("Hypothesis to place");
  fireEvent.click(trigger);
  const options = within(screen.getByRole("listbox")).getAllByRole("option");
  return options.map((option) => option.textContent ?? "");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "PlaceExistingHypothesisControl -- candidates on the loading, load-error and not-valid " +
    "readings carry the case's own hypotheses with none excluded, and state the no-further " +
    "absence once answered empty, distinguishable from a still-pending read (criteria 5, 6)",
  () => {
    it("lists every one of the case's own answered hypotheses as a candidate on each of the three readings, whatever failed the version's own read, and states the no-further absence once the case's hypotheses read answers empty rather than the still-loading statement it shows while that read is pending", async () => {
      const threeHypotheses = () => jsonResponse(caseHypothesesResponse(["H1", "H2", "H3"]));

      const notValidNames = await candidateNamesAt(
        createFetchStub({
          [`GET ${VERSION_PATH}`]: notValidResponse,
          [`GET ${CASE_HYPOTHESES_PATH}`]: threeHypotheses,
        }),
      );
      expect(notValidNames).toEqual(["H1", "H2", "H3"]);

      cleanup();
      vi.unstubAllGlobals();

      const loadErrorNames = await candidateNamesAt(
        createFetchStub({
          [`GET ${VERSION_PATH}`]: () => {
            throw new Error("network down");
          },
          [`GET ${CASE_HYPOTHESES_PATH}`]: threeHypotheses,
        }),
      );
      expect(loadErrorNames).toEqual(["H1", "H2", "H3"]);

      cleanup();
      vi.unstubAllGlobals();

      const loadingNames = await candidateNamesAt(
        createFetchStub({
          [`GET ${VERSION_PATH}`]: () => new Promise<Response>(() => {}),
          [`GET ${CASE_HYPOTHESES_PATH}`]: threeHypotheses,
        }),
      );
      expect(loadingNames).toEqual(["H1", "H2", "H3"]);

      cleanup();
      vi.unstubAllGlobals();

      const answeredEmptyFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: notValidResponse,
        [`GET ${CASE_HYPOTHESES_PATH}`]: () => jsonResponse(caseHypothesesResponse([])),
      });
      await mountManifestScreen(answeredEmptyFetch);
      expect(await screen.findByText(NO_FURTHER_HYPOTHESES_MESSAGE)).toBeTruthy();
      expect(screen.queryByLabelText("Hypothesis to place")).toBeNull();
      expect(screen.queryByText(LOADING_CANDIDATES_MESSAGE)).toBeNull();

      cleanup();
      vi.unstubAllGlobals();

      const pendingHypothesesFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => {
          throw new Error("network down");
        },
        [`GET ${CASE_HYPOTHESES_PATH}`]: pendingCaseHypotheses,
      });
      await mountManifestScreen(pendingHypothesesFetch);
      expect(await screen.findByText(LOADING_CANDIDATES_MESSAGE)).toBeTruthy();
      expect(screen.queryByText(NO_FURTHER_HYPOTHESES_MESSAGE)).toBeNull();
      expect(screen.queryByLabelText("Hypothesis to place")).toBeNull();
    });
  },
);
