import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { resetVisitedSimulationRoutesForTests, useCaseSimulationCockpit, type CaseSimulationCockpitState } from "./use-case-simulation-cockpit";
import {
  SIMULATE_CASE_PATH,
  createWrapper,
  inputRequirementsPath,
  jsonResponse,
  record,
  simulateCaseResult,
  simulateHypothesisPath,
  simulateHypothesisResult,
  stubFetch,
} from "./use-case-simulation-cockpit.test-support";

const SLUG = "acme-widgets";
const VERSION = 7;

beforeEach(() => {
  resetVisitedSimulationRoutesForTests();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function twoRequirementsResponse(): Response {
  return jsonResponse({
    requirements: [
      { attribute: "account-id", required: true, capabilities: [] },
      { attribute: "escalation-flag", required: false, capabilities: [] },
    ],
    capabilities_with_malformed_input_schema: [],
  });
}

async function readySubjectWithoutFillingRequiredField(
  result: { readonly current: CaseSimulationCockpitState },
): Promise<void> {
  await waitFor(() => {
    if (result.current.subject.requiredFields.length !== 2) {
      throw new Error(
        "hold-the-simulate-dispatch-open proof: expected exactly two derived required fields to have loaded",
      );
    }
  });
  act(() => {
    result.current.subject.requiredFields[1]?.onChange("urgent");
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
  it("issues the /v1/simulate request once the requester and a second requirement input are filled, with the one required field still empty", async () => {
    const fetchMock = stubFetch({
      [SIMULATE_CASE_PATH]: () => jsonResponse(simulateCaseResult()),
      [inputRequirementsPath(SLUG, VERSION)]: () => twoRequirementsResponse(),
    });
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
  it("issues the /v1/simulate/hypothesis request once the requester and a second requirement input are filled, with the one required field still empty", async () => {
    const fetchMock = stubFetch({
      [simulateHypothesisPath(SLUG, VERSION)]: () => jsonResponse(simulateHypothesisResult()),
      [inputRequirementsPath(SLUG, VERSION)]: () => twoRequirementsResponse(),
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
