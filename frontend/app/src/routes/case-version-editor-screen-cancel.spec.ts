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
import { CaseVersionEditorScreen } from "./case-version-editor-screen";
import {
  baseHandlers,
  createFetchStub,
  patchCallCount,
  SLUG,
} from "./case-version-editor-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const CANCEL_BUTTON = { name: "Cancel" };

async function mountEditorWithHistory(
  fetchMock: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
  entries: readonly string[],
) {
  vi.stubGlobal("fetch", fetchMock);
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const openedFromRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/simulate-cockpit",
    component: () => createElement("div", null, "Simulation Cockpit Placeholder"),
  });
  const editorRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version",
    component: CaseVersionEditorScreen,
  });
  const routeTree = rootRoute.addChildren([openedFromRoute, editorRoute]);
  const router = createRouter({
    routeTree,
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

describe("Cancel returns the curator to the screen the editing was actually reached from (criterion 3)", () => {
  it("navigates back to the case simulation cockpit it was opened from, rather than a fixed destination such as the case detail route", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    const openedFrom = `/cases/${SLUG}/simulate-cockpit`;
    const router = await mountEditorWithHistory(fetchMock, [
      openedFrom,
      `/cases/${SLUG}/versions/3`,
    ]);
    expect(router.state.location.pathname).toBe(`/cases/${SLUG}/versions/3`);

    fireEvent.click(await screen.findByRole("button", CANCEL_BUTTON));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(openedFrom);
    });
  });

  it("issues no PATCH request when Cancel is clicked after a field was edited", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountEditorWithHistory(fetchMock, [
      `/cases/${SLUG}/simulate-cockpit`,
      `/cases/${SLUG}/versions/3`,
    ]);

    const titleInput = await screen.findByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "Never saved" } });
    fireEvent.click(screen.getByRole("button", CANCEL_BUTTON));

    expect(patchCallCount(fetchMock)).toBe(0);
  });
});
