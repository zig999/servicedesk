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
import { CaseCreationScreen } from "./case-creation-screen";

export type FetchResponder = () => Response | Promise<Response>;

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export function createFetchStub(handlers: Record<string, FetchResponder>): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const key = `${method} ${url}`;
    const handler = handlers[key];
    if (!handler) {
      throw new Error(`case-creation-screen.spec.ts: no mocked response registered for ${key}`);
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

export const CREATE_PATH = "/v1/cases";

export const OUTCOME_TERMS = { data: [{ name: "resolved" }, { name: "pending" }] };
export const ACTION_TERMS = { data: [{ name: "escalate" }, { name: "notify" }] };
export const RECIPIENT_TERMS = { data: [{ name: "supervisor" }, { name: "customer" }] };

export function baseHandlers(
  overrides: Record<string, FetchResponder> = {},
): Record<string, FetchResponder> {
  return {
    "GET /v1/glossary/outcome": () => jsonResponse(OUTCOME_TERMS),
    "GET /v1/glossary/action": () => jsonResponse(ACTION_TERMS),
    "GET /v1/glossary/recipient": () => jsonResponse(RECIPIENT_TERMS),
    ...overrides,
  };
}

function buildTestRouter() {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const caseCreateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/new",
    component: CaseCreationScreen,
  });
  const casesListRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases",
    component: () => createElement("div", null, "Cases List Placeholder"),
  });
  const caseVersionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version",
    component: () => createElement("div", null, "Version Editor Placeholder"),
  });
  const routeTree = rootRoute.addChildren([caseCreateRoute, casesListRoute, caseVersionRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/cases/new"] }),
  });
}

export async function mountCaseCreationScreen(
  fetchMock: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
): Promise<ReturnType<typeof buildTestRouter>> {
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

export const VALID_FORM_INPUT = {
  slug: "case-required-content-check",
  title: "A title",
  when_to_use: "Use this when needed",
  subject: "billing-dispute",
  outcome: "resolved",
  action: "escalate",
  recipient: "supervisor",
};

export type FormInputOverrides = Partial<Record<keyof typeof VALID_FORM_INPUT, string | undefined>>;

function selectOption(labelText: string, optionName: string): void {
  const trigger = screen.getByLabelText(labelText);
  fireEvent.click(trigger);
  const listbox = screen.getByRole("listbox");
  fireEvent.mouseDown(within(listbox).getByRole("option", { name: optionName }));
}

export async function fillForm(overrides: FormInputOverrides = {}): Promise<void> {
  const values = { ...VALID_FORM_INPUT, ...overrides };

  const slugInput = await screen.findByLabelText("Slug");
  fireEvent.change(slugInput, { target: { value: values.slug ?? "" } });
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: values.title ?? "" } });
  fireEvent.change(screen.getByLabelText("When to use"), {
    target: { value: values.when_to_use ?? "" },
  });
  fireEvent.change(screen.getByLabelText("Subject type"), {
    target: { value: values.subject ?? "" },
  });
  if (values.outcome !== undefined) {
    selectOption("Fallback outcome", values.outcome);
  }
  if (values.action !== undefined) {
    selectOption("Fallback referral (action)", values.action);
  }
  if (values.recipient !== undefined) {
    selectOption("Fallback referral (recipient)", values.recipient);
  }
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

export function calledAnyUrlStartingWith(
  fetchMock: ReturnType<typeof createFetchStub>,
  prefix: string,
): boolean {
  return fetchMock.mock.calls.some(([input]) => {
    const url = typeof input === "string" ? input : input.toString();
    return url.startsWith(prefix);
  });
}
