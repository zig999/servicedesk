import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCapabilityDetailView } from "./use-capability-detail-view";
import {
  CAPABILITY_PATH,
  FURTHER_INPUT_SCHEMA,
  FURTHER_OUTPUT_SCHEMA,
  LOADED_CAPABILITY,
  LOADED_INPUT_SCHEMA,
  LOADED_OUTPUT_SCHEMA,
  NAME,
  UPDATED_INPUT_SCHEMA,
  UPDATED_OUTPUT_SCHEMA,
  VERSION,
  createWrapper,
  jsonResponse,
  readyState,
  stubFetch,
} from "./use-capability-detail-view.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCapabilityDetailView -- onDiscard resets every field to the most recently loaded-or-saved values (criterion 5)", () => {
  it("resets both edited JSON schema fields back to their loaded values and clears isDirty", async () => {
    stubFetch();
    const { result } = renderHook(() => useCapabilityDetailView(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).inputSchema.onChange(UPDATED_INPUT_SCHEMA, true);
    });
    act(() => {
      readyState(result.current).outputSchema.onChange(UPDATED_OUTPUT_SCHEMA, true);
    });
    expect(readyState(result.current).isDirty).toBe(true);

    act(() => {
      readyState(result.current).onDiscard();
    });

    expect(readyState(result.current).inputSchema.value).toBe(LOADED_INPUT_SCHEMA);
    expect(readyState(result.current).outputSchema.value).toBe(LOADED_OUTPUT_SCHEMA);
    expect(readyState(result.current).isDirty).toBe(false);
  });

  it("resets a plain form field (connector) back to its loaded value through form.reset()", async () => {
    stubFetch();
    const { result } = renderHook(() => useCapabilityDetailView(NAME, VERSION), {
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
      readyState(result.current).onDiscard();
    });

    expect(readyState(result.current).form.getValues("connector")).toBe(
      LOADED_CAPABILITY.connector,
    );
    expect(readyState(result.current).isDirty).toBe(false);
  });
});

describe("useCapabilityDetailView -- onDiscard resets to what was just saved rather than the original pre-save values (an inference the implementation recorded)", () => {
  it("discards back to the just-saved schema values after a successful save, not the values loaded before it", async () => {
    stubFetch();
    const { result } = renderHook(() => useCapabilityDetailView(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).inputSchema.onChange(UPDATED_INPUT_SCHEMA, true);
    });
    act(() => {
      readyState(result.current).outputSchema.onChange(UPDATED_OUTPUT_SCHEMA, true);
    });
    act(() => {
      readyState(result.current).onSubmit();
    });
    await waitFor(() => expect(readyState(result.current).isDirty).toBe(false));

    act(() => {
      readyState(result.current).inputSchema.onChange(FURTHER_INPUT_SCHEMA, true);
    });
    act(() => {
      readyState(result.current).outputSchema.onChange(FURTHER_OUTPUT_SCHEMA, true);
    });
    expect(readyState(result.current).isDirty).toBe(true);

    act(() => {
      readyState(result.current).onDiscard();
    });

    expect(readyState(result.current).inputSchema.value).toBe(UPDATED_INPUT_SCHEMA);
    expect(readyState(result.current).outputSchema.value).toBe(UPDATED_OUTPUT_SCHEMA);
  });
});

describe("useCapabilityDetailView -- justSaved (criterion 7)", () => {
  it("is false before any save has happened", async () => {
    stubFetch();
    const { result } = renderHook(() => useCapabilityDetailView(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    expect(readyState(result.current).justSaved).toBe(false);
  });

  it("becomes true the instant a save succeeds", async () => {
    stubFetch();
    const { result } = renderHook(() => useCapabilityDetailView(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).inputSchema.onChange(UPDATED_INPUT_SCHEMA, true);
    });
    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(readyState(result.current).justSaved).toBe(true));
  });

  it("clears once the operator edits again after a save, so the acknowledgement never outlives what it acknowledged", async () => {
    stubFetch();
    const { result } = renderHook(() => useCapabilityDetailView(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).inputSchema.onChange(UPDATED_INPUT_SCHEMA, true);
    });
    act(() => {
      readyState(result.current).onSubmit();
    });
    await waitFor(() => expect(readyState(result.current).justSaved).toBe(true));

    act(() => {
      readyState(result.current).inputSchema.onChange(FURTHER_INPUT_SCHEMA, true);
    });

    expect(readyState(result.current).justSaved).toBe(false);
  });

  it("stays false while a save is still pending, only turning true once that same save actually resolves (edge case: a slow dependency)", async () => {
    let resolvePut!: (response: Response) => void;
    const pendingPut = new Promise<Response>((resolve) => {
      resolvePut = resolve;
    });
    stubFetch({
      [CAPABILITY_PATH]: (method) =>
        method === "PUT" ? pendingPut : jsonResponse(LOADED_CAPABILITY),
    });
    const { result } = renderHook(() => useCapabilityDetailView(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).inputSchema.onChange(UPDATED_INPUT_SCHEMA, true);
    });
    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(readyState(result.current).isSubmitting).toBe(true));
    expect(readyState(result.current).justSaved).toBe(false);

    await act(async () => {
      resolvePut(jsonResponse(LOADED_CAPABILITY));
    });
    await waitFor(() => expect(readyState(result.current).justSaved).toBe(true));
  });
});
