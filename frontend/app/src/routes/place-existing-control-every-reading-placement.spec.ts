import { afterEach, describe, expect, it, vi } from "vitest";
// This test walks the not-valid, load-error and loading readings, confirming a placement on
// each, inside a single test body; automatic cleanup only runs between separate it()s, not
// between renders inside one, so each mount past the first unmounts the prior render itself
// before mounting again.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  apiErrorResponse,
  CASE_HYPOTHESES_PATH,
  caseHypothesesResponse,
  createFetchStub,
  hypothesisRevisionsPath,
  hypothesisRevisionsResponse,
  jsonResponse,
  manifestPath,
  mountManifestScreen,
  noContentResponse,
  openHypothesisPicker,
  parsedPutBody,
  putCallCount,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

function notValidResponse(): Response {
  return apiErrorResponse("CaseVersionNotValidError", 409, "validation failed");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "PlaceExistingHypothesisControl -- the curator's own revision and position, never derived, " +
    "confirmed on the not-valid, load-error and loading readings (criteria 7, 8)",
  () => {
    it("issues exactly one PUT carrying the curator's own chosen revision -- pre-selected to the hypothesis's own highest but freely overridden -- and the curator's own typed position, on each of the three readings", async () => {
      const notValidFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: notValidResponse,
        [`GET ${CASE_HYPOTHESES_PATH}`]: () => jsonResponse(caseHypothesesResponse(["H3"])),
        [`GET ${hypothesisRevisionsPath("H3")}`]: () => jsonResponse(hypothesisRevisionsResponse([1, 9])),
        [`PUT ${manifestPath("H3")}`]: () => noContentResponse(),
      });
      await mountManifestScreen(notValidFetch);
      await openHypothesisPicker("H3");
      await waitFor(() => expect(screen.getByLabelText("Revision").textContent).toBe("9"));
      fireEvent.click(screen.getByLabelText("Revision"));
      fireEvent.mouseDown(within(screen.getByRole("listbox")).getByRole("option", { name: "1" }));
      expect(screen.getByLabelText("Revision").textContent).toBe("1");
      fireEvent.change(screen.getByLabelText("Position"), { target: { value: "5" } });
      fireEvent.click(screen.getByRole("button", { name: "Place hypothesis" }));

      await waitFor(() => expect(putCallCount(notValidFetch)).toBe(1));
      expect(parsedPutBody(notValidFetch)).toEqual({ revision: 1, position: 5 });

      cleanup();
      vi.unstubAllGlobals();

      const loadErrorFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => {
          throw new Error("network down");
        },
        [`GET ${CASE_HYPOTHESES_PATH}`]: () => jsonResponse(caseHypothesesResponse(["H2"])),
        [`GET ${hypothesisRevisionsPath("H2")}`]: () => jsonResponse(hypothesisRevisionsResponse([1, 5])),
        [`PUT ${manifestPath("H2")}`]: () => noContentResponse(),
      });
      await mountManifestScreen(loadErrorFetch);
      await screen.findByText("Unable to load this manifest right now.");
      await openHypothesisPicker("H2");
      await waitFor(() => expect(screen.getByLabelText("Revision").textContent).toBe("5"));
      fireEvent.change(screen.getByLabelText("Position"), { target: { value: "2" } });
      fireEvent.click(screen.getByRole("button", { name: "Place hypothesis" }));

      await waitFor(() => expect(putCallCount(loadErrorFetch)).toBe(1));
      expect(parsedPutBody(loadErrorFetch)).toEqual({ revision: 5, position: 2 });

      cleanup();
      vi.unstubAllGlobals();

      const loadingFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => new Promise<Response>(() => {}),
        [`GET ${CASE_HYPOTHESES_PATH}`]: () => jsonResponse(caseHypothesesResponse(["H1"])),
        [`GET ${hypothesisRevisionsPath("H1")}`]: () => jsonResponse(hypothesisRevisionsResponse([3])),
        [`PUT ${manifestPath("H1")}`]: () => noContentResponse(),
      });
      await mountManifestScreen(loadingFetch);
      await openHypothesisPicker("H1");
      await waitFor(() => expect(screen.getByLabelText("Revision").textContent).toBe("3"));
      fireEvent.change(screen.getByLabelText("Position"), { target: { value: "1" } });
      fireEvent.click(screen.getByRole("button", { name: "Place hypothesis" }));

      await waitFor(() => expect(putCallCount(loadingFetch)).toBe(1));
      expect(parsedPutBody(loadingFetch)).toEqual({ revision: 3, position: 1 });
    });
  },
);
