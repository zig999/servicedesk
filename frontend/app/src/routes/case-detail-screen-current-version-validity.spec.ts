import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import {
  createFetchStub,
  jsonResponse,
  manifestPath as versionDetailPath,
  mountCaseDetailScreen,
  SLUG,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";

const NOT_VALID_TEXT = "This case's current version does not read back as a case.";
const READ_FAILED_TEXT = "Unable to load this case's version timeline.";
const NO_VERSION_TEXT = "This case currently holds no version.";

function errorResponse(
  code: string,
  status = 422,
  details?: unknown,
  message: string = code,
): Response {
  return new Response(JSON.stringify({ error: { code, message, details } }), { status });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseDetailScreen's Versions panel -- a current version that does not read back as a case (criterion 1)", () => {
  it("renders the current-version statement when reading the case's only version as a case fails validation", async () => {
    const versions = [{ version: 2, state: "draft" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(2)]: () => errorResponse("CaseVersionNotValidError", 409),
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
      [versionDetailPath(7)]: () => errorResponse("CaseVersionNotValidError", 409),
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
      [versionDetailPath(1)]: () => errorResponse("CaseVersionNotValidError", 409),
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
    expect(screen.queryByText(NO_VERSION_TEXT)).toBeNull();
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

describe("CaseDetailScreen's Versions panel -- no attribute of the non-validating version reaches the page (criterion 3)", () => {
  it("renders only the fixed statement, never an attribute of the non-validating version smuggled in the refusal's own error details", async () => {
    const versions = [{ version: 9, state: "draft" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(9)]: () =>
        errorResponse("CaseVersionNotValidError", 409, {
          title: "SECRET-TITLE",
          when_to_use: "SECRET-WHEN-TO-USE",
          subject: "SECRET-SUBJECT",
          fallback: { outcome: "SECRET-FALLBACK-OUTCOME" },
          consolidation_register: "SECRET-CONSOLIDATION-REGISTER",
          state: "SECRET-STATE",
          manifest: ["SECRET-MANIFEST-ENTRY"],
        }),
    });

    await mountCaseDetailScreen(fetchMock);

    expect(await screen.findByText(NOT_VALID_TEXT)).toBeTruthy();
    expect(screen.queryByText("SECRET-TITLE")).toBeNull();
    expect(screen.queryByText("SECRET-WHEN-TO-USE")).toBeNull();
    expect(screen.queryByText("SECRET-SUBJECT")).toBeNull();
    expect(screen.queryByText("SECRET-FALLBACK-OUTCOME")).toBeNull();
    expect(screen.queryByText("SECRET-CONSOLIDATION-REGISTER")).toBeNull();
    expect(screen.queryByText("SECRET-STATE")).toBeNull();
    expect(screen.queryByText("SECRET-MANIFEST-ENTRY")).toBeNull();
  });
});

describe("CaseDetailScreen's Versions panel -- a refusal the mapping holds no presentation of its own for states nothing else, not even the code, the refusal's own message, or an attribute of the case or its version", () => {
  it("renders only the fixed did-not-complete statement, never the refusal's own error code, its own message, or an attribute of the case or its version, when the current version's own read fails with a code the mapping does not recognize", async () => {
    const versions = [{ version: 9, state: "draft" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(9)]: () =>
        errorResponse(
          "SomeUnrecognizedError",
          500,
          {
            title: "SECRET-TITLE",
            when_to_use: "SECRET-WHEN-TO-USE",
            subject: "SECRET-SUBJECT",
            fallback: { outcome: "SECRET-FALLBACK-OUTCOME" },
            consolidation_register: "SECRET-CONSOLIDATION-REGISTER",
            state: "SECRET-STATE",
            manifest: ["SECRET-MANIFEST-ENTRY"],
          },
          "SECRET-REFUSAL-MESSAGE",
        ),
    });

    await mountCaseDetailScreen(fetchMock);

    expect(await screen.findByText(READ_FAILED_TEXT)).toBeTruthy();
    expect(screen.queryByText(NOT_VALID_TEXT)).toBeNull();
    expect(screen.queryByText("SomeUnrecognizedError")).toBeNull();
    expect(screen.queryByText("SECRET-REFUSAL-MESSAGE")).toBeNull();
    expect(screen.queryByText("SECRET-TITLE")).toBeNull();
    expect(screen.queryByText("SECRET-WHEN-TO-USE")).toBeNull();
    expect(screen.queryByText("SECRET-SUBJECT")).toBeNull();
    expect(screen.queryByText("SECRET-FALLBACK-OUTCOME")).toBeNull();
    expect(screen.queryByText("SECRET-CONSOLIDATION-REGISTER")).toBeNull();
    expect(screen.queryByText("SECRET-STATE")).toBeNull();
    expect(screen.queryByText("SECRET-MANIFEST-ENTRY")).toBeNull();
  });
});

describe("CaseDetailScreen's Versions panel -- an earlier cached read of the same version leaves nothing behind once a later read of it fails with a code the mapping does not recognize", () => {
  it("renders only the read-did-not-complete statement, never an attribute of the case's current version carried over from an earlier successful read still sitting in cache", async () => {
    const versions = [{ version: 9, state: "draft" }];
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(["case-version", SLUG, 9], {
      title: "CACHED-TITLE",
      when_to_use: "CACHED-WHEN-TO-USE",
      subject: "billing-dispute",
    });
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(9)]: () => errorResponse("SomeUnrecognizedError", 500),
    });

    await mountCaseDetailScreen(fetchMock, undefined, queryClient);

    expect(await screen.findByText(READ_FAILED_TEXT)).toBeTruthy();
    expect(screen.queryByText(NOT_VALID_TEXT)).toBeNull();
    expect(screen.queryByText("CACHED-TITLE")).toBeNull();
    expect(screen.queryByText("CACHED-WHEN-TO-USE")).toBeNull();
  });
});
