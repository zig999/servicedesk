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
  const capabilityCreateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities/new",
    component: () => createElement("div", null, "Capability Create Placeholder"),
  });
  const routeTree = rootRoute.addChildren([capabilitiesRoute, capabilityCreateRoute]);
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

describe('CapabilitiesBrowserScreen — "New capability" navigates to the create route (criterion 1)', () => {
  it("navigates to /capabilities/new when New capability is clicked", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
    });
    const router = await mountWithRouter(fetchMock);
    await screen.findByText("No capabilities are currently registered.");
    const newCapabilityButton = screen.getByRole("button", { name: "New capability" });

    fireEvent.click(newCapabilityButton);

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities/new"));
    expect(await screen.findByText("Capability Create Placeholder")).toBeTruthy();
  });
});

describe('CapabilitiesBrowserScreen — "New capability" opens no dialog (criteria 2 and 3)', () => {
  it("opens no dialog when New capability is clicked, either immediately or once the navigation it triggers has resolved", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
    });
    const router = await mountWithRouter(fetchMock);
    await screen.findByText("No capabilities are currently registered.");
    const newCapabilityButton = screen.getByRole("button", { name: "New capability" });
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(newCapabilityButton);

    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities/new"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
