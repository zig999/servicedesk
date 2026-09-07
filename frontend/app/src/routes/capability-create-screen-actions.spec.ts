import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  mountCapabilityCreateScreen,
} from "./capability-create-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityCreateScreen -- offers no Discard control, having read no registration (criterion 8)", () => {
  it("renders no Discard changes control anywhere on the create surface", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    expect(screen.queryByRole("button", { name: "Discard changes" })).toBeNull();
  });
});
