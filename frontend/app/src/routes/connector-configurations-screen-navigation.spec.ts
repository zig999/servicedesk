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
  connectorConfiguration,
  connectorConfigurationsPage,
  createConnectorConfigurationsFetchStub,
  jsonResponse,
} from "./connector-configurations-screen.test-support";

// Proof for task/connector-capability-detail-editing/connector-configuration-detail-route's own
// criteria 2 ("clicking a row ... navigates to that connector's /connectors/<connector> route")
// and 9 ("editing an existing connector configuration from the list screen opens the new route
// instead of the popup dialog"). ConnectorConfigurationsScreen now calls useNavigate() (this
// task's own new row-click wiring), so -- unlike connector-configurations-screen.test-support.ts's
// own mountConnectorConfigurationsScreen, which predates that and renders with a bare
// QueryClientProvider -- this file needs a real router context, mirroring
// cases-list-screen.spec.ts's own established "row click navigates" test convention exactly: a
// small, self-contained test router (this screen at its own route, plus a dummy
// "/connectors/$connector" leaf so navigate() has a real destination to resolve to, since what
// renders there is connector-configuration-detail-screen.tsx's own concern, not this proof's).

function buildTestRouter() {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const connectorsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors",
    component: ConnectorConfigurationsScreen,
  });
  const connectorDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors/$connector",
    component: () => createElement("div", null, "Connector Detail Placeholder"),
  });
  const routeTree = rootRoute.addChildren([connectorsRoute, connectorDetailRoute]);
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

describe("ConnectorConfigurationsScreen -- a row click navigates to the connector's own detail route (criterion 2)", () => {
  it("navigates to /connectors/<connector> when a row is clicked", async () => {
    const target = connectorConfiguration({ connector: "deepl-connector" });
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([target])),
    });
    const router = await mountWithRouter(fetchMock);

    const row = await screen.findByRole("button", { name: "deepl-connector" });
    fireEvent.click(row);

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors/deepl-connector"));
    expect(await screen.findByText("Connector Detail Placeholder")).toBeTruthy();
  });
});

describe("ConnectorConfigurationsScreen -- editing from the list opens the routed screen instead of the popup dialog (criterion 9)", () => {
  it("offers no separate per-row Edit action that would open the popup dialog", async () => {
    const target = connectorConfiguration({ connector: "deepl-connector" });
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([target])),
    });
    await mountWithRouter(fetchMock);
    await screen.findByRole("button", { name: "deepl-connector" });

    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
  });

  it("opens no popup dialog when a row is clicked, only the routed navigation", async () => {
    const target = connectorConfiguration({ connector: "deepl-connector" });
    const fetchMock = createConnectorConfigurationsFetchStub({
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([target])),
    });
    const router = await mountWithRouter(fetchMock);
    const row = await screen.findByRole("button", { name: "deepl-connector" });

    fireEvent.click(row);

    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors/deepl-connector"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
