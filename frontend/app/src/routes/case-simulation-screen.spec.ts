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
// One test below mounts the simulation screen more than once inside a single test body to walk
// it through every reading the route rule names; automatic cleanup only runs between separate
// it()s, not between renders inside one, so each mount past the first unmounts the prior render
// itself before mounting again.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CaseSimulationScreen } from "./case-simulation-screen";
import type { CaseVersionRecord } from "../services/case-version-record";

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

describe(
  "CaseSimulationScreen -- route to the named version's own editor across every reading " +
    "(rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading; " +
    "criteria 1-6)",
  () => {
    it(
      "carries the route while pending, once failed to complete, once refused for validation, " +
        "and once answered for a draft and for a released version, always addressed by the " +
        "screen's own path version",
      async () => {
        // criterion 1: the read has not answered
        const pendingFetch: FetchFn = () => new Promise<Response>(() => {});
        await mountCaseSimulationScreen(pendingFetch);
        expect(await screen.findByText(`Loading version ${VERSION}…`)).toBeTruthy();
        expect(screen.getByRole("link", { name: "Edit version" }).getAttribute("href")).toBe(
          `/cases/${SLUG}/versions/${VERSION}`,
        );

        cleanup();
        vi.unstubAllGlobals();

        // criterion 2: the read did not complete
        const failedFetch: FetchFn = async () => {
          throw new Error("network down");
        };
        await mountCaseSimulationScreen(failedFetch);
        expect(await screen.findByText("Unable to load this version right now.")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Edit version" }).getAttribute("href")).toBe(
          `/cases/${SLUG}/versions/${VERSION}`,
        );

        cleanup();
        vi.unstubAllGlobals();

        // criterion 3: the read was refused with CaseVersionNotValidError
        const refusedFetch: FetchFn = async () =>
          jsonResponse(
            { error: { code: "CaseVersionNotValidError", message: "validation failed" } },
            409,
          );
        await mountCaseSimulationScreen(refusedFetch);
        expect(await screen.findByText("Unable to load this version right now.")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Edit version" }).getAttribute("href")).toBe(
          `/cases/${SLUG}/versions/${VERSION}`,
        );

        cleanup();
        vi.unstubAllGlobals();

        // criterion 4: the reading answered a draft version
        const draftFetch: FetchFn = async (input) => {
          const url = typeof input === "string" ? input : input.toString();
          if (url === VERSION_PATH) {
            return jsonResponse({ ...RECORD, state: "draft" });
          }
          throw new Error(`unexpected fetch: ${url}`);
        };
        await mountCaseSimulationScreen(draftFetch);
        await screen.findByText("Draft");
        expect(screen.getByRole("link", { name: "Edit version" }).getAttribute("href")).toBe(
          `/cases/${SLUG}/versions/${VERSION}`,
        );

        cleanup();
        vi.unstubAllGlobals();

        // criterion 5: the reading answered a released version, alongside the pre-existing
        // new-draft "Edit version" route
        const releasedFetch: FetchFn = async (input) => {
          const url = typeof input === "string" ? input : input.toString();
          if (url === VERSION_PATH) {
            return jsonResponse({ ...RECORD, state: "released" });
          }
          throw new Error(`unexpected fetch: ${url}`);
        };
        await mountCaseSimulationScreen(releasedFetch);
        await screen.findByText("Released");
        // the pre-existing "Edit version" (new-draft) route stays -- its own full target is
        // already asserted by the "resolving for a released version" test above; here it is
        // only confirmed present, alongside the new route below, rather than replaced by it
        screen.getByRole("link", { name: "Edit version" });
        const ownEditorLinks = screen
          .getAllByRole("link")
          .filter((link) => link.getAttribute("href") === `/cases/${SLUG}/versions/${VERSION}`);
        expect(ownEditorLinks).toHaveLength(1);
      },
    );
  },
);

describe(
  "CaseSimulationScreen -- editor route on a refusal the screen holds no specific presentation " +
    "for (UNDERDETERMINED entry 1)",
  () => {
    it(
      "still carries the route to the named version's own editor when the read is refused with " +
        "an error code other than CaseVersionNotValidError",
      async () => {
        const otherErrorFetch: FetchFn = async () =>
          jsonResponse({ error: { code: "SomeUnrecognizedError", message: "boom" } }, 500);
        await mountCaseSimulationScreen(otherErrorFetch);

        expect(await screen.findByText("Unable to load this version right now.")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Edit version" }).getAttribute("href")).toBe(
          `/cases/${SLUG}/versions/${VERSION}`,
        );
      },
    );
  },
);
