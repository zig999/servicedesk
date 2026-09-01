import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCapabilityDetail } from "./use-capability-detail";
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
