import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "../shared/components/app-shell";
import { CapabilitiesBrowserScreen } from "./capabilities-browser-screen";
import { ConnectorConfigurationsScreen } from "./connector-configurations-screen";
import { ConnectorConfigurationDetailScreen } from "./connector-configuration-detail-screen";
import { ConnectorConfigurationCreateScreen } from "./connector-configuration-create-screen";
import { CapabilityDetailScreen } from "./capability-detail-screen";
import { CapabilityCreateScreen } from "./capability-create-screen";
import { CaseDetailScreen } from "./case-detail-screen";
import { CasesListScreen } from "./cases-list-screen";
import { CaseSimulationScreen } from "./case-simulation-screen";
import { CaseVersionEditorScreen } from "./case-version-editor-screen";
import { GlossaryBrowserScreen } from "./glossary-browser-screen";
import { NewCaseDraftScreen } from "./new-case-draft-screen";
import { NewHypothesisScreen } from "./new-hypothesis-screen";
import { ReviseHypothesisScreen } from "./revise-hypothesis-screen";
import { VersionManifestScreen } from "./version-manifest-screen";
import {
  CaseHypothesesPlaceholder,
  VersionDiscardPlaceholder,
  VersionReleasePlaceholder,
} from "./route-placeholders";

const rootRoute = createRootRoute({ component: AppShell });

const casesListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases",
  component: CasesListScreen,
});

const caseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$slug",
  component: CaseDetailScreen,
});

const caseVersionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$slug/versions/$version",
  component: CaseVersionEditorScreen,
});

const newCaseVersionSearchSchema = z.object({
  sourceVersion: z.coerce.number().int().positive().optional(),
});

const newCaseVersionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$slug/versions/new",
  validateSearch: newCaseVersionSearchSchema,
  component: NewCaseDraftScreen,
});

const versionManifestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$slug/versions/$version/manifest",
  component: VersionManifestScreen,
});

const manifestHypothesisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName",
  component: ReviseHypothesisScreen,
});

const newManifestHypothesisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$slug/versions/$version/manifest/hypotheses/new",
  component: NewHypothesisScreen,
});

const versionReleaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$slug/versions/$version/release",
  component: VersionReleasePlaceholder,
});

const versionDiscardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$slug/versions/$version/discard",
  component: VersionDiscardPlaceholder,
});

const caseSimulationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$slug/versions/$version/simulate",
  component: CaseSimulationScreen,
});

const glossaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/glossary",
  component: GlossaryBrowserScreen,
});

const capabilitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/capabilities",
  component: CapabilitiesBrowserScreen,
});

const capabilityDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/capabilities/$name/$version",
  component: CapabilityDetailScreen,
});

const capabilityCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/capabilities/new",
  component: CapabilityCreateScreen,
});

const connectorConfigurationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/connectors",
  component: ConnectorConfigurationsScreen,
});

const connectorConfigurationDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/connectors/$connector",
  component: ConnectorConfigurationDetailScreen,
});

const connectorConfigurationCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/connectors/new",
  component: ConnectorConfigurationCreateScreen,
});

const caseHypothesesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$slug/hypotheses",
  component: CaseHypothesesPlaceholder,
});

const routeTree = rootRoute.addChildren([
  casesListRoute,
  caseDetailRoute,
  caseVersionRoute,
  newCaseVersionRoute,
  versionManifestRoute,
  manifestHypothesisRoute,
  newManifestHypothesisRoute,
  versionReleaseRoute,
  versionDiscardRoute,
  caseSimulationRoute,
  glossaryRoute,
  capabilitiesRoute,
  capabilityDetailRoute,
  capabilityCreateRoute,
  connectorConfigurationsRoute,
  connectorConfigurationDetailRoute,
  connectorConfigurationCreateRoute,
  caseHypothesesRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
