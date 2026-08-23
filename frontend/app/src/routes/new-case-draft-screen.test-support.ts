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
import { NewCaseDraftScreen } from "./new-case-draft-screen";

// Shared fixtures and mounting helpers for new-case-draft-screen.spec.ts,
// new-case-draft-screen-save.spec.ts and new-case-draft-screen-conflict.spec.ts
// (split three ways to stay under this project's own max-lines rule). Mirrors
// case-version-editor-screen.test-support.ts's own established pattern:
// NewCaseDraftScreen reads its own route's slug through useParams({ from:
// "/cases/$slug/versions/new" }) and calls useNavigate() (for the 409
// redirect), so it needs a real router context. This builds a small,
// self-contained test router (NewCaseDraftScreen at its own route, plus the
// general "/cases/$slug/versions/$version" leaf so a redirect after a 409 --
// or a PATCH issued once the hook has switched into edit mode -- has a real
// route/URL to resolve against) rather than reusing the production
// ten-route tree.
//
// The hook this screen composes issues four GETs (the subject-type/outcome/
// action/recipient glossary vocabularies), one POST (the origination Save),
// and -- once switched into edit mode, or on a 409 -- one PATCH or one GET of
// the case's own version list, so the fetch stub below is keyed by "METHOD
// path" rather than by path alone, mirroring that file's own
// stubFetchResponses convention. A key this test does not register throws,
// so a request nobody expected fails the test loudly rather than hanging it.

export type FetchResponder = () => Response | Promise<Response>;

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export function createFetchStub(handlers: Record<string, FetchResponder>): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const key = `${method} ${url}`;
    const handler = handlers[key];
    if (!handler) {
      throw new Error(`new-case-draft-screen.spec.ts: no mocked response registered for ${key}`);
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
export const NEW_DRAFT_PATH = `/cases/${SLUG}/versions/new`;
export const CREATE_PATH = "/v1/cases";
export const VERSIONS_PATH = `/v1/cases/${SLUG}/versions`;

export function versionPath(version: number): string {
  return `/v1/cases/${SLUG}/versions/${version}`;
}

export const SUBJECT_TYPE_TERMS = { data: [{ name: "billing-dispute" }] };
export const OUTCOME_TERMS = {
  data: [{ name: "resolved" }, { name: "pending" }, { name: "rejected" }],
};
export const ACTION_TERMS = { data: [{ name: "escalate" }, { name: "notify" }] };
export const RECIPIENT_TERMS = { data: [{ name: "supervisor" }, { name: "customer" }] };

export function baseHandlers(
  overrides: Record<string, FetchResponder> = {},
): Record<string, FetchResponder> {
  return {
    "GET /v1/glossary/subject-type": () => jsonResponse(SUBJECT_TYPE_TERMS),
    "GET /v1/glossary/outcome": () => jsonResponse(OUTCOME_TERMS),
    "GET /v1/glossary/action": () => jsonResponse(ACTION_TERMS),
    "GET /v1/glossary/recipient": () => jsonResponse(RECIPIENT_TERMS),
    // task/version-editor/seed-new-draft-from-latest-released: useNewDraftVersionForm
    // now reads the case's own version list unconditionally on every mount (to find
    // its own latest released version to seed from), so every caller of baseHandlers()
    // needs a default answer for this GET even where seeding itself is not what that
    // test exercises -- "no released version yet" is exactly new-draft-creation's own
    // preserved default behavior, so an empty page is the correct default rather than
    // an arbitrary one. A test that does exercise seeding overrides this key.
    [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [] }),
    ...overrides,
  };
}

/**
 * A case's own latest released version's record, read through GET
 * /v1/cases/{slug}/versions/{version} (task/version-editor/
 * seed-new-draft-from-latest-released, criterion 1) -- shaped exactly like
 * case-version-editor-screen.test-support.ts's own LOADED_RECORD, reusing
 * this file's own glossary term fixtures so the seeded fallback/outcome
 * values resolve to a real option rather than falling back to a Select's own
 * placeholder.
 */
