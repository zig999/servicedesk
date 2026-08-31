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

// Proof for task/connector-capability-create-detail-route/
// connector-configurations-list-create-action's own criteria 1-3: "New connector configuration"
// now navigates to the routed create screen (route-tree.tsx's own "/connectors/new") instead of
// opening the popup create/edit Dialog this screen used to host, and this screen holds no
// create/edit form-target state of its own left to surface one.
//
// This file used to hold this screen's own proof of the popup Dialog's create-mode behavior
// (field wiring, the Beautify control, the required-connector guard). None of that is reachable
// from this screen any more -- the button that used to open it now navigates away instead
// (connector-configurations-screen.tsx's own header comment) -- and the equivalent behavior for
// the routed create screen this button now leads to is already proved by
// connector-configuration-create-screen.spec.ts's own suite, so it is not re-proved here.
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
      // A form-target state left over from the retired popup Dialog would be the one thing that
      // could make a second activation, before the first navigation settles, behave differently
      // from the first -- e.g. toggling a dialog open. Nothing here does: both clicks are plain
      // navigate() calls with nothing local to accumulate or toggle.
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
