import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import {
  RECORD,
  SLUG,
  VERSION,
  fillSubjectReadyInView,
  mountReadyView,
  readyState,
  stubFetch,
} from "./case-simulation-ready-view.test-support";

// task/simulation-cockpit/screen-assembly rewrote this file's own previous placeholder wiring
// (canSimulate={false}, an inert onSimulateCase, only the header composed) into the full
// composed cockpit -- header, Subject, Hypotheses, Detail and Case result, sharing one subject
// and one dispatch-at-a-time gate through useCaseSimulationCockpit. This file's own previous
// three tests proved facts about that placeholder wiring (an unconditionally-disabled control,
// no gate, no QueryClientProvider needed); two of them (the always-disabled control, and
// clicking its inert handler) are superseded outright by the composed cockpit's own real gate,
// proven below against the actual mechanism rather than its absence. The third (the loaded
// record's own when_to_use and version state reaching the header) and the fourth (the record's
// own title never rendered) describe facts this composition still holds unchanged, so they are
// kept here, re-mounted under the QueryClientProvider this tree now needs to render at all.
//
// Criteria 2 (dispatch-in-flight gating), 3 (the shared subject), 5 (Case result population) and
// 7 (the error banner) live in case-simulation-ready-view-dispatch.spec.ts; criterion 4
// (selecting a hypothesis opens Detail) lives in case-simulation-ready-view-selection.spec.ts.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseSimulationReadyView -- composing the header from the loaded ready state", () => {
  it("passes the loaded record's own when_to_use and the version's own state through to the header", async () => {
    stubFetch();
    await mountReadyView({
      slug: SLUG,
      version: VERSION,
      state: readyState({ versionState: "released" }),
    });

    expect(await screen.findByText(/Use when the customer disputes a charge/)).toBeTruthy();
    expect(screen.getByText("Released")).toBeTruthy();
  });

  it("never renders the loaded record's own title anywhere in the composed cockpit", async () => {
    stubFetch();
    await mountReadyView({ slug: SLUG, version: VERSION, state: readyState() });

    await screen.findByText(/Use when the customer disputes a charge/);
    expect(screen.queryByText(RECORD.title)).toBeNull();
  });
});

describe("CaseSimulationReadyView -- the disabled-until-ready gate spans the header and the Hypotheses table together (criterion 1)", () => {
  it("keeps the header's own Simulate case action and every row's own Simulate action disabled while the shared subject is not ready", async () => {
    stubFetch();
    await mountReadyView({ slug: SLUG, version: VERSION, state: readyState() });

    const headerButton = await screen.findByRole("button", { name: /Simulate case/ });
    expect(headerButton.hasAttribute("disabled")).toBe(true);

    const rowButtons = await screen.findAllByRole("button", {
      name: /Simulate hypothesis at position/,
    });
    expect(rowButtons).toHaveLength(2);
    for (const button of rowButtons) {
      expect(button.hasAttribute("disabled")).toBe(true);
    }
  });

  it("enables the header's own Simulate case action and every row's own Simulate action together, the instant the shared subject becomes ready", async () => {
    stubFetch();
    await mountReadyView({ slug: SLUG, version: VERSION, state: readyState() });

    const headerButton = await screen.findByRole("button", { name: /Simulate case/ });
    expect(headerButton.hasAttribute("disabled")).toBe(true);

    await fillSubjectReadyInView();

    await waitFor(() => expect(headerButton.hasAttribute("disabled")).toBe(false));
    const rowButtons = screen.getAllByRole("button", { name: /Simulate hypothesis at position/ });
    for (const button of rowButtons) {
      expect(button.hasAttribute("disabled")).toBe(false);
    }
  });
});

describe("CaseSimulationReadyView -- regions absent until this session has something to show them (criteria 4-5)", () => {
  it("renders the Detail region's own placeholder message before any hypothesis is selected", async () => {
    stubFetch();
    await mountReadyView({ slug: SLUG, version: VERSION, state: readyState() });

    expect(
      await screen.findByText("Select a hypothesis with a result to see its detail."),
    ).toBeTruthy();
  });

  it("renders no Case result region before any full-case run has completed this session", async () => {
    stubFetch();
    await mountReadyView({ slug: SLUG, version: VERSION, state: readyState() });

    await screen.findByText(/Use when the customer disputes a charge/);
    expect(screen.queryByText("Case result")).toBeNull();
  });
});
