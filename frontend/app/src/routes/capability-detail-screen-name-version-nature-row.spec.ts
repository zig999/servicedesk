import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  mountCapabilityDetailScreen,
} from "./capability-detail-screen.test-support";

// Proof for task/capability-detail-layout/name-version-nature-row's own criterion 1 --
// "CapabilityFormFields wraps the Name, Version and Nature FormField elements in one shared row
// container instead of Nature's current standalone FormField block rendered below the
// Name/Version row." capability-detail-screen.spec.ts's own existing assertions (criterion 6,
// left unmodified by this task per its own criterion 4) locate every field by
// screen.getByLabelText and never inspect DOM structure, so a build with Nature still rendered
// in its own separate row beneath Name/Version -- the very structure this task removes -- would
// satisfy every one of that file's assertions unchanged. This file adds the one structural check
// criterion 1 needs and the label-text suite cannot express: that Name, Version and Nature share
// one common ancestor a field from the next row down (Timeout) sits outside of.
//
// Criteria 2 and 3 (Nature's own selectable values and current selection, Name/Version's own
// values, unchanged by the regrouping) and criterion 4 (the existing suite passes unmodified)
// assert nothing this delivery changed and are already proven by capability-detail-screen.spec.ts
// and capability-detail-screen-save.spec.ts's own existing, untouched assertions, so no new test
// is written for them here.

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

describe("CapabilityDetailScreen -- Name, Version and Nature share one row container (criterion 1)", () => {
  it("wraps Name, Version and Nature in one shared container that a later-row field (Timeout) sits outside of", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const nameField = screen.getByLabelText("Name");
    const versionField = screen.getByLabelText("Version");
    const natureField = screen.getByLabelText("Nature");
    const timeoutField = screen.getByLabelText("Timeout (ms)");

    // The smallest element that wraps both Name and Nature together -- on the structure this
    // task removes (Nature in its own standalone block below a separate Name/Version row), the
    // smallest such element is the whole <form>, which also wraps Timeout; on the structure this
    // task establishes, it is the row itself, which does not.
    const row = closestCommonAncestor(nameField, natureField);

    expect(row.contains(versionField)).toBe(true);
    expect(row.contains(timeoutField)).toBe(false);
  });
});
