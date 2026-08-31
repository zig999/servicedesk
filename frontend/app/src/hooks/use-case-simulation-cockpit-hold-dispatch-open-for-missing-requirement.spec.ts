import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCaseSimulationCockpit, type CaseSimulationCockpitState } from "./use-case-simulation-cockpit";
import {
  SIMULATE_CASE_PATH,
  createWrapper,
  jsonResponse,
  record,
  simulateCaseResult,
  simulateHypothesisPath,
  simulateHypothesisResult,
  stubFetch,
} from "./use-case-simulation-cockpit.test-support";

// task/subject-input-requirements/hold-the-simulate-dispatch-open-for-a-missing-requirement's own
// criteria 1 and 2, proven against the fully composed cockpit rather than the hook alone: a
// required case-input-requirement's own input staying empty must not, by itself, keep either
// dispatch from actually being issued once a requester and at least one attribute-value (here, a
// curator-added row rather than the derived field itself) are present. Every other gating test in
// this hooks directory (-gating.spec.ts, -evaluations.spec.ts) fills the one derived required
// field before dispatching, through their own shared makeSubjectReady helper -- this file is the
// one place that deliberately leaves it empty, so the exact scenario this task changed is
// exercised at the dispatch boundary itself (a real request landing at the endpoint), complementing
// use-simulation-subject-hold-dispatch-open-for-missing-requirement.spec.ts's own isReady-level
// proof of the same fact.

const SLUG = "acme-widgets";
const VERSION = 7;

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Fills the requester and adds one curator-added attribute-value, deliberately leaving the one
 * derived required field ("account-id") empty -- the opposite of this file's own sibling
 * test-support's makeSubjectReady, which fills that field. */
async function readySubjectWithoutFillingRequiredField(
  result: { readonly current: CaseSimulationCockpitState },
): Promise<void> {
  await waitFor(() => {
    if (result.current.subject.requiredFields.length !== 1) {
      throw new Error(
        "hold-the-simulate-dispatch-open proof: expected exactly one derived required field to have loaded",
      );
    }
  });
  act(() => {
    result.current.subject.onAddAttribute();
  });
  const rowId = result.current.subject.addedAttributes[0]?.id;
  act(() => {
    if (rowId !== undefined) {
      result.current.subject.onAttributeChange(rowId, "attribute", "escalation-flag");
    }
  });
  act(() => {
    if (rowId !== undefined) {
      result.current.subject.onAttributeChange(rowId, "value", "urgent");
    }
  });
  act(() => {
    result.current.subject.onRequesterChange("someone");
  });
}

function countCallsTo(fetchMock: { mock: { calls: unknown[][] } }, path: string): number {
  return fetchMock.mock.calls.filter(([input]) => {
    const url = typeof input === "string" ? input : String(input);
    return url === path;
  }).length;
}

describe("useCaseSimulationCockpit -- criterion 1: the simulate-case dispatch is not refused by the one derived required field's own empty input", () => {
  it("issues the /v1/simulate request once the requester and a curator-added attribute-value are present, with the one derived required field still empty", async () => {
    const fetchMock = stubFetch({ [SIMULATE_CASE_PATH]: () => jsonResponse(simulateCaseResult()) });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await readySubjectWithoutFillingRequiredField(result);
    expect(result.current.subject.requiredFields[0]?.value).toBe("");
    expect(result.current.subject.requiredFields[0]?.required).toBe(true);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateCase();
    });

    await waitFor(() => expect(countCallsTo(fetchMock, SIMULATE_CASE_PATH)).toBe(1));
    expect(result.current.subject.requiredFields[0]?.value).toBe("");
  });
});

describe("useCaseSimulationCockpit -- criterion 2: the simulate-hypothesis dispatch is not refused by the one derived required field's own empty input", () => {
  it("issues the /v1/simulate/hypothesis request once the requester and a curator-added attribute-value are present, with the one derived required field still empty", async () => {
    const fetchMock = stubFetch({
      [simulateHypothesisPath(SLUG, VERSION)]: () => jsonResponse(simulateHypothesisResult()),
    });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await readySubjectWithoutFillingRequiredField(result);
    expect(result.current.subject.requiredFields[0]?.value).toBe("");
    await waitFor(() => expect(result.current.disableSimulateHypothesis).toBe(false));

    act(() => {
      result.current.onSimulateHypothesis("hypothesis-a");
    });

    await waitFor(() =>
      expect(countCallsTo(fetchMock, simulateHypothesisPath(SLUG, VERSION))).toBe(1),
    );
    expect(result.current.subject.requiredFields[0]?.value).toBe("");
  });
});
