import { createElement } from "react";
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CaseDetailScreen } from "./case-detail-screen";

const SLUG = "case-alpha";
const VERSIONS_PATH = `/v1/cases/${SLUG}/versions`;
const DELETE_PATH = `/v1/cases/${SLUG}`;

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type FetchResponder = () => Response | Promise<Response>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

function createFetchStub(handlers: Record<string, FetchResponder>): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const key = `${method} ${url}`;
    const handler = handlers[key];
    if (!handler) {
      throw new Error(`case-detail-screen-delete-control proof: no mocked response for ${key}`);
    }
    return handler();
  });
}

function deleteCalls(
  fetchMock: ReturnType<typeof createFetchStub>,
): (readonly [string | URL | Request, RequestInit?])[] {
  return fetchMock.mock.calls.filter(
    ([, init]) => (init?.method ?? "GET").toUpperCase() === "DELETE",
  );
}

function buildRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const caseDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug",
    component: CaseDetailScreen,
  });
  const casesListRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases",
    component: () => createElement("div", null, "Cases Listing Placeholder"),
  });
  const caseVersionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version",
    component: () => null,
  });
  const newDraftRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/new",
    component: () => null,
  });
  const routeTree = rootRoute.addChildren([
    caseDetailRoute,
    casesListRoute,
    caseVersionRoute,
    newDraftRoute,
  ]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

async function mountCaseDetail(fetchMock: FetchFn): Promise<ReturnType<typeof buildRouter>> {
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

function deleteTrigger(): HTMLElement {
  return screen.getByRole("button", { name: "Delete case" });
}

function deleteConfirmButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Delete case" });
}

function keepCaseButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Keep case" });
}

function typeSlugConfirmation(value: string): void {
  const input = screen.getByLabelText(`Type ${SLUG} to confirm`);
  fireEvent.change(input, { target: { value } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseDetailScreen's delete control -- its own visibility (criterion 1)", () => {
  it("offers a Delete case control once the case's own versions read answers no version", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [] }),
    });
    await mountCaseDetail(fetchMock);

    await screen.findByText("This case currently holds no version.");
    expect(deleteTrigger()).toBeTruthy();
  });

  it("renders no Delete case control when the case holds at least one version", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [{ version: 1, state: "draft" }] }),
      [`GET /v1/cases/${SLUG}/versions/1`]: () => jsonResponse({}),
    });
    await mountCaseDetail(fetchMock);

    await screen.findByRole("table");
    expect(screen.queryByRole("button", { name: "Delete case" })).toBeNull();
  });
});

describe("CaseDetailScreen's delete control -- the further explicit act reproducing the case's own slug (rules/knowledge/a-case-deletion-takes-a-further-explicit-act-reproducing-the-cases-own-slug; UNDERDETERMINED entries 1 and 2; criterion 2)", () => {
  it("issues a DELETE to /v1/cases/:slug only once the curator both opens the control and reproduces the case's own slug exactly in a further confirm -- never on opening alone, never on a mismatched act, and never on declining", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [] }),
      [`DELETE ${DELETE_PATH}`]: () => noContentResponse(),
    });
    await mountCaseDetail(fetchMock);
    await screen.findByText("This case currently holds no version.");

    fireEvent.click(deleteTrigger());
    await screen.findByRole("dialog");
    expect(deleteCalls(fetchMock)).toHaveLength(0);

    typeSlugConfirmation(SLUG.toUpperCase());
    expect(deleteConfirmButton().hasAttribute("disabled")).toBe(true);
    fireEvent.click(deleteConfirmButton());
    expect(deleteCalls(fetchMock)).toHaveLength(0);

    fireEvent.click(keepCaseButton());
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(deleteCalls(fetchMock)).toHaveLength(0);

    fireEvent.click(deleteTrigger());
    await screen.findByRole("dialog");
    typeSlugConfirmation(SLUG);
    expect(deleteConfirmButton().hasAttribute("disabled")).toBe(false);
    fireEvent.click(deleteConfirmButton());

    await waitFor(() => expect(deleteCalls(fetchMock)).toHaveLength(1));
    const [[url, init]] = deleteCalls(fetchMock);
    expect(typeof url === "string" ? url : url.toString()).toBe(DELETE_PATH);
    expect(init?.method).toBe("DELETE");
  });
});

describe("CaseDetailScreen's delete control -- exactly one DELETE despite a double click (criterion 2 boundary)", () => {
  it("issues exactly one DELETE even when the confirm control is clicked twice in quick succession", async () => {
    let resolveDelete: (response: Response) => void = () => {};
    const deletePromise = new Promise<Response>((resolve) => {
      resolveDelete = resolve;
    });
    const fetchMock = createFetchStub({
      [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [] }),
      [`DELETE ${DELETE_PATH}`]: () => deletePromise,
    });
    await mountCaseDetail(fetchMock);
    await screen.findByText("This case currently holds no version.");

    fireEvent.click(deleteTrigger());
    await screen.findByRole("dialog");
    typeSlugConfirmation(SLUG);
    const confirmButton = deleteConfirmButton();
    fireEvent.click(confirmButton);
    await waitFor(() => expect(confirmButton.hasAttribute("disabled")).toBe(true));
    fireEvent.click(confirmButton);

    await act(async () => {
      resolveDelete(noContentResponse());
    });

    expect(deleteCalls(fetchMock)).toHaveLength(1);
  });
});

describe("CaseDetailScreen's delete control -- where the curator lands after an accepted delete (rules/knowledge/a-successful-case-deletion-lands-on-the-listing-of-every-case; UNDERDETERMINED entry 3)", () => {
  it("navigates to the cases listing route once the delete is accepted, rather than staying on the deleted case's own detail route", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [] }),
      [`DELETE ${DELETE_PATH}`]: () => noContentResponse(),
    });
    const router = await mountCaseDetail(fetchMock);
    await screen.findByText("This case currently holds no version.");

    fireEvent.click(deleteTrigger());
    await screen.findByRole("dialog");
    typeSlugConfirmation(SLUG);
    fireEvent.click(deleteConfirmButton());

    await waitFor(() => expect(router.state.location.pathname).toBe("/cases"));
  });
});
