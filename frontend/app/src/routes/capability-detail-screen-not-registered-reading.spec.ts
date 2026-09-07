import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  CAPABILITY_PATH,
  createFetchStub,
  errorResponse,
  mountCapabilityDetailScreen,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityDetailScreen -- no field-restoring control renders where the read answered that nothing is registered at that name and version (criterion 18)", () => {
  it("renders no Discard control in the nothing-registered reading", async () => {
    const fetchMock = createFetchStub({
      [CAPABILITY_PATH]: () => errorResponse("CapabilityIdentityNotFoundError", 404),
    });
    await mountCapabilityDetailScreen(fetchMock);

    await screen.findByText("Unable to load this capability right now.");
    expect(screen.queryByRole("button", { name: "Discard changes" })).toBeNull();
  });
});
