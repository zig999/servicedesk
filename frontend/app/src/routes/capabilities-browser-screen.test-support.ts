import { createElement } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { CapabilitiesBrowserScreen } from "./capabilities-browser-screen";
import type { Capability } from "../hooks/use-capabilities";

// Shared fixtures and mounting helper for task/glossary-and-capabilities-browser/
// capabilities-browser-screen's own listing/loading/error/empty-state/formatting coverage
// (capabilities-browser-screen.spec.ts) and task/capability-authoring/
// capability-create-edit-form's own proof of the New/Edit actions and the shared create/edit
// form they open, which replaced this screen's prior read-only row-selection detail panel
// (capabilities-browser-screen-detail.spec.ts: criteria 1, 2 and their own disclosed
// inferences; capabilities-browser-screen-capability-form-schema.spec.ts: criteria 3, 4;
// capabilities-browser-screen-capability-form-save.spec.ts: criteria 5, 6) -- split this way
// to keep each file under this project's own max-lines rule (MNT-01).
//
// CapabilitiesBrowserScreen calls no router hook at all (no useParams, no Link, no
// useNavigate -- confirmed by reading capabilities-browser-screen.tsx in full), so unlike
// every other screen's own test-support module this one needs no
// createMemoryHistory/RouterProvider scaffolding, only a QueryClientProvider for its own
// useCapabilities() call and (once a form Dialog is open) useCapabilityForm's own
// useConceptOptions() and PUT-issuing mutation.
//
// Extended for task/capability-authoring/capability-create-edit-form's own proof:
// createCapabilitiesFetchStub now takes a handlers map keyed by exact path (mirroring
// glossary-browser-screen.test-support.ts's own createGlossaryFetchStub) rather than a
// single CAPABILITIES_PATH-only responder, since a form-opening test also has to answer GET
// /v1/glossary/concepts (useConceptOptions) and PUT /v1/capabilities/{name}/{version}
// (useCapabilityForm's own mutation) -- unlike that sibling, an unhandled path here still
// fails the test loudly rather than falling back to an empty page, since this screen (unlike
// GlossaryBrowserScreen's own always-mounted Concepts tab) issues no request a test could
// forget to stub without meaning to. capabilityPutPath/requestsWithMethod/putCallCount/
// parsedPutBody/conceptOptionsPage/selectOption below are this task's own additions, mirroring
// glossary-browser-screen.test-support.ts's own conceptPutPath/putCallCount/parsedPutBody and
// hypothesis-revision-screen.test-support.ts's own selectOption exactly.

export const CAPABILITIES_PATH = "/v1/capabilities";
export const CONCEPT_OPTIONS_PATH = "/v1/glossary/concepts";

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

/** The shape of one element of vitest's own `Mock<FetchFn>['mock']['calls']` -- structurally
 * distinct from `Parameters<FetchFn>` because vitest's tuple carries the optional second
 * parameter as a required-but-possibly-undefined element rather than an optional tail element. */
type RecordedCall = [string | URL | Request, RequestInit | undefined];

/** The PUT path useCapabilityForm's own mutation dispatches at (contracts/integration/capability-registry's own register-capability operation). */
export function capabilityPutPath(name: string, version: string): string {
  return `/v1/capabilities/${encodeURIComponent(name)}/${encodeURIComponent(version)}`;
}

/** Every call this fetch stub recorded whose own method matches (case-insensitively "GET" by default, since that is what `init` omits). */
export function requestsWithMethod(
  fetchMock: Mock<FetchFn>,
  method: string,
): readonly RecordedCall[] {
  return fetchMock.mock.calls
    .filter(([, init]) => (init?.method ?? "GET").toUpperCase() === method)
    .map(([input, init]): RecordedCall => [input, init]);
}

export function putCallCount(fetchMock: Mock<FetchFn>): number {
  return requestsWithMethod(fetchMock, "PUT").length;
}

/** The JSON body of the `index`-th PUT call this fetch stub recorded (0 by default -- the first one). */
export function parsedPutBody(fetchMock: Mock<FetchFn>, index = 0): unknown {
  const rawBody = requestsWithMethod(fetchMock, "PUT")[index]?.[1]?.body;
  if (typeof rawBody !== "string") {
    throw new Error(
      "capabilities-browser-screen.test-support.ts: expected a PUT call carrying a JSON string body",
    );
  }
  return JSON.parse(rawBody);
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

/** The page envelope useCapabilities() reads only `data` out of -- total/limit/offset/
 * pageCount are deliberately left unread, matching use-glossary-vocabulary.ts's own
 * convention this hook mirrors. */
export function capabilitiesPage(data: readonly Capability[]): unknown {
  return { data, total: data.length, limit: 20, offset: 0, pageCount: 1 };
}

/** One full-fidelity fixture carrying every field domain/integration/capability declares, so a
 * test overriding only what it cares about never has to restate the rest. input_schema and
 * output_schema default to syntactically valid JSON (rather than the plain display strings
 * this fixture predates task/capability-authoring/capability-create-edit-form with): a
 * capability the registry actually holds always carries well-formed schemas
 * (rules/integration/a-capability-declares-well-formed-schemas), which is exactly what
 * use-capability-form.ts's own edit-mode `isValid` default (true, unconditionally) presupposes. */
export function capability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: "translate-text",
    version: "1.0.0",
    nature: "read-only",
    input_schema: '{"kind":"TranslateTextInput"}',
    output_schema: '{"kind":"TranslateTextOutput"}',
    timeout: 5000,
    connector: "deepl-connector",
    concept: "translation",
    ...overrides,
  };
}

/** The page envelope useConceptOptions() reads only `data` out of, one option per given name. */
export function conceptOptionsPage(names: readonly string[]): unknown {
  return {
    data: names.map((name) => ({ name, accepts: [] })),
    total: names.length,
    limit: 20,
    offset: 0,
    pageCount: 1,
  };
}

/**
 * A fetch stub answering exactly the paths its own `handlers` map names; any other path fails
 * the test loudly rather than hanging it, mirroring this file's own prior delivery's
 * createCapabilitiesFetchStub (a single-responder version of the same idea) and
 * case-version-editor-screen.test-support.ts's own createFetchStub.
 */
export function createCapabilitiesFetchStub(
  handlers: Partial<Record<string, () => Response | Promise<Response>>>,
): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (handler === undefined) {
      throw new Error(
        `capabilities-browser-screen.test-support.ts: no mocked response registered for ${url}`,
      );
    }
    return handler();
  });
}

export async function mountCapabilitiesScreen(fetchMock: FetchFn): Promise<void> {
  vi.stubGlobal("fetch", fetchMock);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(CapabilitiesBrowserScreen),
    ),
  );
}

/**
 * Selects `optionName` in the Select labeled `labelText` -- mirrors
 * hypothesis-revision-screen.test-support.ts's own established selectOption convention
 * exactly: TUI's own Select (select.tsx) selects an option on its own onMouseDown, never
 * onClick, so fireEvent.click alone never reaches it.
 */
export function selectOption(labelText: string, optionName: string): void {
  const trigger = screen.getByLabelText(labelText);
  fireEvent.click(trigger);
  const listbox = screen.getByRole("listbox");
  fireEvent.mouseDown(within(listbox).getByRole("option", { name: optionName }));
}
