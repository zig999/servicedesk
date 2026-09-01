import { createElement } from "react";
import { vi } from "vitest";
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
import { CaseVersionEditorScreen } from "./case-version-editor-screen";
import {
  apiErrorResponse,
  baseHandlers,
  createFetchStub,
  jsonResponse,
  LOADED_RECORD,
  SLUG,
  VERSION_PATH,
  type FetchResponder,
} from "./case-version-editor-screen.test-support";

export {
  apiErrorResponse,
  createFetchStub,
  jsonResponse,
  LOADED_RECORD,
  SLUG,
  VERSION_PATH,
};
export type { FetchResponder };

export function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

export const DRAFT_RECORD = { ...LOADED_RECORD, state: "draft" as const };

export const RELEASED_RECORD = { ...LOADED_RECORD, state: "released" as const };

export function discardHandlers(
  overrides: Record<string, FetchResponder> = {},
): Record<string, FetchResponder> {
  return baseHandlers({
    [`GET ${VERSION_PATH}`]: () => jsonResponse(DRAFT_RECORD),
    ...overrides,
  });
}

function buildDiscardTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const caseVersionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version",
    component: CaseVersionEditorScreen,
  });

  const caseDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug",
    component: () => createElement("div", null, "Case Detail Placeholder"),
  });
  const routeTree = rootRoute.addChildren([caseVersionRoute, caseDetailRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

export async function mountForDiscard(
  fetchMock: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
  initialPath = `/cases/${SLUG}/versions/3`,
): Promise<ReturnType<typeof buildDiscardTestRouter>> {
  vi.stubGlobal("fetch", fetchMock);
  const router = buildDiscardTestRouter(initialPath);
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

function callsFor(
  fetchMock: ReturnType<typeof createFetchStub>,
  method: string,
  path: string,
): unknown[] {
  return fetchMock.mock.calls.filter(([input, init]) => {
    const url = typeof input === "string" ? input : input.toString();
    return url === path && (init?.method ?? "GET").toUpperCase() === method;
  });
}

export function deleteCallCount(fetchMock: ReturnType<typeof createFetchStub>): number {
  return callsFor(fetchMock, "DELETE", VERSION_PATH).length;
}

export function deletePostInit(
  fetchMock: ReturnType<typeof createFetchStub>,
): RequestInit | undefined {
  const call = fetchMock.mock.calls.find(([input, init]) => {
    const url = typeof input === "string" ? input : input.toString();
    return url === VERSION_PATH && (init?.method ?? "GET").toUpperCase() === "DELETE";
  });
  return call?.[1];
}

export async function openDiscardDialog(): Promise<void> {
  const trigger = await screen.findByRole("button", { name: "Discard draft" });
  fireEvent.click(trigger);
  await screen.findByRole("dialog");
}

export function discardConfirmButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Discard draft" });
}

export function keepDraftButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Keep draft" });
}

export function typeSlugConfirmation(value: string): void {
  const input = screen.getByLabelText(`Type ${SLUG} to confirm`);
  fireEvent.change(input, { target: { value } });
}
