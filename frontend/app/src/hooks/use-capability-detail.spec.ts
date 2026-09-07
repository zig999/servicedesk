import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCapabilityDetail, type CapabilityDetailState } from "./use-capability-detail";
import {
  CAPABILITY_PATH,
  LOADED_CAPABILITY,
  LOADED_INPUT_SCHEMA,
  LOADED_OUTPUT_SCHEMA,
  NAME,
  UPDATED_INPUT_SCHEMA,
  UPDATED_OUTPUT_SCHEMA,
  VERSION,
  createWrapper,
  defaultHandlers,
  jsonResponse,
  readyState,
  stubFetch,
} from "./use-capability-detail.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function useLoggedCapabilityDetail(
  name: string,
  version: string,
  log: CapabilityDetailState[],
): CapabilityDetailState {
  const state = useCapabilityDetail(name, version);
  useEffect(() => {
    log.push(state);
  });
  return state;
}

function firstReadyEntry(log: readonly CapabilityDetailState[]): CapabilityDetailState {
  const entry = log.find((candidate) => candidate.phase === "ready");
  if (!entry) {
    throw new Error("expected a ready-phase entry in the render log");
  }
  return entry;
}

describe("useCapabilityDetail -- issuing its own GET, independent of the list cache (criterion 1)", () => {
  it("resolves the ready phase from its own direct GET, not from a capabilities list query the caller's cache already held for this same (name, version)", async () => {
    const { Wrapper, queryClient } = createWrapper();

    queryClient.setQueryData(["capabilities"], {
      data: [{ ...LOADED_CAPABILITY, input_schema: '{"from":"list-cache"}' }],
    });
    stubFetch(defaultHandlers());

    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(readyState(result.current).inputSchema.value).toBe(LOADED_INPUT_SCHEMA);
  });

  it("resolves the ready phase with output_schema from its own direct GET as well, not from a capabilities list query the caller's cache already held with a different output_schema for this same (name, version) (an underdetermined note in this task)", async () => {
    const { Wrapper, queryClient } = createWrapper();

    queryClient.setQueryData(["capabilities"], {
      data: [{ ...LOADED_CAPABILITY, output_schema: '{"from":"list-cache"}' }],
    });
    stubFetch(defaultHandlers());

    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(readyState(result.current).outputSchema.value).toBe(LOADED_OUTPUT_SCHEMA);
  });
});

describe("useCapabilityDetail -- the very first render reporting the ready phase already carries the loaded output_schema text (criterion 2, this task)", () => {
  it("carries outputSchema.value equal to the loaded output_schema in the render log's first ready entry", async () => {
    stubFetch(defaultHandlers());
    const log: CapabilityDetailState[] = [];
    renderHook(() => useLoggedCapabilityDetail(NAME, VERSION, log), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(log.some((entry) => entry.phase === "ready")).toBe(true));

    expect(readyState(firstReadyEntry(log)).outputSchema.value).toBe(LOADED_OUTPUT_SCHEMA);
  });
});

describe("useCapabilityDetail -- every form field the ready state exposes lands in the same render phase first reads ready, not one render later (an underdetermined note in this task)", () => {
  it("carries nature, timeout, connector and concept in form.getValues() in the render log's first ready entry", async () => {
    stubFetch(defaultHandlers());
    const log: CapabilityDetailState[] = [];
    renderHook(() => useLoggedCapabilityDetail(NAME, VERSION, log), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(log.some((entry) => entry.phase === "ready")).toBe(true));

    const values = readyState(firstReadyEntry(log)).form.getValues();
    expect({
      nature: values.nature,
      timeout: values.timeout,
      connector: values.connector,
      concept: values.concept,
    }).toEqual({
      nature: LOADED_CAPABILITY.nature,
      timeout: LOADED_CAPABILITY.timeout,
      connector: LOADED_CAPABILITY.connector,
      concept: LOADED_CAPABILITY.concept,
    });
  });
});

describe("useCapabilityDetail -- the loading | load-error | ready phase union (criterion 2)", () => {
  it('reports "loading" before the GET resolves, then "ready" once it does', async () => {
    let resolveGet!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveGet = resolve;
    });
    stubFetch(defaultHandlers({ [CAPABILITY_PATH]: () => pending }));

    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    expect(result.current.phase).toBe("loading");
    resolveGet(jsonResponse(LOADED_CAPABILITY));

    await waitFor(() => expect(result.current.phase).toBe("ready"));
  });
});

describe("useCapabilityDetail -- isDirty against the loaded-or-saved baseline (criterion 3)", () => {
  it("is false immediately after load, before any edit", async () => {
    stubFetch(defaultHandlers());
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(readyState(result.current).isDirty).toBe(false);
  });

  it("becomes true once the input_schema text is edited to a materially different value", async () => {
    stubFetch(defaultHandlers());
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).inputSchema.onChange(UPDATED_INPUT_SCHEMA, true);
    });

    expect(readyState(result.current).isDirty).toBe(true);
  });

  it("becomes true once the output_schema text is edited to a materially different value", async () => {
    stubFetch(defaultHandlers());
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).outputSchema.onChange(UPDATED_OUTPUT_SCHEMA, true);
    });

    expect(readyState(result.current).isDirty).toBe(true);
  });

  it("becomes true once a form field is edited away from its loaded value, even while both JSON fields stay unchanged -- proving isDirty also reads react-hook-form's own dirty tracking rather than only the two schema comparisons", async () => {
    stubFetch(defaultHandlers());
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).form.setValue("connector", "a-different-connector", {
        shouldDirty: true,
      });
    });

    expect(readyState(result.current).isDirty).toBe(true);
  });
});

describe("useCapabilityDetail -- returning to the baseline clears isDirty (criterion 4)", () => {
  it("clears isDirty once the input_schema text is edited back to its exact loaded value", async () => {
    stubFetch(defaultHandlers());
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).inputSchema.onChange(UPDATED_INPUT_SCHEMA, true);
    });
    expect(readyState(result.current).isDirty).toBe(true);

    act(() => {
      readyState(result.current).inputSchema.onChange(LOADED_INPUT_SCHEMA, true);
    });
    expect(readyState(result.current).isDirty).toBe(false);
  });

  it("clears isDirty once the output_schema text is edited back to its exact loaded value", async () => {
    stubFetch(defaultHandlers());
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).outputSchema.onChange(UPDATED_OUTPUT_SCHEMA, true);
    });
    expect(readyState(result.current).isDirty).toBe(true);

    act(() => {
      readyState(result.current).outputSchema.onChange(LOADED_OUTPUT_SCHEMA, true);
    });
    expect(readyState(result.current).isDirty).toBe(false);
  });

  it("clears isDirty once a form field is edited back to its exact loaded value", async () => {
    stubFetch(defaultHandlers());
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).form.setValue("connector", "a-different-connector", {
        shouldDirty: true,
      });
    });
    expect(readyState(result.current).isDirty).toBe(true);

    act(() => {
      readyState(result.current).form.setValue("connector", LOADED_CAPABILITY.connector, {
        shouldDirty: true,
      });
    });
    expect(readyState(result.current).isDirty).toBe(false);
  });
});
