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

    [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [] }),
    ...overrides,
  };
}

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

  fireEvent.mouseDown(within(listbox).getByRole("option", { name: optionName }));
}

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
