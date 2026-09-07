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
import { ConnectorConfigurationDetailScreen } from "./connector-configuration-detail-screen";
import {
  CONFIGURATION_PATH,
  CONNECTOR,
  LOADED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  errorResponse,
  jsonResponse,
  mountConnectorConfigurationDetailScreen,
  putCallCount,
} from "./connector-configuration-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function buildRouteTreeWithHistoryNeighbours() {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const originRouteA = createRoute({
    getParentRoute: () => rootRoute,
    path: "/origin-surface-a",
    component: () => createElement("div", null, "Origin Surface A Placeholder"),
  });
  const originRouteB = createRoute({
    getParentRoute: () => rootRoute,
    path: "/origin-surface-b",
    component: () => createElement("div", null, "Origin Surface B Placeholder"),
  });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors/$connector",
    component: ConnectorConfigurationDetailScreen,
  });
  const listRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors",
    component: () => createElement("div", null, "Connector Configurations List Placeholder"),
  });
  return rootRoute.addChildren([originRouteA, originRouteB, detailRoute, listRoute]);
}

async function mountWithHistory(
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

describe("ConnectorConfigurationDetailScreen -- the return-to-origin control lands back on the surface reached from, when one exists (criterion 1)", () => {
  it("navigates back to the origin surface it was reached from, rather than the connector-configurations listing, and issues no PUT", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    const router = await mountWithHistory(fetchMock, [
      "/origin-surface-a",
      `/connectors/${CONNECTOR}`,
    ]);
    await screen.findByLabelText("Configuration");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/origin-surface-a"));
    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("ConnectorConfigurationDetailScreen -- the presence of both controls turns on nothing about which surface the detail surface was reached from (criterion 8)", () => {
  it("renders both controls when reached from one surface that is not the listing", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountWithHistory(fetchMock, ["/origin-surface-a", `/connectors/${CONNECTOR}`]);
    await screen.findByLabelText("Configuration");

    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Connectors" })).toBeTruthy();
  });

  it("renders both controls when reached from a different surface that is not the listing", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountWithHistory(fetchMock, ["/origin-surface-b", `/connectors/${CONNECTOR}`]);
    await screen.findByLabelText("Configuration");

    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Connectors" })).toBeTruthy();
  });

  it("renders both controls when reached from the connector-configurations listing itself", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountWithHistory(fetchMock, ["/connectors", `/connectors/${CONNECTOR}`]);
    await screen.findByLabelText("Configuration");

    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Connectors" })).toBeTruthy();
  });
});

describe("ConnectorConfigurationDetailScreen -- the return-to-origin control falls back to the listing with no surface to return to, in each of the four readings, registering nothing (criteria 2, 9)", () => {
  it("navigates to /connectors and issues no PUT when Cancel is clicked while the read is still outstanding", async () => {
    let resolveGet!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveGet = resolve;
    });
    const fetchMock = createFetchStub({ [CONFIGURATION_PATH]: () => pending });
    const router = await mountConnectorConfigurationDetailScreen(fetchMock);
    await screen.findByText(`Loading connector configuration ${CONNECTOR}…`);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
    expect(putCallCount(fetchMock)).toBe(0);

    resolveGet(jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }));
  });

  it("navigates to /connectors and issues no PUT when Cancel is clicked once the read has failed for a reason other than the refusal", async () => {
    const fetchMock = createFetchStub({
      [CONFIGURATION_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    const router = await mountConnectorConfigurationDetailScreen(fetchMock);
    await screen.findByRole("button", { name: "Retry" });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
    expect(putCallCount(fetchMock)).toBe(0);
  });

  it("navigates to /connectors and issues no PUT when Cancel is clicked once the read was refused because nothing is registered under that connector name", async () => {
    const fetchMock = createFetchStub({
      [CONFIGURATION_PATH]: () => errorResponse("ConnectorConfigurationNotFoundError", 404),
    });
    const router = await mountConnectorConfigurationDetailScreen(fetchMock);
    await screen.findByRole("button", { name: "Retry" });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
    expect(putCallCount(fetchMock)).toBe(0);
  });

  it("navigates to /connectors and issues no PUT when Cancel is clicked with no edits once the configuration is shown", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    const router = await mountConnectorConfigurationDetailScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("ConnectorConfigurationDetailScreen -- the reading where the read was refused because nothing is registered under the connector name carries exactly the two controls this task owes (criteria 7, 10, 19)", () => {
  it("renders the return-to-origin control and the listing-route control, and renders no field-restoring control", async () => {
    const fetchMock = createFetchStub({
      [CONFIGURATION_PATH]: () => errorResponse("ConnectorConfigurationNotFoundError", 404),
    });
    await mountConnectorConfigurationDetailScreen(fetchMock);
    await screen.findByRole("button", { name: "Retry" });

    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Connectors" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Discard changes" })).toBeNull();
  });
});
