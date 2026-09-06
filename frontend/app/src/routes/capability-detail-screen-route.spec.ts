import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  CAPABILITY_PATH,
  baseHandlers,
  createFetchStub,
  mountCapabilityDetailScreen,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityDetailScreen -- a route to the listing is offered while the read is still outstanding (task's own UNDERDETERMINED note)", () => {
  it("renders 'Back to capabilities' while the capability read is still pending -- an implementation withholding the route here would fail this", async () => {
    const fetchMock = createFetchStub({
      ...baseHandlers(),
      [CAPABILITY_PATH]: () => new Promise<Response>(() => {}),
    });
    await mountCapabilityDetailScreen(fetchMock);

    await screen.findByText(/Loading capability/);
    expect(screen.getByRole("link", { name: "Back to capabilities" })).toBeTruthy();
  });
});
