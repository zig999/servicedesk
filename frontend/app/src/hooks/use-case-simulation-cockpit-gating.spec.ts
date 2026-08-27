import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCaseSimulationCockpit } from "./use-case-simulation-cockpit";
import {
  SIMULATE_CASE_PATH,
  bodySubject,
  createWrapper,
  jsonResponse,
  makeSubjectReady,
  record,
  simulateCaseResult,
  simulateHypothesisPath,
  simulateHypothesisResult,
  stubFetch,
} from "./use-case-simulation-cockpit.test-support";

// task/simulation-cockpit/screen-assembly's own criteria 1-3: the header's own "Simulate case"
// gate and every row's own Simulate gate are driven by one shared value (subject readiness and
// dispatch-in-flight folded together), and both dispatches read the one shared subject this
// cockpit derives exactly once. Proven at the hook level -- CaseSimulationReadyView's own
// end-to-end wiring of the same gate across the rendered header and table is proven separately
// in case-simulation-ready-view.spec.ts, per this task's own instruction that criterion 1 spans
// both the header and the hypotheses table.

const SLUG = "acme-widgets";
const VERSION = 7;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCaseSimulationCockpit -- disabled until the shared subject is ready (criterion 1)", () => {
  it("keeps the header's own and every row's own simulate gate disabled while the shared subject is not ready", async () => {
    stubFetch();
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.subject.requiredFields).toHaveLength(1));
    expect(result.current.subject.isReady).toBe(false);
    expect(result.current.canSimulateCase).toBe(false);
    expect(result.current.disableSimulateHypothesis).toBe(true);
  });

  it("enables both the header's own and every row's own simulate gate together, the instant the shared subject becomes ready", async () => {
    stubFetch();
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });

    await makeSubjectReady(result);

    await waitFor(() => expect(result.current.subject.isReady).toBe(true));
    expect(result.current.canSimulateCase).toBe(true);
    expect(result.current.disableSimulateHypothesis).toBe(false);
  });
});

describe("useCaseSimulationCockpit -- disabled while any dispatch is already in flight, only one at a time (criterion 2)", () => {
  it("disables both gates while a case-level dispatch is in flight, and re-enables both once it settles", async () => {
    let resolveFetch: ((response: Response) => void) | undefined;
    const pending = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    stubFetch({ [SIMULATE_CASE_PATH]: () => pending });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateCase();
    });

    await waitFor(() => expect(result.current.canSimulateCase).toBe(false));
    expect(result.current.disableSimulateHypothesis).toBe(true);

    resolveFetch?.(jsonResponse(simulateCaseResult()));

    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));
    expect(result.current.disableSimulateHypothesis).toBe(false);
  });

  it("disables both gates while a hypothesis-level dispatch is in flight, and re-enables both once it settles", async () => {
    let resolveFetch: ((response: Response) => void) | undefined;
    const pending = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    stubFetch({ [simulateHypothesisPath(SLUG, VERSION)]: () => pending });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateHypothesis("hypothesis-a");
    });

    await waitFor(() => expect(result.current.disableSimulateHypothesis).toBe(true));
    expect(result.current.canSimulateCase).toBe(false);

    resolveFetch?.(jsonResponse(simulateHypothesisResult()));

    await waitFor(() => expect(result.current.disableSimulateHypothesis).toBe(false));
    expect(result.current.canSimulateCase).toBe(true);
  });

  it("refuses a hypothesis-level dispatch made while a case-level dispatch is already in flight, issuing no request for it", async () => {
    let resolveCaseFetch: ((response: Response) => void) | undefined;
    const pendingCase = new Promise<Response>((resolve) => {
      resolveCaseFetch = resolve;
    });
    const hypothesisFetchMock = { calls: 0 };
    stubFetch({
      [SIMULATE_CASE_PATH]: () => pendingCase,
      [simulateHypothesisPath(SLUG, VERSION)]: () => {
        hypothesisFetchMock.calls += 1;
        return jsonResponse(simulateHypothesisResult());
      },
    });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateCase();
    });
    await waitFor(() => expect(result.current.disableSimulateHypothesis).toBe(true));

    act(() => {
      result.current.onSimulateHypothesis("hypothesis-a");
    });

    expect(hypothesisFetchMock.calls).toBe(0);

    resolveCaseFetch?.(jsonResponse(simulateCaseResult()));
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));
  });

  it("refuses a case-level dispatch made while a hypothesis-level dispatch is already in flight, issuing no request for it", async () => {
    let resolveHypFetch: ((response: Response) => void) | undefined;
    const pendingHyp = new Promise<Response>((resolve) => {
      resolveHypFetch = resolve;
    });
    const caseFetchMock = { calls: 0 };
    stubFetch({
      [simulateHypothesisPath(SLUG, VERSION)]: () => pendingHyp,
      [SIMULATE_CASE_PATH]: () => {
        caseFetchMock.calls += 1;
        return jsonResponse(simulateCaseResult());
      },
    });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateHypothesis("hypothesis-a");
    });
    await waitFor(() => expect(result.current.canSimulateCase).toBe(false));

    act(() => {
      result.current.onSimulateCase();
    });

    expect(caseFetchMock.calls).toBe(0);

    resolveHypFetch?.(jsonResponse(simulateHypothesisResult()));
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));
  });
});

describe("useCaseSimulationCockpit -- one subject, shared by both dispatches (criterion 3)", () => {
  it("dispatches a full-case run and a single-hypothesis run against the identical subject value this cockpit's own Subject region holds", async () => {
    const capturedSubjects: unknown[] = [];
    stubFetch({
      [SIMULATE_CASE_PATH]: (_method, body) => {
        capturedSubjects.push(bodySubject(body));
        return jsonResponse(simulateCaseResult());
      },
      [simulateHypothesisPath(SLUG, VERSION)]: (_method, body) => {
        capturedSubjects.push(bodySubject(body));
        return jsonResponse(simulateHypothesisResult());
      },
    });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));
    const sharedSubject = result.current.subject.subject;

    act(() => {
      result.current.onSimulateCase();
    });
    await waitFor(() => expect(capturedSubjects).toHaveLength(1));
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateHypothesis("hypothesis-a");
    });
    await waitFor(() => expect(capturedSubjects).toHaveLength(2));

    expect(capturedSubjects[0]).toEqual(sharedSubject);
    expect(capturedSubjects[1]).toEqual(sharedSubject);
    expect(capturedSubjects[0]).toEqual(capturedSubjects[1]);
  });
});
