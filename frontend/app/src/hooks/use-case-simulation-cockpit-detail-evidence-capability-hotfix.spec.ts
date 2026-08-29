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

// task/detail-evidence-capability-hotfix/flatten-detail-evidence-capability-reference's own
// criterion 2 -- proven end to end through the composed cockpit hook, the exact pipeline that
// crashed on a real full-case run (useCaseSimulationCockpit -> toDetailEvidence
// (case-simulation-cockpit-adapters.ts) -> the Detail region's own `detail.evidence`), rather
// than only against toDetailEvidence in isolation. Not folded into
// use-case-simulation-cockpit-evaluations.spec.ts (which already asserts `detail.evidence` for a
// hypothesis-sourced run, unaffected by this fix) since that file's own existing tests are proof
// this corrective task did not need to add to.

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
