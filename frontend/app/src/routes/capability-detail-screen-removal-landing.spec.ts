import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
import { CapabilitiesBrowserScreen } from "./capabilities-browser-screen";
import { CapabilityDetailScreen } from "./capability-detail-screen";
import {
  CAPABILITY_PATH,
  CONCEPTS_PATH,
  CONCEPTS_RESPONSE,
  LOADED_CAPABILITY,
  NAME,
  ORIGIN_PATH_ONE,
  VERSION,
  baseHandlers,
  createFetchStub,
  errorResponse,
  jsonResponse,
  mountCapabilityDetailScreenAt,
  type FetchResponder,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

function removeTriggerButton(): HTMLElement {
  return screen.getByRole("button", { name: "Remove capability" });
}

async function openRemoveDialog(): Promise<void> {
  fireEvent.click(removeTriggerButton());
  await screen.findByRole("dialog");
}

function removeConfirmButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Remove capability" });
}

async function mountReadyAt(
  initialEntries: string[],
  overrides: Record<string, FetchResponder> = {},
) {
  const fetchMock = createFetchStub(baseHandlers(undefined, undefined, overrides));
  const router = await mountCapabilityDetailScreenAt(fetchMock, initialEntries);
  await screen.findByLabelText("Connector");
  return { fetchMock, router };
}

describe("CapabilityDetailScreen -- a successful removal lands the operator on the capabilities listing (criterion 1)", () => {
  it("navigates to /capabilities once the removal answers with HTTP 204", async () => {
    const { router } = await mountReadyAt([`/capabilities/${NAME}/${VERSION}`], {
      [CAPABILITY_PATH]: (method) =>
        method === "DELETE" ? noContentResponse() : jsonResponse(LOADED_CAPABILITY),
    });

    await openRemoveDialog();
    fireEvent.click(removeConfirmButton());

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
  });
});

describe("CapabilityDetailScreen -- the landing never returns to an earlier navigation-history entry instead (criterion 2)", () => {
  it("lands at /capabilities rather than at the origin navigation history holds, once the removal answers with HTTP 204", async () => {
    const { router } = await mountReadyAt(
      [ORIGIN_PATH_ONE, `/capabilities/${NAME}/${VERSION}`],
      {
        [CAPABILITY_PATH]: (method) =>
          method === "DELETE" ? noContentResponse() : jsonResponse(LOADED_CAPABILITY),
      },
    );
    expect(router.history.canGoBack()).toBe(true);

    await openRemoveDialog();
    fireEvent.click(removeConfirmButton());

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
  });
});

describe("CapabilityDetailScreen -- the landing waits for the removal's own answer, never taken merely because the removal was issued (an underdetermined note in this task)", () => {
  it("still presents the capability's own surface while the DELETE request is outstanding, navigating to /capabilities only once it resolves with HTTP 204", async () => {
    let resolveDelete!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveDelete = resolve;
    });
    const { router } = await mountReadyAt([`/capabilities/${NAME}/${VERSION}`], {
      [CAPABILITY_PATH]: (method) => (method === "DELETE" ? pending : jsonResponse(LOADED_CAPABILITY)),
    });

    await openRemoveDialog();
    fireEvent.click(removeConfirmButton());

    await waitFor(() => expect(removeTriggerButton().hasAttribute("disabled")).toBe(true));
    expect(router.state.location.pathname).toBe(`/capabilities/${NAME}/${VERSION}`);

    resolveDelete(noContentResponse());
    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
  });
});

describe("CapabilityDetailScreen -- a refused removal leaves the operator on the capability's own surface (an underdetermined note in this task)", () => {
  it("stays at the capability's own detail route when the removal answers with a refusal instead of HTTP 204", async () => {
    const { router } = await mountReadyAt([`/capabilities/${NAME}/${VERSION}`], {
      [CAPABILITY_PATH]: (method) =>
        method === "DELETE" ? errorResponse("SomeRemovalRefusal", 409) : jsonResponse(LOADED_CAPABILITY),
    });

    await openRemoveDialog();
    fireEvent.click(removeConfirmButton());

    await waitFor(() => expect(removeTriggerButton().hasAttribute("disabled")).toBe(false));
    expect(router.state.location.pathname).toBe(`/capabilities/${NAME}/${VERSION}`);
  });
});

