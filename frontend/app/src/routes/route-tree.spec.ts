import { describe, expect, it } from "vitest";
import { rootRouteId } from "@tanstack/react-router";
import { router } from "./route-tree";
import { NewHypothesisScreen } from "./new-hypothesis-screen";
import { ReviseHypothesisScreen } from "./revise-hypothesis-screen";
import {
  CaseHypothesesPlaceholder,
  GlossaryPlaceholder,
  CapabilitiesPlaceholder,
  VersionDiscardPlaceholder,
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
 *
 * "/cases/$slug/versions/$version/manifest/hypotheses/new" is the twelfth
 * route, added by task/manifest-hypothesis-authoring/revise-hypothesis-form's
 * own criterion 1: a distinct static route for the blank New-hypothesis
 * entry point, ranking over the pre-existing "$hypothesisName" param route
 * the same way "/cases/$slug/versions/new" already ranks over
 * "/cases/$slug/versions/$version". That pre-existing param route's own
 * component also changed with this task, from ManifestHypothesisPlaceholder
 * to ReviseHypothesisScreen -- both routes are excluded from
 * EXPECTED_COMPONENT_BY_PATH below for the same reason the four earlier
 * real-screen routes already are, and are instead checked by their own
 * dedicated test beneath it.
 */

const EXPECTED_PATHS = [
  "/cases",
  "/cases/$slug",
  "/cases/$slug/hypotheses",
  "/cases/$slug/versions/new",
  "/cases/$slug/versions/$version",
  "/cases/$slug/versions/$version/manifest",
  "/cases/$slug/versions/$version/manifest/hypotheses/new",
  "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName",
  "/cases/$slug/versions/$version/release",
  "/cases/$slug/versions/$version/discard",
  "/glossary",
  "/capabilities",
];

// /cases, /cases/$slug, /cases/$slug/versions/new, /cases/$slug/versions/$version, this task's
// own two hypothesis routes, and task/manifest-hypothesis-authoring/manifest-builder's own
// "/cases/$slug/versions/$version/manifest" are excluded from this map: all seven now render real
// screens (CasesListScreen, CaseDetailScreen, NewCaseDraftScreen, CaseVersionEditorScreen,
// NewHypothesisScreen, ReviseHypothesisScreen, VersionManifestScreen), not a placeholder. Which
// component each of those seven renders is that task's own criterion and its own proof's to test;
// this suite only answers for the five routes that still render a placeholder.
const EXPECTED_COMPONENT_BY_PATH: Record<string, unknown> = {
  "/cases/$slug/hypotheses": CaseHypothesesPlaceholder,
  "/cases/$slug/versions/$version/release": VersionReleasePlaceholder,
  "/cases/$slug/versions/$version/discard": VersionDiscardPlaceholder,
  "/glossary": GlossaryPlaceholder,
  "/capabilities": CapabilitiesPlaceholder,
};

function leafRoutes() {
  return Object.values(router.routesById).filter((route) => route.id !== rootRouteId);
}

describe("route-tree", () => {
  it("registers a route at each of the twelve proposal-plus-origination screens' paths, and no other", () => {
    const actualPaths = leafRoutes().map((route) => route.fullPath);

    expect([...actualPaths].sort()).toEqual([...EXPECTED_PATHS].sort());
  });

  it("assigns no two of the twelve routes the same path", () => {
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

  it("renders the New-hypothesis route and the Revise route through two distinct screens (criterion 1)", () => {
    const routes = leafRoutes();
    const newHypothesisRoute = routes.find(
      (route) => route.fullPath === "/cases/$slug/versions/$version/manifest/hypotheses/new",
    );
    const reviseHypothesisRoute = routes.find(
      (route) =>
        route.fullPath === "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName",
    );

    expect(newHypothesisRoute?.options.component).toBe(NewHypothesisScreen);
    expect(reviseHypothesisRoute?.options.component).toBe(ReviseHypothesisScreen);
    expect(newHypothesisRoute?.options.component).not.toBe(
      reviseHypothesisRoute?.options.component,
    );
  });
});
