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
import { CapabilityCreateScreen } from "./capability-create-screen";
import { FooterSlotContext } from "../shared/components/footer-slot-context";

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

function buildTestRouterWithFooterSlot(entries: readonly string[]) {
  const rootRoute = createRootRoute({
    component: () => createElement(FooterSlotHarness, null, createElement(Outlet)),
  });
  const createRouteDef = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities/new",
    component: CapabilityCreateScreen,
  });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities/$name/$version",
    component: () => createElement("div", null, "Capability Detail Placeholder"),
  });
  const listRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities",
    component: () => createElement("div", null, "Capabilities List Placeholder"),
  });
  const routeTree = rootRoute.addChildren([createRouteDef, detailRoute, listRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [...entries] }),
  });
}

export async function mountCapabilityCreateScreenWithFooterSlot(
  fetchMock: FetchFn,
  entries: readonly string[] = ["/capabilities/new"],
): Promise<ReturnType<typeof buildTestRouterWithFooterSlot>> {
  vi.stubGlobal("fetch", fetchMock);
  const router = buildTestRouterWithFooterSlot(entries);
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
