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
import { fireEvent, render, screen, within } from "@testing-library/react";
import { NewHypothesisScreen } from "./new-hypothesis-screen";
import { ReviseHypothesisScreen } from "./revise-hypothesis-screen";

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
        `hypothesis-revision-screen.spec.ts: no mocked response registered for ${key}`,
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
export const VERSION = 3;
export const VERSION_PATH = `/v1/cases/${SLUG}/versions/${VERSION}`;
export const HYPOTHESES_PATH = `/v1/cases/${SLUG}/hypotheses`;

export function revisionsPath(hypothesisName: string): string {
  return `/v1/cases/${SLUG}/hypotheses/${encodeURIComponent(hypothesisName)}/revisions`;
}

export const NEW_HYPOTHESIS_PATH = `/cases/${SLUG}/versions/${VERSION}/manifest/hypotheses/new`;

export function revisePath(hypothesisName: string): string {
  return `/cases/${SLUG}/versions/${VERSION}/manifest/hypotheses/${hypothesisName}`;
}

export const MANIFEST_PATH = `/cases/${SLUG}/versions/${VERSION}/manifest`;

export const SUBJECT_TYPE = "billing-dispute";

export const CONCEPT_TERMS = {
  data: [
    { name: "ConceptA", accepts: ["billing-dispute"] },
    { name: "ConceptB", accepts: ["billing-dispute", "onboarding"] },
    { name: "ConceptC", accepts: ["onboarding"] },
  ],
};

export const OUTCOME_TERMS = {
  data: [{ name: "resolved" }, { name: "pending" }, { name: "rejected" }],
};
export const ACTION_TERMS = { data: [{ name: "escalate" }, { name: "notify" }] };
export const RECIPIENT_TERMS = { data: [{ name: "supervisor" }, { name: "customer" }] };

export const H1_REVISIONS = {
  data: [
    {
      revision: 3,
      criterion: "Latest criterion text",
      collects: ["ConceptB"],
      resolution: { outcome: "pending", referral: { action: "notify", recipient: "customer" } },
    },
    {
      revision: 1,
      criterion: "Old criterion text",
      collects: ["ConceptA"],
      resolution: {
        outcome: "resolved",
        referral: { action: "escalate", recipient: "supervisor" },
      },
    },
  ],
};

export function baseHandlers(
  overrides: Record<string, FetchResponder> = {},
): Record<string, FetchResponder> {
  return {
    [`GET ${VERSION_PATH}`]: () => jsonResponse({ subject: SUBJECT_TYPE, manifest: [] }),
    "GET /v1/glossary/concepts": () => jsonResponse(CONCEPT_TERMS),
    "GET /v1/glossary/outcome": () => jsonResponse(OUTCOME_TERMS),
    "GET /v1/glossary/action": () => jsonResponse(ACTION_TERMS),
    "GET /v1/glossary/recipient": () => jsonResponse(RECIPIENT_TERMS),
    ...overrides,
  };
}

function buildTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const newHypothesisRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest/hypotheses/new",
    component: NewHypothesisScreen,
  });
  const reviseHypothesisRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName",
    component: ReviseHypothesisScreen,
  });

  const manifestRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest",
    component: () => createElement("div", null, "Manifest Builder Placeholder"),
  });
  const routeTree = rootRoute.addChildren([
    newHypothesisRoute,
    reviseHypothesisRoute,
    manifestRoute,
  ]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

function buildIsolatedReviseRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const reviseHypothesisRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName",
    component: ReviseHypothesisScreen,
  });
  const routeTree = rootRoute.addChildren([reviseHypothesisRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

export async function mountHypothesisForm(
  fetchMock: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
  initialPath: string = NEW_HYPOTHESIS_PATH,
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

export async function mountIsolatedRevise(
  fetchMock: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
  initialPath: string,
): Promise<ReturnType<typeof buildIsolatedReviseRouter>> {
  vi.stubGlobal("fetch", fetchMock);
  const router = buildIsolatedReviseRouter(initialPath);
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

function callsFor(fetchMock: ReturnType<typeof createFetchStub>, method: string) {
  return fetchMock.mock.calls.filter(([, init]) => (init?.method ?? "GET") === method);
}

export function postCallCount(fetchMock: ReturnType<typeof createFetchStub>): number {
  return callsFor(fetchMock, "POST").length;
}

export function parsedPostBody(fetchMock: ReturnType<typeof createFetchStub>): unknown {
  const rawBody = callsFor(fetchMock, "POST")[0]?.[1]?.body;
  if (typeof rawBody !== "string") {
    throw new Error("expected exactly one POST call carrying a JSON string body");
  }
  return JSON.parse(rawBody);
}

export function wasRequested(fetchMock: ReturnType<typeof createFetchStub>, url: string): boolean {
  return fetchMock.mock.calls.some(([callUrl]) => callUrl === url);
}

export function selectOption(labelText: string, optionName: string): void {
  const trigger = screen.getByLabelText(labelText);
  fireEvent.click(trigger);
  const listbox = screen.getByRole("listbox");
  fireEvent.mouseDown(within(listbox).getByRole("option", { name: optionName }));
}

export function checkConcept(conceptName: string): void {
  fireEvent.click(screen.getByRole("checkbox", { name: conceptName }));
}

export async function fillValidForm(hypothesisName?: string): Promise<void> {
  const nameInput = await screen.findByLabelText("Hypothesis name");
  if (hypothesisName !== undefined) {
    fireEvent.change(nameInput, { target: { value: hypothesisName } });
  }
  fireEvent.change(screen.getByLabelText("Criterion"), {
    target: { value: "Some criterion text" },
  });
  checkConcept("ConceptA");
  selectOption("Resolution outcome", "resolved");
  selectOption("Referral action", "escalate");
  selectOption("Referral recipient", "supervisor");
}
