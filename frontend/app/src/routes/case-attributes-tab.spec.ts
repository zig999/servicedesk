import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  createFetchStub,
  errorResponse,
  jsonResponse,
  mountCaseAttributesTab,
  SLUG,
  versionPath,
  VERSIONS_PATH,
} from "./case-attributes-tab.test-support";
import type { CaseVersionRecord } from "../services/case-version-record";

afterEach(() => {
  vi.unstubAllGlobals();
});

const RECORD: CaseVersionRecord = {
  title: "Handling a billing dispute",
  when_to_use: "When a customer disputes a charge",
  subject: "billing-dispute",
  fallback: { outcome: "resolved", referral: { action: "notify", recipient: "customer" } },
  consolidation_register: "formal",
};

describe("CaseAttributesTab -- the current version's own declared attributes (criterion 1)", () => {
  it("renders the current version's own title, when_to_use, subject, fallback outcome/referral and consolidation_register", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 3, state: "draft" }] }),
      [versionPath(3)]: () => jsonResponse(RECORD),
    });

    await mountCaseAttributesTab(fetchMock);

    expect(await screen.findByText("Handling a billing dispute")).toBeTruthy();
    expect(screen.getByText("When a customer disputes a charge")).toBeTruthy();
    expect(screen.getByText("billing-dispute")).toBeTruthy();
    expect(screen.getByText("resolved")).toBeTruthy();
    expect(screen.getByText("notify")).toBeTruthy();
    expect(screen.getByText("customer")).toBeTruthy();
    expect(screen.getByText("formal")).toBeTruthy();
  });

  it('renders "Not set" for consolidation_register when the current version leaves it absent', async () => {
    const recordWithoutRegister: CaseVersionRecord = {
      title: RECORD.title,
      when_to_use: RECORD.when_to_use,
      subject: RECORD.subject,
      fallback: RECORD.fallback,
    };
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 3, state: "draft" }] }),
      [versionPath(3)]: () => jsonResponse(recordWithoutRegister),
    });

    await mountCaseAttributesTab(fetchMock);

    expect(await screen.findByText("Not set")).toBeTruthy();
  });
});

describe("CaseAttributesTab -- the draft action (criterion 3)", () => {
  it('renders only "Continue editing", navigating to that draft version\'s own route, when the current version is a draft', async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 4, state: "draft" }] }),
      [versionPath(4)]: () => jsonResponse(RECORD),
    });

    await mountCaseAttributesTab(fetchMock);

    const link = await screen.findByRole("link", { name: "Continue editing" });
    expect(link.getAttribute("href")).toBe(`/cases/${SLUG}/versions/4`);
    expect(screen.queryByText(/View released/)).toBeNull();
    expect(screen.queryByText(/New draft from/)).toBeNull();
  });
});

describe("CaseAttributesTab -- the released actions (criterion 4)", () => {
  it('renders both "View released vX" navigating to that version\'s own route, and "New draft from vX" navigating into the New Draft flow addressed by that same version\'s own number, when the current version is released', async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 6, state: "released" }] }),
      [versionPath(6)]: () => jsonResponse(RECORD),
    });

    await mountCaseAttributesTab(fetchMock);

    const viewLink = await screen.findByRole("link", { name: "View released v6" });
    expect(viewLink.getAttribute("href")).toBe(`/cases/${SLUG}/versions/6`);

    const newDraftLink = screen.getByRole("link", { name: "New draft from v6" });
    const newDraftUrl = new URL(newDraftLink.getAttribute("href") ?? "", "http://localhost");
    expect(newDraftUrl.pathname).toBe(`/cases/${SLUG}/versions/new`);
    expect(newDraftUrl.searchParams.get("sourceVersion")).toBe("6");

    expect(screen.queryByRole("link", { name: "Continue editing" })).toBeNull();
  });
});

describe("CaseAttributesTab -- the current version's own whole read is refused (criterion 5)", () => {
  it("renders an explicit, distinguishable state offering Continue editing to that same version when read-case refuses the current version's own coherence check", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 2, state: "draft" }] }),
      [versionPath(2)]: () => errorResponse("CaseNotValidError"),
    });

    await mountCaseAttributesTab(fetchMock);

    expect(
      await screen.findByText("This draft's currently declared content does not yet read back as a complete case."),
    ).toBeTruthy();
    const link = screen.getByRole("link", { name: "Continue editing" });
    expect(link.getAttribute("href")).toBe(`/cases/${SLUG}/versions/2`);
    expect(screen.queryByText("Unable to load this case's current version.")).toBeNull();
  });

  it("renders the generic load-error state, not the case-not-valid state, when the current version's own read fails for an unrelated reason", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 2, state: "draft" }] }),
      [versionPath(2)]: () => errorResponse("SomeOtherError", 500),
    });

    await mountCaseAttributesTab(fetchMock);

    expect(await screen.findByText("Unable to load this case's current version.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(
      screen.queryByText("This draft's currently declared content does not yet read back as a complete case."),
    ).toBeNull();
  });

  it("retries the current version's own read when Retry is clicked after a load failure", async () => {
    let versionShouldFail = true;
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 2, state: "draft" }] }),
      [versionPath(2)]: () =>
        versionShouldFail ? errorResponse("SomeOtherError", 500) : jsonResponse(RECORD),
    });

    await mountCaseAttributesTab(fetchMock);
    await screen.findByRole("button", { name: "Retry" });

    versionShouldFail = false;
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Handling a billing dispute")).toBeTruthy();
  });
});

describe("CaseAttributesTab -- a case holding no version (API-04, EDG-02)", () => {
  it("renders the same explicit sentence the Versions tab already established, instead of staying indefinitely loading, when the case currently holds no version", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [] }),
    });

    await mountCaseAttributesTab(fetchMock);

    expect(await screen.findByText("This case currently holds no version.")).toBeTruthy();
  });
});

describe("CaseAttributesTab -- loading and load-error over the version list itself", () => {
  it("shows a loading state before the version list arrives", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => new Promise<Response>(() => {}),
    });

    await mountCaseAttributesTab(fetchMock);

    expect(screen.getByText("Loading…")).toBeTruthy();
  });

  it("shows the generic load-error state, with a retry action, when the version list itself fails to load", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => {
        throw new Error("network down");
      },
    });

    await mountCaseAttributesTab(fetchMock);

    expect(await screen.findByText("Unable to load this case's current version.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });
});
