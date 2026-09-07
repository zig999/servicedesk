import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
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
  it("renders a Capabilities route to the listing while the capability read is still pending -- an implementation withholding the route here would fail this", async () => {
    const fetchMock = createFetchStub({
      ...baseHandlers(),
      [CAPABILITY_PATH]: () => new Promise<Response>(() => {}),
    });
    await mountCapabilityDetailScreen(fetchMock);

    await screen.findByText(/Loading capability/);
    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("link", { name: "Capabilities" }).getAttribute("href")).toBe(
      "/capabilities",
    );
  });
});
