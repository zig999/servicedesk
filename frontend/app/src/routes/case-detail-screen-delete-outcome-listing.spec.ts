import { createElement } from "react";
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CaseDetailScreen } from "./case-detail-screen";
import { CasesListScreen } from "./cases-list-screen";

const SLUG = "case-to-delete";
const OTHER_SLUG = "case-that-stays";
const VERSIONS_PATH = `/v1/cases/${SLUG}/versions`;
const DELETE_PATH = `/v1/cases/${SLUG}`;
const CASES_PATH = "/v1/cases";
const OTHER_VERSIONS_SUMMARY_PATH = `/v1/cases/${OTHER_SLUG}/versions?limit=1&offset=0`;

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type FetchResponder = () => Response | Promise<Response>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

function paginated<T>(data: readonly T[]): {
  data: readonly T[];
  total: number;
  limit: number;
  offset: number;
  pageCount: number;
} {
  return { data, total: data.length, limit: 20, offset: 0, pageCount: 1 };
}

function createFetchStub(handlers: Record<string, FetchResponder>): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const key = `${method} ${url}`;
    const handler = handlers[key];
    if (!handler) {
      throw new Error(
        `case-detail-screen-delete-outcome-listing proof: no mocked response for ${key}`,
      );
    }
    return handler();
  });
}

function buildRouter(initialPath: string) {
  const rootRoute = createRootRoute();
  const caseDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug",
    component: CaseDetailScreen,
  });
  const casesListRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases",
    component: CasesListScreen,
  });
  const routeTree = rootRoute.addChildren([caseDetailRoute, casesListRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

async function mount(fetchMock: FetchFn): Promise<ReturnType<typeof buildRouter>> {
  vi.stubGlobal("fetch", fetchMock);
  const router = buildRouter(`/cases/${SLUG}`);
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

async function deleteTheCase(): Promise<void> {
  fireEvent.click(await screen.findByRole("button", { name: "Delete case" }));
  await screen.findByRole("dialog");
  const input = screen.getByLabelText(`Type ${SLUG} to confirm`);
  fireEvent.change(input, { target: { value: SLUG } });
  const confirmButton = within(screen.getByRole("dialog")).getByRole("button", {
    name: "Delete case",
  });
  fireEvent.click(confirmButton);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseDetailScreen's delete control -- the cases listing once the delete is accepted (criteria 3 and 4)", () => {
  it("no longer lists the deleted case's own slug and still lists every other case once the curator lands on the cases listing", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [] }),
      [`DELETE ${DELETE_PATH}`]: () => noContentResponse(),
      [`GET ${CASES_PATH}`]: () => jsonResponse(paginated([{ slug: OTHER_SLUG }])),
      [`GET ${OTHER_VERSIONS_SUMMARY_PATH}`]: () => jsonResponse(paginated([])),
    });
    const router = await mount(fetchMock);
    await screen.findByText("This case currently holds no version.");

    await deleteTheCase();

    await screen.findByText(OTHER_SLUG);
    expect(router.state.location.pathname).toBe("/cases");
    expect(screen.queryByText(SLUG)).toBeNull();
  });
});
