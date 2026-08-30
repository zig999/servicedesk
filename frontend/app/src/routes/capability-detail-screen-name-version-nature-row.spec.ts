import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  mountCapabilityDetailScreen,
} from "./capability-detail-screen.test-support";

// CapabilityFormFields wraps Name, Version, Nature and Timeout in one shared four-column row
// (a direct layout edit under `edits_freely`, moving Timeout into this row from its own former
// grouping with Connector). capability-detail-screen.spec.ts's own existing assertions locate
// every field by screen.getByLabelText and never inspect DOM structure, so this file adds the
// one structural check that grouping needs and the label-text suite cannot express: that Name,
// Version, Nature and Timeout share one common ancestor a later field (Connector, now its own
// standalone row) sits outside of.

afterEach(() => {
  vi.unstubAllGlobals();
});

/** The smallest element that is an ancestor of both `start` and `target` (or `start` itself, if
 * its own subtree already contains `target`) -- found by walking up from `start` until an
 * ancestor's own subtree contains `target`. Structural containment, not a class name or a tag:
 * whatever markup a row container is built from (a grid wrapper, a flex wrapper, anything else),
 * this is true of it exactly when the fields it wraps sit inside one shared element together. */
function closestCommonAncestor(start: Element, target: Element): Element {
  let candidate: Element | null = start;
  while (candidate !== null) {
    if (candidate.contains(target)) {
      return candidate;
    }
    // Walking up the ancestor chain is the only way to find the smallest shared container of two
    // already-queried elements; Testing Library's own APIs query downward from a container, never
    // upward from an element, so there is no RTL query this walk could be expressed through
    // (mirrors this codebase's own established precedent -- e.g. case-simulation-status-dot.spec.ts,
    // version-manifest-screen-remove.spec.ts -- of a reasoned suppression where no RTL alternative
    // reaches the same DOM relationship).
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

    // The smallest element that wraps both Name and Nature together -- the shared four-column
    // row, which also wraps Timeout and does not wrap Connector, now its own standalone field.
    const row = closestCommonAncestor(nameField, natureField);

    expect(row.contains(versionField)).toBe(true);
    expect(row.contains(timeoutField)).toBe(true);
    expect(row.contains(connectorField)).toBe(false);
  });
});
