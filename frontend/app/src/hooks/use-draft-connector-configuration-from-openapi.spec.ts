import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, useState, type ReactElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useDraftConnectorConfigurationFromOpenApi,
  type ConnectorConfigurationDraft,
  type ConnectorConfigurationDraftUnresolvedItem,
  type DraftConnectorConfigurationFromOpenApiRequest,
  type DraftConnectorConfigurationRequestOutcome,
} from "./use-draft-connector-configuration-from-openapi";

afterEach(() => {
  vi.unstubAllGlobals();
});

const DRAFT_ROUTE = "/v1/draft-connector-configuration-from-openapi";
const CONNECTOR = "deepl-connector";

const DRAFT_REQUEST: DraftConnectorConfigurationFromOpenApiRequest = {
  link: "https://api.example.com/openapi.json",
  path: "/v2/translate",
  method: "POST",
};

const FULL_DRAFT: ConnectorConfigurationDraft = {
  connector: CONNECTOR,
  configuration: '{"address":"https://api.example.com/v2/translate"}',
  unresolved: [{ name: "api-key", reason: "no-capability-registered" }],
  generated_credentials: [{ name: "api-key", security_scheme: "apiKey" }],
  method_mismatch: { registered: "GET", operation: "POST" },
};

const DRAFT_WITHOUT_METHOD_MISMATCH: ConnectorConfigurationDraft = {
  connector: CONNECTOR,
  configuration: "{}",
  unresolved: [],
  generated_credentials: [],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function errorResponse(code: string, details: unknown, status = 422): Response {
  return new Response(JSON.stringify({ error: { code, message: "the request was refused", details } }), { status });
}

type CapturedCall = { readonly url: string; readonly init: RequestInit | undefined };
type FetchHandler = () => Response | Promise<Response>;

function stubFetch(handler: FetchHandler): { readonly calls: CapturedCall[] } {
  const calls: CapturedCall[] = [];
  const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    calls.push({ url, init });
    if (url !== DRAFT_ROUTE) {
      throw new Error(`use-draft-connector-configuration-from-openapi proof: no mocked response for ${url}`);
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
    throw new Error("use-draft-connector-configuration-from-openapi proof: expected a string request body");
  }
  return JSON.parse(body);
}

function mount() {
  return renderHook(() => useDraftConnectorConfigurationFromOpenApi(CONNECTOR), { wrapper: createWrapper() }).result;
}

type DispatchableResult = {
  readonly current: {
    readonly outcome: DraftConnectorConfigurationRequestOutcome;
    readonly requestDraft: (request: DraftConnectorConfigurationFromOpenApiRequest) => void;
  };
};

async function dispatchAndWaitFor(
  result: DispatchableResult,
  request: DraftConnectorConfigurationFromOpenApiRequest,
  expectedKind: DraftConnectorConfigurationRequestOutcome["kind"],
): Promise<void> {
  act(() => {
    result.current.requestDraft(request);
  });
  await waitFor(() => expect(result.current.outcome.kind).toBe(expectedKind));
}

async function mountAndDispatch(
  handler: FetchHandler,
  expectedKind: DraftConnectorConfigurationRequestOutcome["kind"],
  request: DraftConnectorConfigurationFromOpenApiRequest = DRAFT_REQUEST,
): Promise<{ readonly result: ReturnType<typeof mount>; readonly calls: CapturedCall[] }> {
  const { calls } = stubFetch(handler);
  const result = mount();
  await dispatchAndWaitFor(result, request, expectedKind);
  return { result, calls };
}

describe("useDraftConnectorConfigurationFromOpenApi -- a dispatched request's body (criterion 1)", () => {
  it("sends exactly {connector, link, path, method} in the POST body, with the connector the hook was constructed with", async () => {
    const { calls } = await mountAndDispatch(() => jsonResponse(FULL_DRAFT), "drafted");

    expect(calls).toHaveLength(1);
    expect(parsedBody(calls[0])).toEqual({
      connector: CONNECTOR,
      link: DRAFT_REQUEST.link,
      path: DRAFT_REQUEST.path,
      method: DRAFT_REQUEST.method,
    });
  });
});

describe("useDraftConnectorConfigurationFromOpenApi -- the request reaches the published route alone (criterion 2, criterion 11, criterion 12)", () => {
  it("issues its one network call to the published draft route, never to the operator-supplied link or any other route", async () => {
    const { calls } = await mountAndDispatch(() => jsonResponse(FULL_DRAFT), "drafted");

    expect(calls.map((call) => call.url)).toEqual([DRAFT_ROUTE]);
  });
});

describe("useDraftConnectorConfigurationFromOpenApi -- an answered draft is exposed unmodified from the response body (criterion 3)", () => {
  it("exposes connector, configuration, unresolved, generated_credentials and method_mismatch exactly as named, when a mismatch stands", async () => {
    const { result } = await mountAndDispatch(() => jsonResponse(FULL_DRAFT), "drafted");

    expect(result.current.outcome).toEqual({ kind: "drafted", draft: FULL_DRAFT });
  });

  it("exposes no method_mismatch field at all when the response named none", async () => {
    const { result } = await mountAndDispatch(() => jsonResponse(DRAFT_WITHOUT_METHOD_MISMATCH), "drafted");

    const outcome = result.current.outcome;
    if (outcome.kind !== "drafted") {
      throw new Error("use-draft-connector-configuration-from-openapi proof: expected a drafted outcome");
    }
    expect(Object.prototype.hasOwnProperty.call(outcome.draft, "method_mismatch")).toBe(false);
  });
});

describe("useDraftConnectorConfigurationFromOpenApi -- an empty unresolved or generated-credentials list is exposed empty, not absent (criterion 4)", () => {
  it("exposes unresolved and generated_credentials as empty arrays when the response answered both empty", async () => {
    const { result } = await mountAndDispatch(() => jsonResponse(DRAFT_WITHOUT_METHOD_MISMATCH), "drafted");

    const outcome = result.current.outcome;
    if (outcome.kind !== "drafted") {
      throw new Error("use-draft-connector-configuration-from-openapi proof: expected a drafted outcome");
    }
    expect(outcome.draft.unresolved).toEqual([]);
    expect(outcome.draft.generated_credentials).toEqual([]);
  });
});

describe("useDraftConnectorConfigurationFromOpenApi -- an answered draft never carries a capability name, version or count (criterion 5)", () => {
  it("exposes no name, version or count field even when the response body carries them", async () => {
    const { result } = await mountAndDispatch(
      () =>
        jsonResponse({
          connector: CONNECTOR,
          configuration: "{}",
          unresolved: [],
          generated_credentials: [],
          name: "translate-text",
          version: "1.0.0",
          count: 3,
        }),
      "drafted",
    );

    const outcome = result.current.outcome;
    if (outcome.kind !== "drafted") {
      throw new Error("use-draft-connector-configuration-from-openapi proof: expected a drafted outcome");
    }
    for (const key of ["name", "version", "count"]) {
      expect(Object.prototype.hasOwnProperty.call(outcome.draft, key)).toBe(false);
    }
  });
});

type RefusalCase = { readonly label: string; readonly code: string; readonly details: unknown; readonly status?: number; readonly expected: DraftConnectorConfigurationRequestOutcome };

const REFUSAL_CASES: readonly RefusalCase[] = [
  { label: "OpenApiDocumentNotFetchedError (criterion 6): its own outcome, carrying the link and the status-outside-2xx status", code: "OpenApiDocumentNotFetchedError", details: { link: DRAFT_REQUEST.link, kind: "status-outside-2xx", status: 503 }, expected: { kind: "openapi-document-not-fetched", link: DRAFT_REQUEST.link, failure: { kind: "status-outside-2xx", status: 503 } } },
  { label: "OpenApiDocumentNotReadableError (criterion 7): its own outcome, carrying no data from the other refusals", code: "OpenApiDocumentNotReadableError", details: { kind: "unparseable", detail: "not valid JSON" }, expected: { kind: "openapi-document-not-readable" } },
  { label: "OpenApiOperationNotFoundError (criterion 8): its own outcome, carrying the path and method", code: "OpenApiOperationNotFoundError", details: { path: "/v2/translate", method: "PATCH" }, expected: { kind: "openapi-operation-not-found", path: "/v2/translate", method: "PATCH" } },
  { label: "an error code none of the three name (criterion 9): unrecognized-failure", code: "CaseNotFoundError", details: { anything: "here" }, status: 404, expected: { kind: "unrecognized-failure" } },
];

describe("useDraftConnectorConfigurationFromOpenApi -- each refused request is its own distinguishable outcome, carrying no draft field (criteria 6, 7, 8, 9, 10)", () => {
  it.each(REFUSAL_CASES)("exposes $label", async ({ code, details, status, expected }) => {
    const { result } = await mountAndDispatch(() => errorResponse(code, details, status), expected.kind);

    expect(result.current.outcome).toEqual(expected);
  });

  it("exposes exactly {kind: 'unrecognized-failure'} for a raw, non-ApiError throw (the request itself failing outright)", async () => {
    const { result } = await mountAndDispatch(() => {
      throw new TypeError("network failure reaching this project's own backend");
    }, "unrecognized-failure");

    expect(result.current.outcome).toEqual({ kind: "unrecognized-failure" });
  });
});

describe("useDraftConnectorConfigurationFromOpenApi -- the connector is bound once at construction, not supplied per dispatch (inference)", () => {
  it("sends the same connector value on a second dispatch made with a different link, path and method", async () => {
    const { result, calls } = await mountAndDispatch(() => jsonResponse(FULL_DRAFT), "drafted");

    act(() => {
      result.current.requestDraft({ link: "https://second.example.com/openapi.json", path: "/v3/other", method: "GET" });
    });
    await waitFor(() => expect(calls).toHaveLength(2));

    expect(parsedBody(calls[1])).toMatchObject({ connector: CONNECTOR });
  });
});

describe("useDraftConnectorConfigurationFromOpenApi -- idle and pending are their own variants, no refusal is exposed before the operation answers (inference)", () => {
  it("starts as {kind: 'idle'}, then reports exactly {kind: 'pending'} with no refusal data while outstanding", async () => {
    let resolveDraft: ((value: Response) => void) | undefined;
    const pendingResponse = new Promise<Response>((resolve) => {
      resolveDraft = resolve;
    });
    stubFetch(() => pendingResponse);
    const result = mount();
    expect(result.current.outcome).toEqual({ kind: "idle" });

    await dispatchAndWaitFor(result, DRAFT_REQUEST, "pending");
    expect(result.current.outcome).toEqual({ kind: "pending" });

    resolveDraft?.(jsonResponse(FULL_DRAFT));
    await waitFor(() => expect(result.current.outcome.kind).toBe("drafted"));
  });
});

describe("ConnectorConfigurationDraftUnresolvedItem -- reason is a plain string, not narrowed to the closed set of four reason literals (inference)", () => {
  it("type-checks a reason value outside the closed reason set", () => {
    const buildItem = (): ConnectorConfigurationDraftUnresolvedItem => ({
      name: "api-key",
      reason: "a-reason-the-closed-four-value-set-does-not-name",
    });
    expect(typeof buildItem).toBe("function");
  });
});

describe("useDraftConnectorConfigurationFromOpenApi -- never writes to the Configuration field's own local state (per the task's UNDERDETERMINED note)", () => {
  it("leaves an independently-held configuration field value unchanged after a draft answers with different configuration text", async () => {
    const LOCAL_CONFIGURATION_TEXT = "the operator's own untouched configuration text";
    stubFetch(() => jsonResponse(FULL_DRAFT));

    function useCombined() {
      const [configurationFieldText] = useState(LOCAL_CONFIGURATION_TEXT);
      const draft = useDraftConnectorConfigurationFromOpenApi(CONNECTOR);
      return { configurationFieldText, ...draft };
    }

    const { result } = renderHook(useCombined, { wrapper: createWrapper() });
    await dispatchAndWaitFor(result, DRAFT_REQUEST, "drafted");

    expect(result.current.configurationFieldText).toBe(LOCAL_CONFIGURATION_TEXT);
  });
});

describe("useDraftConnectorConfigurationFromOpenApi -- a second dispatch while the first is in flight is ignored (edge case: concurrent dispatch)", () => {
  it("issues exactly one network call when requestDraft is invoked twice before the first settles", async () => {
    let resolveDraft: ((value: Response) => void) | undefined;
    const pendingResponse = new Promise<Response>((resolve) => {
      resolveDraft = resolve;
    });
    const { calls } = stubFetch(() => pendingResponse);
    const result = mount();

    act(() => {
      result.current.requestDraft(DRAFT_REQUEST);
      result.current.requestDraft(DRAFT_REQUEST);
    });
    await waitFor(() => expect(result.current.outcome.kind).toBe("pending"));
    expect(calls).toHaveLength(1);

    resolveDraft?.(jsonResponse(FULL_DRAFT));
    await waitFor(() => expect(result.current.outcome.kind).toBe("drafted"));
  });
});
