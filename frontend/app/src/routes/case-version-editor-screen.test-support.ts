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
import { render } from "@testing-library/react";
import { CaseVersionEditorScreen } from "./case-version-editor-screen";

// Shared fixtures and mounting helpers for case-version-editor-screen.spec.ts and
// case-version-editor-screen-save.spec.ts (split across two files to stay under
// this project's own max-lines rule). CaseVersionEditorScreen reads its own
// route's slug/version through useParams({ from: "/cases/$slug/versions/$version" })
// and calls useNavigate() (for the 404 case), so -- exactly like
// case-detail-screen.spec.ts and cases-list-screen.spec.ts -- it needs a real router
// context rather than a bare render. This builds a small, self-contained test router
// (CaseVersionEditorScreen at its own route, plus a dummy "/cases" leaf so
// navigate({ to: "/cases" }) has a real route to resolve to) rather than reusing the
// production ten-route tree.
//
// The hook this screen composes issues four GETs (the version itself, and the
// outcome/action/recipient glossary vocabularies) and one PATCH (Save), so the fetch
// stub below is keyed by "METHOD path" rather than by path alone -- a case-version.tsx
// URL is read by GET and written by PATCH, and only the method tells them apart. A
// key this test does not register throws, so a request nobody expected fails the test
// loudly rather than hanging it, mirroring cases-list-screen.spec.ts's own
// stubFetchResponses convention.

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
        `case-version-editor-screen.spec.ts: no mocked response registered for ${key}`,
      );
    }
    return handler();
  });
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function apiErrorResponse(code: string, status: number, message: string): Response {
  return jsonResponse({ error: { code, message } }, status);
}

export const SLUG = "some-slug";
export const VERSION_PATH = `/v1/cases/${SLUG}/versions/3`;

export const LOADED_RECORD = {
  title: "Original title",
  when_to_use: "Use when the case needs manual review",
  subject: "billing-dispute",
  fallback: {
    outcome: "resolved",
    referral: { action: "escalate", recipient: "supervisor" },
  },
  consolidation_register: "formal",
};

export const RECORD_WITHOUT_REGISTER = {
  title: "No register title",
  when_to_use: LOADED_RECORD.when_to_use,
  subject: LOADED_RECORD.subject,
  fallback: LOADED_RECORD.fallback,
};

export const OUTCOME_TERMS = {
  data: [{ name: "resolved" }, { name: "pending" }, { name: "rejected" }],
};
export const ACTION_TERMS = { data: [{ name: "escalate" }, { name: "notify" }] };
export const RECIPIENT_TERMS = { data: [{ name: "supervisor" }, { name: "customer" }] };

export function baseHandlers(
  overrides: Record<string, FetchResponder> = {},
): Record<string, FetchResponder> {
  return {
    [`GET ${VERSION_PATH}`]: () => jsonResponse(LOADED_RECORD),
    "GET /v1/glossary/outcome": () => jsonResponse(OUTCOME_TERMS),
    "GET /v1/glossary/action": () => jsonResponse(ACTION_TERMS),
    "GET /v1/glossary/recipient": () => jsonResponse(RECIPIENT_TERMS),
    ...overrides,
  };
}

function buildTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const caseVersionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version",
    component: CaseVersionEditorScreen,
  });
  // A dummy leaf so "/cases" is a resolvable navigate() destination for the 404
  // case -- what renders there is cases-list-screen's own concern, not this
  // proof's.
  const casesListRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases",
    component: () => createElement("div", null, "Cases List Placeholder"),
  });
  const routeTree = rootRoute.addChildren([caseVersionRoute, casesListRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

// Named "mount", not "render": it returns the test router instance, not a render
// result, matching cases-list-screen.spec.ts's own testing-library/
// render-result-naming-convention precedent for a helper shaped this way.
export async function mountCaseVersionEditor(
  fetchMock: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
  initialPath = `/cases/${SLUG}/versions/3`,
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

export function patchCallCount(fetchMock: ReturnType<typeof createFetchStub>): number {
  return fetchMock.mock.calls.filter(([, init]) => init?.method === "PATCH").length;
}

export function parsedPatchBody(fetchMock: ReturnType<typeof createFetchStub>): unknown {
  const patchCalls = fetchMock.mock.calls.filter(([, init]) => init?.method === "PATCH");
  const rawBody = patchCalls[0]?.[1]?.body;
  if (typeof rawBody !== "string") {
    throw new Error("expected exactly one PATCH call carrying a JSON string body");
  }
  return JSON.parse(rawBody);
}
