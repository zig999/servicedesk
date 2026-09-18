import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCapabilityDetail } from "./use-capability-detail";
import {
  LOADED_CAPABILITY,
  NAME,
  UPDATED_INPUT_SCHEMA,
  VERSION,
  createWrapper,
  deferred,
  jsonResponse,
  readyState,
  stubFetchWithControllableCapabilityGet,
} from "./use-capability-detail.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCapabilityDetail -- the outcome stands at the write's own answer, unmoved by the invalidated refetch that follows it (criterion 1)", () => {
  it("reports isSubmitSuccessful true the moment the write settles, while the refetch it invalidated is still outstanding, and keeps it true once that refetch answers", async () => {
    const { queueNextCapabilityGet } = stubFetchWithControllableCapabilityGet();
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    const refetch = deferred<Response>();
    queueNextCapabilityGet(() => refetch.promise);

    act(() => {
      readyState(result.current).inputSchema.onChange(UPDATED_INPUT_SCHEMA, true);
    });
    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(readyState(result.current).isSubmitSuccessful).toBe(true));
    // The refetch this save invalidated has not answered yet -- the outcome already stands.
    expect(readyState(result.current).isSubmitSuccessful).toBe(true);

    await act(async () => {
      refetch.resolve(jsonResponse(LOADED_CAPABILITY));
    });
    await waitFor(() => expect(readyState(result.current).isDirty).toBe(false));
    // The refetch has now answered -- the outcome still stands, unmoved by that answer.
    expect(readyState(result.current).isSubmitSuccessful).toBe(true);
  });
});

describe("useCapabilityDetail -- whether the outcome withdraws when the invalidated refetch instead fails (an underdetermined note in this task)", () => {
  it("keeps isSubmitSuccessful true, and the surface in the ready phase, after the refetch the save invalidated rejects", async () => {
    const { queueNextCapabilityGet } = stubFetchWithControllableCapabilityGet();
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    const refetch = deferred<Response>();
    queueNextCapabilityGet(() => refetch.promise);

    act(() => {
      readyState(result.current).inputSchema.onChange(UPDATED_INPUT_SCHEMA, true);
    });
    act(() => {
      readyState(result.current).onSubmit();
    });
    await waitFor(() => expect(readyState(result.current).isSubmitSuccessful).toBe(true));

    await act(async () => {
      refetch.reject(new Error("useCapabilityDetail proof: simulated refetch failure"));
    });

    expect(readyState(result.current).isSubmitSuccessful).toBe(true);
  });
});
