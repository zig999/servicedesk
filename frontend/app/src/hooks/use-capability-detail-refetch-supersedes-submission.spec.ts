import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCapabilityDetail } from "./use-capability-detail";
import {
  LOADED_CAPABILITY,
  NAME,
  UPDATED_INPUT_SCHEMA,
  UPDATED_OUTPUT_SCHEMA,
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

const REFETCHED_INPUT_SCHEMA = '{"type":"object","refetched":true}';
const REFETCHED_OUTPUT_SCHEMA = '{"type":"string","refetched":true}';
const REFETCHED_CONNECTOR = "a-refetch-only-connector";
const SUBMITTED_CONNECTOR = "an-operator-chosen-connector";

describe("useCapabilityDetail -- the submitted edit stands until the refetch answers (criterion 3)", () => {
  it("holds exactly the submitted values for both schema fields and a plain field between the write's answer and the refetch answering", async () => {
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
      readyState(result.current).outputSchema.onChange(UPDATED_OUTPUT_SCHEMA, true);
    });
    act(() => {
      readyState(result.current).form.setValue("connector", SUBMITTED_CONNECTOR, {
        shouldDirty: true,
      });
    });
    act(() => {
      readyState(result.current).onSubmit();
    });
    await waitFor(() => expect(readyState(result.current).isSubmitSuccessful).toBe(true));

    expect(readyState(result.current).inputSchema.value).toBe(UPDATED_INPUT_SCHEMA);
    expect(readyState(result.current).outputSchema.value).toBe(UPDATED_OUTPUT_SCHEMA);
    expect(readyState(result.current).form.getValues("connector")).toBe(SUBMITTED_CONNECTOR);

    // Tear down the refetch this save invalidated rather than leaving it pending.
    await act(async () => {
      refetch.resolve(jsonResponse(LOADED_CAPABILITY));
    });
  });
});

describe("useCapabilityDetail -- the refetch's own answer supersedes the submission for every field and both baselines (criteria 2 and 4)", () => {
  it("adopts the refetched answer's values once it lands, even where that answer differs from what was submitted", async () => {
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
      readyState(result.current).outputSchema.onChange(UPDATED_OUTPUT_SCHEMA, true);
    });
    act(() => {
      readyState(result.current).form.setValue("connector", SUBMITTED_CONNECTOR, {
        shouldDirty: true,
      });
    });
    act(() => {
      readyState(result.current).onSubmit();
    });
    await waitFor(() => expect(readyState(result.current).isSubmitSuccessful).toBe(true));

    await act(async () => {
      refetch.resolve(
        jsonResponse({
          ...LOADED_CAPABILITY,
          input_schema: REFETCHED_INPUT_SCHEMA,
          output_schema: REFETCHED_OUTPUT_SCHEMA,
          connector: REFETCHED_CONNECTOR,
        }),
      );
    });

    await waitFor(() => expect(readyState(result.current).isDirty).toBe(false));
    expect(readyState(result.current).inputSchema.value).toBe(REFETCHED_INPUT_SCHEMA);
    expect(readyState(result.current).outputSchema.value).toBe(REFETCHED_OUTPUT_SCHEMA);
    expect(readyState(result.current).form.getValues("connector")).toBe(REFETCHED_CONNECTOR);
  });
});
