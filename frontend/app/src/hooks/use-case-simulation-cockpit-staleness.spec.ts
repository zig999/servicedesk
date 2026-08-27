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

// task/simulation-cockpit/screen-assembly's own criterion 6: returning to this cockpit for a
// slug/version this tab has already visited invalidates that version's own cached query --
// use-case-simulation-version.ts's own exact ["case-version", slug, version] key, which the
// header, the Subject region and the Hypotheses table's own manifest rows all read -- and marks
// the last run "stale". Every case-version record in this delivery's own fixtures carries no
// hash or updated_at (case-version-record.ts), so D8's "otherwise always mark stale on return"
// is the only branch this cockpit can ever take; no comparison is computed anywhere in this
// file's own proof for that reason.
//
// This task's own delivery record discloses that useCaseSimulationHistory's own run list is
// component-scoped React state, so a genuine full-route navigation away and back unmounts and
// remounts this whole cockpit first, resetting that list to empty before markLastRunStale is
// ever called against it -- the mechanism fires correctly but has nothing left to mark on a real
// round trip today. The last test below proves exactly that current behavior, not a future fix:
// each test below addresses this tab's own "already visited" marker under a slug unique to that
// test, since the marker is a plain module-level Set shared by every render in this file and
// must not let one test's visit leak into another's assertion about a first visit.

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