const SURVIVOR_NAME = "a-surviving-capability";
const SURVIVOR_VERSION = "2.0.0";
const CAPABILITIES_LIST_PATH = "/v1/capabilities";

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

function survivorCapability(): typeof LOADED_CAPABILITY {
  return { ...LOADED_CAPABILITY, name: SURVIVOR_NAME, version: SURVIVOR_VERSION };
}

function createLandingFetchStub(): { fetchMock: FetchFn } {
  let removed = false;
  const fetchMock = vi.fn(
    async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      const method = (init?.method ?? "GET").toUpperCase();
      if (url === CAPABILITY_PATH) {
        if (method === "DELETE") {
          removed = true;
          return noContentResponse();
        }
        return removed
          ? errorResponse("CapabilityIdentityNotFoundError", 404)
          : jsonResponse(LOADED_CAPABILITY);
      }
      if (url === CAPABILITIES_LIST_PATH) {
        return jsonResponse({
          data: removed ? [survivorCapability()] : [LOADED_CAPABILITY, survivorCapability()],
        });
      }
      if (url === CONCEPTS_PATH) {
        return jsonResponse(CONCEPTS_RESPONSE);
      }
      throw new Error(`capability-detail-screen-removal-landing proof: no mocked response for ${url}`);
    },
  );
  return { fetchMock };
}

function buildLandingRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const capabilitiesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities",
    component: CapabilitiesBrowserScreen,
  });
  const capabilityDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities/$name/$version",
    component: CapabilityDetailScreen,
  });
  const routeTree = rootRoute.addChildren([capabilitiesRoute, capabilityDetailRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

async function mountLandingRouter(
  fetchMock: FetchFn,
  initialPath: string,
  seed?: (queryClient: QueryClient) => void,
): Promise<ReturnType<typeof buildLandingRouter>> {
  vi.stubGlobal("fetch", fetchMock);
  const router = buildLandingRouter(initialPath);
  await router.load();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  seed?.(queryClient);
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RouterProvider, { router }),
    ),
  );
  return router;
}

describe("CapabilityDetailScreen -- a successful removal leaves no row for the removed name and version on the capabilities listing (criterion 3)", () => {
  it("replaces a capabilities-listing cache that still held the removed row with one that no longer does, once the removal lands there", async () => {
    const { fetchMock } = createLandingFetchStub();
    const router = await mountLandingRouter(fetchMock, `/capabilities/${NAME}/${VERSION}`, (queryClient) =>
      queryClient.setQueryData(["capabilities"], {
        data: [LOADED_CAPABILITY, survivorCapability()],
      }),
    );
    await screen.findByLabelText("Connector");

    await openRemoveDialog();
    fireEvent.click(removeConfirmButton());

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
    await waitFor(() => expect(screen.queryByRole("button", { name: new RegExp(NAME) })).toBeNull());
    expect(screen.getByRole("button", { name: new RegExp(SURVIVOR_NAME) })).toBeTruthy();
  });
});

describe("CapabilityDetailScreen -- a successful removal never shows the removed identity's own read refusal (criterion 4)", () => {
  it("never renders the removed capability's not-registered refusal once the removal lands on the listing", async () => {
    const { fetchMock } = createLandingFetchStub();
    const router = await mountLandingRouter(fetchMock, `/capabilities/${NAME}/${VERSION}`);
    await screen.findByLabelText("Connector");

    await openRemoveDialog();
    fireEvent.click(removeConfirmButton());

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
    await screen.findByRole("button", { name: new RegExp(SURVIVOR_NAME) });
    expect(screen.queryByText("Unable to load this capability right now.")).toBeNull();
  });
});
