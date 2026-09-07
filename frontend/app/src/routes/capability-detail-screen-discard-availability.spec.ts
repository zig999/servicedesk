import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  CAPABILITY_PATH,
  baseHandlers,
  createFetchStub,
  errorResponse,
  mountCapabilityDetailScreen,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityDetailScreen -- the Discard control is withheld while the read is outstanding (task's own UNDERDETERMINED note)", () => {
  it("renders no Discard control while the capability read is still pending -- an implementation offering Discard here would fail this", async () => {
    const fetchMock = createFetchStub({
      ...baseHandlers(),
      [CAPABILITY_PATH]: () => new Promise<Response>(() => {}),
    });
    await mountCapabilityDetailScreen(fetchMock);

    await screen.findByText(/Loading capability/);
    expect(screen.queryByRole("button", { name: "Discard changes" })).toBeNull();
  });
});

describe("CapabilityDetailScreen -- the Discard control is withheld once the read has failed (task's own UNDERDETERMINED note)", () => {
  it("renders no Discard control once the capability read fails -- an implementation offering Discard here would fail this", async () => {
    const fetchMock = createFetchStub({
      ...baseHandlers(),
      [CAPABILITY_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    await mountCapabilityDetailScreen(fetchMock);

    await screen.findByRole("button", { name: "Retry" });
    expect(screen.queryByRole("button", { name: "Discard changes" })).toBeNull();
  });
});
