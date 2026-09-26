import { createElement } from "react";
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
// Walking the case-not-found and case-holds-versions refusals through two separate mounts inside
// one test body to compare their rendered text directly; automatic cleanup only runs between
// separate it()s, not between renders inside one, so the first render is unmounted by hand before
// the second one replaces it.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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

const SLUG = "case-refused-delete";
const VERSIONS_PATH = `/v1/cases/${SLUG}/versions`;
const DELETE_PATH = `/v1/cases/${SLUG}`;
const CASES_PATH = "/v1/cases";
const SLUG_VERSIONS_SUMMARY_PATH = `/v1/cases/${SLUG}/versions?limit=1&offset=0`;

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type FetchResponder = () => Response | Promise<Response>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown,
): Response {
  const envelope =
    details === undefined ? { error: { code, message } } : { error: { code, message, details } };
  return new Response(JSON.stringify(envelope), { status });
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
      throw new Error(`case-detail-screen-delete-refusal proof: no mocked response for ${key}`);
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

async function triggerDelete(): Promise<void> {
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

describe(
  "CaseDetailScreen's delete control -- presenting a CaseHoldsVersionsError refusal " +
    "(criterion 1; rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete)",
  () => {
    it("presents a CaseHoldsVersionsError refusal as the case still holding a version and not having been deleted", async () => {
      const fetchMock = createFetchStub({
        [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [] }),
        [`DELETE ${DELETE_PATH}`]: () =>
          errorResponse(409, "CaseHoldsVersionsError", "the case still holds a version", {
            slug: SLUG,
          }),
      });
      await mount(fetchMock);
      await screen.findByText("This case currently holds no version.");

      await triggerDelete();

      const message = await screen.findByText(/not deleted/i);
      expect(message.textContent).toMatch(/version/i);
    });
  },
);

describe(
  "CaseDetailScreen's delete control -- presenting a CaseNotFoundError refusal " +
    "(criterion 2; UNDERDETERMINED entry 1; rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete)",
  () => {
    it("presents a CaseNotFoundError refusal as the case not having been deleted and no case answering the slug", async () => {
      const fetchMock = createFetchStub({
        [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [] }),
        [`DELETE ${DELETE_PATH}`]: () =>
          errorResponse(404, "CaseNotFoundError", "no case answers the named slug", {
            slug: SLUG,
          }),
      });
      await mount(fetchMock);
      await screen.findByText("This case currently holds no version.");

      await triggerDelete();

      const message = await screen.findByText(/not deleted/i);
      expect(message.textContent).toContain(SLUG);
      expect(message.textContent).toMatch(/no case answers/i);
    });
  },
);

describe(
  "CaseDetailScreen's delete control -- the two named refusals told apart (criterion 3)",
  () => {
    it("renders different text for a CaseHoldsVersionsError refusal than for a CaseNotFoundError refusal", async () => {
      const holdsVersionsFetch = createFetchStub({
        [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [] }),
        [`DELETE ${DELETE_PATH}`]: () =>
          errorResponse(409, "CaseHoldsVersionsError", "the case still holds a version", {
            slug: SLUG,
          }),
      });
      await mount(holdsVersionsFetch);
      await screen.findByText("This case currently holds no version.");
      await triggerDelete();
      const holdsVersionsText = (await screen.findByText(/not deleted/i)).textContent;

      cleanup();
      vi.unstubAllGlobals();

      const notFoundFetch = createFetchStub({
        [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [] }),
        [`DELETE ${DELETE_PATH}`]: () =>
          errorResponse(404, "CaseNotFoundError", "no case answers the named slug", {
            slug: SLUG,
          }),
      });
      await mount(notFoundFetch);
      await screen.findByText("This case currently holds no version.");
      await triggerDelete();
      const notFoundText = (await screen.findByText(/not deleted/i)).textContent;

      expect(holdsVersionsText).not.toBe(notFoundText);
    });
  },
);

describe(
  "CaseDetailScreen's delete control -- presenting an unrecognised refusal (criterion 4; " +
    "UNDERDETERMINED entry 2; " +
    "rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure)",
  () => {
    it("presents any other refusal as a failure distinct from both named refusals, disclosing neither its code, its message, nor any carried value", async () => {
      const SECRET_MESSAGE = "connection reset while committing the delete transaction";
      const SECRET_DETAIL = "trace-9f31-do-not-leak";
      const fetchMock = createFetchStub({
        [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [] }),
        [`DELETE ${DELETE_PATH}`]: () =>
          errorResponse(500, "INTERNAL_ERROR", SECRET_MESSAGE, { traceId: SECRET_DETAIL }),
      });
      await mount(fetchMock);
      await screen.findByText("This case currently holds no version.");

      await triggerDelete();

      const message = await screen.findByText(/recognis|recogniz/i);
      const text = message.textContent ?? "";
      expect(text).toMatch(/fail/i);
      expect(text).not.toContain("INTERNAL_ERROR");
      expect(text).not.toContain(SECRET_MESSAGE);
      expect(text).not.toContain(SECRET_DETAIL);
      expect(text).not.toMatch(/no case answers/i);
      expect(text.toLowerCase()).not.toMatch(/still holds/);
    });
  },
);

describe(
  "CaseDetailScreen's delete control -- the cases listing once a CaseHoldsVersionsError refusal is met (criterion 5)",
  () => {
    it("still lists the refused case's own slug on the cases listing once a CaseHoldsVersionsError refusal is met", async () => {
      const fetchMock = createFetchStub({
        [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [] }),
        [`DELETE ${DELETE_PATH}`]: () =>
          errorResponse(409, "CaseHoldsVersionsError", "the case still holds a version", {
            slug: SLUG,
          }),
        [`GET ${CASES_PATH}`]: () => jsonResponse(paginated([{ slug: SLUG }])),
        [`GET ${SLUG_VERSIONS_SUMMARY_PATH}`]: () => jsonResponse(paginated([])),
      });
      const router = await mount(fetchMock);
      await screen.findByText("This case currently holds no version.");

      await triggerDelete();
      await screen.findByText(/not deleted/i);

      await act(async () => {
        await router.navigate({ to: "/cases" });
      });

      await screen.findByText(SLUG);
    });
  },
);
