import { afterEach, describe, expect, it, vi } from "vitest";
// This test walks the not-valid, load-error and loading readings, confirming a refused
// placement against each, inside a single test body; automatic cleanup only runs between
// separate it()s, not between renders inside one, so each mount past the first unmounts the
// prior render itself before mounting again.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import type { FetchResponder } from "./version-manifest-screen.test-support";
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
  openHypothesisPicker,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

type PhaseConfig = { readonly name: string; readonly versionResponder: FetchResponder };

const PHASES: readonly PhaseConfig[] = [
  {
    name: "not-valid",
    versionResponder: () => apiErrorResponse("CaseVersionNotValidError", 409, "validation failed"),
  },
  {
    name: "load-error",
    versionResponder: () => {
      throw new Error("network down");
    },
  },
  { name: "loading", versionResponder: () => new Promise<Response>(() => {}) },
];

async function confirmAPlacement(
  versionResponder: FetchResponder,
  putResponder: FetchResponder,
): Promise<void> {
  const fetchMock = createFetchStub({
    [`GET ${VERSION_PATH}`]: versionResponder,
    [`GET ${CASE_HYPOTHESES_PATH}`]: () => jsonResponse(caseHypothesesResponse(["H1"])),
    [`GET ${hypothesisRevisionsPath("H1")}`]: () => jsonResponse(hypothesisRevisionsResponse([1])),
    [`PUT ${manifestPath("H1")}`]: putResponder,
  });
  await mountManifestScreen(fetchMock);
  await openHypothesisPicker("H1");
  await waitFor(() => expect(screen.getByLabelText("Revision").textContent).toBe("1"));
  fireEvent.change(screen.getByLabelText("Position"), { target: { value: "1" } });
  fireEvent.click(screen.getByRole("button", { name: "Place hypothesis" }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "PlaceExistingHypothesisControl -- refusal tellings identical to the ready reading's own on " +
    "the not-valid, load-error and loading readings (criteria 9, 10; " +
    "rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for)",
  () => {
    it("states the position-occupied telling against the chosen hypothesis, naming the collision and that the manifest stands unchanged, and discloses nothing for a refusal it holds no named telling for, on each of the three readings", async () => {
      for (const phase of PHASES) {
        await confirmAPlacement(phase.versionResponder, () =>
          apiErrorResponse("ManifestPositionOccupiedError", 409, "position already occupied"),
        );
        const alert = await screen.findByRole("alert");
        const alertText = alert.textContent ?? "";
        expect(alertText, `${phase.name}: names the hypothesis`).toMatch(/different hypothesis/i);
        expect(alertText, `${phase.name}: names the position collision`).toMatch(/position/i);
        expect(alertText, `${phase.name}: states the manifest stands unchanged`).toMatch(
          /(unchanged|exactly as it (did|stood))/i,
        );

        cleanup();
        vi.unstubAllGlobals();

        await confirmAPlacement(phase.versionResponder, () =>
          apiErrorResponse("HypothesisAlreadyManifestedError", 409, "SECRET-REFUSAL-MESSAGE"),
        );
        await waitFor(() =>
          expect(
            screen.getByRole("button", { name: "Place hypothesis" }).hasAttribute("disabled"),
          ).toBe(false),
        );
        expect(screen.queryByRole("alert"), `${phase.name}: no alert for an unnamed refusal`).toBeNull();
        expect(screen.queryByText("HypothesisAlreadyManifestedError")).toBeNull();
        expect(screen.queryByText("SECRET-REFUSAL-MESSAGE")).toBeNull();

        cleanup();
        vi.unstubAllGlobals();
      }
    });
  },
);
