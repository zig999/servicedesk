import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { resetVisitedSimulationRoutesForTests, useCaseSimulationCockpit } from "./use-case-simulation-cockpit";
import {
  SIMULATE_CASE_PATH,
  createWrapper,
  jsonResponse,
  makeSubjectReady,
  record,
  simulateCaseResult,
  simulateHypothesisPath,
  simulateHypothesisResult,
  stubFetch,
} from "./use-case-simulation-cockpit.test-support";

const SLUG = "acme-widgets";
const VERSION = 7;

function hasRequesterField(body: unknown): body is { requester: unknown } {
  return typeof body === "object" && body !== null && "requester" in body;
}

function bodyRequester(body: unknown): unknown {
  if (!hasRequesterField(body)) {
    throw new Error(
      "use-case-simulation-cockpit-hypothesis-requester proof: expected a request body carrying a requester",
    );
  }
  return body.requester;
}

beforeEach(() => {
  resetVisitedSimulationRoutesForTests();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCaseSimulationCockpit -- onSimulateHypothesis forwards the shared subject's own requester (criterion 5)", () => {
  it("dispatches the hypothesis-level request carrying the identical requester value the case-level dispatch already carried", async () => {
    const capturedRequesters: unknown[] = [];
    stubFetch({
      [SIMULATE_CASE_PATH]: (_method, body) => {
        capturedRequesters.push(bodyRequester(body));
        return jsonResponse(simulateCaseResult());
      },
      [simulateHypothesisPath(SLUG, VERSION)]: (_method, body) => {
        capturedRequesters.push(bodyRequester(body));
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
    await waitFor(() => expect(capturedRequesters).toHaveLength(1));
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateHypothesis("hypothesis-a");
    });
    await waitFor(() => expect(capturedRequesters).toHaveLength(2));

    expect(capturedRequesters[0]).toBe("someone");
    expect(capturedRequesters[1]).toBe("someone");
    expect(capturedRequesters[0]).toEqual(capturedRequesters[1]);
  });
});
