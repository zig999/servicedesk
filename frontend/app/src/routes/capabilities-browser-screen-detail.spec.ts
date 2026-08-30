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
import { CapabilitiesBrowserScreen } from "./capabilities-browser-screen";
import {
  CAPABILITIES_PATH,
  capabilitiesPage,
  createCapabilitiesFetchStub,
  jsonResponse,
} from "./capabilities-browser-screen.test-support";

// Proof for task/connector-capability-create-detail-route/capabilities-browser-create-action's
// own criteria 1, 2 and 3: "New capability" now navigates to the routed create screen
// (route-tree.tsx's own "/capabilities/new", CapabilityCreateScreen) instead of opening the
// popup Dialog's create mode, and the screen holds no create/edit form-target state of its own
// to host that Dialog (capabilities-browser-screen.tsx's own header comment).
//
// Every describe block this file's own prior delivery held here -- task/capability-authoring/
// capability-create-edit-form's own criterion 1 ("New capability" opens a blank Dialog, its own
// nature-defaults-to-read-only inference) and the concept-vocabulary loading/load-error phases
// inside that same Dialog -- is retired outright rather than rewritten: this task's own change
// removes the only path this screen ever had to open that Dialog (the "New capability" button's
// onClick), so no interaction reaches a Dialog from here any more. That Dialog's own create-mode
// behavior -- the shared useCapabilityForm hook's loading/load-error phases, its concept
// vocabulary, its form fields -- is proven instead through the routed create screen's own proof
// (capability-create-screen.spec.ts's own criteria 6 and 7,
// task/connector-capability-create-detail-route/capability-create-route), which composes that
// same hook in create mode.
//
// CapabilitiesBrowserScreen calls useNavigate() (capabilities-browser-screen-navigation.spec.ts's
// own header comment explains why a bare QueryClientProvider mount is not enough once a click is
// meant to navigate), so this file keeps that same router-based mounting convention: a small,
// self-contained test router with a dummy "/capabilities/new" leaf (what renders there is
// capability-create-screen.tsx's own concern, not this proof's).

function buildTestRouter() {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const capabilitiesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities",
    component: CapabilitiesBrowserScreen,
  });
  const capabilityCreateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities/new",
    component: () => createElement("div", null, "Capability Create Placeholder"),
  });
  const routeTree = rootRoute.addChildren([capabilitiesRoute, capabilityCreateRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/capabilities"] }),
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

describe('CapabilitiesBrowserScreen — "New capability" navigates to the create route (criterion 1)', () => {
  it("navigates to /capabilities/new when New capability is clicked", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
    });
    const router = await mountWithRouter(fetchMock);
    await screen.findByText("No capabilities are currently registered.");
    const newCapabilityButton = screen.getByRole("button", { name: "New capability" });

    fireEvent.click(newCapabilityButton);

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities/new"));
    expect(await screen.findByText("Capability Create Placeholder")).toBeTruthy();
  });
});

describe('CapabilitiesBrowserScreen — "New capability" opens no dialog (criteria 2 and 3)', () => {
  it("opens no dialog when New capability is clicked, either immediately or once the navigation it triggers has resolved", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
    });
    const router = await mountWithRouter(fetchMock);
    await screen.findByText("No capabilities are currently registered.");
    const newCapabilityButton = screen.getByRole("button", { name: "New capability" });
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(newCapabilityButton);

    // The screen holds no formTarget state of its own to open one (criterion 3), so no dialog
    // ever appears at any point in this interaction -- checked both immediately after the click
    // and once the navigation this same click triggers has actually resolved.
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities/new"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
