import { afterEach, describe, expect, it, vi } from "vitest";
// This test walks the manifest builder through more than one reading inside a single test body,
// to compare its own placement-refusal telling against the remove-hypothesis telling and against
// a refusal carrying a code it holds no presentation for; automatic cleanup only runs between
// separate it()s, not between renders inside one, so each mount past the first unmounts the
// prior render itself before mounting again.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  apiErrorResponse,
  CASE_HYPOTHESES_PATH,
  caseHypothesesResponse,
  clickRemoveTrigger,
  createFetchStub,
  dialogConfirmRemoveButton,
  findRow,
  hypothesisRevisionsPath,
  hypothesisRevisionsResponse,
  jsonResponse,
  manifestPath,
  mountManifestScreen,
  openHypothesisPicker,
  TWO_ENTRY_MANIFEST,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "PlaceExistingHypothesisControl — its own refusal tellings, distinguishable from the " +
    "remove-hypothesis telling and from the generic notice (criteria 11, 12; " +
    "rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for)",
  () => {
    it("states, against the hypothesis just chosen, that a different hypothesis already holds the named position and that the manifest stands unchanged; reads distinctly from the remove-hypothesis telling; and discloses nothing for a placement refused with a code it holds no presentation for", async () => {
      const positionOccupiedFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
        [`GET ${hypothesisRevisionsPath("H1")}`]: () => jsonResponse(hypothesisRevisionsResponse([2])),
        [`GET ${hypothesisRevisionsPath("H2")}`]: () => jsonResponse(hypothesisRevisionsResponse([5])),
        [`GET ${CASE_HYPOTHESES_PATH}`]: () =>
          jsonResponse(caseHypothesesResponse(["H1", "H2", "H3"])),
        [`GET ${hypothesisRevisionsPath("H3")}`]: () => jsonResponse(hypothesisRevisionsResponse([1])),
        [`PUT ${manifestPath("H3")}`]: () =>
          apiErrorResponse("ManifestPositionOccupiedError", 409, "position already occupied"),
      });
      await mountManifestScreen(positionOccupiedFetch);
      await screen.findByLabelText("H1");

      await openHypothesisPicker("H3");
      await waitFor(() => expect(screen.getByLabelText("Revision").textContent).toBe("1"));
      fireEvent.change(screen.getByLabelText("Position"), { target: { value: "1" } });
      fireEvent.click(screen.getByRole("button", { name: "Place hypothesis" }));

      const placeAlert = await screen.findByRole("alert");
      const placeText = placeAlert.textContent ?? "";
      expect(placeText).toMatch(/different hypothesis/i);
      expect(placeText).toMatch(/position/i);
      expect(placeText).toMatch(/(unchanged|exactly as it (did|stood))/i);
      // the manifest itself stands exactly as it stood before the refused act
      expect(screen.queryByLabelText("H3")).toBeNull();
      expect(screen.getByLabelText("H1").textContent).toBe("2");
      expect(screen.getByLabelText("H2").textContent).toBe("5");

      cleanup();
      vi.unstubAllGlobals();

      const removeFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
        [`GET ${hypothesisRevisionsPath("H1")}`]: () => jsonResponse(hypothesisRevisionsResponse([2])),
        [`GET ${hypothesisRevisionsPath("H2")}`]: () => jsonResponse(hypothesisRevisionsResponse([5])),
        [`GET ${CASE_HYPOTHESES_PATH}`]: () => jsonResponse(caseHypothesesResponse(["H1", "H2"])),
        [`DELETE ${manifestPath("H1")}`]: () =>
          apiErrorResponse("ManifestWouldHoldNoHypothesisError", 422, "would hold no hypothesis"),
      });
      await mountManifestScreen(removeFetch);
      await screen.findByLabelText("H1");
      clickRemoveTrigger("H1");
      await screen.findByRole("dialog");
      fireEvent.click(dialogConfirmRemoveButton());
      const removeAlert = await within(findRow("H1")).findByRole("alert");
      expect(removeAlert.textContent).not.toBe(placeText);

      cleanup();
      vi.unstubAllGlobals();

      const otherCodeFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
        [`GET ${hypothesisRevisionsPath("H1")}`]: () => jsonResponse(hypothesisRevisionsResponse([2])),
        [`GET ${hypothesisRevisionsPath("H2")}`]: () => jsonResponse(hypothesisRevisionsResponse([5])),
        [`GET ${CASE_HYPOTHESES_PATH}`]: () =>
          jsonResponse(caseHypothesesResponse(["H1", "H2", "H3"])),
        [`GET ${hypothesisRevisionsPath("H3")}`]: () => jsonResponse(hypothesisRevisionsResponse([1])),
        [`PUT ${manifestPath("H3")}`]: () =>
          apiErrorResponse("HypothesisAlreadyManifestedError", 409, "SECRET-REFUSAL-MESSAGE"),
      });
      await mountManifestScreen(otherCodeFetch);
      await screen.findByLabelText("H1");

      await openHypothesisPicker("H3");
      await waitFor(() => expect(screen.getByLabelText("Revision").textContent).toBe("1"));
      fireEvent.change(screen.getByLabelText("Position"), { target: { value: "1" } });
      fireEvent.click(screen.getByRole("button", { name: "Place hypothesis" }));

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Place hypothesis" }).hasAttribute("disabled"),
        ).toBe(false),
      );
      expect(screen.queryByRole("alert")).toBeNull();
      expect(screen.queryByText("HypothesisAlreadyManifestedError")).toBeNull();
      expect(screen.queryByText("SECRET-REFUSAL-MESSAGE")).toBeNull();
    });
  },
);
