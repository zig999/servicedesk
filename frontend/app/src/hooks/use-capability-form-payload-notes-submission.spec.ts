import { afterEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { createElement, type ReactElement, type ReactNode } from "react";
import { toast } from "sonner";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCapabilityForm, type CapabilityFormState } from "./use-capability-form";
import type { Capability } from "./use-capabilities";

const NAME = "some-capability";
const VERSION = "v1";
const CAPABILITY_PATH = `/v1/capabilities/${NAME}/${VERSION}`;
const CONCEPTS_PATH = "/v1/glossary/concepts";
const CONCEPTS_RESPONSE = { data: [{ name: "some-concept", accepts: ["capability"] }] };

const EXISTING_CAPABILITY: Capability = {
  name: NAME,
  version: VERSION,
  nature: "read-only",
  input_schema: '{"type":"object"}',
  output_schema: '{"type":"string"}',
  timeout: 30,
  connector: "some-connector",
  concept: "some-concept",
};

const EDITED_PAYLOAD_NOTES = "an operator's own edited account of what this observation returns";
const PREVIOUSLY_DECLARED_PAYLOAD_NOTES =
  "a previously declared account of what this observation returns, untouched this session";

const EXISTING_CAPABILITY_WITH_PAYLOAD_NOTES: Capability = {
  ...EXISTING_CAPABILITY,
  payload_notes: PREVIOUSLY_DECLARED_PAYLOAD_NOTES,
};

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function stubFetch(): Mock<FetchFn> {
  const fetchMock = vi.fn(
    async (input: string | URL | Request, _init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      if (url === CONCEPTS_PATH) {
        return jsonResponse(CONCEPTS_RESPONSE);
      }
      if (url === CAPABILITY_PATH) {
        return jsonResponse(EXISTING_CAPABILITY);
      }
      throw new Error(`useCapabilityForm proof: no mocked response for ${url}`);
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

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
    throw new Error("useCapabilityForm proof: expected a PUT call carrying a JSON string body");
  }
  return JSON.parse(rawBody);
}

function createWrapper(): (props: { children: ReactNode }) => ReactElement {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function readyState(
  state: CapabilityFormState,
): Extract<CapabilityFormState, { phase: "ready" }> {
  if (state.phase !== "ready") {
    throw new Error(`expected the ready phase, got "${state.phase}"`);
  }
  return state;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
});

describe("useCapabilityForm -- the submitted body carries payload_notes as the form value holds it (criterion 2)", () => {
  it("forwards a payload_notes value the operator just set into the PUT body, unchanged", async () => {
    const fetchMock = stubFetch();
    const { result } = renderHook(() => useCapabilityForm(EXISTING_CAPABILITY, () => {}), {
      wrapper: createWrapper(),
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

describe("useCapabilityForm -- an untouched, previously-declared payload_notes survives resubmission after editing only an unrelated field", () => {
  it("carries the previously loaded payload_notes forward in the submitted body, unchanged", async () => {
    const fetchMock = stubFetch();
    const { result } = renderHook(
      () => useCapabilityForm(EXISTING_CAPABILITY_WITH_PAYLOAD_NOTES, () => {}),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).form.setValue("connector", "a-different-connector", {
        shouldDirty: true,
      });
    });
    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual(
      expect.objectContaining({ payload_notes: PREVIOUSLY_DECLARED_PAYLOAD_NOTES }),
    );
  });
});

describe("useCapabilityForm -- payload_notes explicitly cleared is submitted as exactly an empty string, not the prior text", () => {
  it("carries payload_notes as an empty string in the submitted body", async () => {
    const fetchMock = stubFetch();
    const { result } = renderHook(
      () => useCapabilityForm(EXISTING_CAPABILITY_WITH_PAYLOAD_NOTES, () => {}),
      { wrapper: createWrapper() },
    );
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
