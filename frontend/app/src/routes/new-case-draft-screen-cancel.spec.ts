import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NewCaseDraftScreen } from "./new-case-draft-screen";
import {
  baseHandlers,
  CREATE_PATH,
  createFetchStub,
  fillValidForm,
  jsonResponse,
  mountNewCaseDraft,
  postCallCount,
  SLUG,
  SUBJECT_TYPE_TERMS,
  VALID_FORM_INPUT,
  versionPath,
} from "./new-case-draft-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const CANCEL_BUTTON = { name: "Cancel" };

async function mountNewDraftWithHistory(
  fetchMock: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
  entries: readonly string[],
) {
  vi.stubGlobal("fetch", fetchMock);
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const openedFromRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug",
    component: () => createElement("div", null, "Case Detail Placeholder"),
  });
  const newDraftRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/new",
    component: NewCaseDraftScreen,
  });
  const routeTree = rootRoute.addChildren([openedFromRoute, newDraftRoute]);
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

describe("Cancel on a not-yet-created draft returns to the screen it was opened from (criterion 3)", () => {
  it("navigates back to the case detail screen it was opened from, rather than a fixed destination", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    const openedFrom = `/cases/${SLUG}`;
    const router = await mountNewDraftWithHistory(fetchMock, [
      openedFrom,
      `/cases/${SLUG}/versions/new`,
    ]);
    expect(router.state.location.pathname).toBe(`/cases/${SLUG}/versions/new`);

    fireEvent.click(await screen.findByRole("button", CANCEL_BUTTON));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(openedFrom);
    });
  });

  it("issues no POST /v1/cases when Cancel is clicked after the form was filled in", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountNewDraftWithHistory(fetchMock, [`/cases/${SLUG}`, `/cases/${SLUG}/versions/new`]);
    await fillValidForm();

    fireEvent.click(screen.getByRole("button", CANCEL_BUTTON));

    expect(postCallCount(fetchMock)).toBe(0);
  });
});

describe("The interval before a created draft's own record resolves offers no control at all (task's UNDERDETERMINED note)", () => {
  it("renders no Cancel button, and no button at all, only the still-being-read statement", async () => {
    let resolveGet: (response: Response) => void = () => {};
    const getPromise = new Promise<Response>((resolve) => {
      resolveGet = resolve;
    });
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: SLUG, version: 9 }, 201),
        [`GET ${versionPath(9)}`]: () => getPromise,
      }),
    );
    await mountNewCaseDraft(fetchMock);
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await screen.findByText("Loading…");
    expect(screen.queryByRole("button", CANCEL_BUTTON)).toBeNull();
    expect(screen.queryAllByRole("button")).toHaveLength(0);

    await act(async () => {
      resolveGet(
        jsonResponse({
          title: VALID_FORM_INPUT.title,
          when_to_use: VALID_FORM_INPUT.when_to_use,
          subject: SUBJECT_TYPE_TERMS.data[0].name,
          fallback: {
            outcome: VALID_FORM_INPUT.outcome,
            referral: {
              action: VALID_FORM_INPUT.action,
              recipient: VALID_FORM_INPUT.recipient,
            },
          },
          state: "draft",
        }),
      );
    });
  });
});
