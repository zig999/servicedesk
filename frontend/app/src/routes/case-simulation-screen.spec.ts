import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CaseSimulationScreen } from "./case-simulation-screen";
import type { CaseVersionRecord } from "../services/case-version-record";

// task/simulation-cockpit/case-simulation-route's own screen, end to end
// through the real router, the real useCaseSimulationVersion hook and the
// real ready-view/header composition -- proving criterion 1's own "resolves
// for both a draft and a released version's slug/version pair" and EDG-01/
// EDG-02, unlike case-simulation-header.spec.ts and
// case-simulation-ready-view.spec.ts, which each mount their own unit
// directly with hand-built props. Mirrors case-version-editor-screen.
// test-support.ts's own established mounting shape for a screen that reads
// its own route's params.

const SLUG = "some-slug";
const VERSION = 3;
const VERSION_PATH = `/v1/cases/${SLUG}/versions/${VERSION}`;

const RECORD: CaseVersionRecord = {
  title: "Some title",
  when_to_use: "Use when the customer disputes a charge",
  subject: "billing-dispute",
  fallback: { outcome: "resolved", referral: { action: "notify", recipient: "customer" } },
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

type FetchFn = (input: string | URL | Request) => Promise<Response>;

function buildTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const simulateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/simulate",
    component: CaseSimulationScreen,
  });
  const routeTree = rootRoute.addChildren([simulateRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

async function mountCaseSimulationScreen(
  fetchMock: FetchFn,
  initialPath = `/cases/${SLUG}/versions/${VERSION}/simulate`,
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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseSimulationScreen -- loading (EDG-01)", () => {
  it("renders an explicit loading state before the version resolves", async () => {
    const fetchMock: FetchFn = () => new Promise<Response>(() => {});
    await mountCaseSimulationScreen(fetchMock);

    expect(screen.getByText(`Loading version ${VERSION}…`)).toBeTruthy();
  });
});

describe("CaseSimulationScreen -- load failure (EDG-02, and this task's own recorded inference: no navigate-away)", () => {
  it("degrades to a typed error state offering a retry that reissues the request, without navigating away from this route", async () => {
    let shouldFail = true;
    const fetchMock = vi.fn(async (): Promise<Response> => {
      if (shouldFail) {
        throw new Error("network down");
      }
      return jsonResponse({ ...RECORD, state: "draft" });
    });

    const router = await mountCaseSimulationScreen(fetchMock);

    expect(await screen.findByText("Unable to load this version right now.")).toBeTruthy();
    const callsBeforeRetry = fetchMock.mock.calls.length;

    shouldFail = false;
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBeforeRetry));
    expect(router.state.location.pathname).toBe(`/cases/${SLUG}/versions/${VERSION}/simulate`);
  });
});

describe("CaseSimulationScreen -- resolving for a draft version (criterion 1)", () => {
  it("renders the ready header for a draft version's own slug/version pair", async () => {
    const fetchMock: FetchFn = async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url === VERSION_PATH) {
        return jsonResponse({ ...RECORD, state: "draft" });
      }
      throw new Error(`unexpected fetch: ${url}`);
    };
    await mountCaseSimulationScreen(fetchMock);

    expect(await screen.findByText("Draft")).toBeTruthy();
    expect(screen.getByText(`${SLUG} · v${VERSION}`)).toBeTruthy();
    const editLink = screen.getByRole("link", { name: "Edit version" });
    expect(editLink.getAttribute("href")).toBe(`/cases/${SLUG}/versions/${VERSION}`);
  });
});

describe("CaseSimulationScreen -- resolving for a released version (criterion 1)", () => {
  it("renders the ready header for a released version's own slug/version pair", async () => {
    const fetchMock: FetchFn = async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url === VERSION_PATH) {
        return jsonResponse({ ...RECORD, state: "released" });
      }
      throw new Error(`unexpected fetch: ${url}`);
    };
    await mountCaseSimulationScreen(fetchMock);

    expect(await screen.findByText("Released")).toBeTruthy();
    const editLink = screen.getByRole("link", { name: "Edit version" });
    const url = new URL(editLink.getAttribute("href") ?? "", "http://localhost");
    expect(url.pathname).toBe(`/cases/${SLUG}/versions/new`);
    expect(url.searchParams.get("sourceVersion")).toBe(String(VERSION));
  });
});
