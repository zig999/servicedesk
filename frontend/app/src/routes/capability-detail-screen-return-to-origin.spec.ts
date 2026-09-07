import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  CAPABILITY_PATH,
  NAME,
  ORIGIN_PATH_ONE,
  VERSION,
  baseHandlers,
  createFetchStub,
  errorResponse,
  mountCapabilityDetailScreen,
  mountCapabilityDetailScreenAt,
  putCallCount,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const DETAIL_PATH = `/capabilities/${NAME}/${VERSION}`;

function actionsFooter(): HTMLElement {
  return screen.getByRole("group", { name: "Actions" });
}

describe("CapabilityDetailScreen -- the return-to-origin control lands back on a surface that exists (criterion 1)", () => {
  it("returns to the surface the detail screen was reached from, rather than the capabilities listing, and issues no register-capability call", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    const router = await mountCapabilityDetailScreenAt(fetchMock, [ORIGIN_PATH_ONE, DETAIL_PATH]);
    await screen.findByLabelText("Connector");

    fireEvent.click(within(actionsFooter()).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe(ORIGIN_PATH_ONE));
    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("CapabilityDetailScreen -- the return-to-origin control falls back to the capabilities listing with no surface to return to (criterion 2)", () => {
  it("lands on the capabilities listing from the outstanding-read reading", async () => {
    const fetchMock = createFetchStub({
      ...baseHandlers(),
      [CAPABILITY_PATH]: () => new Promise<Response>(() => {}),
    });
    const router = await mountCapabilityDetailScreen(fetchMock);
    await screen.findByText(/Loading capability/);

    fireEvent.click(within(actionsFooter()).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
    expect(putCallCount(fetchMock)).toBe(0);
  });

  it("lands on the capabilities listing from the failed-read reading", async () => {
    const fetchMock = createFetchStub({
      [CAPABILITY_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    const router = await mountCapabilityDetailScreen(fetchMock);
    await screen.findByRole("button", { name: "Retry" });

    fireEvent.click(within(actionsFooter()).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
    expect(putCallCount(fetchMock)).toBe(0);
  });

  it("lands on the capabilities listing from the nothing-registered reading", async () => {
    const fetchMock = createFetchStub({
      [CAPABILITY_PATH]: () => errorResponse("CapabilityIdentityNotFoundError", 404),
    });
    const router = await mountCapabilityDetailScreen(fetchMock);
    await screen.findByText("Unable to load this capability right now.");

    fireEvent.click(within(actionsFooter()).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
    expect(putCallCount(fetchMock)).toBe(0);
  });

  it("lands on the capabilities listing from the ready reading", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    const router = await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    fireEvent.click(within(actionsFooter()).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("CapabilityDetailScreen -- the return-to-origin control ignores an unsubmitted edit (criterion 3)", () => {
  it("lands on the capabilities listing from the ready reading even once a field has been edited away from what the read answered", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    const router = await mountCapabilityDetailScreen(fetchMock);
    const connectorField = await screen.findByLabelText<HTMLInputElement>("Connector");
    fireEvent.change(connectorField, { target: { value: "a-different-connector" } });

    fireEvent.click(within(actionsFooter()).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("CapabilityDetailScreen -- the return-to-origin control renders on every reading (criteria 4, 5, 6, 7)", () => {
  it("renders while the read is outstanding", async () => {
    const fetchMock = createFetchStub({
      ...baseHandlers(),
      [CAPABILITY_PATH]: () => new Promise<Response>(() => {}),
    });
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByText(/Loading capability/);

    expect(within(actionsFooter()).getByRole("button", { name: "Cancel" })).toBeTruthy();
  });

  it("renders once the read has failed", async () => {
    const fetchMock = createFetchStub({
      [CAPABILITY_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByRole("button", { name: "Retry" });

    expect(within(actionsFooter()).getByRole("button", { name: "Cancel" })).toBeTruthy();
  });

  it("renders once the capability has been read and is shown", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    expect(within(actionsFooter()).getByRole("button", { name: "Cancel" })).toBeTruthy();
  });

  it("renders where the read answered that no capability is registered at that name and version", async () => {
    const fetchMock = createFetchStub({
      [CAPABILITY_PATH]: () => errorResponse("CapabilityIdentityNotFoundError", 404),
    });
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByText("Unable to load this capability right now.");

    expect(within(actionsFooter()).getByRole("button", { name: "Cancel" })).toBeTruthy();
  });
});
