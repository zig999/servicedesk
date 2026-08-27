import { createElement } from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { CaseSimulationHeader, type CaseSimulationHeaderProps } from "./case-simulation-header";

/**
 * Shared mounting helper for case-simulation-header.spec.ts. CaseSimulationHeader
 * renders "Edit version" and "Manifest" as @tanstack/react-router Links, so it
 * needs a real router context to resolve an href against -- mirrors
 * case-attributes-tab.test-support.ts's own established shape for a component
 * mounted directly (root route renders the component itself, taking every prop
 * from the caller rather than a route param), with destination leaves
 * registered only so those Links have somewhere real to resolve.
 */
export async function mountCaseSimulationHeader(props: CaseSimulationHeaderProps): Promise<void> {
  const rootRoute = createRootRoute({
    component: () => createElement(CaseSimulationHeader, props),
  });
  const versionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version",
    component: () => null,
  });
  const newVersionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/new",
    component: () => null,
  });
  const manifestRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest",
    component: () => null,
  });
  const routeTree = rootRoute.addChildren([versionRoute, newVersionRoute, manifestRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  render(createElement(RouterProvider, { router }));
}
