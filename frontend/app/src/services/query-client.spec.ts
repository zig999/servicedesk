import { describe, expect, it, vi } from "vitest";
import { QueryClient, type Query } from "@tanstack/react-query";

// sonner is the network/DOM-adjacent boundary this module reaches across to
// surface a toast; vi.mock intercepts the module @tanstack/react-query's own
// onError handler (below) calls into, so the assertions never depend on
// sonner actually mounting anything.
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

import { toast } from "sonner";
import { queryClient } from "./query-client";

// The onError handler under test (query-client.ts) reads only the thrown
// error; the Query argument @tanstack/react-query's own onError signature
// requires is never touched by it, so this stub stands in for a real one
// rather than constructing a live Query through the cache's internals.
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- this is a deliberate stand-in for a Query argument the handler under test never reads, not an assertion narrowing a checked value.
const stubQuery = {} as unknown as Query<unknown, unknown, unknown>;

describe("queryClient", () => {
  it("is a QueryClient instance", () => {
    expect(queryClient).toBeInstanceOf(QueryClient);
  });

  it("retries a failed query exactly once by default", () => {
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(1);
  });

  it("leaves staleTime unset on the client itself, deferring it to each query", () => {
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBeUndefined();
  });
});

describe("queryClient's QueryCache onError handler", () => {
  it("toasts the thrown Error's own message", () => {
    vi.mocked(toast.error).mockClear();
    const onError = queryClient.getQueryCache().config.onError;

    onError?.(new Error("network down"), stubQuery);

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith("network down");
  });

  it("toasts a fallback string, rather than throwing, when the rejection carries no Error", () => {
    vi.mocked(toast.error).mockClear();
    const onError = queryClient.getQueryCache().config.onError;

    // A query function can reject with any value at runtime, whatever
    // @tanstack/react-query's own default error type claims -- this cast
    // is what lets the test drive that path deliberately.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- deliberately drives the handler with a non-Error value to prove it does not throw, which is exactly what the onError type signature (typed to Error by this app's own usage) would otherwise forbid at compile time.
    expect(() => onError?.("just a string" as unknown as Error, stubQuery)).not.toThrow();

    expect(toast.error).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- narrows a mock call's loosely-typed argument tuple to the single string argument this specific call is known to have received.
    const [message] = vi.mocked(toast.error).mock.calls[0] as [string];
    expect(typeof message).toBe("string");
    expect(message.length).toBeGreaterThan(0);
    expect(message).not.toBe("just a string");
  });
});
