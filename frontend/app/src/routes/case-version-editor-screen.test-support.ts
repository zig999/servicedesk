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

  const casesListRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases",
    component: () => createElement("div", null, "Cases List Placeholder"),
  });

  const caseSimulationRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/simulate",
    component: () => createElement("div", null, "Simulation Cockpit Placeholder"),
  });
  const routeTree = rootRoute.addChildren([
    caseVersionRoute,
    casesListRoute,
    caseSimulationRoute,
  ]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

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
