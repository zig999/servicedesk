import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useTestConnectorPanel,
  type TestConnectorResult,
  type TestDispatchOutcome,
} from "./use-test-connector-panel";
import type { Capability } from "./use-capabilities";

/**
 * Proof for task/connector-test-panel-dispatch-state/discriminate-test-dispatch-outcome's own
 * (sole) criterion: TestConnectorPanelState's testOutcome field can no longer represent,
 * simultaneously, a result from a previous successful call and an error from a more recent
 * failed call -- the type's own structure (a discriminated union) makes that combination
 * unrepresentable, not merely avoided at runtime.
 *
 * A runtime `expect` cannot witness a claim about the type system itself: whatever a test
 * constructs at runtime, it constructs successfully, by definition -- the refusal this
 * criterion names is the compiler's, over the source text, not a wrong value produced by
 * running anything. So the proof below is the concrete construction the compiler must refuse
 * -- a "succeeded" outcome that also carries a fresh failed message, and its mirror, a "failed"
 * outcome that also carries a stale succeeded result -- each marked `@ts-expect-error`, checked
 * by the same typecheck step (`npm run typecheck`) this project's own suite already runs on
 * every proof (TYP-01's own tool). Neither `it` below asserts anything at runtime on purpose:
 * asserting on the value these two functions return would assert on a value the test itself
 * just built, which proves nothing (the JS emitted for a `@ts-expect-error`-suppressed line
 * still runs unchanged -- TypeScript's excess-property check has no runtime counterpart). The
 * actual assertion is the `@ts-expect-error` directive itself: TypeScript reports an "unused
 * '@ts-expect-error' directive" as a real compile error the moment the line below it no longer
 * errors -- which is exactly what happens if TestDispatchOutcome ever widens back toward a bag
 * of independent, simultaneously-settable fields (the old isTesting/result/testError trio this
 * task replaced) or if either existing variant gains the other's field. Each `it` closes with
 * `expect(typeof buildImpossibleOutcome).toBe("function")` only so the local it declares is
 * read (this project's own noUnusedLocals) through a call expression rather than a bare
 * reference -- a formality accompanying the real proof above it, asserting nothing this task's
 * criterion is actually about.
 */

const stubResult: TestConnectorResult = {
  request: { method: "POST", address: "https://api.example.com", headers: {} },
  response: { kind: "response", status: 200, headers: {}, elapsedMs: 1 },
};

