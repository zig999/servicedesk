import { afterEach, describe, expect, it, vi } from "vitest";
// The second test below mounts the manifest builder twice inside a single test body, to compare
// a pending case-hypotheses read against one that has answered empty; automatic cleanup only
// runs between separate it()s, not between renders inside one, so the second mount unmounts the
// first render itself before mounting again.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import {
  CASE_HYPOTHESES_PATH,
  caseHypothesesResponse,
  createFetchStub,
  entry,
  hypothesisRevisionsPath,
  hypothesisRevisionsResponse,
  jsonResponse,
  mountManifestScreen,
  TWO_ENTRY_MANIFEST,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

const NO_FURTHER_HYPOTHESES_MESSAGE =
  "This case holds no further composed hypothesis to place in this version's manifest.";
const LOADING_CANDIDATES_MESSAGE = "Loading this case's hypotheses…";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "PlaceExistingHypothesisControl — the picker's own choices, once the version and the " +
    "case's hypotheses have both answered (criterion 1, criterion 2)",
  () => {
    it("lists, by hypothesis name, exactly the case's own hypotheses this version's manifest does not already hold as a row", async () => {
      const fetchMock = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
        [`GET ${hypothesisRevisionsPath("H1")}`]: () => jsonResponse(hypothesisRevisionsResponse([2])),
        [`GET ${hypothesisRevisionsPath("H2")}`]: () => jsonResponse(hypothesisRevisionsResponse([5])),
        [`GET ${CASE_HYPOTHESES_PATH}`]: () =>
          jsonResponse(caseHypothesesResponse(["H1", "H2", "H3"])),
      });
      await mountManifestScreen(fetchMock);
      await screen.findByLabelText("H1");

      const trigger = await screen.findByLabelText("Hypothesis to place");
      fireEvent.click(trigger);
      const options = within(screen.getByRole("listbox")).getAllByRole("option");
      expect(options.map((option) => option.textContent)).toEqual(["H3"]);
    });
  },
);

describe(
  "PlaceExistingHypothesisControl — no further hypothesis to place, told apart from a read " +
    "that has not settled (criterion 3, criterion 4)",
  () => {
    it("shows a loading statement offering no hypothesis and stating no absence while the case's hypotheses read has not answered, and switches to an explicit no-further-hypothesis statement offering no Select once that read answers leaving nothing beyond this version's own manifest", async () => {
      const pendingFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "Solo", 1)] }),
        [`GET ${hypothesisRevisionsPath("Solo")}`]: () =>
          jsonResponse(hypothesisRevisionsResponse([1])),
        [`GET ${CASE_HYPOTHESES_PATH}`]: () => new Promise<Response>(() => {}),
      });
      await mountManifestScreen(pendingFetch);
      await screen.findByLabelText("Solo");

      expect(screen.getByText(LOADING_CANDIDATES_MESSAGE)).toBeTruthy();
      expect(screen.queryByText(NO_FURTHER_HYPOTHESES_MESSAGE)).toBeNull();
      expect(screen.queryByLabelText("Hypothesis to place")).toBeNull();

      cleanup();
      vi.unstubAllGlobals();

      const answeredEmptyFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "Solo", 1)] }),
        [`GET ${hypothesisRevisionsPath("Solo")}`]: () =>
          jsonResponse(hypothesisRevisionsResponse([1])),
        [`GET ${CASE_HYPOTHESES_PATH}`]: () => jsonResponse(caseHypothesesResponse(["Solo"])),
      });
      await mountManifestScreen(answeredEmptyFetch);
      await screen.findByLabelText("Solo");

      expect(await screen.findByText(NO_FURTHER_HYPOTHESES_MESSAGE)).toBeTruthy();
      expect(screen.queryByText(LOADING_CANDIDATES_MESSAGE)).toBeNull();
      expect(screen.queryByLabelText("Hypothesis to place")).toBeNull();
    });
  },
);

describe(
  "PlaceExistingHypothesisControl — withheld on a released version's reading (criterion 13)",
  () => {
    it("renders no candidate Select, no loading statement and no no-further-hypothesis statement once the version reads back released", async () => {
      const fetchMock = createFetchStub({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse({ state: "released", manifest: [entry(1, "H1", 2)] }),
        [`GET ${hypothesisRevisionsPath("H1")}`]: () => jsonResponse(hypothesisRevisionsResponse([2])),
        [`GET ${CASE_HYPOTHESES_PATH}`]: () => jsonResponse(caseHypothesesResponse(["H1", "H2"])),
      });
      await mountManifestScreen(fetchMock);
      await screen.findByLabelText("H1");

      expect(screen.queryByLabelText("Hypothesis to place")).toBeNull();
      expect(screen.queryByText(NO_FURTHER_HYPOTHESES_MESSAGE)).toBeNull();
      expect(screen.queryByText(LOADING_CANDIDATES_MESSAGE)).toBeNull();
    });
  },
);
