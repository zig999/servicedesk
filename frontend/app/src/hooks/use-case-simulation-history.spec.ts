import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useCaseSimulationHistory, type NewCaseResultRun } from "./use-case-simulation-history";

function newRun(overrides: Partial<NewCaseResultRun> = {}): NewCaseResultRun {
  return {
    outcome: "resolved",
    referral: { action: "notify", recipient: "customer" },
    text: "Thanks for reaching out.",
    register: "formal",
    hypotheses: [],
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useCaseSimulationHistory -- appending this session's own run history (criterion 3)", () => {
  it("starts with an empty run history before any full-case run has completed", () => {
    const { result } = renderHook(() => useCaseSimulationHistory());

    expect(result.current.runs).toEqual([]);
  });

  it("appends a newly-completed run to the end of the history, in the order runs complete", () => {
    const { result } = renderHook(() => useCaseSimulationHistory());

    act(() => {
      result.current.recordRun(newRun({ outcome: "resolved" }));
    });
    act(() => {
      result.current.recordRun(newRun({ outcome: "unresolved" }));
    });

    expect(result.current.runs.map((run) => run.outcome)).toEqual(["resolved", "unresolved"]);
  });

  it("assigns each recorded run its own id, timestamp and not-stale flag, distinct from the previous run's, rather than reading them from the caller", () => {
    const { result } = renderHook(() => useCaseSimulationHistory());

    act(() => {
      result.current.recordRun(newRun());
    });
    act(() => {
      result.current.recordRun(newRun());
    });

    const [first, second] = result.current.runs;
    expect(first?.id).toEqual(expect.any(String));
    expect(first?.id.length).toBeGreaterThan(0);
    expect(Number.isNaN(Date.parse(first?.ranAt ?? ""))).toBe(false);
    expect(first?.stale).toBe(false);
    expect(second?.id).not.toBe(first?.id);
  });

  it("records two runs completed back-to-back within the same update, losing neither", () => {
    const { result } = renderHook(() => useCaseSimulationHistory());

    act(() => {
      result.current.recordRun(newRun({ outcome: "A" }));
      result.current.recordRun(newRun({ outcome: "B" }));
    });

    expect(result.current.runs.map((run) => run.outcome)).toEqual(["A", "B"]);
  });
});

describe("useCaseSimulationHistory -- marking the last run stale (criterion 5)", () => {
  it("flips the current last run's own stale flag to true in place, without appending a new run", () => {
    const { result } = renderHook(() => useCaseSimulationHistory());
    act(() => {
      result.current.recordRun(newRun());
    });

    act(() => {
      result.current.markLastRunStale();
    });

    expect(result.current.runs).toHaveLength(1);
    expect(result.current.runs[0]?.stale).toBe(true);
  });

  it("is a no-op when no run has completed yet, neither throwing nor creating a run", () => {
    const { result } = renderHook(() => useCaseSimulationHistory());

    expect(() => {
      act(() => {
        result.current.markLastRunStale();
      });
    }).not.toThrow();
    expect(result.current.runs).toEqual([]);
  });

  it("marks only the last of several runs stale, and leaves that marking untouched once a further run completes", () => {
    const { result } = renderHook(() => useCaseSimulationHistory());
    act(() => {
      result.current.recordRun(newRun({ outcome: "first" }));
    });
    act(() => {
      result.current.recordRun(newRun({ outcome: "second" }));
    });

    act(() => {
      result.current.markLastRunStale();
    });
    expect(result.current.runs[0]?.stale).toBe(false);
    expect(result.current.runs[1]?.stale).toBe(true);

    act(() => {
      result.current.recordRun(newRun({ outcome: "third" }));
    });

    expect(result.current.runs[1]?.stale).toBe(true);
    expect(result.current.runs[2]?.stale).toBe(false);
  });

  it("calling markLastRunStale twice in a row leaves the last run stale, rather than toggling it back off", () => {
    const { result } = renderHook(() => useCaseSimulationHistory());
    act(() => {
      result.current.recordRun(newRun());
    });

    act(() => {
      result.current.markLastRunStale();
    });
    act(() => {
      result.current.markLastRunStale();
    });

    expect(result.current.runs[0]?.stale).toBe(true);
  });
});

describe("useCaseSimulationHistory -- kept only in memory (criterion 3, rules/investigation/a-simulation-writes-no-investigation)", () => {
  it("issues no network request when recording a run or marking it stale", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useCaseSimulationHistory());

    act(() => {
      result.current.recordRun(newRun());
    });
    act(() => {
      result.current.markLastRunStale();
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never writes to localStorage or sessionStorage when recording a run or marking it stale", () => {
    const localSpy = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useCaseSimulationHistory());

    act(() => {
      result.current.recordRun(newRun());
    });
    act(() => {
      result.current.markLastRunStale();
    });

    expect(localSpy).not.toHaveBeenCalled();
  });

  it("keeps no history across separate mounts of the hook, so nothing this session recorded survives outside this component's own memory", () => {
    const { result: firstResult, unmount: firstUnmount } = renderHook(() =>
      useCaseSimulationHistory(),
    );
    act(() => {
      firstResult.current.recordRun(newRun());
    });
    expect(firstResult.current.runs).toHaveLength(1);
    firstUnmount();

    const { result: secondResult } = renderHook(() => useCaseSimulationHistory());

    expect(secondResult.current.runs).toEqual([]);
  });
});