describe("TestDispatchOutcome -- a stale succeeded result and a fresh failed message can never coexist in one value (criterion)", () => {
  it('refuses a "succeeded" outcome that also carries a fresh failed message', () => {
    const buildImpossibleOutcome = (): TestDispatchOutcome => {

      // @ts-expect-error - excess `message` field on the "succeeded" member, described above.
      return { kind: "succeeded", result: stubResult, message: "a fresh failure message" };
    };
    expect(typeof buildImpossibleOutcome).toBe("function");
  });

  it('refuses a "failed" outcome that also carries a stale succeeded result', () => {
    const buildImpossibleOutcome = (): TestDispatchOutcome => {

      // @ts-expect-error - excess `result` field on the "failed" member, described above.
      return { kind: "failed", message: "a fresh failure message", result: stubResult };
    };
    expect(typeof buildImpossibleOutcome).toBe("function");
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const CAPABILITIES_PATH = "/v1/capabilities";
const SUBJECT_TYPE_PATH = "/v1/glossary/subject-type";
const TEST_CONNECTOR_PATH = "/v1/test-connector";

const TEST_CAPABILITY: Capability = {
  name: "translate-text",
  version: "1.0.0",
  nature: "read-only",
  input_schema: '{"kind":"TranslateTextInput"}',
  output_schema: '{"kind":"TranslateTextOutput"}',
  timeout: 5000,
  connector: "deepl-connector",
  concept: "translation",
};

const CONFIGURATION_TEXT_WITH_PLACEHOLDER =
  '{"address":"https://api.example.com/${subject:account-id}"}';

const GENERIC_TEST_DISPATCH_FAILURE_MESSAGE =
  "The test call could not be sent. Check the selected capability, subject and requester, then try again.";

function testConnectorSuccessResult(): TestConnectorResult {
  return {
    request: {
      method: "POST",
      address: "https://api.deepl.example/v2/translate",
      headers: { "content-type": "application/json" },
      body: { text: "hello" },
    },
    response: {
      kind: "response",
      status: 200,
      headers: { "content-type": "application/json" },
      body: { translation: "hola" },
      elapsedMs: 42,
    },
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function capabilitiesPage(data: readonly Capability[]): unknown {
  return { data, total: data.length, limit: 20, offset: 0, pageCount: 1 };
}

function subjectTypeTermsPage(names: readonly string[]): unknown {
  return {
    data: names.map((name) => ({ name })),
    total: names.length,
    limit: 20,
    offset: 0,
    pageCount: 1,
  };
}

type FetchHandler = () => Response | Promise<Response>;

function stubFetch(handlers: Partial<Record<string, FetchHandler>>): void {
  const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (handler === undefined) {
      throw new Error(`use-test-connector-panel proof: no mocked response registered for ${url}`);
    }
    return handler();
  });
  vi.stubGlobal("fetch", fetchMock);
}

function baseHandlers(): Partial<Record<string, FetchHandler>> {
  return {
    [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([TEST_CAPABILITY])),
    [SUBJECT_TYPE_PATH]: () => jsonResponse(subjectTypeTermsPage(["billing-dispute"])),
  };
}

function createWrapper(): { Wrapper: (props: { children: ReactNode }) => ReactElement } {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
  return { Wrapper };
}

async function mountReadyPanel() {
  const { result } = renderHook(
    () => useTestConnectorPanel("deepl-connector", CONFIGURATION_TEXT_WITH_PLACEHOLDER),
    { wrapper: createWrapper().Wrapper },
  );

  await waitFor(() => expect(result.current.capabilityOptions.length).toBeGreaterThan(0));

  act(() => {
    result.current.onSelectCapability(`${TEST_CAPABILITY.name}@${TEST_CAPABILITY.version}`);
    result.current.onSubjectTypeChange("billing-dispute");
    result.current.onRequesterChange("operator@example.com");
  });
  act(() => {
    result.current.onAddAttribute();
  });
  const rowId = result.current.attributes[0]?.id;
  if (rowId === undefined) {
    throw new Error("use-test-connector-panel proof: expected onAddAttribute to add one row");
  }
  act(() => {
    result.current.onAttributeChange(rowId, "value", "12345");
  });

  if (!result.current.canTest) {
    throw new Error(
      "use-test-connector-panel proof: expected canTest to be true once every required field was filled",
    );
  }
  return result;
}

describe("useTestConnectorPanel -- testOutcome is derived from the mutation's own state, not a separately-set useState (criterion 1)", () => {
  it("starts as {kind: 'idle'} before any dispatch has ever been made", () => {
    stubFetch(baseHandlers());
    const { result } = renderHook(
      () => useTestConnectorPanel("deepl-connector", CONFIGURATION_TEXT_WITH_PLACEHOLDER),
      { wrapper: createWrapper().Wrapper },
    );

    expect(result.current.testOutcome).toEqual({ kind: "idle" });
  });

  it("reports pending exactly while a dispatch is in flight, then succeeded once it resolves -- tracking the mutation's own status on every render rather than a value a callback set once", async () => {
    let resolveTestConnector: ((value: Response) => void) | undefined;
    const pendingResponse = new Promise<Response>((resolve) => {
      resolveTestConnector = resolve;
    });
    stubFetch({
      ...baseHandlers(),
      [TEST_CONNECTOR_PATH]: () => pendingResponse,
    });
    const result = await mountReadyPanel();

    act(() => {
      result.current.onTest();
    });
    await waitFor(() => expect(result.current.testOutcome.kind).toBe("pending"));
    expect(result.current.testOutcome).toEqual({ kind: "pending" });

    resolveTestConnector?.(jsonResponse(testConnectorSuccessResult()));
    await waitFor(() => expect(result.current.testOutcome.kind).toBe("succeeded"));
    expect(result.current.testOutcome).toEqual({
      kind: "succeeded",
      result: testConnectorSuccessResult(),
    });
  });
});

describe("useTestConnectorPanel -- a second dispatch's own outcome never carries the first dispatch's own leftover result or message (criterion 2)", () => {
  it('replaces a first dispatch\'s own succeeded result with exactly {kind: "failed", message} once a second dispatch fails, carrying no leftover result field', async () => {
    let testConnectorCallCount = 0;
    stubFetch({
      ...baseHandlers(),
      [TEST_CONNECTOR_PATH]: () => {
        testConnectorCallCount += 1;
        if (testConnectorCallCount === 1) {
          return jsonResponse(testConnectorSuccessResult());
        }
        return jsonResponse(
          { error: { code: "CaseNotFoundError", message: "raw backend message nobody sees" } },
          404,
        );
      },
    });
    const result = await mountReadyPanel();

    act(() => {
      result.current.onTest();
    });
    await waitFor(() => expect(result.current.testOutcome.kind).toBe("succeeded"));
    expect(result.current.testOutcome).toEqual({
      kind: "succeeded",
      result: testConnectorSuccessResult(),
    });

    act(() => {
      result.current.onTest();
    });
    await waitFor(() => expect(result.current.testOutcome.kind).toBe("failed"));
    expect(result.current.testOutcome).toEqual({
      kind: "failed",
      message: GENERIC_TEST_DISPATCH_FAILURE_MESSAGE,
    });
  });

  it('replaces a first dispatch\'s own failed message with exactly {kind: "succeeded", result} once a second dispatch succeeds, carrying no leftover message field', async () => {
    let testConnectorCallCount = 0;
    stubFetch({
      ...baseHandlers(),
      [TEST_CONNECTOR_PATH]: () => {
        testConnectorCallCount += 1;
        if (testConnectorCallCount === 1) {
          return jsonResponse(
            { error: { code: "CaseNotFoundError", message: "raw backend message nobody sees" } },
            404,
          );
        }
        return jsonResponse(testConnectorSuccessResult());
      },
    });
    const result = await mountReadyPanel();

    act(() => {
      result.current.onTest();
    });
    await waitFor(() => expect(result.current.testOutcome.kind).toBe("failed"));
    expect(result.current.testOutcome).toEqual({
      kind: "failed",
      message: GENERIC_TEST_DISPATCH_FAILURE_MESSAGE,
    });

    act(() => {
      result.current.onTest();
    });
    await waitFor(() => expect(result.current.testOutcome.kind).toBe("succeeded"));
    expect(result.current.testOutcome).toEqual({
      kind: "succeeded",
      result: testConnectorSuccessResult(),
    });
  });
});
