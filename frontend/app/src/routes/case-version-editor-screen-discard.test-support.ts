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

// Shared fixtures and helpers for task/version-editor/discard-draft-version's own proof
// (case-version-editor-screen-discard.spec.ts). Builds on case-version-editor-screen.
// test-support.ts's own fixtures for the same reason release-draft-version's own
// test-support module does -- this task extends the very same hook and screen, never a
// second surface -- but supplies its own mounting helper: discard's own criterion 5
// navigates to a route ("/cases/$slug", Case Detail) that module's own test router never
// registers, since neither edit-draft-version nor release-draft-version ever navigates
// there.

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

/** A loaded version whose own state is draft -- the baseline every Discard-control test
 * starts from (LOADED_RECORD itself, edit-draft-version's own fixture, carries no `state`
 * field at all). */
export const DRAFT_RECORD = { ...LOADED_RECORD, state: "draft" as const };

export const RELEASED_RECORD = { ...LOADED_RECORD, state: "released" as const };

/** baseHandlers() (edit-draft-version's own fixture set: the version GET and the three
 * glossary GETs) with DRAFT_RECORD as the loaded version -- every Discard-control test's
 * own starting point, overridden per test as each one needs. */
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
  // Discard's own criterion 5 destination -- a dummy leaf, since what renders at Case
  // Detail is that screen's own concern, not this proof's; this test only needs a route
  // navigate({ to: "/cases/$slug" }) can actually resolve to.
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

// Named "mount", not "render", matching every other screen test-support module's own
// testing-library/render-result-naming-convention precedent for a helper shaped this way.
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

/** Opens the Discard Dialog from its own trigger, and waits for it to actually mount. */
export async function openDiscardDialog(): Promise<void> {
  const trigger = await screen.findByRole("button", { name: "Discard draft" });
  fireEvent.click(trigger);
  await screen.findByRole("dialog");
}

/** Distinct from the trigger above, which stays mounted (outside the portal, per this
 * app's own version-manifest-screen.test-support.ts precedent for an identically-worded
 * trigger/confirm pair) while the Dialog is open -- both carry the exact same accessible
 * name ("Discard draft"), so only a query scoped to the Dialog itself disambiguates them. */
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
