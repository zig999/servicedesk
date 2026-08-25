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
import { render } from "@testing-library/react";
import { CapabilityDetailScreen } from "./capability-detail-screen";

// Shared fixtures and mounting helper for capability-detail-screen.spec.ts and its siblings
// capability-detail-screen-invalid-schema.spec.ts, capability-detail-screen-save.spec.ts and
// capability-detail-screen-discard.spec.ts (split across four files to stay under this
// project's own max-lines discipline from the start -- task/connector-capability-detail-editing/
// capability-detail-route's own instruction to mirror
// connector-configuration-detail-screen.test-support.ts's own established convention closely,
// doubled where this screen's own two JSON schema fields (input_schema, output_schema) each need
// a warning/boundary test the sibling's single configuration field only needed once).
// CapabilityDetailScreen reads its own route's name and version through
// useParams({ from: "/capabilities/$name/$version" }) and renders a Link to "/capabilities", so
// it needs a real router context rather than a bare render; this builds a small,
// self-contained test router (the screen at its own route, plus a dummy "/capabilities" leaf so
// the Back link has a real destination) rather than reusing route-tree.tsx's own production
// tree.
//
// The screen also composes useConceptOptions (through useCapabilityDetail) for the Concept
// select's own vocabulary -- baseHandlers below answers that GET by default, mirroring
// connector-configuration-detail-screen.test-support.ts's own baseHandlers convention of
// answering every dependent read a test does not itself care about, so a test asserting on the
// capability's own fields never has to repeat that fixture.

export const NAME = "some-capability";
export const VERSION = "v1";
export const CAPABILITY_PATH = `/v1/capabilities/${NAME}/${VERSION}`;
export const CONCEPTS_PATH = "/v1/glossary/concepts";

export const LOADED_INPUT_SCHEMA = '{"type":"object"}';
export const LOADED_OUTPUT_SCHEMA = '{"type":"string"}';
export const UPDATED_INPUT_SCHEMA = '{"type":"object","updated":true}';
export const UPDATED_OUTPUT_SCHEMA = '{"type":"string","updated":true}';
export const INVALID_INPUT_SCHEMA = "{not valid json";
export const INVALID_OUTPUT_SCHEMA = "{also not valid";

export const LOADED_CAPABILITY = {
  name: NAME,
  version: VERSION,
  nature: "read-only",
  input_schema: LOADED_INPUT_SCHEMA,
  output_schema: LOADED_OUTPUT_SCHEMA,
  timeout: 30,
  connector: "some-connector",
  concept: "some-concept",
};

export const CONCEPTS_RESPONSE = { data: [{ name: "some-concept", accepts: ["capability"] }] };

/** JsonTextareaField's own mount-time pretty-print effect reformats a syntactically valid loaded
 * value before any test can observe it (json-textarea-pretty-print-on-load, already delivered) --
 * every assertion on a schema field's own displayed text uses this rather than the raw fixture. */
export function prettyPrinted(value: string): string {
  return JSON.stringify(JSON.parse(value), null, 2);
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function errorResponse(code: string, status = 500): Response {
  return new Response(JSON.stringify({ error: { code, message: code } }), { status });
}

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
export type FetchResponder = (method: string) => Response | Promise<Response>;

/** Each handler is keyed by URL and receives the request's own method, mirroring
 * connector-configuration-detail-screen.test-support.ts's own METHOD-keyed convention -- this
 * screen's own CAPABILITY_PATH answers both a GET (load) and a PUT (save) to the very same
 * URL. */
export function createFetchStub(handlers: Record<string, FetchResponder>): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(`capability-detail-screen proof: no mocked response for ${url}`);
    }
    return handler((init?.method ?? "GET").toUpperCase());
  });
}

/** Answers the load GET (and, unchanged, a save PUT to the same URL -- this hook's own
 * onSuccess re-baselines from the submitted values rather than the response body, so what this
 * responds with never has to vary by method) with a capability carrying `inputSchema` and
 * `outputSchema`, plus the Concept select's own vocabulary read -- see this file's own header
 * comment. */
export function baseHandlers(
  inputSchema: string = LOADED_INPUT_SCHEMA,
  outputSchema: string = LOADED_OUTPUT_SCHEMA,
  overrides: Record<string, FetchResponder> = {},
): Record<string, FetchResponder> {
  return {
    [CAPABILITY_PATH]: () =>
      jsonResponse({
        ...LOADED_CAPABILITY,
        input_schema: inputSchema,
        output_schema: outputSchema,
      }),
    [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE),
    ...overrides,
  };
}

function buildTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities/$name/$version",
    component: CapabilityDetailScreen,
  });
  // A dummy leaf so "/capabilities" is a resolvable Back-link destination -- what renders there
  // is capabilities-browser-screen.tsx's own concern, not this proof's, mirroring
  // connector-configuration-detail-screen.test-support.ts's own dummy "/connectors" leaf.
  const listRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities",
    component: () => createElement("div", null, "Capabilities List Placeholder"),
  });
  const routeTree = rootRoute.addChildren([detailRoute, listRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

// Named "mount", not "render", matching connector-configuration-detail-screen.test-support.ts's
// own testing-library/render-result-naming-convention precedent for a helper shaped this way --
// it returns the test router instance, not a render result.
export async function mountCapabilityDetailScreen(
  fetchMock: FetchFn,
  initialPath = `/capabilities/${NAME}/${VERSION}`,
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
      "capability-detail-screen proof: expected a PUT call carrying a JSON string body",
    );
  }
  return JSON.parse(rawBody);
}
