import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCapabilityDetail } from "./use-capability-detail";
import {
  CAPABILITY_PATH,
  LOADED_CAPABILITY,
  NAME,
  UPDATED_INPUT_SCHEMA,
  VERSION,
  createWrapper,
  defaultHandlers,
  errorResponse,
  jsonResponse,
  readyState,
  stubFetch,
} from "./use-capability-detail.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCapabilityDetail -- a successful save re-baselines and clears isDirty (criterion 5)", () => {
  it("clears isDirty right after a successful save, with no further edits", async () => {
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
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(readyState(result.current).isDirty).toBe(false));
  });

  it("re-baselines both JSON fields to the values just submitted, not whatever the PUT response body's own schema fields carry", async () => {
    stubFetch(
      defaultHandlers({
        [CAPABILITY_PATH]: (method) =>
          method === "PUT"
            ? jsonResponse({
                ...LOADED_CAPABILITY,
                input_schema: '{"unexpected":"response-shape"}',
                output_schema: '{"unexpected":"response-shape"}',
              })
            : jsonResponse(LOADED_CAPABILITY),
      }),
    );
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).inputSchema.onChange(UPDATED_INPUT_SCHEMA, true);
    });
    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(readyState(result.current).isDirty).toBe(false));
    expect(readyState(result.current).inputSchema.value).toBe(UPDATED_INPUT_SCHEMA);
  });
});

describe("useCapabilityDetail -- a successful save invalidates both queries (criterion 6)", () => {
  it("invalidates both the capabilities list query and its own capability query once the save succeeds", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    stubFetch(defaultHandlers());
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).inputSchema.onChange(UPDATED_INPUT_SCHEMA, true);
    });
    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(readyState(result.current).isDirty).toBe(false));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["capabilities"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["capability", NAME, VERSION] });
  });
});

describe("useCapabilityDetail -- a refused save settling with no distinguishable handling (an inference the implementation recorded)", () => {
  it("returns isSubmitting to false and keeps both the edit and the ready phase once the PUT fails, with isDirty still true", async () => {
    stubFetch(
      defaultHandlers({
        [CAPABILITY_PATH]: (method) =>
          method === "PUT"
            ? errorResponse("SomeRegistryRefusal", 422)
            : jsonResponse(LOADED_CAPABILITY),
      }),
    );
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).inputSchema.onChange(UPDATED_INPUT_SCHEMA, true);
    });
    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(readyState(result.current).isSubmitting).toBe(false));
    expect(readyState(result.current).isDirty).toBe(true);
    expect(readyState(result.current).inputSchema.value).toBe(UPDATED_INPUT_SCHEMA);
  });
});

describe("useCapabilityDetail -- ignoring a second submit before the first one settles (edge case: two operations against one subject at once)", () => {
  it("dispatches only one PUT even when onSubmit is called twice before the first save has resolved", async () => {
    const fetchMock = stubFetch(defaultHandlers());
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).onSubmit();
      readyState(result.current).onSubmit();
    });

    await waitFor(() => {
      const putCalls = fetchMock.mock.calls.filter(
        ([url, init]) => url === CAPABILITY_PATH && init?.method === "PUT",
      );
      expect(putCalls.length).toBe(1);
    });
  });
});
