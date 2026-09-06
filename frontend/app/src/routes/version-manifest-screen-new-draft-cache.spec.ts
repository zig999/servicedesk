import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NewCaseDraftScreen } from "./new-case-draft-screen";
import { VersionManifestScreen } from "./version-manifest-screen";
import {
  baseHandlers,
  CREATE_PATH,
  createFetchStub,
  fillValidForm,
  jsonResponse,
  NEW_DRAFT_PATH,
  postCallCount,
  SLUG,
  SUBJECT_TYPE_TERMS,
  versionPath,
} from "./new-case-draft-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function buildSharedRouter() {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const newDraftRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/new",
    component: NewCaseDraftScreen,
  });
  const manifestRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest",
    component: VersionManifestScreen,
  });
  const routeTree = rootRoute.addChildren([newDraftRoute, manifestRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [NEW_DRAFT_PATH] }),
  });
}

async function mountThenCreateDraft(
  fetchMock: ReturnType<typeof createFetchStub>,
): Promise<ReturnType<typeof buildSharedRouter>> {
  vi.stubGlobal("fetch", fetchMock);
  const router = buildSharedRouter();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await router.load();
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RouterProvider, { router }),
    ),
  );
  await fillValidForm();
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() => {
    expect(postCallCount(fetchMock)).toBe(1);
  });
  return router;
}

describe("VersionManifestScreen — opened right after a new draft is created, before its own editor screen has read anything back", () => {
  it("renders the manifest rows drawn from the backend's own record instead of throwing when the created draft's manifest holds one hypothesis", async () => {
    const NEW_VERSION = 9;
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: SLUG, version: NEW_VERSION }, 201),
        [`GET ${versionPath(NEW_VERSION)}`]: () =>
          jsonResponse({
            title: "Copied from the released version",
            when_to_use: "Copied use",
            subject: SUBJECT_TYPE_TERMS.data[0].name,
            fallback: {
              outcome: "resolved",
              referral: { action: "escalate", recipient: "supervisor" },
            },
            state: "draft",
            manifest: [
              { position: 1, hypothesis_revision: { hypothesis: { name: "Solo" }, revision: 1 } },
            ],
          }),
      }),
    );
    const router = await mountThenCreateDraft(fetchMock);

    await act(async () => {
      await router.navigate({
        to: "/cases/$slug/versions/$version/manifest",
        params: { slug: SLUG, version: String(NEW_VERSION) },
      });
    });

    expect(await screen.findByRole("row", { name: /Solo/ })).toBeTruthy();
  });

  it("reflects the created draft's own state once read back, rather than a missing value defaulting to editable", async () => {
    const NEW_VERSION = 11;
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: SLUG, version: NEW_VERSION }, 201),
        [`GET ${versionPath(NEW_VERSION)}`]: () =>
          jsonResponse({
            title: "Copied from the released version",
            when_to_use: "Copied use",
            subject: SUBJECT_TYPE_TERMS.data[0].name,
            fallback: {
              outcome: "resolved",
              referral: { action: "escalate", recipient: "supervisor" },
            },
            state: "released",
            manifest: [
              { position: 1, hypothesis_revision: { hypothesis: { name: "H1" }, revision: 2 } },
              { position: 2, hypothesis_revision: { hypothesis: { name: "H2" }, revision: 5 } },
            ],
          }),
      }),
    );
    const router = await mountThenCreateDraft(fetchMock);

    await act(async () => {
      await router.navigate({
        to: "/cases/$slug/versions/$version/manifest",
        params: { slug: SLUG, version: String(NEW_VERSION) },
      });
    });

    const moveDownButton = await screen.findByRole<HTMLButtonElement>("button", {
      name: "Move H1 down",
    });
    expect(moveDownButton.disabled).toBe(true);
  });

  it("shows the pending \"Loading manifest…\" statement rather than an empty, zero-row manifest table while the created draft's own record has not yet been read back", async () => {
    const NEW_VERSION = 13;
    let resolveGet: (response: Response) => void = () => {};
    const getPromise = new Promise<Response>((resolve) => {
      resolveGet = resolve;
    });
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: SLUG, version: NEW_VERSION }, 201),
        [`GET ${versionPath(NEW_VERSION)}`]: () => getPromise,
      }),
    );
    const router = await mountThenCreateDraft(fetchMock);

    await act(async () => {
      await router.navigate({
        to: "/cases/$slug/versions/$version/manifest",
        params: { slug: SLUG, version: String(NEW_VERSION) },
      });
    });

    expect(screen.getByText("Loading manifest…")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("row")).toBeNull();

    await act(async () => {
      resolveGet(
        jsonResponse({
          title: "Copied from the released version",
          when_to_use: "Copied use",
          subject: SUBJECT_TYPE_TERMS.data[0].name,
          fallback: {
            outcome: "resolved",
            referral: { action: "escalate", recipient: "supervisor" },
          },
          state: "draft",
          manifest: [
            { position: 1, hypothesis_revision: { hypothesis: { name: "Solo" }, revision: 1 } },
          ],
        }),
      );
    });
    expect(await screen.findByRole("row", { name: /Solo/ })).toBeTruthy();
  });
});
