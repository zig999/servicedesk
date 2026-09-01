import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CapabilitiesBrowserScreen } from "./capabilities-browser-screen";
import {
  CAPABILITIES_PATH,
  capabilitiesPage,
  capability,
  createCapabilitiesFetchStub,
  jsonResponse,
} from "./capabilities-browser-screen.test-support";

function buildTestRouter() {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const capabilitiesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities",
    component: CapabilitiesBrowserScreen,
  });
  const capabilityDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities/$name/$version",
    component: () => createElement("div", null, "Capability Detail Placeholder"),
  });
  const routeTree = rootRoute.addChildren([capabilitiesRoute, capabilityDetailRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/capabilities"] }),
  });
}

async function mountWithRouter(
  fetchMock: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
): Promise<ReturnType<typeof buildTestRouter>> {
  vi.stubGlobal("fetch", fetchMock);
  const router = buildTestRouter();
  await router.load();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RouterProvider, { router }),
    ),
  );
  return router;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilitiesBrowserScreen -- a row click navigates to that capability's own detail route (criterion 2)", () => {
  it("navigates to /capabilities/<name>/<version>, by both identity fields, when a row is clicked", async () => {
    const target = capability({ name: "translate-text", version: "1.0.0" });
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([target])),
    });
    const router = await mountWithRouter(fetchMock);

    const row = await screen.findByRole("button", { name: /translate-text/ });
    fireEvent.click(row);

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/capabilities/translate-text/1.0.0"),
    );
    expect(await screen.findByText("Capability Detail Placeholder")).toBeTruthy();
  });
});

describe("CapabilitiesBrowserScreen -- editing from the list opens the routed screen instead of the popup dialog (criterion 9)", () => {
  it("offers no separate per-row Edit action that would open the popup dialog", async () => {
    const target = capability({ name: "translate-text", version: "1.0.0" });
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([target])),
    });
    await mountWithRouter(fetchMock);
    await screen.findByRole("button", { name: /translate-text/ });

    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
  });

  it("opens no popup dialog when a row is clicked, only the routed navigation", async () => {
    const target = capability({ name: "translate-text", version: "1.0.0" });
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([target])),
    });
    const router = await mountWithRouter(fetchMock);
    const row = await screen.findByRole("button", { name: /translate-text/ });

    fireEvent.click(row);

    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/capabilities/translate-text/1.0.0"),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
