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
      // TestDispatchOutcome's "succeeded" member declares only `kind` and `result`; a
      // `message` alongside them is the stale-result-plus-fresh-error combination this task's
      // criterion makes unrepresentable, so this literal's `message` field must be excess
      // against every member of the union. If this stops erroring, the directive immediately
      // below itself becomes an unused-directive compile error, which is how a regression here
      // is caught.
      // @ts-expect-error - excess `message` field on the "succeeded" member, described above.
      return { kind: "succeeded", result: stubResult, message: "a fresh failure message" };
    };
    expect(typeof buildImpossibleOutcome).toBe("function");
  });

  it('refuses a "failed" outcome that also carries a stale succeeded result', () => {
    const buildImpossibleOutcome = (): TestDispatchOutcome => {
      // TestDispatchOutcome's "failed" member declares only `kind` and `message`; a `result`
      // alongside them is the same impossible combination read from the other member's own
      // side, so this literal's `result` field must be excess against every member of the
      // union. If this stops erroring, the directive immediately below itself becomes an
      // unused-directive compile error, which is how a regression here is caught.
      // @ts-expect-error - excess `result` field on the "failed" member, described above.
      return { kind: "failed", message: "a fresh failure message", result: stubResult };
    };
    expect(typeof buildImpossibleOutcome).toBe("function");
  });
});

/**
 * Runtime proof for task/connector-test-panel-dispatch-state/derive-outcome-from-mutation's own
 * two criteria:
 *
 *  1. testOutcome is computed from useMutation's own status/data/error at render/return time
 *     (testOutcomeFromMutation, use-test-connector-panel.ts's own module-level function) rather
 *     than a separately-set useState assigned inside onSuccess/onError -- proven below by
 *     showing testOutcome tracks whatever the mutation's own status currently is (idle, then
 *     pending, then succeeded) on every render, with no other path exposed to set it.
 *  2. The original TYP-04 fix still holds under that new derivation: a first dispatch's own
 *     succeeded result never survives alongside a second dispatch's own failed message, or vice
 *     versa -- proven below by dispatching twice in both orders and asserting the exact shape
 *     testOutcome holds afterwards, with no leftover field from the first call.
 *
 * useTestConnectorPanel composes two dependent reads of its own (useCapabilities,
 * useGlossaryVocabularyOptions) before a dispatch is even possible, so every test below stubs
 * global fetch for all three endpoints (TST-03: the network is the boundary stood in for, never
 * this hook's own logic) and mountReadyPanel() fills every field canTest gates on -- capability,
 * subject type, one complete attribute row, requester -- so onTest actually reaches
 * mutation.mutate(). The fixtures mirror src/routes/connector-test-panel.test-support.ts's own
 * (one capability, one subject-type term, a configuration text embedding exactly one
 * ${subject:account-id} placeholder) rather than inventing a second set of them.
 */

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

// Mirrors use-test-connector-panel.ts's own private GENERIC_TEST_DISPATCH_FAILURE_MESSAGE
// literal -- not exported, so restated here the same way
// connector-test-panel-fresh-failure-clears-stale-result.spec.ts's own findByText assertion
// already hardcodes it.
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

// Built once per test and captured in this closure, mirroring
// use-simulate-case.test-support.ts's own createWrapper -- a QueryClient built inline inside the
// returned component would be rebuilt on every render, discarding its cache mid-test.
function createWrapper(): { Wrapper: (props: { children: ReactNode }) => ReactElement } {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
  return { Wrapper };
}

/**
 * Mounts useTestConnectorPanel against a stubbed fetch (assumed already installed by the
 * caller through stubFetch, so the eventual test-connector dispatch resolves however that test
 * needs it to) and fills every field canTest gates on: selects the one stubbed capability,
 * types a subject type, adds and completes the one attribute row CONFIGURATION_TEXT_WITH_PLACEHOLDER's
 * own ${subject:account-id} placeholder reconciles to, and types a requester. Returns the live
 * renderHook `result` so each test drives its own onTest()/assertion sequence from here.
 */
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
