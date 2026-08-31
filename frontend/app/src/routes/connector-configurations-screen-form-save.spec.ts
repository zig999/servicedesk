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

// Proof for task/connector-capability-create-detail-route/
// connector-configurations-list-create-action's own criterion 2 ("Activating 'New connector
// configuration' opens no dialog over the connector configurations list"), on its own
// save-dispatch dimension.
//
// This file used to hold this screen's own proof of the popup Dialog's create-mode save flow --
// a successful create's PUT and list refresh, the minified-persist behavior, the not-well-formed
// and generic-fallback refusal messages, and the double-submit guard. None of that dispatch is
// reachable from this screen any more: "New connector configuration" navigates away instead of
// opening a form that could ever call register-connector from here (connector-configurations-
// screen.tsx's own header comment), and the equivalent save behavior for the routed create screen
// this button now leads to is already proved by connector-configuration-create-screen-save.spec.ts's
// own suite, so it is not re-proved here. What remains this screen's own to prove is the negative
// half: that activating the action issues no PUT of its own.
//
// Mirrors connector-configurations-screen-navigation.spec.ts's own established "row click
// navigates" convention exactly: a small, self-contained test router (this screen at its own
// route, plus a dummy "/connectors/new" leaf so navigate() has a real destination to resolve to,
// since what renders there is connector-configuration-create-screen.tsx's own concern, not this
// proof's).

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
