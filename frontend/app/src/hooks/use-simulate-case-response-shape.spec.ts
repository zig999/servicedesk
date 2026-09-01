import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSimulateCase } from "./use-simulate-case";
import {
  SIMULATE_PATH,
  confirmedEvaluation,
  createWrapper,
  draftCaseRef,
  inconclusiveEvaluation,
  jsonResponse,
  loadedResult,
  requestBody,
  simulateResult,
  stubFetch,
} from "./use-simulate-case.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSimulateCase -- one evidence item per collected concept (criterion 2)", () => {
  it("carries the full evidence record per collected concept, with result_detail present only when the response included it", async () => {
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(simulateResult()) });
    const { result } = renderHook(() => useSimulateCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.onSimulate(requestBody(draftCaseRef()));
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const evidence = loadedResult(result.current).evidence;
    expect(evidence).toHaveLength(2);
    expect(evidence[0]).toMatchObject({
      concept: "account-standing",
      result: "ok",
      result_detail: "cached",
      elapsed_ms: 120,
      capability_name: "lookup-account",
      capability_version: "1.0.0",
    });
    expect(evidence[1]).not.toHaveProperty("result_detail");
    expect(evidence[1].result).toBe("timeout");
  });

  it("carries an empty evidence array as a valid success rather than treating no collected concept as a failure", async () => {
    stubFetch({
      [SIMULATE_PATH]: () => jsonResponse(simulateResult({ evidence: [] })),
    });
    const { result } = renderHook(() => useSimulateCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.onSimulate(requestBody(draftCaseRef()));
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(loadedResult(result.current).evidence).toEqual([]);
    expect(result.current.simulateError).toBeNull();
  });
});

describe("useSimulateCase -- one evaluation per manifested hypothesis (criterion 3)", () => {
  it("carries citations for a decided verdict and a reason for an inconclusive one, with usage/elapsed_ms/prompt present only when a judgment call happened", async () => {
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(simulateResult()) });
    const { result } = renderHook(() => useSimulateCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.onSimulate(requestBody(draftCaseRef()));
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const evaluations = loadedResult(result.current).evaluations;
    expect(evaluations).toHaveLength(2);

    const confirmed = confirmedEvaluation(evaluations);
    expect(confirmed.citations).toEqual([{ concept: "account-standing", field: "observation" }]);
    expect(confirmed.usage).toEqual({ input_tokens: 120, output_tokens: 40 });

    const inconclusive = inconclusiveEvaluation(evaluations);
    expect(inconclusive.reason).toBe("no-data");
    expect(inconclusive).not.toHaveProperty("usage");
    expect(inconclusive).not.toHaveProperty("elapsed_ms");
    expect(inconclusive).not.toHaveProperty("prompt");
  });

  it("carries an empty evaluations array as a valid success rather than treating no manifested hypothesis as a failure", async () => {
    stubFetch({
      [SIMULATE_PATH]: () => jsonResponse(simulateResult({ evaluations: [] })),
    });
    const { result } = renderHook(() => useSimulateCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.onSimulate(requestBody(draftCaseRef()));
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(loadedResult(result.current).evaluations).toEqual([]);
    expect(result.current.simulateError).toBeNull();
  });
});

describe("useSimulateCase -- the resolved assessment, the total cost and the per-stage durations (criterion 4)", () => {
  it("carries the resolved assessment, total cost and per-stage durations exactly as the response sent them", async () => {
    const fixture = simulateResult();
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(fixture) });
    const { result } = renderHook(() => useSimulateCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.onSimulate(requestBody(draftCaseRef()));
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const loaded = loadedResult(result.current);
    expect(loaded.assessment).toEqual(fixture.assessment);
    expect(loaded.cost).toEqual(fixture.cost);
    expect(loaded.durations).toEqual(fixture.durations);
  });

  it("carries the assessment with no determining_hypothesis when the response sent none, rather than defaulting one in", async () => {
    const fixture = simulateResult({
      assessment: {
        outcome: "inconclusive",
        referral: { action: "monitor", recipient: "billing-team" },
        text: "No hypothesis could be confirmed from the collected evidence.",
        register: "plain",
        usage: { input_tokens: 150, output_tokens: 60 },
        elapsed_ms: 700,
        prompt: "consolidate the assessment",
      },
    });
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(fixture) });
    const { result } = renderHook(() => useSimulateCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.onSimulate(requestBody(draftCaseRef()));
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const assessment = loadedResult(result.current).assessment;
    expect(assessment).not.toHaveProperty("determining_hypothesis");
    expect(assessment.outcome).toBe("inconclusive");
  });

  it("carries durations with no writing figure when no consolidation call happened, rather than defaulting one in", async () => {
    const fixture = simulateResult({
      durations: { collection: 1200, judgment: 800, total: 2000 },
    });
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(fixture) });
    const { result } = renderHook(() => useSimulateCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.onSimulate(requestBody(draftCaseRef()));
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const durations = loadedResult(result.current).durations;
    expect(durations).not.toHaveProperty("writing");
    expect(durations.total).toBe(2000);
  });
});
