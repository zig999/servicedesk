import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  mountCapabilityDetailScreen,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function closestCommonAncestor(start: Element, target: Element): Element {
  let candidate: Element | null = start;
  while (candidate !== null) {
    if (candidate.contains(target)) {
      return candidate;
    }

    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    candidate = candidate.parentElement;
  }
  throw new Error(
    "capability-detail-screen-name-version-nature-row proof: no common ancestor found in the document",
  );
}

describe("CapabilityDetailScreen -- Name, Version, Nature and Timeout share one row container", () => {
  it("wraps Name, Version, Nature and Timeout in one shared container that a later field (Connector) sits outside of", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const nameField = screen.getByLabelText("Name");
    const versionField = screen.getByLabelText("Version");
    const natureField = screen.getByLabelText("Nature");
    const timeoutField = screen.getByLabelText("Timeout (ms)");
    const connectorField = screen.getByLabelText("Connector");

    const row = closestCommonAncestor(nameField, natureField);

    expect(row.contains(versionField)).toBe(true);
    expect(row.contains(timeoutField)).toBe(true);
    expect(row.contains(connectorField)).toBe(false);
  });
});
