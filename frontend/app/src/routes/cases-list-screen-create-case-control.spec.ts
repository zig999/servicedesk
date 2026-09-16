import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { CasesListScreen } from "./cases-list-screen";

type FetchFn = (input: string | URL | Request) => Promise<Response>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function buildTestRouter() {
  const rootRoute = createRootRoute();
  const casesListRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases",
    component: CasesListScreen,
  });
  const caseCreateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/new",
    component: () => createElement("div", null, "Case Creation Placeholder"),
  });
  const routeTree = rootRoute.addChildren([casesListRoute, caseCreateRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/cases"] }),
  });
}

async function mountWithReading(handlers: Record<string, () => Response | Promise<Response>>) {
  const fetchMock: FetchFn = vi.fn(async (input) => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(
        `cases-list-screen-create-case-control.spec.ts: no mocked response registered for ${url}`,
      );
    }
    return handler();
  });
  vi.stubGlobal("fetch", fetchMock);

  const router = buildTestRouter();
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

afterEach(() => {
  vi.unstubAllGlobals();
});

const READINGS: readonly {
  readonly name: string;
  readonly handlers: Record<string, () => Response | Promise<Response>>;
}[] = [
  {
    name: "a read still outstanding",
    handlers: { "/v1/cases": () => new Promise<Response>(() => {}) },
  },
  {
    name: "a read that failed",
    handlers: {
      "/v1/cases": () => {
        throw new Error("network down");
      },
    },
  },
  {
    name: "a read that answered no case at all",
    handlers: {
      "/v1/cases": () => jsonResponse({ data: [], total: 0, limit: 20, offset: 0, pageCount: 0 }),
    },
  },
  {
    name: "a read that answered at least one case",
    handlers: {
      "/v1/cases": () =>
        jsonResponse({
          data: [{ slug: "case-x" }],
          total: 1,
          limit: 20,
          offset: 0,
          pageCount: 1,
        }),
      "/v1/cases/case-x/versions?limit=1&offset=0": () =>
        jsonResponse({
          data: [{ version: 1, state: "draft" }],
          total: 1,
          limit: 1,
          offset: 0,
          pageCount: 1,
        }),
      "/v1/cases/case-x/versions/1": () => jsonResponse({ authored_at: "2024-01-01T00:00:00.000Z" }),
    },
  },
];

describe(
  "CasesListScreen — the header's Create case control " +
    "(task/case-creation-screen-corrective/wire-case-creation-to-a-real-screen-and-route, criterion 1; " +
    "rules/knowledge/a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading)",
  () => {
    it(
      "offers an always-enabled Create case control that navigates to /cases/new, whichever " +
        "reading the case listing is currently in -- outstanding, failed, answering no case, or " +
        "answering at least one",
      async () => {
        for (const reading of READINGS) {
          const router = await mountWithReading(reading.handlers);

          const button = await screen.findByRole("button", { name: "Create case" });
          expect(
            button.hasAttribute("disabled"),
            `expected the Create case control to be enabled during ${reading.name}`,
          ).toBe(false);

          fireEvent.click(button);
          await waitFor(() => {
            expect(
              router.state.location.pathname,
              `expected clicking Create case during ${reading.name} to navigate to /cases/new`,
            ).toBe("/cases/new");
          });

          vi.unstubAllGlobals();
        }
      },
    );
  },
);
