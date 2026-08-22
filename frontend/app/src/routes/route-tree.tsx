import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { AppShell } from "../shared/components/app-shell";
import { CaseDetailScreen } from "./case-detail-screen";
import { CasesListScreen } from "./cases-list-screen";
import { CaseVersionEditorScreen } from "./case-version-editor-screen";
import { NewCaseDraftScreen } from "./new-case-draft-screen";
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

// task/version-editor/new-draft-creation's own blank-form entry point,
// addressed from Case Detail's "New draft" action. A static "new" segment
// ranks over the "$version" param segment above regardless of declaration
// order (TanStack Router sorts a route tree by specificity, not by
// registration order), so this never collides with a real version number.
const newCaseVersionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$slug/versions/new",
  component: NewCaseDraftScreen,
});

const versionManifestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$slug/versions/$version/manifest",
  component: VersionManifestPlaceholder,
});

const manifestHypothesisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName",
  component: ManifestHypothesisPlaceholder,
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

const glossaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/glossary",
  component: GlossaryPlaceholder,
});

const capabilitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/capabilities",
  component: CapabilitiesPlaceholder,
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
  versionReleaseRoute,
  versionDiscardRoute,
  glossaryRoute,
  capabilitiesRoute,
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
