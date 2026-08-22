import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  createFetchStub,
  HYPOTHESES_PATH,
  jsonResponse,
  mountCaseHypothesesTab,
  revisionsPath,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";

// task/manifest-hypothesis-authoring/hypotheses-tab's own criteria 2, 3 and 4, proven
// directly against CaseHypothesesTab (mounted on its own, the same way
// hypothesis-revision-screen.spec.ts mounts NewHypothesisScreen/ReviseHypothesisScreen
// directly rather than through the whole production route tree) -- criterion 1's own
// tab-strip wiring is proven separately in case-detail-screen-hypotheses-tab.spec.ts.
// A row carries onRowClick, so StatusTable overrides its implicit "row" role with
// "button" (status-table.spec.ts's own established convention, also used by
// cases-list-screen.spec.ts for the same reason).

afterEach(() => {
  vi.unstubAllGlobals();
});

const H1_REVISIONS = {
  data: [
    {
      revision: 5,
      criterion: "Some criterion",
      collects: ["ConceptA"],
      resolution: { outcome: "pending", referral: { action: "notify", recipient: "customer" } },
    },
  ],
  total: 5,
};

const H2_REVISIONS = {
  data: [
    {
      revision: 1,
      criterion: "First",
      collects: ["ConceptB"],
      resolution: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
    },
    {
      revision: 2,
      criterion: "Second",
      collects: ["ConceptB"],
      resolution: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
    },
  ],
  total: 2,
};

describe("CaseHypothesesTab (criterion 2)", () => {
  it("lists every hypothesis GET /v1/cases/{slug}/hypotheses returns for the case, by name", async () => {
    const fetchMock = createFetchStub({
      [HYPOTHESES_PATH]: () => jsonResponse({ data: [{ name: "H1" }, { name: "H2" }] }),
      [revisionsPath("H1")]: () => jsonResponse(H1_REVISIONS),
      [revisionsPath("H2")]: () => jsonResponse(H2_REVISIONS),
    });

    await mountCaseHypothesesTab(fetchMock);

    const rows = await screen.findAllByRole("button");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("H1")).toBeTruthy();
    expect(within(rows[1]).getByText("H2")).toBeTruthy();
  });
});

describe("CaseHypothesesTab (criterion 3)", () => {
  it("shows each hypothesis's Revisions count as the endpoint's own total, never the length of the page it returned", async () => {
    const fetchMock = createFetchStub({
      [HYPOTHESES_PATH]: () => jsonResponse({ data: [{ name: "H1" }, { name: "H2" }] }),
      // H1's own revisions page carries a single item, but its total is 5 --
      // this is exactly the distinction this criterion states.
      [revisionsPath("H1")]: () => jsonResponse(H1_REVISIONS),
      [revisionsPath("H2")]: () => jsonResponse(H2_REVISIONS),
    });

    await mountCaseHypothesesTab(fetchMock);

    const rows = await screen.findAllByRole("button");
    expect(within(rows[0]).getByText("5")).toBeTruthy();
    expect(within(rows[0]).queryByText("1")).toBeNull();
    expect(within(rows[1]).getByText("2")).toBeTruthy();
  });

  it("shows an em dash for a hypothesis's own Revisions count when that hypothesis's own revisions fail to load, without blocking the rest of the row", async () => {
    const fetchMock = createFetchStub({
      [HYPOTHESES_PATH]: () => jsonResponse({ data: [{ name: "H1" }, { name: "H2" }] }),
      [revisionsPath("H1")]: () => {
        throw new Error("network down");
      },
      [revisionsPath("H2")]: () => jsonResponse(H2_REVISIONS),
    });

    await mountCaseHypothesesTab(fetchMock);

    const rows = await screen.findAllByRole("button");
    expect(await within(rows[0]).findByText("—")).toBeTruthy();
    expect(within(rows[1]).getByText("2")).toBeTruthy();
  });
});

describe("CaseHypothesesTab (criterion 4)", () => {
  it("renders that hypothesis's own revision-history view when its row is selected", async () => {
    const fetchMock = createFetchStub({
      [HYPOTHESES_PATH]: () => jsonResponse({ data: [{ name: "H1" }, { name: "H2" }] }),
      [revisionsPath("H1")]: () => jsonResponse(H1_REVISIONS),
      [revisionsPath("H2")]: () => jsonResponse(H2_REVISIONS),
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 1, state: "released" }] }),
    });

    await mountCaseHypothesesTab(fetchMock);
    const rows = await screen.findAllByRole("button");
    fireEvent.click(rows[0]);

    expect(await screen.findByRole("button", { name: "Back to hypotheses" })).toBeTruthy();
    expect(screen.queryByText("H2")).toBeNull();
  });

  it("returns to the hypotheses list when Back to hypotheses is clicked from the revision-history view", async () => {
    const fetchMock = createFetchStub({
      [HYPOTHESES_PATH]: () => jsonResponse({ data: [{ name: "H1" }, { name: "H2" }] }),
      [revisionsPath("H1")]: () => jsonResponse(H1_REVISIONS),
      [revisionsPath("H2")]: () => jsonResponse(H2_REVISIONS),
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 1, state: "released" }] }),
    });

    await mountCaseHypothesesTab(fetchMock);
    const rows = await screen.findAllByRole("button");
    fireEvent.click(rows[0]);
    const backButton = await screen.findByRole("button", { name: "Back to hypotheses" });

    fireEvent.click(backButton);

    expect(await screen.findByText("H2")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Back to hypotheses" })).toBeNull();
  });
});

describe("CaseHypothesesTab -- loading, failure and empty states", () => {
  it("shows a loading placeholder before the hypothesis list arrives", async () => {
    const fetchMock = createFetchStub({
      [HYPOTHESES_PATH]: () => new Promise<Response>(() => {}),
    });

    await mountCaseHypothesesTab(fetchMock);

    expect(screen.getByText("Loading hypotheses…")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("shows a failure placeholder with a retry action when the hypothesis list fails to load", async () => {
    const fetchMock = createFetchStub({
      [HYPOTHESES_PATH]: () => {
        throw new Error("network down");
      },
    });

    await mountCaseHypothesesTab(fetchMock);

    expect(await screen.findByText("Unable to load this case's hypotheses.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("renders an explicit empty state when the case has originated no hypotheses", async () => {
    const fetchMock = createFetchStub({
      [HYPOTHESES_PATH]: () => jsonResponse({ data: [] }),
    });

    await mountCaseHypothesesTab(fetchMock);

    expect(await screen.findByText("This case has originated no hypotheses yet.")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
});
