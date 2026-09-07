import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  CAPABILITY_PATH,
  NAME,
  VERSION,
  baseHandlers,
  createFetchStub,
  errorResponse,
  mountCapabilityDetailScreen,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityDetailScreen -- the outstanding, failed-read and shown readings are each distinguishable from the other two (criterion 17, and criterion 12's own wording)", () => {
  it("shows only the outstanding-read text, naming this capability's own name and version, while the read is pending", async () => {
    const fetchMock = createFetchStub({
      ...baseHandlers(),
      [CAPABILITY_PATH]: () => new Promise<Response>(() => {}),
    });
    await mountCapabilityDetailScreen(fetchMock);

    await screen.findByText(`Loading capability ${NAME} ${VERSION}…`);
    expect(screen.queryByText("Unable to load this capability right now.")).toBeNull();
    expect(screen.queryByRole("heading", { name: `Capability ${NAME} ${VERSION}` })).toBeNull();
  });

  it("shows only the failed-read text once the read fails, neither the outstanding-read text nor the loaded form", async () => {
    const fetchMock = createFetchStub({
      [CAPABILITY_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    await mountCapabilityDetailScreen(fetchMock);

    await screen.findByText("Unable to load this capability right now.");
    expect(screen.queryByText(/Loading capability/)).toBeNull();
    expect(screen.queryByRole("heading", { name: `Capability ${NAME} ${VERSION}` })).toBeNull();
  });

  it("shows only the loaded form once the capability is read and shown, neither the outstanding-read text nor the failed-read text", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);

    await screen.findByRole("heading", { name: `Capability ${NAME} ${VERSION}` });
    expect(screen.queryByText(/Loading capability/)).toBeNull();
    expect(screen.queryByText("Unable to load this capability right now.")).toBeNull();
  });
});
