import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  CAPABILITY_PATH,
  baseHandlers,
  createFetchStub,
  errorResponse,
  mountCapabilityDetailScreen,
  putCallCount,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function actionsFooter(): HTMLElement {
  return screen.getByRole("group", { name: "Actions" });
}

describe("CapabilityDetailScreen -- a control whose destination is the capabilities listing renders on every reading (criterion 10)", () => {
  it("renders while the read is outstanding", async () => {
    const fetchMock = createFetchStub({
      ...baseHandlers(),
      [CAPABILITY_PATH]: () => new Promise<Response>(() => {}),
    });
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByText(/Loading capability/);

    expect(
      within(actionsFooter()).getByRole("link", { name: "Capabilities" }).getAttribute("href"),
    ).toBe("/capabilities");
  });

  it("renders once the read has failed", async () => {
    const fetchMock = createFetchStub({
      [CAPABILITY_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByRole("button", { name: "Retry" });

    expect(
      within(actionsFooter()).getByRole("link", { name: "Capabilities" }).getAttribute("href"),
    ).toBe("/capabilities");
  });

  it("renders once the capability has been read and is shown", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    expect(
      within(actionsFooter()).getByRole("link", { name: "Capabilities" }).getAttribute("href"),
    ).toBe("/capabilities");
  });

  it("renders where the read answered that no capability is registered at that name and version", async () => {
    const fetchMock = createFetchStub({
      [CAPABILITY_PATH]: () => errorResponse("CapabilityIdentityNotFoundError", 404),
    });
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByText("Unable to load this capability right now.");

    expect(
      within(actionsFooter()).getByRole("link", { name: "Capabilities" }).getAttribute("href"),
    ).toBe("/capabilities");
  });
});

describe("CapabilityDetailScreen -- taking the capabilities-listing control issues no register-capability call (criterion 11)", () => {
  it("issues no PUT when the Capabilities link is clicked from the ready reading", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    const router = await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    fireEvent.click(within(actionsFooter()).getByRole("link", { name: "Capabilities" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
    expect(putCallCount(fetchMock)).toBe(0);
  });
});
