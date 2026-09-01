import { describe, expect, it } from "vitest";
import { rootRouteId } from "@tanstack/react-router";
import { router } from "./route-tree";
import { CapabilitiesBrowserScreen } from "./capabilities-browser-screen";
import { CapabilityCreateScreen } from "./capability-create-screen";
import { CapabilityDetailScreen } from "./capability-detail-screen";
import { CaseSimulationScreen } from "./case-simulation-screen";
import { ConnectorConfigurationsScreen } from "./connector-configurations-screen";
import { ConnectorConfigurationCreateScreen } from "./connector-configuration-create-screen";
import { GlossaryBrowserScreen } from "./glossary-browser-screen";
import { NewHypothesisScreen } from "./new-hypothesis-screen";
import { ReviseHypothesisScreen } from "./revise-hypothesis-screen";
import {
  CaseHypothesesPlaceholder,
  VersionDiscardPlaceholder,
  VersionReleasePlaceholder,
} from "./route-placeholders";

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
  "/capabilities/$name/$version",
  "/capabilities/new",
  "/connectors",
  "/connectors/$connector",
  "/connectors/new",
  "/cases/$slug/versions/$version/simulate",
];

const EXPECTED_COMPONENT_BY_PATH: Record<string, unknown> = {
  "/cases/$slug/hypotheses": CaseHypothesesPlaceholder,
  "/cases/$slug/versions/$version/release": VersionReleasePlaceholder,
  "/cases/$slug/versions/$version/discard": VersionDiscardPlaceholder,
};

function leafRoutes() {
  return Object.values(router.routesById).filter((route) => route.id !== rootRouteId);
}

describe("route-tree", () => {
  it("registers a route at each of the eighteen proposal-plus-origination screens' paths, and no other", () => {
    const actualPaths = leafRoutes().map((route) => route.fullPath);

    expect([...actualPaths].sort()).toEqual([...EXPECTED_PATHS].sort());
  });

  it("assigns no two of the eighteen routes the same path", () => {
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

  it("renders the /connectors/new route through ConnectorConfigurationCreateScreen (task/connector-capability-create-detail-route/connector-configuration-create-route, criterion 1), distinct from the /connectors/$connector route's own component", () => {
    const routes = leafRoutes();
    const createRoute = routes.find((route) => route.fullPath === "/connectors/new");
    const detailRoute = routes.find((route) => route.fullPath === "/connectors/$connector");

    expect(createRoute?.options.component).toBe(ConnectorConfigurationCreateScreen);
    expect(createRoute?.options.component).not.toBe(detailRoute?.options.component);
  });

  it("renders the /capabilities/new route through CapabilityCreateScreen (task/connector-capability-create-detail-route/capability-create-route, criterion 1), distinct from the /capabilities/$name/$version route's own component", () => {
    const routes = leafRoutes();
    const createRoute = routes.find((route) => route.fullPath === "/capabilities/new");
    const detailRoute = routes.find((route) => route.fullPath === "/capabilities/$name/$version");

    expect(createRoute?.options.component).toBe(CapabilityCreateScreen);
    expect(createRoute?.options.component).not.toBe(detailRoute?.options.component);
  });

  it("renders the /capabilities/$name/$version route through CapabilityDetailScreen -- the capability detail/edit screen a capability's own (name, version) identity is addressed by", () => {
    const detailRoute = leafRoutes().find(
      (route) => route.fullPath === "/capabilities/$name/$version",
    );

    expect(detailRoute?.options.component).toBe(CapabilityDetailScreen);
  });

  it("renders the /cases/$slug/versions/$version/simulate route through CaseSimulationScreen (task/simulation-cockpit/case-simulation-route, criterion 1)", () => {
    const simulateRoute = leafRoutes().find(
      (route) => route.fullPath === "/cases/$slug/versions/$version/simulate",
    );

    expect(simulateRoute?.options.component).toBe(CaseSimulationScreen);
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
