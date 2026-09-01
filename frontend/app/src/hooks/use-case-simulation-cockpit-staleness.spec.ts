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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCaseSimulationCockpit -- a first mount for a slug/version is never treated as a return (criterion 6)", () => {
  it("invalidates no query on this cockpit's first mount for a slug/version this tab has not visited before", () => {
    stubFetch();
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderHook(() => useCaseSimulationCockpit("first-visit-slug", 1, record()), { wrapper: Wrapper });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe("useCaseSimulationCockpit -- a second mount for the same slug/version is treated as a return (criterion 6)", () => {
  it("invalidates exactly the version's own case-version query, keyed the same way use-case-simulation-version.ts reads it", () => {
    stubFetch();
    const { queryClient, Wrapper } = createWrapper();
    const slug = "return-visit-slug";
    const version = 4;

    const { unmount: firstUnmount } = renderHook(
      () => useCaseSimulationCockpit(slug, version, record()),
      { wrapper: Wrapper },
    );
    firstUnmount();

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    renderHook(() => useCaseSimulationCockpit(slug, version, record()), { wrapper: Wrapper });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["case-version", slug, version] });
  });
});

describe("useCaseSimulationCockpit -- the disclosed limitation: a return mount has nothing of its own run history left to mark stale", () => {
  it("starts a return mount's own Case result run history empty, even though the earlier mount had already recorded a completed run", async () => {
    stubFetch({ [SIMULATE_CASE_PATH]: () => jsonResponse(simulateCaseResult()) });
    const { Wrapper } = createWrapper();
    const slug = "stale-marking-slug";
    const version = 9;

    const { result: firstResult, unmount: firstUnmount } = renderHook(
      () => useCaseSimulationCockpit(slug, version, record()),
      { wrapper: Wrapper },
    );
    await makeSubjectReady(firstResult);
    await waitFor(() => expect(firstResult.current.canSimulateCase).toBe(true));
    act(() => {
      firstResult.current.onSimulateCase();
    });
    await waitFor(() => expect(firstResult.current.caseResultRuns).toHaveLength(1));
    firstUnmount();

    const { result: secondResult } = renderHook(
      () => useCaseSimulationCockpit(slug, version, record()),
      { wrapper: Wrapper },
    );

    expect(secondResult.current.caseResultRuns).toEqual([]);
  });
});
