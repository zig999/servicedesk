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
// three leaf routes at the same three paths Sidebar's own links point to --
// so each test controls exactly which route is "current" via
// createMemoryHistory's initialEntries, without depending on the production
// route tree's shape or on browser history.

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
  const routeTree = rootRoute.addChildren([casesRoute, glossaryRoute, capabilitiesRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

describe("AppShell", () => {
  it("lists exactly the three sidebar entries Cases, Glossary and Capabilities, with no Hypotheses entry", async () => {
    const router = buildTestRouter("/cases");
    await router.load();
    render(createElement(RouterProvider, { router }));

    const nav = screen.getByRole("navigation", { name: "Primary" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Cases",
      "Glossary",
      "Capabilities",
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
