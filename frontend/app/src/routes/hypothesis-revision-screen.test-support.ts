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

// Shared fixtures and mounting helpers for hypothesis-revision-screen.spec.ts,
// hypothesis-revision-screen-submit.spec.ts and hypothesis-revision-screen-errors.spec.ts
// (split three ways to stay under this project's own max-lines rule), proving
// task/manifest-hypothesis-authoring/revise-hypothesis-form. NewHypothesisScreen and
// ReviseHypothesisScreen each read their own route's slug/version(/hypothesisName)
// through useParams() and both call useNavigate() (the success phase's own "Open
// Manifest Builder" control), so -- exactly like case-version-editor-screen.test-support.ts --
// they need a real router context rather than a bare render. buildTestRouter carries both of
// this task's own routes plus a dummy Manifest destination (criterion 10), rather than reusing
// the production twelve-route tree.
//
// The shared hook issues four GETs on every visit (the draft version, the glossary concepts,
// and the outcome/action/recipient vocabularies), a fifth GET only on the Revise route (the
// addressed hypothesis's own revisions), and one POST on submit -- so the fetch stub below is
// keyed by "METHOD path", mirroring every other screen test-support module's own convention. A
// key this test does not register throws, so a request nobody expected fails the test loudly
// rather than hanging it.

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

// The highest-revision entry (3) sits first, not last, so a test asserting the form
// pre-populates from *this* one rather than the array's last entry (1) proves criterion 3's
// own "current revision" is picked by revision number, never by array position.
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
    [`GET ${VERSION_PATH}`]: () => jsonResponse({ subject: SUBJECT_TYPE }),
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
  // A dummy leaf so "Open Manifest Builder" (criterion 10) has a real route to resolve to --
  // what renders there is the Manifest Builder's own concern, not this proof's.
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

// A second, isolated router carrying *only* the $hypothesisName route -- no static "new"
// sibling -- so a navigation to ".../hypotheses/new" cannot be intercepted by route ranking
// (TanStack Router ranks a static segment over a dynamic one for the same literal path, the
// same convention this app already establishes for "versions/new" over "versions/$version",
// confirmed directly in route-tree.tsx's own header comments). This is what lets a test
// address ReviseHypothesisScreen directly with hypothesisName "new", to check that its own
// code path treats that string exactly like any other name -- no special-casing internal to
// the Revise route itself (criterion 1's own "addressed by the Revise route" half).
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

// Named "mount", not "render", matching case-version-editor-screen.test-support.ts's own
// testing-library/render-result-naming-convention precedent for a helper shaped this way.
// Each mount function renders its own router type directly (rather than delegating to one
// shared, generically-typed helper) since buildTestRouter and buildIsolatedReviseRouter
// produce routers over two different, incompatible route trees.
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

// The Select primitive (frontend/tui) selects on its own onMouseDown, not onClick
// (select.tsx) -- fireEvent.click alone never reaches it, mirroring
// new-case-draft-screen.test-support.ts's own established convention.
export function selectOption(labelText: string, optionName: string): void {
  const trigger = screen.getByLabelText(labelText);
  fireEvent.click(trigger);
  const listbox = screen.getByRole("listbox");
  fireEvent.mouseDown(within(listbox).getByRole("option", { name: optionName }));
}

export function checkConcept(conceptName: string): void {
  fireEvent.click(screen.getByRole("checkbox", { name: conceptName }));
}

/** Fills every field the shared form requires, with valid, glossary-backed values, so submit's own POST validates (criterion 9). Only sets hypothesis_name when the caller passes one -- the Revise route's own name field is fixed and never needs filling. */
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
