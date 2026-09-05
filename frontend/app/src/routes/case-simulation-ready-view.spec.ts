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

describe("CaseSimulationReadyView -- the Debug section's own view subject JSON control", () => {
  it("shows the currently assembled subject's type and its full set of attribute-values, exactly as domain/investigation/subject structures it, inside a collapsible details/summary block", async () => {
    stubFetch();
    await mountReadyView({ slug: SLUG, version: VERSION, state: readyState() });

    await fillSubjectReadyInView();

    const summary = await screen.findByText("View subject JSON");
    expect(summary.tagName).toBe("SUMMARY");
    // eslint-disable-next-line testing-library/no-node-access -- confirming the native disclosure element itself, mirroring case-simulation-detail-evidence-tab.spec.ts's own established convention.
    const disclosure = summary.closest("details");
    expect(disclosure).not.toBeNull();
    // eslint-disable-next-line testing-library/no-node-access -- reading the raw JSON text out of the collapsible block is the only way to confirm this criterion; parsed and compared structurally so this test does not pin the implementation's own chosen indentation.
    const rendered = disclosure?.querySelector("pre")?.textContent ?? "";
    expect(JSON.parse(rendered)).toEqual({
      type: "billing-dispute",
      attributes: [{ attribute: "account-id", value: "acct-1" }],
    });
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
