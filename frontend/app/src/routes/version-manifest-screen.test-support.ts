import { createElement } from "react";
import { vi, type Mock } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { VersionManifestScreen } from "./version-manifest-screen";

// Shared fixtures and mounting helpers for task/manifest-hypothesis-authoring/
// manifest-builder's proof, split across version-manifest-screen-load.spec.ts,
// version-manifest-screen-reorder.spec.ts, version-manifest-screen-remove.spec.ts and
// version-manifest-screen-conflict.spec.ts to stay under this project's own max-lines
// rule. VersionManifestScreen reads its own route's slug/version through useParams()
// and renders a Link ("+ Add hypothesis"), so -- exactly like every other screen's own
// test-support module -- it needs a real router context rather than a bare render.
//
// The hook issues exactly one GET on every visit (the draft version, whose own
// `manifest` field this screen reads) and one isolated PUT or DELETE per row action, so
// the fetch stub below is keyed by "METHOD path", mirroring every other screen test-
// support module's own convention. A key this test does not register throws, so a
// request nobody expected fails the test loudly rather than hanging it.

export type FetchResponder = () => Response | Promise<Response>;

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export function createFetchStub(handlers: Record<string, FetchResponder>): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const key = `${method} ${url}`;
    const handler = handlers[key];
    if (!handler) {
      throw new Error(
        `version-manifest-screen.spec.ts: no mocked response registered for ${key}`,
      );
    }
    return handler();
  });
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

export function apiErrorResponse(code: string, status: number, message: string): Response {
  return jsonResponse({ error: { code, message } }, status);
}

/** Consumes one entry of `responses` per call, staying on the last one once exhausted -- lets a
 * test control exactly what the initial GET answers versus what a later refetch (after a
 * successful PUT/DELETE) answers. */
export function sequentialGetHandler(responses: readonly unknown[]): FetchResponder {
  let call = 0;
  return () => {
    const body = responses[Math.min(call, responses.length - 1)];
    call += 1;
    return jsonResponse(body);
  };
}

export const SLUG = "some-slug";
export const VERSION = 3;
export const VERSION_PATH = `/v1/cases/${SLUG}/versions/${VERSION}`;
export const MANIFEST_ROUTE_PATH = `/cases/${SLUG}/versions/${VERSION}/manifest`;
export const NEW_HYPOTHESIS_PATH = `${MANIFEST_ROUTE_PATH}/hypotheses/new`;

export function manifestPath(hypothesisName: string): string {
  return `${VERSION_PATH}/manifest/${encodeURIComponent(hypothesisName)}`;
}

export function entry(
  position: number,
  name: string,
  revision: number,
): { position: number; hypothesis_revision: { hypothesis: { name: string }; revision: number } } {
  return { position, hypothesis_revision: { hypothesis: { name }, revision } };
}

export const ONE_ENTRY_MANIFEST = { manifest: [entry(1, "Solo", 1)] };
export const TWO_ENTRY_MANIFEST = { manifest: [entry(1, "H1", 2), entry(2, "H2", 5)] };
export const THREE_ENTRY_MANIFEST = {
  manifest: [entry(1, "H1", 2), entry(2, "H2", 5), entry(3, "H3", 9)],
};

function buildTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const manifestRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest",
    component: VersionManifestScreen,
  });
  // A dummy leaf so "+ Add hypothesis" (criterion 10) has a real route to resolve an
  // href against -- what renders there is the shared hypothesis form's own concern,
  // not this proof's.
  const newHypothesisRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest/hypotheses/new",
    component: () => createElement("div", null, "New Hypothesis Placeholder"),
  });
  const routeTree = rootRoute.addChildren([manifestRoute, newHypothesisRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

// Named "mount", not "render", matching every other screen test-support module's own
// testing-library/render-result-naming-convention precedent for a helper shaped this way.
export async function mountManifestScreen(
  fetchMock: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
  initialPath: string = MANIFEST_ROUTE_PATH,
): Promise<ReturnType<typeof buildTestRouter>> {
  vi.stubGlobal("fetch", fetchMock);
  const router = buildTestRouter(initialPath);
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

function callsFor(fetchMock: ReturnType<typeof createFetchStub>, method: string) {
  return fetchMock.mock.calls.filter(([, init]) => (init?.method ?? "GET") === method);
}

export function putCallCount(fetchMock: ReturnType<typeof createFetchStub>): number {
  return callsFor(fetchMock, "PUT").length;
}

export function deleteCallCount(fetchMock: ReturnType<typeof createFetchStub>): number {
  return callsFor(fetchMock, "DELETE").length;
}

export function getCallCount(fetchMock: ReturnType<typeof createFetchStub>): number {
  return callsFor(fetchMock, "GET").length;
}

export function parsedPutBody(
  fetchMock: ReturnType<typeof createFetchStub>,
  callIndex = 0,
): unknown {
  const rawBody = callsFor(fetchMock, "PUT")[callIndex]?.[1]?.body;
  if (typeof rawBody !== "string") {
    throw new Error("expected a PUT call carrying a JSON string body");
  }
  return JSON.parse(rawBody);
}

/** Finds a manifest row by its own hypothesis name, appearing somewhere in that row's own
 * accessible name (position, "name · rev N" text, and its action buttons' own labels). */
export function findRow(hypothesisName: string): HTMLElement {
  return screen.getByRole("row", { name: new RegExp(hypothesisName) });
}

/** Clicks a row's own Remove trigger, opening the confirmation dialog (EDG-04) -- never
 * issuing the DELETE by itself. */
export function clickRemoveTrigger(hypothesisName: string): void {
  const row = findRow(hypothesisName);
  fireEvent.click(within(row).getByRole("button", { name: "Remove" }));
}

/** The dialog's own destructive confirm button -- distinct from the row's own Remove
 * trigger, which stays mounted (outside the portal) while the dialog is open. */
export function dialogConfirmRemoveButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Remove" });
}

export function dialogCancelButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" });
}
