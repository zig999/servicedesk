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
import { ReviseHypothesisScreen } from "./revise-hypothesis-screen";
import {
  baseHandlers,
  createFetchStub,
  fillValidForm,
  H1_REVISIONS,
  HYPOTHESES_PATH,
  jsonResponse,
  mountHypothesisForm,
  mountIsolatedRevise,
  postCallCount,
  revisePath,
  revisionsPath,
  SLUG,
} from "./hypothesis-revision-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const CANCEL_BUTTON = { name: "Cancel" };

async function mountRevisionFormWithHistory(
  fetchMock: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
  entries: readonly string[],
) {
  vi.stubGlobal("fetch", fetchMock);
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const openedFromRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/simulation",
    component: () => createElement("div", null, "Simulation Placeholder"),
  });
  const reviseRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName",
    component: ReviseHypothesisScreen,
  });
  const routeTree = rootRoute.addChildren([openedFromRoute, reviseRoute]);
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

describe("Cancel's offer does not turn on how much of the composition was filled in (criterion 3)", () => {
  it("is present and enabled both on a freshly opened, blank form and once every field has been filled in", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisForm(fetchMock);

    const blank = await screen.findByRole("button", CANCEL_BUTTON);
    expect(blank.hasAttribute("disabled")).toBe(false);

    await fillValidForm("New Name");

    const filled = screen.getByRole("button", CANCEL_BUTTON);
    expect(filled.hasAttribute("disabled")).toBe(false);
  });
});

describe("Cancel is offered only for as long as the composition has not been submitted (criterion 3)", () => {
  it("is no longer rendered once a save has succeeded", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "New Name", revision: 1 }, 201),
      }),
    );
    await mountHypothesisForm(fetchMock);
    await fillValidForm("New Name");
    fireEvent.click(screen.getByRole("button", { name: "Save hypothesis" }));

    await screen.findByText('Hypothesis "New Name" saved as revision 1.');
    expect(screen.queryByRole("button", CANCEL_BUTTON)).toBeNull();
  });
});

describe("Cancel abandons the composition without writing a revision (criterion 2)", () => {
  it("issues no POST to the hypotheses endpoint when clicked, even after every field was filled in", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisForm(fetchMock);
    await fillValidForm("New Name");

    fireEvent.click(screen.getByRole("button", CANCEL_BUTTON));

    expect(postCallCount(fetchMock)).toBe(0);
  });
});

describe("Cancel returns the curator to the screen the composition was actually opened from (criterion 2)", () => {
  it("navigates back to the case simulation screen it was reached from, rather than a fixed destination such as the manifest builder", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({ [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS) }),
    );
    const openedFrom = `/cases/${SLUG}/simulation`;
    const router = await mountRevisionFormWithHistory(fetchMock, [openedFrom, revisePath("H1")]);
    expect(router.state.location.pathname).toBe(revisePath("H1"));

    fireEvent.click(await screen.findByRole("button", CANCEL_BUTTON));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(openedFrom);
    });
  });
});

describe("Cancel's offer does not turn on the hypothesis's own revision-release state (task's UNDERDETERMINED note)", () => {
  it("still renders Cancel when the hypothesis's highest existing revision has already been released", async () => {
    const releasedRevisions = {
      data: [
        {
          revision: 3,
          criterion: "Latest criterion text",
          collects: ["ConceptA"],
          resolution: {
            outcome: "resolved",
            referral: { action: "escalate", recipient: "supervisor" },
          },
          state: "released",
        },
      ],
    };
    const fetchMock = createFetchStub(
      baseHandlers({ [`GET ${revisionsPath("H1")}`]: () => jsonResponse(releasedRevisions) }),
    );
    await mountIsolatedRevise(fetchMock, revisePath("H1"));

    expect(await screen.findByRole("button", CANCEL_BUTTON)).toBeTruthy();
  });
});
