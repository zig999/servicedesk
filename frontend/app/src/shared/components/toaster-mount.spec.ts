import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { AppShell } from "./app-shell";

// AppShell.spec.ts (this directory) already owns the sidebar/breadcrumb/
// no-auth proof for a sibling task and is not touched here. This file adds
// exactly one focused test for the Toaster criterion, so it needs its own
// self-contained test router -- the same minimal pattern app-shell.spec.ts
// uses (AppShell as the root route's own component, one leaf route so the
// router has something to match) -- rather than reusing that file or the
// production route tree.

function ScreenA() {
  return createElement("div", null, "Screen A content");
}

function buildTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: AppShell });
  const casesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases",
    component: ScreenA,
  });
  const routeTree = rootRoute.addChildren([casesRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

describe("AppShell's Toaster mount", () => {
  it("renders exactly one sonner Toaster for every routed screen", async () => {
    const router = buildTestRouter("/cases");
    await router.load();
    render(createElement(RouterProvider, { router }));

    // Sonner's own Toaster renders a real accessible landmark, not a
    // decorative element: its root is a <section aria-label="Notifications
    // ..."> (frontend/app/node_modules/sonner/dist/index.mjs), and a
    // <section> with an aria-label carries the implicit ARIA role "region" --
    // so querying by that role/name is what tells apart "a Toaster mounted"
    // from "AppShell rendered some div".
    const toasters = screen.getAllByRole("region", { name: /Notifications/i });
    expect(toasters).toHaveLength(1);
  });
});
