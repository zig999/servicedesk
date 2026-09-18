import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCapabilityDetail } from "./use-capability-detail";
import {
  CAPABILITY_PATH,
  NAME,
  VERSION,
  createWrapper,
  defaultHandlers,
  readyState,
  stubFetch,
} from "./use-capability-detail.test-support";

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

afterEach(() => {
  vi.unstubAllGlobals();
});

function putCallCount(fetchMock: Mock<FetchFn>): number {
  return fetchMock.mock.calls.filter(
    ([url, init]) => url === CAPABILITY_PATH && init?.method === "PUT",
  ).length;
}

function parsedPutBody(fetchMock: Mock<FetchFn>): unknown {
  const putCall = fetchMock.mock.calls.find(
    ([url, init]) => url === CAPABILITY_PATH && init?.method === "PUT",
  );
  const rawBody = putCall?.[1]?.body;
  if (typeof rawBody !== "string") {
    throw new Error(
      "useCapabilityDetail proof: expected a PUT call carrying a JSON string body",
    );
  }
  return JSON.parse(rawBody);
}

const EDITED_PAYLOAD_NOTES = "an operator's own edited account of what this observation returns";

describe("useCapabilityDetail -- the submitted body carries payload_notes as the form value holds it (criterion 1)", () => {
  it("forwards a payload_notes value the operator just set into the PUT body, unchanged", async () => {
    const fetchMock = stubFetch(defaultHandlers());
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).form.setValue("payload_notes", EDITED_PAYLOAD_NOTES, {
        shouldDirty: true,
      });
    });
    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual(
      expect.objectContaining({ payload_notes: EDITED_PAYLOAD_NOTES }),
    );
  });
});

describe("useCapabilityDetail -- an untouched payload_notes reaches the registry as undeclared, and the submission is not refused for leaving it so (criteria 3 and 4)", () => {
  it("carries no payload_notes property in the submitted body, and still dispatches the PUT, when the field was never edited", async () => {
    const fetchMock = stubFetch(defaultHandlers());
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).not.toHaveProperty("payload_notes");
  });
});

describe("useCapabilityDetail -- payload_notes typed then cleared is submitted as exactly an empty string (criterion 3)", () => {
  it("carries payload_notes as an empty string in the submitted body, and no other content", async () => {
    const fetchMock = stubFetch(defaultHandlers());
    const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).form.setValue("payload_notes", "", { shouldDirty: true });
    });
    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual(expect.objectContaining({ payload_notes: "" }));
  });
});
