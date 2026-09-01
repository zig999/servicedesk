import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCaseSimulationCockpit } from "./use-case-simulation-cockpit";
import {
  SIMULATE_CASE_PATH,
  createWrapper,
  jsonResponse,
  makeSubjectReady,
  record,
  simulateCaseResult,
  stubFetch,
} from "./use-case-simulation-cockpit.test-support";

const SLUG = "acme-widgets";
const VERSION = 7;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCaseSimulationCockpit -- opening the Detail region for a full-case run's own evaluation does not throw (criterion 2)", () => {
  it("builds detail.evidence for a selected hypothesis from a completed full-case run without throwing, carrying the run's own capability reference as flat fields", async () => {
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

    expect(() => {
      act(() => {
        result.current.onSelectHypothesis("hypothesis-a");
      });
    }).not.toThrow();

    expect(result.current.detail?.evidence).toEqual([
      expect.objectContaining({
        concept: "billing-history",
        capabilityName: "fetch-billing-account",
        capabilityVersion: "1",
        connector: "billing-connector",
      }),
    ]);
  });
});
