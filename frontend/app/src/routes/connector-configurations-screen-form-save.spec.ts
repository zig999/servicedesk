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
import { ConnectorConfigurationsScreen } from "./connector-configurations-screen";
import {
  CONNECTORS_PATH,
  connectorConfigurationsPage,
  createConnectorConfigurationsFetchStub,
  jsonResponse,
  putCallCount,
} from "./connector-configurations-screen.test-support";

function buildTestRouter() {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const connectorsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors",
    component: ConnectorConfigurationsScreen,
  });
  const connectorCreateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors/new",
    component: () => createElement("div", null, "Create Screen Placeholder"),
  });
  const routeTree = rootRoute.addChildren([connectorsRoute, connectorCreateRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/connectors"] }),
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

describe(
  'ConnectorConfigurationsScreen — "New connector configuration" submits nothing of its own ' +
    "(criterion 2, dispatch dimension)",
  () => {
    it("issues no PUT to the connectors endpoint when the action is activated and navigation resolves", async () => {
      const fetchMock = createConnectorConfigurationsFetchStub({
        [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([])),
      });
      const router = await mountWithRouter(fetchMock);
      await screen.findByText("No connector configurations are currently registered.");

      fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));

      await waitFor(() => expect(router.state.location.pathname).toBe("/connectors/new"));
      expect(putCallCount(fetchMock)).toBe(0);
    });
  },
);
