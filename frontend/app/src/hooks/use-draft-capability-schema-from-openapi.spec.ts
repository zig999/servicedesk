import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useDraftCapabilitySchemaFromOpenApi,
  type CapabilitySchemaDraft,
  type DraftCapabilitySchemaFromOpenApiRequest,
  type DraftCapabilitySchemaRequestOutcome,
} from "./use-draft-capability-schema-from-openapi";

afterEach(() => {
  vi.unstubAllGlobals();
});

const DRAFT_ROUTE = "/v1/draft-capability-schema-from-openapi";

const DRAFT_REQUEST: DraftCapabilitySchemaFromOpenApiRequest = {
  link: "https://api.example.com/openapi.json",
  path: "/v2/translate",
  method: "POST",
};

const FULL_DRAFT: CapabilitySchemaDraft = {
  input_schema: '{"type":"object","properties":{"text":{"type":"string"}},"required":["text"]}',
  output_schema: '{"type":"object","properties":{"translation":{"type":"string"}}}',
  unresolved: [{ name: "locale", reason: "schema-not-reducible-to-a-type" }],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function errorResponse(code: string, status = 422): Response {
  return new Response(JSON.stringify({ error: { code, message: "the request was refused" } }), { status });
}

type CapturedCall = { readonly url: string; readonly init: RequestInit | undefined };
type FetchHandler = () => Response | Promise<Response>;

function stubFetch(handler: FetchHandler): { readonly calls: CapturedCall[] } {
  const calls: CapturedCall[] = [];
  const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    calls.push({ url, init });
    if (url !== DRAFT_ROUTE) {
      throw new Error(`use-draft-capability-schema-from-openapi proof: no mocked response for ${url}`);
    }
    return handler();
  });
  vi.stubGlobal("fetch", fetchMock);
  return { calls };
}

