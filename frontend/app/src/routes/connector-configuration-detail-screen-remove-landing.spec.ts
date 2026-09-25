import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from "sonner";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
import { ConnectorConfigurationsScreen } from "./connector-configurations-screen";
import {
  CONFIGURATION_PATH,
  CONNECTOR,
  LOADED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  errorResponse,
  jsonResponse,
  mountConnectorConfigurationDetailScreen,
} from "./connector-configuration-detail-screen.test-support";
import {
  CONNECTORS_PATH,
  connectorConfiguration,
  connectorConfigurationsPage,
} from "./connector-configurations-screen.test-support";
import type { ConnectorConfiguration } from "../hooks/use-connector-configurations";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
});

function removableHandlers(): ReturnType<typeof baseHandlers> {
  return baseHandlers(LOADED_CONFIGURATION, {
    [CONFIGURATION_PATH]: (method) =>
      method === "DELETE"
        ? new Response(null, { status: 204 })
        : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
  });
}

function removeControlButton(): HTMLElement {
  return screen.getByRole("button", { name: "Remove connector configuration" });
}

async function openRemoveDialog(): Promise<void> {
  fireEvent.click(removeControlButton());
  await screen.findByRole("dialog");
}

function confirmRemoveButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", {
    name: "Remove connector configuration",
  });
}

function buildRouteTreeWithOrigin() {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const originRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/origin-surface",
    component: () => createElement("div", null, "Origin Surface Placeholder"),
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
  return rootRoute.addChildren([originRoute, detailRoute, listRoute]);
}

async function mountWithOriginHistory(
  fetchMock: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
) {
  vi.stubGlobal("fetch", fetchMock);
  const router = createRouter({
    routeTree: buildRouteTreeWithOrigin(),
    history: createMemoryHistory({
      initialEntries: ["/origin-surface", `/connectors/${CONNECTOR}`],
    }),
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

function buildRouteTreeWithRealListing() {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors/$connector",
    component: ConnectorConfigurationDetailScreen,
  });
  const listRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors",
    component: ConnectorConfigurationsScreen,
  });
  return rootRoute.addChildren([detailRoute, listRoute]);
}

async function mountWithRealListing(
  fetchMock: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
  seedListing?: readonly ConnectorConfiguration[],
) {
  vi.stubGlobal("fetch", fetchMock);
  const router = createRouter({
    routeTree: buildRouteTreeWithRealListing(),
    history: createMemoryHistory({ initialEntries: [`/connectors/${CONNECTOR}`] }),
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  if (seedListing) {
    queryClient.setQueryData(
      ["connector-configurations"],
      connectorConfigurationsPage(seedListing),
    );
  }
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

describe("ConnectorConfigurationDetailScreen -- a successful removal lands on the connectors listing (criterion 1)", () => {
  it("navigates to /connectors once the DELETE answers 204", async () => {
    const fetchMock = createFetchStub(removableHandlers());
    const router = await mountConnectorConfigurationDetailScreen(fetchMock);
    await screen.findByLabelText("Configuração");

    await openRemoveDialog();
    fireEvent.click(confirmRemoveButton());

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
  });
});

describe("ConnectorConfigurationDetailScreen -- landing on /connectors holds even with an earlier history entry to return to (criterion 2)", () => {
  it("navigates to /connectors, not back to the origin surface reached from, once the DELETE answers 204", async () => {
    const fetchMock = createFetchStub(removableHandlers());
    const router = await mountWithOriginHistory(fetchMock);
    await screen.findByLabelText("Configuração");

    await openRemoveDialog();
    fireEvent.click(confirmRemoveButton());

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
  });
});

describe("ConnectorConfigurationDetailScreen -- the connectors listing shows no row for the removed connector once landed (criterion 3)", () => {
  it("no longer lists the removed connector's row once the listing refetches on landing, even though its row was cached from an earlier visit", async () => {
    const fetchMock = createFetchStub({
      ...removableHandlers(),
      [CONNECTORS_PATH]: () =>
        jsonResponse(
          connectorConfigurationsPage([connectorConfiguration({ connector: "other-connector" })]),
        ),
    });
    const router = await mountWithRealListing(fetchMock, [
      connectorConfiguration({ connector: CONNECTOR }),
      connectorConfiguration({ connector: "other-connector" }),
    ]);
    await screen.findByLabelText("Configuração");

    await openRemoveDialog();
    fireEvent.click(confirmRemoveButton());

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
    await screen.findByRole("button", { name: "other-connector" });
    expect(screen.queryByRole("button", { name: CONNECTOR })).toBeNull();
  });
});

describe("ConnectorConfigurationDetailScreen -- the removed connector's own read refusal is never shown once landed (criterion 4)", () => {
  it("never shows the read-refused message for the removed connector, even where a refetch of its own now-unregistered query would answer refused", async () => {
    let getCallCount = 0;
    const fetchMock = createFetchStub({
      ...baseHandlers(LOADED_CONFIGURATION, {
        [CONFIGURATION_PATH]: (method) => {
          if (method === "DELETE") {
            return new Response(null, { status: 204 });
          }
          getCallCount += 1;
          return getCallCount === 1
            ? jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION })
            : errorResponse("ConnectorConfigurationNotFoundError", 404);
        },
      }),
      [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([])),
    });
    const router = await mountWithRealListing(fetchMock);
    await screen.findByLabelText("Configuração");

    await openRemoveDialog();
    fireEvent.click(confirmRemoveButton());

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
    expect(
      screen.queryByText("Unable to load this connector configuration right now."),
    ).toBeNull();
  });
});

describe("ConnectorConfigurationDetailScreen -- landing depends on an actual 204 answer, not on issuing the removal or on any other answer (UNDERDETERMINED note: a reading navigating on issue or on any answer including a refusal would still pass every stated criterion)", () => {
  it("stays on the connector's own surface while the DELETE is outstanding, and again once it is refused, never reaching /connectors without a 204 -- an implementation navigating as soon as the removal is issued, or on a refusal, would fail this", async () => {
    let resolveDelete!: (response: Response) => void;
    const pendingDelete = new Promise<Response>((resolve) => {
      resolveDelete = resolve;
    });
    const fetchMock = createFetchStub(
      baseHandlers(LOADED_CONFIGURATION, {
        [CONFIGURATION_PATH]: (method) =>
          method === "DELETE"
            ? pendingDelete
            : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
      }),
    );
    const router = await mountConnectorConfigurationDetailScreen(fetchMock);
    await screen.findByLabelText("Configuração");

    await openRemoveDialog();
    fireEvent.click(confirmRemoveButton());

    expect(router.state.location.pathname).toBe(`/connectors/${CONNECTOR}`);

    resolveDelete(errorResponse("ValidationError", 400));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());

    expect(router.state.location.pathname).toBe(`/connectors/${CONNECTOR}`);
  });
});

describe("ConnectorConfigurationDetailScreen -- the removal's success statement is not dropped by the same onSuccess that navigates away (UNDERDETERMINED note: a reading navigating straight to /connectors and dropping the issuing surface's state would still pass every stated criterion)", () => {
  it("still emits the removal's success statement naming the connector in the same onSuccess that also navigates to /connectors -- an implementation dropping the statement in favor of only navigating would fail this", async () => {
    const fetchMock = createFetchStub(removableHandlers());
    const router = await mountConnectorConfigurationDetailScreen(fetchMock);
    await screen.findByLabelText("Configuração");

    await openRemoveDialog();
    fireEvent.click(confirmRemoveButton());

    await waitFor(() => expect(router.state.location.pathname).toBe("/connectors"));
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining(CONNECTOR));
  });
});
