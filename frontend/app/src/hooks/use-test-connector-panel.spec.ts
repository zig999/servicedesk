import { describe, expect, it } from "vitest";
import type { TestConnectorResult, TestDispatchOutcome } from "./use-test-connector-panel";

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
