import { describe, expect, it } from "vitest";
import { rootRouteId } from "@tanstack/react-router";
import { router } from "./route-tree";
import {
  CaseHypothesesPlaceholder,
  GlossaryPlaceholder,
  CapabilitiesPlaceholder,
  ManifestHypothesisPlaceholder,
  VersionDiscardPlaceholder,
  VersionManifestPlaceholder,
  VersionReleasePlaceholder,
} from "./route-placeholders";

/**
 * This suite runs under Vitest's "node" environment: there is no DOM, so
 * nothing here renders a route -- it inspects the router's own registered
 * route structure instead. `router.routesById` is populated synchronously
 * inside createRouter()'s constructor (it processes the route tree before
 * any history, store or render exists), so reading it needs no navigation
 * and no jsdom.
 *
 * The expected paths and the path -> placeholder mapping below are written
 * independently of route-tree.tsx rather than derived from it -- an
 * expectation copied from the file under test would hold no matter what
 * that file declared.
 *
 * "/cases/$slug/versions/new" is the eleventh route, added by
 * task/version-editor/new-draft-creation: it is not one of the original ten
 * proposal screens (2.1-2.10) route-tree.tsx first registered, but is
 * architecturally required so the create flow and the edit flow mount as
 * genuinely distinct component instances, per that task's own disclosed
 * Notes.
 */

const EXPECTED_PATHS = [
  "/cases",
  "/cases/$slug",
  "/cases/$slug/hypotheses",
  "/cases/$slug/versions/new",
  "/cases/$slug/versions/$version",
  "/cases/$slug/versions/$version/manifest",
  "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName",
  "/cases/$slug/versions/$version/release",
  "/cases/$slug/versions/$version/discard",
  "/glossary",
  "/capabilities",
];

// /cases, /cases/$slug, /cases/$slug/versions/new and
// /cases/$slug/versions/$version are excluded from this map: all four now
// render real screens (CasesListScreen, CaseDetailScreen,
// NewCaseDraftScreen, CaseVersionEditorScreen), not a placeholder. Which
// component each of those four renders is that task's own criterion and its
// own proof's to test; this suite only answers for the six routes that
// still render a placeholder.
const EXPECTED_COMPONENT_BY_PATH: Record<string, unknown> = {
  "/cases/$slug/hypotheses": CaseHypothesesPlaceholder,
  "/cases/$slug/versions/$version/manifest": VersionManifestPlaceholder,
  "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName": ManifestHypothesisPlaceholder,
  "/cases/$slug/versions/$version/release": VersionReleasePlaceholder,
  "/cases/$slug/versions/$version/discard": VersionDiscardPlaceholder,
  "/glossary": GlossaryPlaceholder,
  "/capabilities": CapabilitiesPlaceholder,
};

function leafRoutes() {
  return Object.values(router.routesById).filter((route) => route.id !== rootRouteId);
}

describe("route-tree", () => {
  it("registers a route at each of the eleven proposal-plus-origination screens' paths, and no other", () => {
    const actualPaths = leafRoutes().map((route) => route.fullPath);

    expect([...actualPaths].sort()).toEqual([...EXPECTED_PATHS].sort());
  });

  it("assigns no two of the eleven routes the same path", () => {
    const actualPaths = leafRoutes().map((route) => route.fullPath);

    expect(new Set(actualPaths).size).toBe(actualPaths.length);
  });

  it("renders each still-placeholder route through exactly its own placeholder, and no route through another's", () => {
    const actualComponentByPath = Object.fromEntries(
      leafRoutes()
        .filter((route) => route.fullPath in EXPECTED_COMPONENT_BY_PATH)
        .map((route) => [route.fullPath, route.options.component]),
    );

    expect(actualComponentByPath).toEqual(EXPECTED_COMPONENT_BY_PATH);
  });
});
