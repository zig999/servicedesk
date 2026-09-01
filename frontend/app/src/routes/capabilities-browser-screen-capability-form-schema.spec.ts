import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { mountCapabilitiesScreen } from "./capabilities-browser-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilitiesBrowserScreen — the New capability action while the list is loading (criterion 4)", () => {
  it("renders New capability before GET /v1/capabilities responds", async () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    await mountCapabilitiesScreen(fetchMock);

    expect(screen.getByText("Loading capabilities…")).toBeTruthy();
    expect(screen.getByRole("button", { name: "New capability" })).toBeTruthy();
  });
});
