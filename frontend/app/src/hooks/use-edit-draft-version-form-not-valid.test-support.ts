import { createElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterContextProvider,
} from "@tanstack/react-router";

export const SLUG = "some-slug";
export const VERSION = 3;

export function versionPath(version: number = VERSION): string {
  return `/v1/cases/${SLUG}/versions/${version}`;
}

export function declaredAttributesPath(version: number = VERSION): string {
  return `/v1/cases/${SLUG}/versions/${version}/declared-attributes`;
}

export const VERSIONS_LIST_PATH = `/v1/cases/${SLUG}/versions`;

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function notValidResponse(): Response {
  return jsonResponse(
    { error: { code: "CaseVersionNotValidError", message: "validation failed" } },
    409,
  );
}

export function unrecognizedErrorResponse(): Response {
  return jsonResponse({ error: { code: "SomeUnrecognizedError", message: "SECRET-MESSAGE" } }, 500);
}

export function versionsListResponse(
  entries: ReadonlyArray<{ version: number; state: "draft" | "released" }>,
): Response {
  return jsonResponse({ data: entries });
}

const GLOSSARY_HANDLERS: Record<string, () => Response> = {
  "GET /v1/glossary/outcome": () => jsonResponse({ data: [] }),
  "GET /v1/glossary/action": () => jsonResponse({ data: [] }),
  "GET /v1/glossary/recipient": () => jsonResponse({ data: [] }),
};

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

// Handler keys are "METHOD url" (e.g. "GET /v1/cases/some-slug/versions/3"), a GET assumed
// where a caller registers a bare url; declaredAttributesPath()/versionPath()/VERSIONS_LIST_PATH
// stay GET-only throughout this proof, so every read registered below is keyed that way.
export function stubFetch(
  handlers: Record<string, () => Response | Promise<Response>>,
): Mock<FetchFn> {
  const merged = { ...GLOSSARY_HANDLERS, ...handlers };
  const fetchMock = vi.fn(
    async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      const method = (init?.method ?? "GET").toUpperCase();
      const key = `${method} ${url}`;
      const handler = merged[key];
      if (!handler) {
        throw new Error(
          `use-edit-draft-version-form not-valid proof: no mocked response for ${key}`,
        );
      }
      return handler();
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

export function patchCallCount(fetchMock: Mock<FetchFn>): number {
  return fetchMock.mock.calls.filter(([, init]) => init?.method === "PATCH").length;
}

// A concrete (non-generic) helper: ReturnType<typeof buildRouter> below resolves against this
// function's own inferred body rather than against createRouter's generic default, which is
// what let router keep its exact, narrow type through createRouterWrapper's own explicit
// return-type annotation.
function buildRouter(entries: readonly string[]) {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const placeholderRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version",
    component: () => createElement("div", null, "Placeholder"),
  });
  return createRouter({
    routeTree: rootRoute.addChildren([placeholderRoute]),
    history: createMemoryHistory({ initialEntries: [...entries] }),
  });
}

export function createRouterWrapper(
  entries: readonly string[] = [`/cases/${SLUG}/versions/${VERSION}`],
): {
  Wrapper: (props: { children: ReactNode }) => ReactNode;
  router: ReturnType<typeof buildRouter>;
  queryClient: QueryClient;
} {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = buildRouter(entries);
  const Wrapper = ({ children }: { children: ReactNode }): ReactNode =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      // eslint-disable-next-line react/no-children-prop -- RouterContextProvider's own prop type requires children inside this same props object for TypeScript to infer TRouter from router; passing children as a third createElement argument instead breaks that inference (PRH-03).
      createElement(RouterContextProvider, { router, children }),
    );
  return { Wrapper, router, queryClient };
}
