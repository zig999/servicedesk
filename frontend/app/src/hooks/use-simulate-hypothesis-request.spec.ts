import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useSimulateHypothesis,
  type Evaluation,
  type SimulateHypothesisResult,
  type SimulateHypothesisState,
} from "./use-simulate-hypothesis";
import {
  REQUESTER,
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

// task/simulation-cockpit/use-simulate-hypothesis's own criteria 1-3, plus
// fix-use-simulate-hypothesis-dispatch's own criteria 1-4 and 6 (a corrective increment): the
// request dispatched names exactly one case, one subject, one requester and one hypothesis --
// never a manifest or a collection-plan union (scenarios/investigation/
// a-single-hypothesis-is-simulated) -- against the route the sibling case-simulation-backend
// initiative actually delivered (POST /v1/simulate/hypothesis), and the typed success response
// carries exactly evidence, one evaluation and durations, never an outcome or an assessment
// field. Criteria 4-6 of use-simulate-hypothesis's own original task live in the sibling
// use-simulate-hypothesis-dispatch-safety.spec.ts, mirroring connector-test-panel-request-
// response.spec.ts / connector-test-panel-dispatch-safety.spec.ts's own established split.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSimulateHypothesis — the dispatched request body is exactly {case, subject, requester, hypothesis} (criterion 1, structural proof)", () => {
  it("sends exactly {case: {slug, version}, subject, requester, hypothesis} in the POST body, naming the one hypothesis passed to onSimulate", async () => {
    const fetchMock = stubFetch({
      [SIMULATE_PATH]: () => jsonResponse(simulateHypothesisResult()),
    });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-b", SUBJECT, REQUESTER);
    });

    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(fetchMock.mock.calls.length).toBe(1);
    expect(parsedPostBody(fetchMock)).toEqual({
      case: { slug: SLUG, version: VERSION },
      subject: SUBJECT,
      requester: REQUESTER,
      hypothesis: "hypothesis-b",
    });
  });
});

describe("useSimulateHypothesis — dispatches to the corrected route, never the old nested per-case-version URL (criterion 1)", () => {
  it("issues its POST to exactly /v1/simulate/hypothesis, never a nested /v1/cases/{slug}/versions/{version}/simulate-hypothesis path", async () => {
    const fetchMock = stubFetch({
      [SIMULATE_PATH]: () => jsonResponse(simulateHypothesisResult()),
    });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(0));

    const dispatchedUrl = fetchMock.mock.calls[0]?.[0];
    expect(dispatchedUrl).toBe("/v1/simulate/hypothesis");
    expect(dispatchedUrl).not.toBe(`/v1/cases/${SLUG}/versions/${VERSION}/simulate-hypothesis`);
  });
});

describe("useSimulateHypothesis — onSimulate forwards requester unchanged into the dispatched body (criterion 4)", () => {
  it("carries the exact requester value onSimulate received, with no default and no transformation", async () => {
    const fetchMock = stubFetch({
      [SIMULATE_PATH]: () => jsonResponse(simulateHypothesisResult()),
    });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, "a-distinct-requester");
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(parsedPostBody(fetchMock)).toMatchObject({ requester: "a-distinct-requester" });
  });
});

describe("useSimulateHypothesis — a dispatch against the live backend route returns exactly one evaluation for the named hypothesis (criterion 6)", () => {
  it("resolves a single evaluation object -- never an array -- carrying the hypothesis name onSimulate was called with", async () => {
    stubFetch({
      [SIMULATE_PATH]: () =>
        jsonResponse(
          simulateHypothesisResult({
            hypothesis: "hypothesis-a",
            verdict: "confirmed",
            citations: [{ concept: "billing-account", field: "status" }],
          }),
        ),
    });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const returned = definedResult(result.current.result);
    expect(Array.isArray(returned.evaluation)).toBe(false);
    expect(returned.evaluation.hypothesis).toBe("hypothesis-a");
  });
});

