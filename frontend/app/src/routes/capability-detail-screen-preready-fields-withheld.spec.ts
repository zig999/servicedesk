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

function expectNoCapabilityFields(): void {
  expect(screen.queryByLabelText("Nature")).toBeNull();
  expect(screen.queryByLabelText("Input schema")).toBeNull();
  expect(screen.queryByLabelText("Output schema")).toBeNull();
  expect(screen.queryByLabelText("Timeout (ms)")).toBeNull();
  expect(screen.queryByLabelText("Connector")).toBeNull();
  expect(screen.queryByLabelText("Concept")).toBeNull();
}

describe("CapabilityDetailScreen -- neither the outstanding-read nor the failed-read reading presents any capability field (criterion 13)", () => {
  it("presents no capability field while the read is outstanding", async () => {
    const fetchMock = createFetchStub({
      ...baseHandlers(),
      [CAPABILITY_PATH]: () => new Promise<Response>(() => {}),
    });
    await mountCapabilityDetailScreen(fetchMock);

    await screen.findByText(/Loading capability/);
    expectNoCapabilityFields();
  });

  it("presents no capability field once the read has failed", async () => {
    const fetchMock = createFetchStub({
      [CAPABILITY_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    await mountCapabilityDetailScreen(fetchMock);

    await screen.findByRole("button", { name: "Retry" });
    expectNoCapabilityFields();
  });
});
