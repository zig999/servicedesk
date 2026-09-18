import { createElement, type ReactElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCapabilityForm, type CapabilityFormState } from "./use-capability-form";
import type { Capability } from "./use-capabilities";

const CONCEPTS_PATH = "/v1/glossary/concepts";
const CONCEPTS_RESPONSE = { data: [{ name: "some-concept", accepts: ["capability"] }] };

const EXISTING_CAPABILITY_WITH_PAYLOAD_NOTES: Capability = {
  name: "some-capability",
  version: "v1",
  nature: "read-only",
  input_schema: '{"type":"object"}',
  output_schema: '{"type":"string"}',
  timeout: 30,
  connector: "some-connector",
  concept: "some-concept",
  payload_notes: "an operator's own account of what this observation actually returns",
};

const EXISTING_CAPABILITY_WITHOUT_PAYLOAD_NOTES: Capability = {
  name: "some-capability",
  version: "v1",
  nature: "read-only",
  input_schema: '{"type":"object"}',
  output_schema: '{"type":"string"}',
  timeout: 30,
  connector: "some-connector",
  concept: "some-concept",
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

function stubFetch(): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      if (url === CONCEPTS_PATH) {
        return jsonResponse(CONCEPTS_RESPONSE);
      }
      throw new Error(`useCapabilityForm proof: no mocked response for ${url}`);
    }),
  );
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
});

describe("useCapabilityForm -- the existing capability's payload_notes is the payload_notes its form values hold, where that capability carries content", () => {
  it("holds the existing capability's own payload_notes content in the ready-phase form values", async () => {
    stubFetch();
    const { result } = renderHook(
      () => useCapabilityForm(EXISTING_CAPABILITY_WITH_PAYLOAD_NOTES, () => {}),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(readyState(result.current).form.getValues("payload_notes")).toBe(
      EXISTING_CAPABILITY_WITH_PAYLOAD_NOTES.payload_notes,
    );
  });
});

describe("useCapabilityForm -- the existing capability's payload_notes is the payload_notes its form values hold, where that capability carries none", () => {
  it("holds no payload_notes content in the ready-phase form values", async () => {
    stubFetch();
    const { result } = renderHook(
      () => useCapabilityForm(EXISTING_CAPABILITY_WITHOUT_PAYLOAD_NOTES, () => {}),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(readyState(result.current).form.getValues("payload_notes")).toBeUndefined();
  });
});
