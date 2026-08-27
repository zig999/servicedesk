import { createElement } from "react";
import { describe, expect, it } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  CaseSimulationReadyView,
  type CaseSimulationReadyViewProps,
} from "./case-simulation-ready-view";
import type { CaseVersionRecord } from "../services/case-version-record";

// task/simulation-cockpit/case-simulation-route's own "ready" phase markup.
// CaseSimulationReadyView composes CaseSimulationHeader, whose own Links need
// a real router context to resolve an href against -- mirrors
// case-simulation-header.test-support.ts's own established mounting shape
// (root route renders the component directly with hand-built props,
// destination leaves exist only so a Link resolves).

const RECORD: CaseVersionRecord = {
  title: "A title no criterion of this task names",
  when_to_use: "Use when the customer disputes a charge",
  subject: "billing-dispute",
  fallback: { outcome: "resolved", referral: { action: "notify", recipient: "customer" } },
};

type ReadyState = CaseSimulationReadyViewProps["state"];

function readyState(
  overrides: Partial<Pick<ReadyState, "versionState" | "record">> = {},
): ReadyState {
  return {
    phase: "ready",
    record: overrides.record ?? RECORD,
    versionState: overrides.versionState ?? "draft",
  };
}

async function mountReadyView(props: CaseSimulationReadyViewProps): Promise<void> {
  const rootRoute = createRootRoute({
    component: () => createElement(CaseSimulationReadyView, props),
  });
  const versionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version",
    component: () => null,
  });
  const newVersionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/new",
    component: () => null,
  });
  const manifestRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest",
    component: () => null,
  });
  const routeTree = rootRoute.addChildren([versionRoute, newVersionRoute, manifestRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  render(createElement(RouterProvider, { router }));
}

describe("CaseSimulationReadyView -- composing the header from the loaded ready state", () => {
  it("passes the loaded record's own when_to_use and the version's own state through to the header", async () => {
    await mountReadyView({
      slug: "some-slug",
      version: 3,
      state: readyState({ versionState: "released" }),
    });

    expect(screen.getByText(/Use when the customer disputes a charge/)).toBeTruthy();
    expect(screen.getByText("Released")).toBeTruthy();
  });
});

describe("CaseSimulationReadyView -- the Simulate case control's placeholder wiring (this task's own recorded inference)", () => {
  it("renders 'Simulate case' disabled, since no subject-readiness gate exists in this tree yet", async () => {
    await mountReadyView({ slug: "some-slug", version: 3, state: readyState() });

    const button = screen.getByRole("button", { name: /Simulate case/ });
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("does not throw when the disabled Simulate case control is clicked, since its click handler is an inert placeholder", async () => {
    await mountReadyView({ slug: "some-slug", version: 3, state: readyState() });

    const button = screen.getByRole("button", { name: /Simulate case/ });
    expect(() => fireEvent.click(button)).not.toThrow();
  });
});

describe("CaseSimulationReadyView -- omitting the version's title (this task's own recorded inference)", () => {
  it("never renders the loaded record's own title, only identity, state and when_to_use", async () => {
    await mountReadyView({
      slug: "some-slug",
      version: 3,
      state: readyState({ record: RECORD }),
    });

    expect(screen.queryByText(RECORD.title)).toBeNull();
  });
});
