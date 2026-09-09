import { createElement, useState, type ReactNode } from "react";
import { vi } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { NewHypothesisScreen } from "./new-hypothesis-screen";
import { ReviseHypothesisScreen } from "./revise-hypothesis-screen";
import { FooterSlotContext } from "../shared/components/footer-slot-context";
import { NEW_HYPOTHESIS_PATH } from "./hypothesis-revision-screen.test-support";

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

function FooterSlotHarness({ children }: { children: ReactNode }) {
  const [footerSlotNode, setFooterSlotNode] = useState<HTMLDivElement | null>(null);
  return createElement(
    "div",
    null,
    createElement(FooterSlotContext.Provider, { value: footerSlotNode }, children),
    createElement("div", { ref: setFooterSlotNode }),
  );
}

function buildTestRouterWithFooterSlot(initialPath: string) {
  const rootRoute = createRootRoute({
    component: () => createElement(FooterSlotHarness, null, createElement(Outlet)),
  });
  const newHypothesisRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest/hypotheses/new",
    component: NewHypothesisScreen,
  });
  const reviseHypothesisRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName",
    component: ReviseHypothesisScreen,
  });
  const manifestRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest",
    component: () => createElement("div", null, "Manifest Builder Placeholder"),
  });
  const routeTree = rootRoute.addChildren([
    newHypothesisRoute,
    reviseHypothesisRoute,
    manifestRoute,
  ]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

function buildIsolatedReviseRouterWithFooterSlot(initialPath: string) {
  const rootRoute = createRootRoute({
    component: () => createElement(FooterSlotHarness, null, createElement(Outlet)),
  });
  const reviseHypothesisRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName",
    component: ReviseHypothesisScreen,
  });
  const routeTree = rootRoute.addChildren([reviseHypothesisRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

export async function mountHypothesisFormWithFooterSlot(
  fetchMock: FetchFn,
  initialPath: string = NEW_HYPOTHESIS_PATH,
): Promise<ReturnType<typeof buildTestRouterWithFooterSlot>> {
  vi.stubGlobal("fetch", fetchMock);
  const router = buildTestRouterWithFooterSlot(initialPath);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await router.load();
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RouterProvider, { router }),
    ),
  );
  return router;
}

export async function mountIsolatedReviseWithFooterSlot(
  fetchMock: FetchFn,
  initialPath: string,
): Promise<ReturnType<typeof buildIsolatedReviseRouterWithFooterSlot>> {
  vi.stubGlobal("fetch", fetchMock);
  const router = buildIsolatedReviseRouterWithFooterSlot(initialPath);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await router.load();
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RouterProvider, { router }),
    ),
  );
  return router;
}

function buildRevisionFormRouterWithHistory(entries: readonly string[]) {
  const rootRoute = createRootRoute({
    component: () => createElement(FooterSlotHarness, null, createElement(Outlet)),
  });
  const openedFromRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/simulation",
    component: () => createElement("div", null, "Simulation Placeholder"),
  });
  const reviseRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName",
    component: ReviseHypothesisScreen,
  });
  const routeTree = rootRoute.addChildren([openedFromRoute, reviseRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [...entries] }),
  });
}

export async function mountRevisionFormWithHistoryAndFooterSlot(
  fetchMock: FetchFn,
  entries: readonly string[],
): Promise<ReturnType<typeof buildRevisionFormRouterWithHistory>> {
  vi.stubGlobal("fetch", fetchMock);
  const router = buildRevisionFormRouterWithHistory(entries);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await router.load();
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RouterProvider, { router }),
    ),
  );
  return router;
}
