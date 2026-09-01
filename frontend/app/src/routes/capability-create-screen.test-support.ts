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
import { CapabilityCreateScreen } from "./capability-create-screen";

export const CONCEPTS_PATH = "/v1/glossary/concepts";
export const CONCEPT_NAME = "some-concept";
export const CONCEPTS_RESPONSE = { data: [{ name: CONCEPT_NAME, accepts: ["capability"] }] };

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
export type FetchResponder = (method: string) => Response | Promise<Response>;

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function errorResponse(code: string, status = 409): Response {
  return new Response(JSON.stringify({ error: { code, message: code } }), { status });
}

export function capabilityPutPath(name: string, version: string): string {
  return `/v1/capabilities/${encodeURIComponent(name)}/${encodeURIComponent(version)}`;
}

export function createFetchStub(handlers: Record<string, FetchResponder> = {}): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(`capability-create-screen proof: no mocked response for ${url}`);
    }
    return handler((init?.method ?? "GET").toUpperCase());
  });
}

export function baseHandlers(
  overrides: Record<string, FetchResponder> = {},
): Record<string, FetchResponder> {
  return {
    [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE),
    ...overrides,
  };
}

export function putCallCount(fetchMock: Mock<FetchFn>): number {
  return fetchMock.mock.calls.filter(
    ([, init]) => (init?.method ?? "GET").toUpperCase() === "PUT",
  ).length;
}

export function parsedPutBody(fetchMock: Mock<FetchFn>, index = 0): unknown {
  const putCalls = fetchMock.mock.calls.filter(
    ([, init]) => (init?.method ?? "GET").toUpperCase() === "PUT",
  );
  const rawBody = putCalls[index]?.[1]?.body;
  if (typeof rawBody !== "string") {
    throw new Error(
      "capability-create-screen proof: expected a PUT call carrying a JSON string body",
    );
  }
  return JSON.parse(rawBody);
}

function buildTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const createRouteDef = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities/new",
    component: CapabilityCreateScreen,
  });

  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities/$name/$version",
    component: () => createElement("div", null, "Capability Detail Placeholder"),
  });

  const listRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities",
    component: () => createElement("div", null, "Capabilities List Placeholder"),
  });
  const routeTree = rootRoute.addChildren([createRouteDef, detailRoute, listRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

export async function mountCapabilityCreateScreen(
  fetchMock: FetchFn,
  initialPath = "/capabilities/new",
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

export function selectOption(labelText: string, optionName: string): void {
  const trigger = screen.getByLabelText(labelText);
  fireEvent.click(trigger);
  const listbox = screen.getByRole("listbox");
  fireEvent.mouseDown(within(listbox).getByRole("option", { name: optionName }));
}

export function fillValidForm(
  fields: {
    readonly name?: string;
    readonly version?: string;
    readonly connector?: string;
    readonly timeout?: string;
    readonly nature?: string;
    readonly inputSchema?: string;
    readonly outputSchema?: string;
    readonly concept?: string;
  } = {},
): void {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: fields.name ?? "translate-text" },
  });
  fireEvent.change(screen.getByLabelText("Version"), {
    target: { value: fields.version ?? "1.0.0" },
  });
  fireEvent.change(screen.getByLabelText("Connector"), {
    target: { value: fields.connector ?? "deepl-connector" },
  });
  if (fields.timeout !== undefined) {
    fireEvent.change(screen.getByLabelText("Timeout (ms)"), {
      target: { value: fields.timeout },
    });
  }
  if (fields.nature !== undefined) {
    selectOption("Nature", fields.nature);
  }
  fireEvent.change(screen.getByLabelText("Input schema"), {
    target: { value: fields.inputSchema ?? "{}" },
  });
  fireEvent.change(screen.getByLabelText("Output schema"), {
    target: { value: fields.outputSchema ?? "{}" },
  });
  selectOption("Concept", fields.concept ?? CONCEPT_NAME);
}
