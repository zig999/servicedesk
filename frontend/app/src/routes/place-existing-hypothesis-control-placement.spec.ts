import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  CASE_HYPOTHESES_PATH,
  caseHypothesesResponse,
  createFetchStub,
  entry,
  hypothesisRevisionsPath,
  hypothesisRevisionsResponse,
  jsonResponse,
  manifestPath,
  mountManifestScreen,
  noContentResponse,
  openHypothesisPicker,
  parsedPutBody,
  putCallCount,
  putUrl,
  sequentialGetHandler,
  SLUG,
  THREE_ENTRY_MANIFEST,
  TWO_ENTRY_MANIFEST,
  VERSION,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "PlaceExistingHypothesisControl — the PUT a confirmed placement issues, defaulting the " +
    "revision to the chosen hypothesis's own highest (criteria 5, 6, 7 [default half], 15; " +
    "domain/knowledge/manifest-entry)",
  () => {
    it("issues exactly one PUT to that hypothesis's own manifest endpoint, carrying a body that is exactly its highest existing revision paired with the curator's own declared position", async () => {
      const fetchMock = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
        [`GET ${hypothesisRevisionsPath("H1")}`]: () => jsonResponse(hypothesisRevisionsResponse([2])),
        [`GET ${hypothesisRevisionsPath("H2")}`]: () => jsonResponse(hypothesisRevisionsResponse([5])),
        [`GET ${CASE_HYPOTHESES_PATH}`]: () =>
          jsonResponse(caseHypothesesResponse(["H1", "H2", "H3"])),
        [`GET ${hypothesisRevisionsPath("H3")}`]: () =>
          jsonResponse(hypothesisRevisionsResponse([1, 9])),
        [`PUT ${manifestPath("H3")}`]: () => noContentResponse(),
      });
      await mountManifestScreen(fetchMock);
      await screen.findByLabelText("H1");

      await openHypothesisPicker("H3");
      await waitFor(() => expect(screen.getByLabelText("Revision").textContent).toBe("9"));
      fireEvent.change(screen.getByLabelText("Position"), { target: { value: "4" } });
      fireEvent.click(screen.getByRole("button", { name: "Place hypothesis" }));

      await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
      expect(putUrl(fetchMock)).toBe(manifestPath("H3"));
      expect(parsedPutBody(fetchMock)).toEqual({ revision: 9, position: 4 });
    });
  },
);

describe(
  "PlaceExistingHypothesisControl — overriding the default revision before confirming " +
    "(criterion 7 [override half]; " +
    "rules/knowledge/a-placement-into-a-manifest-holding-no-entry-pins-the-revision-the-curator-names)",
  () => {
    it("sends exactly the revision the curator switched to, never the hypothesis's own highest the picker defaulted to, whatever state either revision carries", async () => {
      const fetchMock = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
        [`GET ${hypothesisRevisionsPath("H1")}`]: () => jsonResponse(hypothesisRevisionsResponse([2])),
        [`GET ${hypothesisRevisionsPath("H2")}`]: () => jsonResponse(hypothesisRevisionsResponse([5])),
        [`GET ${CASE_HYPOTHESES_PATH}`]: () =>
          jsonResponse(caseHypothesesResponse(["H1", "H2", "H3"])),
        [`GET ${hypothesisRevisionsPath("H3")}`]: () =>
          jsonResponse(hypothesisRevisionsResponse([1, 9])),
        [`PUT ${manifestPath("H3")}`]: () => noContentResponse(),
      });
      await mountManifestScreen(fetchMock);
      await screen.findByLabelText("H1");

      await openHypothesisPicker("H3");
      await waitFor(() => expect(screen.getByLabelText("Revision").textContent).toBe("9"));

      fireEvent.click(screen.getByLabelText("Revision"));
      fireEvent.mouseDown(within(screen.getByRole("listbox")).getByRole("option", { name: "1" }));
      expect(screen.getByLabelText("Revision").textContent).toBe("1");

      fireEvent.change(screen.getByLabelText("Position"), { target: { value: "4" } });
      fireEvent.click(screen.getByRole("button", { name: "Place hypothesis" }));

      await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
      expect(parsedPutBody(fetchMock)).toEqual({ revision: 1, position: 4 });
    });
  },
);

