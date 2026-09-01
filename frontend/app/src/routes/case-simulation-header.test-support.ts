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
