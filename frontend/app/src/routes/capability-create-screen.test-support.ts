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

// Shared fixtures and mounting helper for capability-create-screen.spec.ts and its sibling
// capability-create-screen-save.spec.ts (split across two files, mirroring
// connector-configuration-create-screen.test-support.ts's own base-plus-save split for the
// sibling task of this same epic). CapabilityCreateScreen calls useNavigate(), renders a Link to
// "/capabilities" and composes useCapabilityForm's own useConceptOptions() read, so it needs a
// real router context plus a QueryClientProvider -- this builds a small, self-contained test
// router (the create screen at its own static "/capabilities/new" route, the real dynamic
// "/capabilities/$name/$version" pattern as a dummy placeholder so criterion 2's own routing
// claim and criterion 12's own post-save destination are both checked against the actual dynamic
// route, plus a dummy "/capabilities" leaf for the Back link, criterion 13) rather than reusing
// route-tree.tsx's own production tree -- mirroring
// connector-configuration-create-screen.test-support.ts's own identical convention exactly.
// Unlike app-shell.spec.ts, this root route's own component is a bare Outlet rather than
// AppShell: every route-tree.tsx leaf already renders inside AppShell as a structural,
// independently-tested invariant (app-shell.spec.ts's own "wraps the matched route's own content"
// test), so this file follows every sibling screen's own test-support convention of not
// re-mounting AppShell per screen.

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

/** The PUT path useCapabilityForm's own mutation dispatches at (contracts/integration/capability-registry's own register-capability operation). */
export function capabilityPutPath(name: string, version: string): string {
  return `/v1/capabilities/${encodeURIComponent(name)}/${encodeURIComponent(version)}`;
}

/** Each handler is keyed by URL and receives the request's own method, mirroring
 * connector-configuration-create-screen.test-support.ts's own createFetchStub convention. A key
 * this test does not register throws, so a request nobody expected fails the test loudly rather
 * than hanging it. */
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

/** Answers GET /v1/glossary/concepts with one concept option (CONCEPT_NAME) -- the vocabulary
 * useCapabilityForm's own useConceptOptions read needs before its "ready" phase renders. Every
 * test that does not itself care about the loading/load-error phases uses this rather than
 * restating the fixture. */
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
  // A dummy leaf at the real dynamic detail pattern, so criterion 2 ("/capabilities/new/<version>"
  // must resolve here, not to the create screen) and criterion 12 (a successful save must resolve
  // here, at the just-registered capability's own name and version) are both checked against
  // actual TanStack Router resolution rather than a stand-in path. What renders at this route in
  // production is capability-detail-screen.tsx's own concern, not this proof's.
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities/$name/$version",
    component: () => createElement("div", null, "Capability Detail Placeholder"),
  });
  // A dummy leaf so "/capabilities" is a resolvable Back-link destination -- what renders there is
  // capabilities-browser-screen.tsx's own concern, not this proof's.
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

// Named "mount", not "render", matching capability-detail-screen.test-support.ts's own
// established convention -- it returns the test router instance, not a render result.
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

/**
 * Selects `optionName` in the Select labeled `labelText` -- mirrors
 * capabilities-browser-screen.test-support.ts's own established selectOption convention exactly:
 * TUI's own Select (select.tsx) selects an option on its own onMouseDown, never onClick, so
 * fireEvent.click alone never reaches it.
 */
export function selectOption(labelText: string, optionName: string): void {
  const trigger = screen.getByLabelText(labelText);
  fireEvent.click(trigger);
  const listbox = screen.getByRole("listbox");
  fireEvent.mouseDown(within(listbox).getByRole("option", { name: optionName }));
}

/**
 * Fills every field capabilityFormSchema requires, plus both JSON schemas as valid JSON and the
 * one available concept option -- the minimal fill that lets Save actually dispatch. Every field
 * is overridable, so a caller proving one particular field's own behavior (an invalid schema, a
 * chosen nature, an empty name) only ever states that one field, leaving the rest at a value the
 * schema already accepts.
 */
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
