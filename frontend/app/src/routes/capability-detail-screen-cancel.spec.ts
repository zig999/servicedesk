import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  mountCapabilityDetailScreen,
  putCallCount,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityDetailScreen -- a Cancel control leaves the surface without submitting or replacing the registered capability (criterion 9, disclosed inference)", () => {
  it("renders Cancel as a button distinct from Discard, alongside a separate Capabilities link addressed at the listing", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const cancel = screen.getByRole("button", { name: "Cancel" });
    expect(cancel.tagName).toBe("BUTTON");
    expect(screen.getByRole("button", { name: "Discard changes" })).not.toBe(cancel);
    const listingLink = screen.getByRole("link", { name: "Capabilities" });
    expect(listingLink.getAttribute("href")).toBe("/capabilities");
  });

  it("navigates to the capabilities listing when Cancel is clicked while an edit is pending, issuing no PUT", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    const router = await mountCapabilityDetailScreen(fetchMock);
    const connectorField = await screen.findByLabelText<HTMLInputElement>("Connector");
    fireEvent.change(connectorField, { target: { value: "a-different-connector" } });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/capabilities"));
    expect(putCallCount(fetchMock)).toBe(0);
  });
});
