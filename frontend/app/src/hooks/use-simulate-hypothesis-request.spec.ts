import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useSimulateHypothesis,
  type Evaluation,
  type SimulateHypothesisResult,
} from "./use-simulate-hypothesis";
import {
  SIMULATE_PATH,
  SLUG,
  SUBJECT,
  VERSION,
  confirmedEvaluation,
  confirmedEvaluationWithJudgmentCall,
  createWrapper,
  definedResult,
  inconclusiveEvaluation,
  jsonResponse,
  parsedPostBody,
  simulateHypothesisResult,
  stubFetch,
} from "./use-simulate-hypothesis.test-support";

// task/simulation-cockpit/use-simulate-hypothesis's own criteria 1-3: the request dispatched
// names exactly one hypothesis and one subject -- never a manifest or a collection-plan union
// (scenarios/investigation/a-single-hypothesis-is-simulated, proven structurally per this task's
// own Notes: no live simulate-hypothesis backend exists yet to run the scenario against) -- and
// the typed success response carries exactly one evaluation, never an outcome or an assessment
// field. Criteria 4-6 live in the sibling use-simulate-hypothesis-dispatch-safety.spec.ts,
// mirroring connector-test-panel-request-response.spec.ts /
// connector-test-panel-dispatch-safety.spec.ts's own established split.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSimulateHypothesis — the dispatched request names exactly one hypothesis and one subject, never a manifest or a hypothesis collection (criterion 1, structural proof)", () => {
  it("sends only {hypothesis, subject} in the POST body, naming the one hypothesis passed to onSimulate", async () => {
    const fetchMock = stubFetch({
      [SIMULATE_PATH]: () => jsonResponse(simulateHypothesisResult()),
    });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-b", SUBJECT);
    });

    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(fetchMock.mock.calls.length).toBe(1);
    expect(parsedPostBody(fetchMock)).toEqual({ hypothesis: "hypothesis-b", subject: SUBJECT });
  });
});

describe("SimulateHypothesisResult carries exactly one evaluation, never an outcome or an assessment field (criteria 2-3)", () => {
  it("returns exactly the evaluation the mocked response carried, with no other key present at runtime", async () => {
    const evaluation = confirmedEvaluation();
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(simulateHypothesisResult(evaluation)) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(result.current.result).toEqual({ evaluation });
  });

  it("carries a citations array and no reason on a decided (confirmed/refuted) evaluation, matching domain/investigation/evaluation's own decided branch", async () => {
    const evaluation = confirmedEvaluation();
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(simulateHypothesisResult(evaluation)) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const returned = definedResult(result.current.result);
    expect(returned.evaluation.verdict).toBe("confirmed");
    expect("citations" in returned.evaluation).toBe(true);
    expect("reason" in returned.evaluation).toBe(false);
  });

  it("passes usage, elapsed_ms and prompt through unchanged when the response carries them, naming the judgment call that actually happened (criterion 2's own \"usage/elapsed_ms/prompt when a judgment call happened\")", async () => {
    const evaluation = confirmedEvaluationWithJudgmentCall();
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(simulateHypothesisResult(evaluation)) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const returned = definedResult(result.current.result);
    expect(returned.evaluation).toEqual(evaluation);
    expect(returned.evaluation.usage).toEqual({ input_tokens: 120, output_tokens: 45 });
    expect(returned.evaluation.elapsed_ms).toBe(850);
    expect(returned.evaluation.prompt).toBe(evaluation.prompt);
  });

  it("carries a reason and no citations on an inconclusive evaluation, matching domain/investigation/evaluation's own inconclusive branch", async () => {
    const evaluation = inconclusiveEvaluation();
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(simulateHypothesisResult(evaluation)) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const returned = definedResult(result.current.result);
    expect(returned.evaluation.verdict).toBe("inconclusive");
    expect("reason" in returned.evaluation).toBe(true);
    expect("citations" in returned.evaluation).toBe(false);
  });

  it("type-checks that SimulateHypothesisResult can never carry an outcome or assessment field, and that Evaluation's own two branches stay mutually exclusive (checked by this project's own typecheck step, TYP-04)", () => {
    function assertResultCarriesNoOutcomeOrAssessment(r: SimulateHypothesisResult): void {
      void r.evaluation;
      // @ts-expect-error -- SimulateHypothesisResult never carries an outcome field (criterion 3).
      void r.outcome;
      // @ts-expect-error -- SimulateHypothesisResult never carries an assessment field (criterion 3).
      void r.assessment;
    }
    function assertEvaluationBranchesAreMutuallyExclusive(e: Evaluation): void {
      if (e.verdict === "inconclusive") {
        void e.reason;
        // @ts-expect-error -- the inconclusive branch never carries citations (TYP-04).
        void e.citations;
      } else {
        void e.citations;
        // @ts-expect-error -- the confirmed/refuted branch never carries a reason (TYP-04).
        void e.reason;
      }
    }

    const decided = simulateHypothesisResult(confirmedEvaluation());
    const inconclusive = inconclusiveEvaluation();
    assertResultCarriesNoOutcomeOrAssessment(decided);
    assertEvaluationBranchesAreMutuallyExclusive(inconclusive);

    expect(decided.evaluation.verdict).toBe("confirmed");
    expect(inconclusive.verdict).toBe("inconclusive");
  });
});
