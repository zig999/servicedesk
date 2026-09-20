import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSimulateHypothesis, type SimulateHypothesisResult } from "./use-simulate-hypothesis";
import type { SimulateCost } from "./use-simulate-case";
import {
  REQUESTER,
  SIMULATE_PATH,
  SLUG,
  SUBJECT,
  VERSION,
  createWrapper,
  definedResult,
  hypothesisCost,
  hypothesisDurations,
  jsonResponse,
  simulateHypothesisResult,
  stubFetch,
} from "./use-simulate-hypothesis.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SimulateHypothesisResult's cost is required and admits exactly SimulateCost's three members (criterion 1; demonstrates domain/investigation/cost)", () => {
  it("requires calls, input_tokens and output_tokens on cost, admits no other member, and the shared fixture's own cost carries exactly those three", () => {
    // @ts-expect-error -- cost is required on SimulateHypothesisResult, not optional (criterion 1).
    const missingCost: SimulateHypothesisResult = {
      evidence: [],
      evaluation: { hypothesis: "h", verdict: "confirmed", citations: [] },
      durations: hypothesisDurations(),
    };
    void missingCost;

    // @ts-expect-error -- calls is required on the reused SimulateCost shape (criterion 1).
    const missingCalls: SimulateCost = { input_tokens: 1, output_tokens: 1 };
    void missingCalls;

    // @ts-expect-error -- input_tokens is required on the reused SimulateCost shape (criterion 1).
    const missingInputTokens: SimulateCost = { calls: 1, output_tokens: 1 };
    void missingInputTokens;

    // @ts-expect-error -- output_tokens is required on the reused SimulateCost shape (criterion 1).
    const missingOutputTokens: SimulateCost = { calls: 1, input_tokens: 1 };
    void missingOutputTokens;

    // @ts-expect-error -- cost admits no member beyond calls, input_tokens and output_tokens (domain/investigation/cost's finite attribute list).
    const extraMember: SimulateCost = { calls: 1, input_tokens: 1, output_tokens: 1, extra: true };
    void extraMember;

    const validCost: SimulateCost = { calls: 1, input_tokens: 1, output_tokens: 1 };
    void validCost;

    expect(Object.keys(hypothesisCost()).sort()).toEqual(["calls", "input_tokens", "output_tokens"]);
  });
});

describe("SimulateHypothesisResult declares durations beside cost, with writing absent rather than present as a figure (criteria 3 and 4; demonstrates domain/investigation/durations)", () => {
  it("requires collection, judgment and total on durations, admits writing only optionally, admits no other member, and the shared fixture's own durations carries no writing key by default", () => {
    function assertBothMembersPresent(v: SimulateHypothesisResult): void {
      void v.cost;
      void v.durations;
    }
    void assertBothMembersPresent;

    // @ts-expect-error -- collection is required on durations (domain/investigation/durations).
    const missingCollection: SimulateHypothesisResult["durations"] = { judgment: 1, total: 1 };
    void missingCollection;

    // @ts-expect-error -- judgment is required on durations (domain/investigation/durations).
    const missingJudgment: SimulateHypothesisResult["durations"] = { collection: 1, total: 1 };
    void missingJudgment;

    // @ts-expect-error -- total is required on durations (domain/investigation/durations).
    const missingTotal: SimulateHypothesisResult["durations"] = { collection: 1, judgment: 1 };
    void missingTotal;

    // writing is optional: this compiles with no writing key at all (criterion 4).
    const noWriting: SimulateHypothesisResult["durations"] = { collection: 1, judgment: 1, total: 1 };
    void noWriting;

    // writing may still carry a number, for the (never this run's) case a consolidation call happened.
    const withWriting: SimulateHypothesisResult["durations"] = {
      collection: 1,
      judgment: 1,
      writing: 1,
      total: 1,
    };
    void withWriting;

    // @ts-expect-error -- durations admits no member beyond collection, judgment, writing and total (domain/investigation/durations' finite attribute list).
    const extraMember: SimulateHypothesisResult["durations"] = { collection: 1, judgment: 1, total: 1, extra: true };
    void extraMember;

    expect(Object.keys(hypothesisDurations()).sort()).toEqual(["collection", "judgment", "total"]);
  });
});

describe("useSimulateHypothesis -- onSimulate's result carries the response's cost unaltered, including a cost totalling exactly one judgment call and no consolidation call (criteria 5 and 6)", () => {
  it("returns exactly the cost the response sent, unmodified, for a cost whose calls total the one judgment call a hypothesis run makes", async () => {
    const distinctCost: SimulateCost = { calls: 1, input_tokens: 777, output_tokens: 333 };
    const fixture = simulateHypothesisResult();
    const responseBody: SimulateHypothesisResult = { ...fixture, cost: distinctCost };
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(responseBody) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(definedResult(result.current.result).cost).toEqual(distinctCost);
  });
});
