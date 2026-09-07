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
import { ConnectorConfigurationCreateScreen } from "./connector-configuration-create-screen";
import {
  connectorPutPath,
  createFetchStub,
  jsonResponse,
  mountConnectorConfigurationCreateScreen,
  putCallCount,
} from "./connector-configuration-create-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function buildRouteTreeWithHistoryNeighbours() {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const createRouteDef = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors/new",
    component: ConnectorConfigurationCreateScreen,
  });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors/$connector",
    component: () => createElement("div", null, "Connector Detail Placeholder"),
  });
  const listRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors",
    component: () => createElement("div", null, "Connector Configurations List Placeholder"),
  });
  return rootRoute.addChildren([createRouteDef, detailRoute, listRoute]);
}

async function mountCreateWithHistory(
  fetchMock: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
  entries: readonly string[],
) {
  vi.stubGlobal("fetch", fetchMock);
  const router = createRouter({
    routeTree: buildRouteTreeWithHistoryNeighbours(),
    history: createMemoryHistory({ initialEntries: [...entries] }),
  });
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

describe("ConnectorConfigurationCreateScreen -- the abandonment control returns to the surface authoring was reached from (criterion 1)", () => {
  it("navigates back to the connector detail screen it was opened from, rather than a fixed destination", async () => {
    const fetchMock = createFetchStub();
    const openedFrom = "/connectors/deepl-connector";
    const router = await mountCreateWithHistory(fetchMock, [openedFrom, "/connectors/new"]);
    expect(router.state.location.pathname).toBe("/connectors/new");

    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe(openedFrom));
  });

  it("navigates back to the connector-configurations listing when that is the surface authoring was reached from, going back through history rather than treating the listing as a privileged fixed destination", async () => {
    const fetchMock = createFetchStub();
    const router = await mountCreateWithHistory(fetchMock, ["/connectors", "/connectors/new"]);
    expect(router.state.location.pathname).toBe("/connectors/new");

    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
  });
});

describe("ConnectorConfigurationCreateScreen -- offers no discard control, having read no registration (criterion 6)", () => {
  it("renders no Discard changes control", async () => {
    const fetchMock = createFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    expect(screen.queryByRole("button", { name: "Discard changes" })).toBeNull();
  });
});

describe("ConnectorConfigurationCreateScreen -- the footer's Cancel abandons authoring without registering (criterion 7; UNDERDETERMINED note: the listing route is never rendered as a control that submits the form)", () => {
  it("issues no PUT and returns to the connector-configurations listing when Cancel is clicked, even after the form was filled in -- a Cancel wired to submit before navigating would fail this", async () => {
    const fetchMock = createFetchStub({
      [connectorPutPath("deepl-connector")]: () =>
        jsonResponse({ connector: "deepl-connector", configuration: "{}" }),
    });
    const router = await mountConnectorConfigurationCreateScreen(fetchMock);
    const connectorInput = await screen.findByLabelText<HTMLInputElement>("Connector");
    fireEvent.change(connectorInput, { target: { value: "deepl-connector" } });
    const configurationField = screen.getByLabelText<HTMLTextAreaElement>("Configuration");
    fireEvent.change(configurationField, { target: { value: "{}" } });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
    expect(putCallCount(fetchMock)).toBe(0);
  });
});
