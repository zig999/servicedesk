import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  createCapabilitiesFetchStub,
  mountCapabilitiesScreen,
} from "./capabilities-browser-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilitiesBrowserScreen — the New capability action while the list has failed to load (criterion 4)", () => {
  it("renders New capability when GET /v1/capabilities fails", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => {
        throw new Error("network down");
      },
    });
    await mountCapabilitiesScreen(fetchMock);

    expect(await screen.findByText("Capabilities could not be loaded.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "New capability" })).toBeTruthy();
  });
});
