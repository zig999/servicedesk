import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCaseSimulationCockpit } from "./use-case-simulation-cockpit";
import {
  SIMULATE_CASE_PATH,
  confirmedCaseEvaluation,
  createWrapper,
  errorResponse,
  inconclusiveCaseEvaluation,
  inconclusiveHypothesisEvaluation,
  jsonResponse,
  makeSubjectReady,
  record,
  simulateCaseResult,
  simulateHypothesisPath,
  simulateHypothesisResult,
  stubFetch,
} from "./use-case-simulation-cockpit.test-support";

// task/simulation-cockpit/screen-assembly's own criteria 4, 5 and 7: the Detail region always
// reflects whichever run -- full-case or single-hypothesis -- last produced a given hypothesis's
// evaluation; only a completed full-case run ever populates the Case result region; and a
// dispatch failure is the only thing this cockpit ever surfaces as an error, never a returned
// verdict.

const SLUG = "acme-widgets";
const VERSION = 7;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCaseSimulationCockpit -- the Detail region reflects whichever run last produced an evaluation (criterion 4)", () => {
  it("shows no detail for a selection made before any run has produced an evaluation", async () => {
    stubFetch();
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSelectHypothesis("hypothesis-a");
    });

    expect(result.current.detail).toBeUndefined();
  });

  it("opens the Detail region for a hypothesis's evaluation from a completed full-case run", async () => {
    stubFetch({ [SIMULATE_CASE_PATH]: () => jsonResponse(simulateCaseResult()) });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateCase();
    });
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSelectHypothesis("hypothesis-a");
    });

    expect(result.current.detail?.evaluation.hypothesis).toBe("hypothesis-a");
    expect(result.current.detail?.evaluation.verdict).toBe("confirmed");
  });

  it("opens the Detail region for a hypothesis's evaluation from a single-hypothesis run, exactly as it would from a full-case run", async () => {
    stubFetch({
      [simulateHypothesisPath(SLUG, VERSION)]: () =>
        jsonResponse(simulateHypothesisResult(inconclusiveHypothesisEvaluation("hypothesis-a"))),
    });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateHypothesis("hypothesis-a");
    });
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSelectHypothesis("hypothesis-a");
    });

    expect(result.current.detail?.evaluation.hypothesis).toBe("hypothesis-a");
    expect(result.current.detail?.evaluation.verdict).toBe("inconclusive");
    // A single-hypothesis run's own response carries no evidence field at all
    // (use-simulate-hypothesis.ts), so this composition supplies none for it.
    expect(result.current.detail?.evidence).toEqual([]);
  });

  it("shows a hypothesis's most recent evaluation whichever kind of run produced it last, leaving every other hypothesis's own evaluation untouched", async () => {
    stubFetch({
      [SIMULATE_CASE_PATH]: () =>
        jsonResponse(
          simulateCaseResult({
            evaluations: [confirmedCaseEvaluation("hypothesis-a"), confirmedCaseEvaluation("hypothesis-b")],
          }),
        ),
      [simulateHypothesisPath(SLUG, VERSION)]: () =>
        jsonResponse(simulateHypothesisResult(inconclusiveHypothesisEvaluation("hypothesis-a"))),
    });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateCase();
    });
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateHypothesis("hypothesis-a");
    });
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSelectHypothesis("hypothesis-a");
    });
    expect(result.current.detail?.evaluation.verdict).toBe("inconclusive");

    const hypothesisBRow = result.current.hypothesesRows.find(
      (row) => row.hypothesisName === "hypothesis-b",
    );
    expect(hypothesisBRow?.evaluation?.verdict).toBe("confirmed");
  });
});

describe("useCaseSimulationCockpit -- only a full-case run populates the Case result region (criterion 5)", () => {
  it("never appends to the Case result region's own run history for a completed single-hypothesis run", async () => {
    stubFetch({
      [simulateHypothesisPath(SLUG, VERSION)]: () => jsonResponse(simulateHypothesisResult()),
    });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateHypothesis("hypothesis-a");
    });
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    expect(result.current.caseResultRuns).toEqual([]);
  });

  it("appends exactly one run to the Case result region's own run history for a completed full-case run", async () => {
    stubFetch({ [SIMULATE_CASE_PATH]: () => jsonResponse(simulateCaseResult()) });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateCase();
    });

    await waitFor(() => expect(result.current.caseResultRuns).toHaveLength(1));
    expect(result.current.caseResultRuns[0]?.outcome).toBe("resolved");
  });
});

describe("useCaseSimulationCockpit -- an error state comes only from a dispatch failure, never a returned verdict (criterion 7)", () => {
  it("surfaces a case-level dispatch failure as dispatchError", async () => {
    stubFetch({ [SIMULATE_CASE_PATH]: () => errorResponse("SomeUpstreamError", 500) });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateCase();
    });

    await waitFor(() => expect(result.current.dispatchError).not.toBeNull());
  });

  it("surfaces a hypothesis-level dispatch failure as dispatchError", async () => {
    stubFetch({
      [simulateHypothesisPath(SLUG, VERSION)]: () => errorResponse("SomeUpstreamError", 500),
    });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateHypothesis("hypothesis-a");
    });

    await waitFor(() => expect(result.current.dispatchError).not.toBeNull());
  });

  it("keeps dispatchError null for a completed run that resolved an inconclusive verdict, since that is a returned evaluation rather than an operation failure", async () => {
    stubFetch({
      [SIMULATE_CASE_PATH]: () =>
        jsonResponse(
          simulateCaseResult({
            evaluations: [inconclusiveCaseEvaluation("hypothesis-a"), inconclusiveCaseEvaluation("hypothesis-b")],
          }),
        ),
    });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateCase();
    });

    await waitFor(() => expect(result.current.caseResultRuns).toHaveLength(1));
    expect(result.current.dispatchError).toBeNull();
  });
});
