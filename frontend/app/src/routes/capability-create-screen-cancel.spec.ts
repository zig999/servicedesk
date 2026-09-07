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
import { CapabilityCreateScreen } from "./capability-create-screen";
import {
  CONCEPTS_PATH,
  baseHandlers,
  capabilityPutPath,
  createFetchStub,
  errorResponse,
  fillValidForm,
  jsonResponse,
  putCallCount,
} from "./capability-create-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const CANCEL_BUTTON = { name: "Cancel" };
const NAME = "translate-text";
const VERSION = "1.0.0";

function buildRouteTree() {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const createRouteDef = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities/new",
    component: CapabilityCreateScreen,
  });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities/$name/$version",
    component: () => createElement("div", null, "Capability Detail Placeholder"),
  });
  const listRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities",
    component: () => createElement("div", null, "Capabilities List Placeholder"),
  });
  return rootRoute.addChildren([createRouteDef, detailRoute, listRoute]);
}

async function mountCreateWithHistory(
  fetchMock: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
  entries: readonly string[],
) {
  vi.stubGlobal("fetch", fetchMock);
  const router = createRouter({
    routeTree: buildRouteTree(),
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

describe("CapabilityCreateScreen -- the abandonment control returns to the surface authoring was reached from (criterion 1)", () => {
  it("navigates back to the capability detail screen it was opened from, rather than a fixed destination", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    const openedFrom = `/capabilities/${NAME}/${VERSION}`;
    const router = await mountCreateWithHistory(fetchMock, [openedFrom, "/capabilities/new"]);
    expect(router.state.location.pathname).toBe("/capabilities/new");

    fireEvent.click(await screen.findByRole("button", CANCEL_BUTTON));

    await waitFor(() => expect(router.state.location.pathname).toBe(openedFrom));
  });

  it("navigates back to the capabilities listing when that is the surface authoring was reached from, going back through history rather than treating the listing as a privileged destination", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    const router = await mountCreateWithHistory(fetchMock, ["/capabilities", "/capabilities/new"]);
    expect(router.state.location.pathname).toBe("/capabilities/new");

    fireEvent.click(await screen.findByRole("button", CANCEL_BUTTON));

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
  });
});

describe("CapabilityCreateScreen -- the abandonment control lands on the capabilities listing where no surface was reached from (criterion 2)", () => {
  it("navigates to the capabilities listing when the create screen was opened at its own address, with no history to return to", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    const router = await mountCreateWithHistory(fetchMock, ["/capabilities/new"]);

    fireEvent.click(await screen.findByRole("button", CANCEL_BUTTON));

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
  });
});

describe("CapabilityCreateScreen -- the abandonment control registers nothing (criterion 3)", () => {
  it("issues no PUT when the abandonment is taken after the form was filled in, leaving the registered set untouched", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [capabilityPutPath(NAME, VERSION)]: () => jsonResponse({ name: NAME, version: VERSION }),
      }),
    );
    const router = await mountCreateWithHistory(fetchMock, ["/capabilities/new"]);
    await screen.findByLabelText("Connector");
    fillValidForm({ name: NAME, version: VERSION });

    fireEvent.click(screen.getByRole("button", CANCEL_BUTTON));

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("CapabilityCreateScreen -- the abandonment control renders on every reading of the surface (disclosed inference)", () => {
  it("renders Cancel while the concept vocabulary is still loading", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => new Promise<Response>(() => {}),
    });
    await mountCreateWithHistory(fetchMock, ["/capabilities/new"]);

    await screen.findByText("Loading…");
    expect(screen.getByRole("button", CANCEL_BUTTON)).toBeTruthy();
  });

  it("renders Cancel once the concept vocabulary has failed to load", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    await mountCreateWithHistory(fetchMock, ["/capabilities/new"]);

    await screen.findByRole("button", { name: "Retry" });
    expect(screen.getByRole("button", CANCEL_BUTTON)).toBeTruthy();
  });

  it("renders Cancel once the surface is ready to author", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCreateWithHistory(fetchMock, ["/capabilities/new"]);

    await screen.findByLabelText("Connector");
    expect(screen.getByRole("button", CANCEL_BUTTON)).toBeTruthy();
  });
});
