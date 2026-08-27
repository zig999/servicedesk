import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { AppShell } from "./app-shell";

// AppShell reads the currently matched route through @tanstack/react-router's
// own useMatches() and renders sidebar Links via the router's own Link, so it
// cannot render outside a real router context. Rather than reuse the
// production ten-route router (route-tree.tsx), this builds a small,
// self-contained test router -- AppShell as the root route's own component,
// four leaf routes at the same four paths Sidebar's own links point to --
// so each test controls exactly which route is "current" via
// createMemoryHistory's initialEntries, without depending on the production
// route tree's shape or on browser history.
//
// A fourth leaf route, "/connectors", was added by task/connector-configuration-
// authoring/connector-configuration-create-edit-form's own criterion 1 ("a new
// route reachable from the app's navigation"): SIDEBAR_ENTRIES now names a
// fourth destination (app-shell.tsx's own header comment), so this file's own
// test router has to register that path too -- Sidebar's own Link to
// "/connectors" needs a real registered route to resolve against, the same
// requirement the pre-existing three routes below already satisfy for Cases,
// Glossary and Capabilities.

function ScreenA() {
  return createElement("div", null, "Screen A content");
}

function ScreenB() {
  return createElement("div", null, "Screen B content");
}

function buildTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: AppShell });
  const casesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases",
    component: ScreenA,
  });
  const glossaryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/glossary",
    component: ScreenB,
  });
  const capabilitiesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities",
    component: ScreenB,
  });
  const connectorsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors",
    component: ScreenB,
  });
  const routeTree = rootRoute.addChildren([
    casesRoute,
    glossaryRoute,
    capabilitiesRoute,
    connectorsRoute,
  ]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

// A second test router, built independently of buildTestRouter above so it does
// not disturb SIDEBAR_ENTRIES's own four-item assertion (the new route
// task/simulation-cockpit/case-simulation-route registers is not a sidebar
// destination, so it is added as a fifth leaf here rather than folded into
// buildTestRouter's own four). It keeps the same four sidebar-destination
// leaves buildTestRouter registers -- AppShell always renders Sidebar's own
// four Links regardless of which route is current, so they need a real
// destination to resolve an href against here too. It exists to check
// ROUTE_LABELS's own new entry for "/cases/$slug/versions/$version/simulate"
// -- a param route, so its own raw pathname (what a match falls back to when
// no label is found) is the *resolved* path with real params substituted in,
// never the literal pattern string.
function buildSimulateTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: AppShell });
  const casesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases",
    component: ScreenA,
  });
  const glossaryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/glossary",
    component: ScreenB,
  });
  const capabilitiesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities",
    component: ScreenB,
  });
  const connectorsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors",
    component: ScreenB,
  });
  const simulateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/simulate",
    component: () => createElement("div", null, "Simulation Cockpit content"),
  });
  const routeTree = rootRoute.addChildren([
    casesRoute,
    glossaryRoute,
    capabilitiesRoute,
    connectorsRoute,
    simulateRoute,
  ]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

describe("AppShell -- ROUTE_LABELS' own new entry for the Simulation Cockpit route (task/simulation-cockpit/case-simulation-route, criterion 2)", () => {
  it("shows the breadcrumb as 'Simulate' rather than falling back to the route's own resolved pathname", async () => {
    const router = buildSimulateTestRouter("/cases/some-slug/versions/7/simulate");
    await router.load();
    render(createElement(RouterProvider, { router }));

    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });
    expect(within(breadcrumb).getByText("Simulate")).toBeTruthy();
    expect(
      within(breadcrumb).queryByText("/cases/some-slug/versions/7/simulate"),
    ).toBeNull();
  });
});

describe("AppShell", () => {
  it("lists exactly the four sidebar entries Cases, Glossary, Capabilities and Connectors, with no Hypotheses entry", async () => {
    const router = buildTestRouter("/cases");
    await router.load();
    render(createElement(RouterProvider, { router }));

    const nav = screen.getByRole("navigation", { name: "Primary" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Cases",
      "Glossary",
      "Capabilities",
      "Connectors",
    ]);
    expect(within(nav).queryByText(/hypothes/i)).toBeNull();
  });

  it("links each sidebar entry to its own real route", async () => {
    const router = buildTestRouter("/cases");
    await router.load();
    render(createElement(RouterProvider, { router }));

    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getByRole("link", { name: "Cases" }).getAttribute("href")).toBe(
      "/cases",
    );
    expect(within(nav).getByRole("link", { name: "Glossary" }).getAttribute("href")).toBe(
      "/glossary",
    );
    expect(
      within(nav).getByRole("link", { name: "Capabilities" }).getAttribute("href"),
    ).toBe("/capabilities");
  });

  // task/connector-configuration-authoring/connector-configuration-create-edit-form's own
  // criterion 1: the new "/connectors" route is reachable from the app's navigation.
  it("lists a Connectors entry linking to /connectors", async () => {
    const router = buildTestRouter("/cases");
    await router.load();
    render(createElement(RouterProvider, { router }));

    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(
      within(nav).getByRole("link", { name: "Connectors" }).getAttribute("href"),
    ).toBe("/connectors");
  });

  it("renders the breadcrumb through TUI's Breadcrumb primitive, reflecting the currently matched route", async () => {
    const router = buildTestRouter("/cases");
    await router.load();
    render(createElement(RouterProvider, { router }));

    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });
    expect(within(breadcrumb).getByText("Cases List")).toBeTruthy();
  });

  it("updates the breadcrumb when a different route is current, rather than a fixed string", async () => {
    const router = buildTestRouter("/glossary");
    await router.load();
    render(createElement(RouterProvider, { router }));

    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });
    expect(within(breadcrumb).getByText("Glossary Browser")).toBeTruthy();
    expect(within(breadcrumb).queryByText("Cases List")).toBeNull();
  });

  it("shows the fixed no-auth indicator regardless of which route is current", async () => {
    const casesRouter = buildTestRouter("/cases");
    await casesRouter.load();
    const { unmount } = render(createElement(RouterProvider, { router: casesRouter }));
    expect(screen.getByText("No auth in this build")).toBeTruthy();
    unmount();

    const capabilitiesRouter = buildTestRouter("/capabilities");
    await capabilitiesRouter.load();
    render(createElement(RouterProvider, { router: capabilitiesRouter }));
    expect(screen.getByText("No auth in this build")).toBeTruthy();
  });

  it("wraps the matched route's own content with the sidebar and topbar rather than replacing them", async () => {
    const router = buildTestRouter("/cases");
    await router.load();
    render(createElement(RouterProvider, { router }));

    expect(screen.getByText("Screen A content")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeTruthy();
  });
});