describe("SimulateHypothesisResult carries exactly evidence, evaluation and durations -- never an outcome or an assessment field (criteria 2-3)", () => {
  it("returns exactly the evidence/evaluation/durations envelope the mocked response carried, with no other key present at runtime", async () => {
    const evaluation = confirmedEvaluation();
    const fixture = simulateHypothesisResult(evaluation);
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(fixture) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(result.current.result).toEqual(fixture);
  });

  it("carries evidence's own capability reference as two flat fields, capability_name and capability_version, never nested under a capability object (a recorded inference)", async () => {
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(simulateHypothesisResult()) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const returned = definedResult(result.current.result);
    expect(returned.evidence).toHaveLength(1);
    expect(returned.evidence[0]).toMatchObject({
      capability_name: "fetch-billing-account",
      capability_version: "1",
    });
    expect(returned.evidence[0]).not.toHaveProperty("capability");
  });

  it("carries exactly evidence, evaluation and durations at runtime, never an outcome or an assessment key", async () => {
    const evaluation = confirmedEvaluation();
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(simulateHypothesisResult(evaluation)) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const returned = definedResult(result.current.result);
    expect(Object.keys(returned).sort()).toEqual(["durations", "evaluation", "evidence"]);
    expect(returned).not.toHaveProperty("outcome");
    expect(returned).not.toHaveProperty("assessment");
  });

  it("carries a citations array and no reason on a decided (confirmed/refuted) evaluation, matching domain/investigation/evaluation's own decided branch", async () => {
    const evaluation = confirmedEvaluation();
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(simulateHypothesisResult(evaluation)) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
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
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const returned = definedResult(result.current.result);
    expect(returned.evaluation).toEqual(evaluation);
    expect(returned.evaluation.usage).toEqual({ input_tokens: 120, output_tokens: 45 });
    expect(returned.evaluation.elapsed_ms).toBe(850);
    expect(returned.evaluation.prompt).toBe(evaluation.prompt);
  });

  it("carries a reason and a (possibly empty) citations array on an inconclusive evaluation, matching the route's own delivered evaluationSchema", async () => {
    const evaluation = inconclusiveEvaluation();
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(simulateHypothesisResult(evaluation)) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const returned = definedResult(result.current.result);
    expect(returned.evaluation.verdict).toBe("inconclusive");
    expect("reason" in returned.evaluation).toBe(true);
    expect("citations" in returned.evaluation).toBe(true);
    expect(returned.evaluation.citations).toEqual([]);
  });

  it("type-checks that SimulateHypothesisResult can never carry an outcome or assessment field, and that only `reason` stays exclusive to Evaluation's inconclusive branch (checked by this project's own typecheck step, TYP-04)", () => {
    function assertResultCarriesNoOutcomeOrAssessment(r: SimulateHypothesisResult): void {
      void r.evaluation;
      // @ts-expect-error -- SimulateHypothesisResult never carries an outcome field (criterion 3).
      void r.outcome;
      // @ts-expect-error -- SimulateHypothesisResult never carries an assessment field (criterion 3).
      void r.assessment;
    }
    function assertReasonStaysExclusiveToInconclusive(e: Evaluation): void {
      // citations is present on every branch after this fix -- never gated behind a narrowing.
      void e.citations;
      if (e.verdict === "inconclusive") {
        void e.reason;
      } else {
        // @ts-expect-error -- the confirmed/refuted branch never carries a reason (TYP-04).
        void e.reason;
      }
    }
    function assertRequesterIsRequired(onSimulate: SimulateHypothesisState["onSimulate"]): void {
      // @ts-expect-error -- requester is a required third argument, not optional (criterion 4).
      onSimulate("hypothesis-a", SUBJECT);
    }

    const decided = simulateHypothesisResult(confirmedEvaluation());
    const inconclusive = inconclusiveEvaluation();
    const noopOnSimulate: SimulateHypothesisState["onSimulate"] = () => {};
    assertResultCarriesNoOutcomeOrAssessment(decided);
    assertReasonStaysExclusiveToInconclusive(inconclusive);
    assertRequesterIsRequired(noopOnSimulate);

    expect(decided.evaluation.verdict).toBe("confirmed");
    expect(inconclusive.verdict).toBe("inconclusive");
  });
});
