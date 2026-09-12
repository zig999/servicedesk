import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useDraftConnectorConfigurationFromOpenApi,
  type ConnectorConfigurationDraft,
  type ConnectorConfigurationDraftReadingNote,
  type ConnectorConfigurationDraftReadingNoteKind,
  type ConnectorConfigurationDraftResponseField,
  type ConnectorConfigurationDraftStatusReading,
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
  status_readings: [],
  response_fields: [],
  reading_notes: [],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

type CapturedCall = { readonly url: string; readonly init: RequestInit | undefined };
type FetchHandler = () => Response | Promise<Response>;

function stubFetch(handler: FetchHandler): { readonly calls: CapturedCall[] } {
  const calls: CapturedCall[] = [];
  const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    calls.push({ url, init });
    if (url !== DRAFT_ROUTE) {
      throw new Error(`use-draft-connector-configuration-from-openapi-reading-parts proof: no mocked response for ${url}`);
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

describe("useDraftConnectorConfigurationFromOpenApi -- each status reading carries its status and ending always, and its declared_as exactly when the answer named one (criterion 1; domain/integration/connector-configuration-draft-status-reading)", () => {
  it("carries declared_as through when the answer named one, and carries no declared_as key at all when it named none", async () => {
    const statusReadingWithDeclaredAs: ConnectorConfigurationDraftStatusReading = {
      status: "200",
      ending: "read-through",
      declared_as: "Successful translation",
    };
    const statusReadingWithoutDeclaredAs: ConnectorConfigurationDraftStatusReading = {
      status: "404",
      ending: "not-drafted",
    };
    const { result } = await mountAndDispatch(
      () =>
        jsonResponse({
          ...FULL_DRAFT,
          status_readings: [statusReadingWithDeclaredAs, statusReadingWithoutDeclaredAs],
        }),
      "drafted",
    );

    const outcome = result.current.outcome;
    if (outcome.kind !== "drafted") {
      throw new Error("use-draft-connector-configuration-from-openapi-reading-parts proof: expected a drafted outcome");
    }
    expect(outcome.draft.status_readings).toEqual([statusReadingWithDeclaredAs, statusReadingWithoutDeclaredAs]);
    expect(Object.prototype.hasOwnProperty.call(outcome.draft.status_readings[1], "declared_as")).toBe(false);
  });
});

describe("useDraftConnectorConfigurationFromOpenApi -- each response field carries its name, path and status always, and its declared_type, declared_required and envelope exactly when the answer named them (criterion 2; domain/integration/connector-configuration-draft-response-field)", () => {
  it("carries declared_type, declared_required and envelope through when the answer named them, and carries none of the three when it named none", async () => {
    const responseFieldWithOptionalTerms: ConnectorConfigurationDraftResponseField = {
      name: "translatedText",
      path: "translations.0.text",
      status: "200",
      declared_type: "string",
      declared_required: true,
      envelope: "translations",
    };
    const responseFieldWithoutOptionalTerms: ConnectorConfigurationDraftResponseField = {
      name: "detectedLanguage",
      path: "translations.0.detected_source_language",
      status: "200",
    };
    const { result } = await mountAndDispatch(
      () =>
        jsonResponse({
          ...FULL_DRAFT,
          response_fields: [responseFieldWithOptionalTerms, responseFieldWithoutOptionalTerms],
        }),
      "drafted",
    );

    const outcome = result.current.outcome;
    if (outcome.kind !== "drafted") {
      throw new Error("use-draft-connector-configuration-from-openapi-reading-parts proof: expected a drafted outcome");
    }
    expect(outcome.draft.response_fields).toEqual([responseFieldWithOptionalTerms, responseFieldWithoutOptionalTerms]);
    for (const key of ["declared_type", "declared_required", "envelope"]) {
      expect(Object.prototype.hasOwnProperty.call(outcome.draft.response_fields[1], key)).toBe(false);
    }
  });
});

describe("useDraftConnectorConfigurationFromOpenApi -- each reading note carries its kind and subject always, and its detail exactly when the answer named one (criterion 3; domain/integration/connector-configuration-draft-reading-note)", () => {
  it("carries detail through when the answer named one, and carries no detail key at all when it named none", async () => {
    const readingNoteWithDetail: ConnectorConfigurationDraftReadingNote = {
      kind: "repeated-field-name-path-not-taken",
      subject: "translations.1.text",
      detail: "GET /v2/translate",
    };
    const readingNoteWithoutDetail: ConnectorConfigurationDraftReadingNote = {
      kind: "no-responses-declared",
      subject: "POST /v2/translate",
    };
    const { result } = await mountAndDispatch(
      () =>
        jsonResponse({
          ...FULL_DRAFT,
          reading_notes: [readingNoteWithDetail, readingNoteWithoutDetail],
        }),
      "drafted",
    );

    const outcome = result.current.outcome;
    if (outcome.kind !== "drafted") {
      throw new Error("use-draft-connector-configuration-from-openapi-reading-parts proof: expected a drafted outcome");
    }
    expect(outcome.draft.reading_notes).toEqual([readingNoteWithDetail, readingNoteWithoutDetail]);
    expect(Object.prototype.hasOwnProperty.call(outcome.draft.reading_notes[1], "detail")).toBe(false);
  });
});

const ALL_NINE_READING_NOTE_KINDS: readonly ConnectorConfigurationDraftReadingNoteKind[] = [
  "default-response-not-drafted",
  "status-range-not-drafted",
  "non-json-success-content-not-read",
  "envelope-read-through",
  "variants-united",
  "repeated-field-name-path-not-taken",
  "no-responses-declared",
  "no-success-response-schema",
  "success-schema-declares-no-properties",
];

describe("useDraftConnectorConfigurationFromOpenApi -- the reading admits each of the nine reading-note kinds and no kind outside them (criterion 4; domain/integration/connector-configuration-draft-reading-note-kind)", () => {
  it("carries all nine kinds through unmodified, in order, and refuses a tenth kind at the type level", async () => {
    const readingNotes = ALL_NINE_READING_NOTE_KINDS.map((kind, index) => ({
      kind,
      subject: `subject-${index}`,
    }));
    const { result } = await mountAndDispatch(
      () => jsonResponse({ ...FULL_DRAFT, reading_notes: readingNotes }),
      "drafted",
    );

    const outcome = result.current.outcome;
    if (outcome.kind !== "drafted") {
      throw new Error("use-draft-connector-configuration-from-openapi-reading-parts proof: expected a drafted outcome");
    }
    expect(outcome.draft.reading_notes.map((note) => note.kind)).toEqual(ALL_NINE_READING_NOTE_KINDS);

    function buildReadingNoteWithKindOutsideTheNine(): ConnectorConfigurationDraftReadingNote {
      return {
        // @ts-expect-error "a-tenth-kind-the-vocabulary-does-not-name" is not one of the nine reading-note kinds
        kind: "a-tenth-kind-the-vocabulary-does-not-name",
        subject: "GET /v2/translate",
      };
    }
    expect(typeof buildReadingNoteWithKindOutsideTheNine).toBe("function");
  });
});