function createWrapper(): (props: { children: ReactNode }) => ReactElement {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function parsedBody(call: CapturedCall): unknown {
  const body = call.init?.body;
  if (typeof body !== "string") {
    throw new Error("use-draft-capability-schema-from-openapi proof: expected a string request body");
  }
  return JSON.parse(body);
}

function mount() {
  return renderHook(() => useDraftCapabilitySchemaFromOpenApi(), { wrapper: createWrapper() }).result;
}

type DispatchableResult = {
  readonly current: {
    readonly outcome: DraftCapabilitySchemaRequestOutcome;
    readonly requestDraft: (request: DraftCapabilitySchemaFromOpenApiRequest) => void;
  };
};

async function dispatchAndWaitFor(
  result: DispatchableResult,
  request: DraftCapabilitySchemaFromOpenApiRequest,
  expectedKind: DraftCapabilitySchemaRequestOutcome["kind"],
): Promise<void> {
  act(() => {
    result.current.requestDraft(request);
  });
  await waitFor(() => expect(result.current.outcome.kind).toBe(expectedKind));
}

async function mountAndDispatch(
  handler: FetchHandler,
  expectedKind: DraftCapabilitySchemaRequestOutcome["kind"],
  request: DraftCapabilitySchemaFromOpenApiRequest = DRAFT_REQUEST,
): Promise<{ readonly result: ReturnType<typeof mount>; readonly calls: CapturedCall[] }> {
  const { calls } = stubFetch(handler);
  const result = mount();
  await dispatchAndWaitFor(result, request, expectedKind);
  return { result, calls };
}

describe("useDraftCapabilitySchemaFromOpenApi -- the dispatched request's body (criterion 1)", () => {
  it("sends exactly {link, path, method} in the POST body, taken from the request passed to requestDraft", async () => {
    const { calls } = await mountAndDispatch(() => jsonResponse(FULL_DRAFT), "drafted");

    expect(calls).toHaveLength(1);
    expect(parsedBody(calls[0])).toEqual({
      link: DRAFT_REQUEST.link,
      path: DRAFT_REQUEST.path,
      method: DRAFT_REQUEST.method,
    });
  });
});

describe("useDraftCapabilitySchemaFromOpenApi -- the request reaches the published draft operation alone (criteria 2 and 3)", () => {
  it("issues exactly one network call, to the published draft route, never to the operator-named link itself or to any other operation", async () => {
    const { calls } = await mountAndDispatch(() => jsonResponse(FULL_DRAFT), "drafted");

    expect(calls.map((call) => call.url)).toEqual([DRAFT_ROUTE]);
  });
});

describe("useDraftCapabilitySchemaFromOpenApi -- a 200 answer's draft is exposed with exactly its declared top-level fields (criteria 4 and 11)", () => {
  it("carries the link, path and method of the request answered, and a draft holding exactly input_schema, output_schema and unresolved -- no field the answer's top level did not carry", async () => {
    const { result } = await mountAndDispatch(
      () =>
        jsonResponse({
          ...FULL_DRAFT,
          capability_name: "translate-text",
          generated_at: "2026-09-15T00:00:00Z",
        }),
      "drafted",
    );

    const outcome = result.current.outcome;
    if (outcome.kind !== "drafted") {
      throw new Error("use-draft-capability-schema-from-openapi proof: expected a drafted outcome");
    }
    expect(outcome.link).toBe(DRAFT_REQUEST.link);
    expect(outcome.path).toBe(DRAFT_REQUEST.path);
    expect(outcome.method).toBe(DRAFT_REQUEST.method);
    expect(outcome.draft).toEqual({
      input_schema: FULL_DRAFT.input_schema,
      output_schema: FULL_DRAFT.output_schema,
      unresolved: FULL_DRAFT.unresolved,
    });
    expect(Object.prototype.hasOwnProperty.call(outcome.draft, "capability_name")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(outcome.draft, "generated_at")).toBe(false);
  });
});

describe("useDraftCapabilitySchemaFromOpenApi -- each unresolved item is exposed with exactly its name and reason (criterion 4)", () => {
  it("strips any field an unresolved item carried beyond name and reason", async () => {
    const { result } = await mountAndDispatch(
      () =>
        jsonResponse({
          input_schema: FULL_DRAFT.input_schema,
          output_schema: FULL_DRAFT.output_schema,
          unresolved: [{ name: "locale", reason: "schema-not-reducible-to-a-type", parameter_location: "query" }],
        }),
      "drafted",
    );

    const outcome = result.current.outcome;
    if (outcome.kind !== "drafted") {
      throw new Error("use-draft-capability-schema-from-openapi proof: expected a drafted outcome");
    }
    expect(outcome.draft.unresolved).toEqual([{ name: "locale", reason: "schema-not-reducible-to-a-type" }]);
  });
});

describe("useDraftCapabilitySchemaFromOpenApi -- an empty unresolved list is exposed empty, not absent (criterion 4)", () => {
  it("exposes unresolved as an empty array when the answer carried none", async () => {
    const { result } = await mountAndDispatch(
      () => jsonResponse({ input_schema: "{}", output_schema: "{}", unresolved: [] }),
      "drafted",
    );

    const outcome = result.current.outcome;
    if (outcome.kind !== "drafted") {
      throw new Error("use-draft-capability-schema-from-openapi proof: expected a drafted outcome");
    }
    expect(outcome.draft.unresolved).toEqual([]);
  });
});

type NamedRefusalCase = {
  readonly label: string;
  readonly code: string;
  readonly expectedKind: "openapi-document-not-fetched" | "openapi-document-not-readable" | "openapi-operation-not-found";
};

const NAMED_REFUSAL_CASES: readonly NamedRefusalCase[] = [
  { label: "OpenApiDocumentNotFetchedError (criterion 5)", code: "OpenApiDocumentNotFetchedError", expectedKind: "openapi-document-not-fetched" },
  { label: "OpenApiDocumentNotReadableError (criterion 6)", code: "OpenApiDocumentNotReadableError", expectedKind: "openapi-document-not-readable" },
  { label: "OpenApiOperationNotFoundError (criterion 7)", code: "OpenApiOperationNotFoundError", expectedKind: "openapi-operation-not-found" },
];

describe("useDraftCapabilitySchemaFromOpenApi -- each named refusal code is its own distinguishable outcome, carrying the answered request (criteria 5, 6, 7, 11)", () => {
  it.each(NAMED_REFUSAL_CASES)("resolves $label to $expectedKind, carrying the link, path and method of the request it answered", async ({ code, expectedKind }) => {
    const { result } = await mountAndDispatch(() => errorResponse(code), expectedKind);

    expect(result.current.outcome).toEqual({
      kind: expectedKind,
      link: DRAFT_REQUEST.link,
      path: DRAFT_REQUEST.path,
      method: DRAFT_REQUEST.method,
    });
  });
});

type UnrecognizedFailureCase = { readonly label: string; readonly handler: FetchHandler };

const UNRECOGNIZED_FAILURE_CASES: readonly UnrecognizedFailureCase[] = [
  { label: "an error code none of the three name (criterion 8)", handler: () => errorResponse("CaseNotFoundError") },
  {
    label: "the request failing outright with no answer at all (criterion 8's fallback; a dependency failing edge case)",
    handler: () => {
      throw new TypeError("network failure reaching this project's own backend");
    },
  },
];

describe("useDraftCapabilitySchemaFromOpenApi -- a failure matching none of the three named refusals resolves to unrecognized-failure (criterion 8)", () => {
  it.each(UNRECOGNIZED_FAILURE_CASES)("resolves $label to unrecognized-failure, distinct from drafted and the three named refusals", async ({ handler }) => {
    const { result } = await mountAndDispatch(handler, "unrecognized-failure");

    expect(result.current.outcome.kind).toBe("unrecognized-failure");
  });
});

describe("useDraftCapabilitySchemaFromOpenApi -- idle and pending precede any refusal (criteria 9 and 10)", () => {
  it("starts idle before any dispatch, stays pending -- neither drafted nor any refusal -- while the request is unanswered, and only reports a refusal once the operation actually answers", async () => {
    let settle: ((response: Response) => void) | undefined;
    const pendingResponse = new Promise<Response>((resolve) => {
      settle = resolve;
    });
    stubFetch(() => pendingResponse);
    const result = mount();

    expect(result.current.outcome).toEqual({ kind: "idle" });

    act(() => {
      result.current.requestDraft(DRAFT_REQUEST);
    });
    await waitFor(() => expect(result.current.outcome.kind).toBe("pending"));
    expect(result.current.outcome).toEqual({ kind: "pending" });

    settle?.(errorResponse("OpenApiDocumentNotReadableError"));
    await waitFor(() => expect(result.current.outcome.kind).toBe("openapi-document-not-readable"));
  });
});

describe("useDraftCapabilitySchemaFromOpenApi -- a second dispatch while the first is in flight is suppressed (criterion 12)", () => {
  it("issues exactly one network call when requestDraft is invoked twice before the first settles", async () => {
    let settle: ((response: Response) => void) | undefined;
    const pendingResponse = new Promise<Response>((resolve) => {
      settle = resolve;
    });
    const { calls } = stubFetch(() => pendingResponse);
    const result = mount();

    act(() => {
      result.current.requestDraft(DRAFT_REQUEST);
      result.current.requestDraft(DRAFT_REQUEST);
    });
    await waitFor(() => expect(result.current.outcome.kind).toBe("pending"));
    expect(calls).toHaveLength(1);

    settle?.(jsonResponse(FULL_DRAFT));
    await waitFor(() => expect(result.current.outcome.kind).toBe("drafted"));
  });
});
