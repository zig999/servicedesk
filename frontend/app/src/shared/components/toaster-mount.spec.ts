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

    const toasters = screen.getAllByRole("region", { name: /Notifications/i });
    expect(toasters).toHaveLength(1);
  });
});
