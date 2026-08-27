import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "../shared/components/app-shell";
import { CapabilitiesBrowserScreen } from "./capabilities-browser-screen";
import { ConnectorConfigurationsScreen } from "./connector-configurations-screen";
import { ConnectorConfigurationDetailScreen } from "./connector-configuration-detail-screen";
import { CapabilityDetailScreen } from "./capability-detail-screen";
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

/**
 * Code-based route tree for the ten proposal screens (2.1 through 2.10).
 * Flat by this task's own instruction: every leaf is a direct child of the
 * root route, addressed by its full path in one segment string, rather than
 * built through a chain of intermediate parent routes -- the nesting a real
 * case/version/manifest layout will need is left to the wave that builds it.
 *
 * The root route's own `component` is AppShell (frontend-console-foundation/
 * app-shell): it renders the sidebar, the topbar and an Outlet, so every one
 * of the ten placeholders below renders inside it -- none of them composes
 * its own layout.
 */
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

// task/cases-list-and-detail/case-attributes-at-a-glance's own "New draft
// from vX" action (criterion 4, released-current-version branch): the
// source version number the curator originated the new draft from,
// addressed through this route's own search state rather than a path
// segment, since new-draft-creation's own blank-form entry point
// (Case Detail's plain "New draft" action, no source version) still
// addresses this exact same route with none. Optional so every existing
// caller naming no search at all keeps resolving to the same route with the
// same blank form -- this task's own Notes: "the criterion here is
// navigation only ... independently demonstrable" of whichever task, if
// any, ever reads this field back out (task/version-editor/seed-new-draft-
// from-latest-released, a sibling task this one does not depend on).
const newCaseVersionSearchSchema = z.object({
  sourceVersion: z.coerce.number().int().positive().optional(),
});

// task/version-editor/new-draft-creation's own blank-form entry point,
// addressed from Case Detail's "New draft" action. A static "new" segment
// ranks over the "$version" param segment above regardless of declaration
// order (TanStack Router sorts a route tree by specificity, not by
// registration order), so this never collides with a real version number.
const newCaseVersionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$slug/versions/new",
  validateSearch: newCaseVersionSearchSchema,
  component: NewCaseDraftScreen,
});

// task/manifest-hypothesis-authoring/manifest-builder's own screen: reorders
// and prunes a draft's manifest, replacing VersionManifestPlaceholder.
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

// task/manifest-hypothesis-authoring/revise-hypothesis-form's own criterion
// 1: a distinct route for the blank "New hypothesis" entry point, so a
// hypothesis literally named "new" is addressed by manifestHypothesisRoute
// above rather than being captured here. A static "new" segment ranks over
// the "$hypothesisName" param segment above regardless of declaration order
// (TanStack Router sorts a route tree by specificity, not by registration
// order), the same convention newCaseVersionRoute already establishes for
// "/cases/$slug/versions/new" beside "/cases/$slug/versions/$version".
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

// task/simulation-cockpit/case-simulation-route's own screen: the curator's
// own entry to the same engine a diagnosis runs (contracts/investigation/
// case-simulation), open on a case version in either draft or released
// state. No dynamic sibling exists directly under "/cases/$slug/versions/
// $version" that a literal "simulate" segment could collide with (every
// other child there -- manifest, release, discard -- is likewise a static
// segment), so this needs no specificity note the way "new" and
// "hypotheses/new" do above.
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

// task/connector-capability-detail-editing/capability-detail-route's own
// screen: shows and edits one capability in place of the popup dialog's
// edit path (the popup's own "New capability" creation path is untouched,
// still hosted on capabilitiesRoute above).
const capabilityDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/capabilities/$name/$version",
  component: CapabilityDetailScreen,
});

// task/connector-configuration-authoring/connector-configuration-create-edit-form's
// own screen: lists every registered connector configuration and hosts its
// create/edit form dialog.
const connectorConfigurationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/connectors",
  component: ConnectorConfigurationsScreen,
});

// task/connector-capability-detail-editing/connector-configuration-detail-route's
// own screen: shows and edits one connector configuration in place of the
// popup dialog's edit path (the popup's own "New connector configuration"
// creation path is untouched, still hosted on connectorConfigurationsRoute
// above).
const connectorConfigurationDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/connectors/$connector",
  component: ConnectorConfigurationDetailScreen,
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
  connectorConfigurationsRoute,
  connectorConfigurationDetailRoute,
  caseHypothesesRoute,
]);

export const router = createRouter({ routeTree });

// Registers this app's router type so a hook consuming it elsewhere (Link,
// useParams, useNavigate) is typed against these ten routes rather than the
// library's untyped default -- the standard setup TanStack Router's own
// quick-start documents, not a fact this task is stating on its own.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