describe(
  "PlaceExistingHypothesisControl — the position a confirmed placement carries (criterion 8; " +
    "rules/knowledge/a-first-placements-position-is-the-one-the-curator-declares)",
  () => {
    it("sends exactly the position the curator typed, even where that number matches neither this version's current entry count nor one past it", async () => {
      const fetchMock = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(THREE_ENTRY_MANIFEST),
        [`GET ${hypothesisRevisionsPath("H1")}`]: () => jsonResponse(hypothesisRevisionsResponse([2])),
        [`GET ${hypothesisRevisionsPath("H2")}`]: () => jsonResponse(hypothesisRevisionsResponse([5])),
        [`GET ${hypothesisRevisionsPath("H3")}`]: () => jsonResponse(hypothesisRevisionsResponse([9])),
        [`GET ${CASE_HYPOTHESES_PATH}`]: () =>
          jsonResponse(caseHypothesesResponse(["H1", "H2", "H3", "H4"])),
        [`GET ${hypothesisRevisionsPath("H4")}`]: () => jsonResponse(hypothesisRevisionsResponse([1])),
        [`PUT ${manifestPath("H4")}`]: () => noContentResponse(),
      });
      await mountManifestScreen(fetchMock);
      await screen.findByLabelText("H1");

      await openHypothesisPicker("H4");
      await waitFor(() => expect(screen.getByLabelText("Revision").textContent).toBe("1"));
      fireEvent.change(screen.getByLabelText("Position"), { target: { value: "37" } });
      fireEvent.click(screen.getByRole("button", { name: "Place hypothesis" }));

      await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
      expect(parsedPutBody(fetchMock)).toEqual({ revision: 1, position: 37 });
    });
  },
);

describe(
  "PlaceExistingHypothesisControl — the manifest table after a settled placement (criterion 9)",
  () => {
    it("shows the placed hypothesis as a row of the manifest table once the placement settles, with the curator never reloading the screen", async () => {
      const AFTER = { manifest: [...TWO_ENTRY_MANIFEST.manifest, entry(3, "H3", 9)] };
      const fetchMock = createFetchStub({
        [`GET ${VERSION_PATH}`]: sequentialGetHandler([TWO_ENTRY_MANIFEST, AFTER]),
        [`GET ${hypothesisRevisionsPath("H1")}`]: () => jsonResponse(hypothesisRevisionsResponse([2])),
        [`GET ${hypothesisRevisionsPath("H2")}`]: () => jsonResponse(hypothesisRevisionsResponse([5])),
        [`GET ${hypothesisRevisionsPath("H3")}`]: () => jsonResponse(hypothesisRevisionsResponse([9])),
        [`GET ${CASE_HYPOTHESES_PATH}`]: () =>
          jsonResponse(caseHypothesesResponse(["H1", "H2", "H3"])),
        [`PUT ${manifestPath("H3")}`]: () => noContentResponse(),
      });
      await mountManifestScreen(fetchMock);
      await screen.findByLabelText("H1");
      expect(screen.queryByLabelText("H3")).toBeNull();

      await openHypothesisPicker("H3");
      await waitFor(() => expect(screen.getByLabelText("Revision").textContent).toBe("9"));
      fireEvent.change(screen.getByLabelText("Position"), { target: { value: "3" } });
      fireEvent.click(screen.getByRole("button", { name: "Place hypothesis" }));

      await screen.findByLabelText("H3");
    });
  },
);

describe(
  "PlaceExistingHypothesisControl — the telemetry a settled placement emits (criterion 10)",
  () => {
    it("emits the manifest placement telemetry event naming this case's slug, this version, the placed hypothesis's own name and the position it was placed at", async () => {
      const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
      const AFTER = { manifest: [...TWO_ENTRY_MANIFEST.manifest, entry(3, "H3", 9)] };
      const fetchMock = createFetchStub({
        [`GET ${VERSION_PATH}`]: sequentialGetHandler([TWO_ENTRY_MANIFEST, AFTER]),
        [`GET ${hypothesisRevisionsPath("H1")}`]: () => jsonResponse(hypothesisRevisionsResponse([2])),
        [`GET ${hypothesisRevisionsPath("H2")}`]: () => jsonResponse(hypothesisRevisionsResponse([5])),
        [`GET ${hypothesisRevisionsPath("H3")}`]: () => jsonResponse(hypothesisRevisionsResponse([9])),
        [`GET ${CASE_HYPOTHESES_PATH}`]: () =>
          jsonResponse(caseHypothesesResponse(["H1", "H2", "H3"])),
        [`PUT ${manifestPath("H3")}`]: () => noContentResponse(),
      });
      await mountManifestScreen(fetchMock);
      await screen.findByLabelText("H1");

      await openHypothesisPicker("H3");
      await waitFor(() => expect(screen.getByLabelText("Revision").textContent).toBe("9"));
      fireEvent.change(screen.getByLabelText("Position"), { target: { value: "3" } });
      fireEvent.click(screen.getByRole("button", { name: "Place hypothesis" }));

      await waitFor(() =>
        expect(infoSpy).toHaveBeenCalledWith("telemetry:manifest.hypothesis_placed", {
          slug: SLUG,
          version: VERSION,
          hypothesis_name: "H3",
          position: 3,
          moved: false,
        }),
      );
      infoSpy.mockRestore();
    });
  },
);