export const RELEASED_VERSION_RECORD = {
  title: "Released title",
  when_to_use: "Use this when the case reopens",
  subject: SUBJECT_TYPE_TERMS.data[0].name,
  fallback: {
    outcome: OUTCOME_TERMS.data[0].name,
    referral: {
      action: ACTION_TERMS.data[0].name,
      recipient: RECIPIENT_TERMS.data[0].name,
    },
  },
  consolidation_register: "formal",
};

/** The same released version, but carrying no consolidation_register of its own -- mirrors RECORD_WITHOUT_REGISTER in case-version-editor-screen.test-support.ts. */
export const RELEASED_VERSION_RECORD_WITHOUT_REGISTER = {
  title: "Released title without a register",
  when_to_use: RELEASED_VERSION_RECORD.when_to_use,
  subject: RELEASED_VERSION_RECORD.subject,
  fallback: RELEASED_VERSION_RECORD.fallback,
};

function buildTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const newDraftRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/new",
    component: NewCaseDraftScreen,
  });
  // A dummy leaf so the general Version Editor route is a resolvable
  // destination for both a 409 redirect (criterion 6) and the PATCH URL the
  // hook addresses once switched into edit mode (criterion 4) -- what
  // renders there is case-version-editor-screen's own concern, not this
  // proof's.
  const caseVersionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version",
    component: () => createElement("div", null, "Version Editor Placeholder"),
  });
  const routeTree = rootRoute.addChildren([newDraftRoute, caseVersionRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

// Named "mount", not "render", matching case-version-editor-screen.test-support.ts's
// own testing-library/render-result-naming-convention precedent for a helper shaped
// this way.
export async function mountNewCaseDraft(
  fetchMock: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
  initialPath: string = NEW_DRAFT_PATH,
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

export const VALID_FORM_INPUT = {
  title: "Origin title",
  when_to_use: "Use when starting fresh",
  outcome: "resolved",
  action: "escalate",
  recipient: "supervisor",
};

function selectOption(labelText: string, optionName: string): void {
  const trigger = screen.getByLabelText(labelText);
  fireEvent.click(trigger);
  const listbox = screen.getByRole("listbox");
  // The Select primitive (frontend/tui) selects on its own onMouseDown, not
  // onClick (see select.tsx) -- fireEvent.click alone never reaches it.
  fireEvent.mouseDown(within(listbox).getByRole("option", { name: optionName }));
}

/** Fills every field caseVersionFormSchema requires beyond subject (pre-set by the hook itself) with VALID_FORM_INPUT's own values, so Save's own POST validates. */
export async function fillValidForm(): Promise<void> {
  const titleInput = await screen.findByLabelText("Title");
  fireEvent.change(titleInput, { target: { value: VALID_FORM_INPUT.title } });
  fireEvent.change(screen.getByLabelText("When to use"), {
    target: { value: VALID_FORM_INPUT.when_to_use },
  });
  selectOption("Fallback outcome", VALID_FORM_INPUT.outcome);
  selectOption("Fallback referral (action)", VALID_FORM_INPUT.action);
  selectOption("Fallback referral (recipient)", VALID_FORM_INPUT.recipient);
}

// `init?.method` defaults to GET (fetch's own default, and apiFetch never
// sets it for a plain read) -- normalized here so a caller asking for "GET"
// also matches the many calls this hook makes with no explicit method.
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Reads the POST body's own `authored_at` field without an unguarded type
 * assertion (TYP-02): `isRecord` narrows the parsed body first, so TypeScript
 * itself confirms the shape this reads rather than a cast asserting past it.
 */
export function postedAuthoredAt(fetchMock: ReturnType<typeof createFetchStub>): string {
  const body = parsedPostBody(fetchMock);
  if (!isRecord(body) || typeof body.authored_at !== "string") {
    throw new Error("expected the POST body to carry a string authored_at");
  }
  return body.authored_at;
}

export function patchCallCount(fetchMock: ReturnType<typeof createFetchStub>): number {
  return callsFor(fetchMock, "PATCH").length;
}

export function wasCalledWith(
  fetchMock: ReturnType<typeof createFetchStub>,
  method: string,
  url: string,
): boolean {
  return callsFor(fetchMock, method).some(([callUrl]) => callUrl === url);
}
