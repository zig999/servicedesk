import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  createFetchStub,
  jsonResponse,
  manifestPath as versionDetailPath,
  mountCaseDetailScreen,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";

const NOT_VALID_TEXT = "This case's current version does not read back as a case.";
const READ_FAILED_TEXT = "Unable to load this case's version timeline.";
const NO_VERSION_TEXT = "This case currently holds no version.";

function errorResponse(code: string, status = 422, details?: unknown): Response {
  return new Response(JSON.stringify({ error: { code, message: code, details } }), { status });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseDetailScreen's Versions panel -- a current version that does not read back as a case (criterion 1)", () => {
  it("renders the current-version statement when reading the case's only version as a case fails validation", async () => {
    const versions = [{ version: 2, state: "draft" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(2)]: () => errorResponse("CaseNotValidError"),
    });

    await mountCaseDetailScreen(fetchMock);

    expect(await screen.findByText(NOT_VALID_TEXT)).toBeTruthy();
    expect(screen.queryByText(READ_FAILED_TEXT)).toBeNull();
    expect(screen.queryByText(NO_VERSION_TEXT)).toBeNull();
  });
});

describe("CaseDetailScreen's Versions panel -- answering the case's highest-numbered version even beside a lower-numbered draft (criterion 2)", () => {
  it("renders the current-version statement for the case's highest-numbered version, never for a lower-numbered draft also on file", async () => {
    const versions = [
      { version: 3, state: "draft" },
      { version: 7, state: "released" },
    ];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(7)]: () => errorResponse("CaseNotValidError"),
    });

    await mountCaseDetailScreen(fetchMock);

    expect(await screen.findByText(NOT_VALID_TEXT)).toBeTruthy();
    const rows = await screen.findAllByRole("row");
    expect(rows).toHaveLength(3);
  });
});

describe("CaseDetailScreen's Versions panel -- still lists every version alongside the statement (criterion 9)", () => {
  it("renders the version-list table's rows unchanged alongside the current-version statement, never instead of it", async () => {
    const versions = [{ version: 1, state: "released" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(1)]: () => errorResponse("CaseNotValidError"),
    });

    await mountCaseDetailScreen(fetchMock);

    expect(await screen.findByText(NOT_VALID_TEXT)).toBeTruthy();
    const rows = await screen.findAllByRole("row");
    expect(rows).toHaveLength(2);
    expect(within(rows[1]).getByText("1")).toBeTruthy();
    expect(within(rows[1]).getByText("Released")).toBeTruthy();
  });
});

describe("CaseDetailScreen's Versions panel -- a read that fails for a reason other than failing validation (criterion 7)", () => {
  it("renders the read-did-not-complete statement, not the current-version statement, when the current version's own read fails for any other reason", async () => {
    const versions = [{ version: 4, state: "released" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(4)]: () => errorResponse("SomeOtherError", 500),
    });

    await mountCaseDetailScreen(fetchMock);

    expect(await screen.findByText(READ_FAILED_TEXT)).toBeTruthy();
    expect(screen.queryByText(NOT_VALID_TEXT)).toBeNull();
    const rows = await screen.findAllByRole("row");
    expect(rows).toHaveLength(2);
  });
});

describe("CaseDetailScreen's Versions panel -- a current version that reads back cleanly (criterion 8)", () => {
  it("renders neither statement once the case's highest-numbered version reads back as a case", async () => {
    const versions = [{ version: 5, state: "draft" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(5)]: () =>
        jsonResponse({
          title: "Some title",
          when_to_use: "When to use text",
          subject: "billing-dispute",
          fallback: { outcome: "resolved", referral: { action: "notify", recipient: "customer" } },
        }),
    });

    await mountCaseDetailScreen(fetchMock);

    await screen.findByRole("table");
    expect(screen.queryByText(NOT_VALID_TEXT)).toBeNull();
    expect(screen.queryByText(READ_FAILED_TEXT)).toBeNull();
  });
});

describe("CaseDetailScreen's Versions panel -- a case holding no version (criterion 5, criterion 6)", () => {
  it("renders only the no-version statement, neither the current-version statement nor the read-did-not-complete statement", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [] }),
    });

    await mountCaseDetailScreen(fetchMock);

    expect(await screen.findByText(NO_VERSION_TEXT)).toBeTruthy();
    expect(screen.queryByText(NOT_VALID_TEXT)).toBeNull();
    expect(screen.queryByText(READ_FAILED_TEXT)).toBeNull();
  });
});

describe("CaseDetailScreen's Versions panel -- the current version's own read still in flight (a dependency answering slowly)", () => {
  it("renders neither statement while the current version's own read has not yet completed, showing only the version list", async () => {
    const versions = [{ version: 1, state: "released" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(1)]: () => new Promise<Response>(() => {}),
    });

    await mountCaseDetailScreen(fetchMock);

    await screen.findByRole("table");
    expect(screen.queryByText(NOT_VALID_TEXT)).toBeNull();
    expect(screen.queryByText(READ_FAILED_TEXT)).toBeNull();
  });
});

describe("CaseDetailScreen's Versions panel -- no field of the unreadable version reaches the page (criterion 3)", () => {
  it("renders only the fixed statement, never a field smuggled in the failing read's own error details", async () => {
    const versions = [{ version: 9, state: "draft" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(9)]: () =>
        errorResponse("CaseNotValidError", 422, {
          title: "SECRET-TITLE",
          when_to_use: "SECRET-WHEN-TO-USE",
          subject: "SECRET-SUBJECT",
        }),
    });

    await mountCaseDetailScreen(fetchMock);

    expect(await screen.findByText(NOT_VALID_TEXT)).toBeTruthy();
    expect(screen.queryByText("SECRET-TITLE")).toBeNull();
    expect(screen.queryByText("SECRET-WHEN-TO-USE")).toBeNull();
    expect(screen.queryByText("SECRET-SUBJECT")).toBeNull();
  });
});
