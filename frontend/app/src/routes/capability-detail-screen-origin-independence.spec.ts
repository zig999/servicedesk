import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  NAME,
  ORIGIN_PATH_ONE,
  ORIGIN_PATH_TWO,
  VERSION,
  baseHandlers,
  createFetchStub,
  mountCapabilityDetailScreenAt,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const DETAIL_PATH = `/capabilities/${NAME}/${VERSION}`;

async function expectBothControlsPresent(): Promise<void> {
  await screen.findByLabelText("Connector");
  const footer = screen.getByRole("group", { name: "Actions" });
  expect(within(footer).getByRole("button", { name: "Cancel" })).toBeTruthy();
  expect(within(footer).getByRole("link", { name: "Capabilities" })).toBeTruthy();
}

describe("CapabilityDetailScreen -- the presence of both controls turns on nothing about the reached-from surface (criterion 8)", () => {
  it("renders both controls when reached from one surface that is not the capabilities listing", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreenAt(fetchMock, [ORIGIN_PATH_ONE, DETAIL_PATH]);

    await expectBothControlsPresent();
  });

  it("renders both controls when reached from a different surface that is not the capabilities listing", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreenAt(fetchMock, [ORIGIN_PATH_TWO, DETAIL_PATH]);

    await expectBothControlsPresent();
  });

  it("renders both controls when reached from the capabilities listing itself", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreenAt(fetchMock, ["/capabilities", DETAIL_PATH]);

    await expectBothControlsPresent();
  });
});
