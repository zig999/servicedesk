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

function emptyListFetchStub() {
  return createConnectorConfigurationsFetchStub({
    [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([])),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  'ConnectorConfigurationsScreen — "New connector configuration" navigates to the ' +
    "create route (criterion 1)",
  () => {
    it("navigates to /connectors/new when activated", async () => {
      const router = await mountWithRouter(emptyListFetchStub());
      await screen.findByText("No connector configurations are currently registered.");

      fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));

      await waitFor(() => expect(router.state.location.pathname).toBe("/connectors/new"));
      expect(await screen.findByText("Create Screen Placeholder")).toBeTruthy();
    });
  },
);

describe(
  'ConnectorConfigurationsScreen — "New connector configuration" opens no dialog (criterion 2)',
  () => {
    it("renders no dialog over the list, immediately after the action is activated and once navigation resolves", async () => {
      const router = await mountWithRouter(emptyListFetchStub());
      await screen.findByText("No connector configurations are currently registered.");

      fireEvent.click(screen.getByRole("button", { name: "New connector configuration" }));

      expect(screen.queryByRole("dialog")).toBeNull();
      await waitFor(() => expect(router.state.location.pathname).toBe("/connectors/new"));
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  },
);

describe(
  "ConnectorConfigurationsScreen — holds no create/edit form-target state of its own " +
    "(criterion 3, two activations at once)",
  () => {
    it("still shows no dialog when the action is activated twice in quick succession", async () => {

      const router = await mountWithRouter(emptyListFetchStub());
      await screen.findByText("No connector configurations are currently registered.");
      const newConnectorButton = screen.getByRole("button", { name: "New connector configuration" });

      fireEvent.click(newConnectorButton);
      fireEvent.click(newConnectorButton);

      expect(screen.queryByRole("dialog")).toBeNull();
      await waitFor(() => expect(router.state.location.pathname).toBe("/connectors/new"));
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  },
);
