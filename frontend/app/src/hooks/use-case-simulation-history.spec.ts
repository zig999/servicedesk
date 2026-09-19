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
    durations: { collectionMs: 100, judgmentMs: 200, writingMs: 50, totalMs: 350 },
    cost: { calls: 1, inputTokens: 100, outputTokens: 50 },
    consolidationCall: {
      called: true,
      usage: { inputTokens: 100, outputTokens: 50 },
      elapsedMs: 50,
      prompt: "prompt",
    },
    rawResponse: {},
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

  it("keeps an earlier run's own durations, cost, consolidation record and payload unchanged once a second, different run completes", () => {
    const { result } = renderHook(() => useCaseSimulationHistory());

    act(() => {
      result.current.recordRun(
        newRun({
          durations: { collectionMs: 100, judgmentMs: 200, writingMs: 50, totalMs: 350 },
          cost: { calls: 1, inputTokens: 100, outputTokens: 50 },
          consolidationCall: {
            called: true,
            usage: { inputTokens: 100, outputTokens: 50 },
            elapsedMs: 50,
            prompt: "first prompt",
          },
          rawResponse: { marker: "first" },
        }),
      );
    });
    act(() => {
      result.current.recordRun(
        newRun({
          durations: { collectionMs: 999, judgmentMs: 999, writingMs: 999, totalMs: 999 },
          cost: { calls: 9, inputTokens: 999, outputTokens: 999 },
          consolidationCall: {
            called: true,
            usage: { inputTokens: 999, outputTokens: 999 },
            elapsedMs: 999,
            prompt: "second prompt",
          },
          rawResponse: { marker: "second" },
        }),
      );
    });

    const [first] = result.current.runs;
    expect(first?.durations).toEqual({
      collectionMs: 100,
      judgmentMs: 200,
      writingMs: 50,
      totalMs: 350,
    });
    expect(first?.cost).toEqual({ calls: 1, inputTokens: 100, outputTokens: 50 });
    expect(first?.consolidationCall).toEqual({
      called: true,
      usage: { inputTokens: 100, outputTokens: 50 },
      elapsedMs: 50,
      prompt: "first prompt",
    });
    expect(first?.rawResponse).toEqual({ marker: "first" });
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
