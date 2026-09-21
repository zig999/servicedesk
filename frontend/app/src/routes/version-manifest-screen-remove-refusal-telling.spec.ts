import { afterEach, describe, expect, it, vi } from "vitest";
// This test walks the manifest builder through more than one reading inside a single test
// body, to compare the two named refusal tellings against each other and against the
// generic notice; automatic cleanup only runs between separate it()s, not between renders
// inside one, so each mount past the first unmounts the prior render itself before mounting
// again.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  apiErrorResponse,
  clickRemoveTrigger,
  createFetchStub,
  dialogConfirmRemoveButton,
  findRow,
  jsonResponse,
  manifestPath,
  mountManifestScreen,
  TWO_ENTRY_MANIFEST,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "VersionManifestScreen — the manifest surface's own presentation for each composing " +
    "refusal it names, and the generic notice for every other one " +
    "(rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for)",
  () => {
    it("states the position-occupied refusal and the would-hold-no-hypothesis refusal distinctly from each other, and discloses no code, message or value for a place or a remove refused with any other code", async () => {
      const positionOccupiedFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
        [`PUT ${manifestPath("H2")}`]: () =>
          apiErrorResponse("ManifestPositionOccupiedError", 409, "position already occupied"),
      });
      await mountManifestScreen(positionOccupiedFetch);
      await screen.findByLabelText("H1");
      fireEvent.click(within(findRow("H2")).getByRole("button", { name: "Move H2 up" }));
      const positionStatement = await within(findRow("H2")).findByRole("alert");
      const positionText = positionStatement.textContent;
      expect(positionText).toBeTruthy();

      cleanup();
      vi.unstubAllGlobals();

      const wouldHoldNoneFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
        [`DELETE ${manifestPath("H1")}`]: () =>
          apiErrorResponse("ManifestWouldHoldNoHypothesisError", 422, "would hold no hypothesis"),
      });
      await mountManifestScreen(wouldHoldNoneFetch);
      await screen.findByLabelText("H1");
      clickRemoveTrigger("H1");
      await screen.findByRole("dialog");
      fireEvent.click(dialogConfirmRemoveButton());
      const removeStatement = await within(findRow("H1")).findByRole("alert");
      expect(removeStatement.textContent).toBeTruthy();
      expect(removeStatement.textContent).not.toBe(positionText);

      cleanup();
      vi.unstubAllGlobals();

      const placeOtherCodeFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
        [`PUT ${manifestPath("H2")}`]: () =>
          apiErrorResponse("SomeOtherRefusalCode", 500, "SECRET-REFUSAL-MESSAGE"),
      });
      await mountManifestScreen(placeOtherCodeFetch);
      await screen.findByLabelText("H1");
      fireEvent.click(within(findRow("H2")).getByRole("button", { name: "Move H2 up" }));
      await waitFor(() =>
        expect(
          within(findRow("H2")).getByRole("button", { name: "Move H2 up" }).hasAttribute(
            "disabled",
          ),
        ).toBe(false),
      );
      expect(within(findRow("H2")).queryByRole("alert")).toBeNull();
      expect(screen.queryByText("SomeOtherRefusalCode")).toBeNull();
      expect(screen.queryByText("SECRET-REFUSAL-MESSAGE")).toBeNull();

      cleanup();
      vi.unstubAllGlobals();

      const removeOtherCodeFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
        [`DELETE ${manifestPath("H1")}`]: () =>
          apiErrorResponse("SomeOtherRefusalCode", 500, "SECRET-REFUSAL-MESSAGE"),
      });
      await mountManifestScreen(removeOtherCodeFetch);
      await screen.findByLabelText("H1");
      clickRemoveTrigger("H1");
      await screen.findByRole("dialog");
      fireEvent.click(dialogConfirmRemoveButton());
      await waitFor(() =>
        expect(
          within(findRow("H1")).getByRole("button", { name: "Remove" }).hasAttribute("disabled"),
        ).toBe(false),
      );
      expect(within(findRow("H1")).queryByRole("alert")).toBeNull();
      expect(screen.queryByText("SomeOtherRefusalCode")).toBeNull();
      expect(screen.queryByText("SECRET-REFUSAL-MESSAGE")).toBeNull();
    });
  },
);
