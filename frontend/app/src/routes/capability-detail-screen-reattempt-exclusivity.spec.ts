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

describe("CapabilityDetailScreen -- the reattempt control is withheld from every reading but the failed-read one (criterion 15)", () => {
  it("renders no Retry control while the read is still outstanding", async () => {
    const fetchMock = createFetchStub({
      ...baseHandlers(),
      [CAPABILITY_PATH]: () => new Promise<Response>(() => {}),
    });
    await mountCapabilityDetailScreen(fetchMock);

    await screen.findByText(/Loading capability/);
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });

  it("renders no Retry control once the capability has been read and is shown", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);

    await screen.findByLabelText("Connector");
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });
});
