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

export function findRow(hypothesisName: string): HTMLElement {
  return screen.getByRole("row", { name: new RegExp(hypothesisName) });
}

export function clickRemoveTrigger(hypothesisName: string): void {
  const row = findRow(hypothesisName);
  fireEvent.click(within(row).getByRole("button", { name: "Remove" }));
}

export function dialogConfirmRemoveButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Remove" });
}

export function dialogCancelButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" });
}
