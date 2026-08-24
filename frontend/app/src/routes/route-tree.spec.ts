import { describe, expect, it } from "vitest";
import { rootRouteId } from "@tanstack/react-router";
import { router } from "./route-tree";
import { CapabilitiesBrowserScreen } from "./capabilities-browser-screen";
import { ConnectorConfigurationsScreen } from "./connector-configurations-screen";
import { GlossaryBrowserScreen } from "./glossary-browser-screen";
import { NewHypothesisScreen } from "./new-hypothesis-screen";
import { ReviseHypothesisScreen } from "./revise-hypothesis-screen";
import {
  CaseHypothesesPlaceholder,
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
 *
 * "/connectors" is the thirteenth route, added by
 * task/connector-configuration-authoring/connector-configuration-create-edit-form's
 * own criterion 1: a new route listing every registered connector
 * configuration, rendering ConnectorConfigurationsScreen. Excluded from
 * EXPECTED_COMPONENT_BY_PATH below for the same reason "/capabilities" and
 * "/glossary" already are -- it renders a real screen, not a placeholder --
 * and checked by its own dedicated test beneath the capabilities/glossary
 * ones instead.
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
  "/connectors",
];

// /cases, /cases/$slug, /cases/$slug/versions/new, /cases/$slug/versions/$version, this task's
// own two hypothesis routes, task/manifest-hypothesis-authoring/manifest-builder's own
// "/cases/$slug/versions/$version/manifest", task/glossary-and-capabilities-browser/
// capabilities-browser-screen's own "/capabilities" and task/glossary-and-capabilities-browser/
// glossary-browser-screen's own "/glossary" are excluded from this map: all nine now render
// real screens (CasesListScreen, CaseDetailScreen, NewCaseDraftScreen, CaseVersionEditorScreen,
// NewHypothesisScreen, ReviseHypothesisScreen, VersionManifestScreen, CapabilitiesBrowserScreen,
// GlossaryBrowserScreen), not a placeholder. Which component each of those nine renders is that
// task's own criterion and its own proof's to test; this suite only answers for the three
// routes that still render a placeholder.
const EXPECTED_COMPONENT_BY_PATH: Record<string, unknown> = {
  "/cases/$slug/hypotheses": CaseHypothesesPlaceholder,
  "/cases/$slug/versions/$version/release": VersionReleasePlaceholder,
  "/cases/$slug/versions/$version/discard": VersionDiscardPlaceholder,
};

function leafRoutes() {
  return Object.values(router.routesById).filter((route) => route.id !== rootRouteId);
}

describe("route-tree", () => {
  it("registers a route at each of the thirteen proposal-plus-origination screens' paths, and no other", () => {
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

  it("renders the /capabilities route through CapabilitiesBrowserScreen (task/glossary-and-capabilities-browser/capabilities-browser-screen)", () => {
    const capabilitiesRoute = leafRoutes().find((route) => route.fullPath === "/capabilities");

    expect(capabilitiesRoute?.options.component).toBe(CapabilitiesBrowserScreen);
  });

  it("renders the /glossary route through GlossaryBrowserScreen (task/glossary-and-capabilities-browser/glossary-browser-screen)", () => {
    const glossaryRoute = leafRoutes().find((route) => route.fullPath === "/glossary");

    expect(glossaryRoute?.options.component).toBe(GlossaryBrowserScreen);
  });

  it("renders the /connectors route through ConnectorConfigurationsScreen (task/connector-configuration-authoring/connector-configuration-create-edit-form, criterion 1)", () => {
    const connectorsRoute = leafRoutes().find((route) => route.fullPath === "/connectors");

    expect(connectorsRoute?.options.component).toBe(ConnectorConfigurationsScreen);
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

/**
 * task/cases-list-and-detail/case-attributes-at-a-glance's own inference: "New draft from vX"
 * addresses the New Draft flow by adding an optional "sourceVersion" search field to this
 * pre-existing route, rather than a new route or a required parameter. Read directly off the
 * registered route's own `validateSearch` (a zod schema assigned as-is, exposing `.parse()`)
 * rather than re-declaring an expectation independent of it -- the schema itself is this
 * task's own new artifact, unlike EXPECTED_PATHS/EXPECTED_COMPONENT_BY_PATH above, which check
 * route-tree.tsx against an independently-authored expectation.
 */
type ParsableSearchSchema = { parse: (input: unknown) => unknown };

function newDraftSearchSchema(): ParsableSearchSchema {
  const route = leafRoutes().find((route) => route.fullPath === "/cases/$slug/versions/new");
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- validateSearch's own declared type is a broad function/validator union TanStack Router accepts; this narrows it to the one shape (a zod-like object exposing .parse()) route-tree.tsx actually assigns, which every .parse() call below then exercises for real -- never trusted unchecked.
  const schema = route?.options.validateSearch as ParsableSearchSchema | undefined;
  if (!schema) {
    throw new Error("no validateSearch is registered on /cases/$slug/versions/new");
  }
  return schema;
}

describe("the New Draft route's own 'sourceVersion' search field (task/cases-list-and-detail/case-attributes-at-a-glance)", () => {
  it("parses an absent sourceVersion as {}, so the pre-existing blank 'New draft' entry point keeps resolving unaffected", () => {
    expect(newDraftSearchSchema().parse({})).toEqual({});
  });

  it("coerces a numeric-string sourceVersion query value into a number, so 'New draft from vX' can address the flow by that version's own number", () => {
    expect(newDraftSearchSchema().parse({ sourceVersion: "3" })).toEqual({ sourceVersion: 3 });
  });

  it("accepts the smallest valid sourceVersion, 1", () => {
    expect(newDraftSearchSchema().parse({ sourceVersion: "1" })).toEqual({ sourceVersion: 1 });
  });

  it("refuses a sourceVersion of zero or below", () => {
    expect(() => newDraftSearchSchema().parse({ sourceVersion: "0" })).toThrow();
    expect(() => newDraftSearchSchema().parse({ sourceVersion: "-1" })).toThrow();
  });
});
