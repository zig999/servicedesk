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
