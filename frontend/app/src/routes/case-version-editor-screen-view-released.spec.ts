import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  jsonResponse,
  LOADED_RECORD,
  mountCaseVersionEditor,
  VERSION_PATH,
} from "./case-version-editor-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const RELEASED_MANIFEST = [
  {
    position: 3,
    hypothesis_revision: {
      hypothesis: { name: "Delayed payment history" },
      revision: 4,
      criterion: "At least two late payments in the last 90 days",
      collects: ["late-payment"],
    },
  },
  {
    position: 1,
    hypothesis_revision: {
      hypothesis: { name: "Disputed invoice pattern" },
      revision: 2,
      criterion: "Three or more disputes filed against the same invoice",
      collects: [],
    },
  },
];

const RELEASED_RECORD_WITH_MANIFEST = {
  ...LOADED_RECORD,
  state: "released" as const,
  manifest: RELEASED_MANIFEST,
};

describe("CaseVersionEditorScreen — a released version's own read-only render (criterion 4)", () => {
  it("renders title, when_to_use, subject, fallback outcome/referral and consolidation_register from the GET response, each disabled", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(RELEASED_RECORD_WITH_MANIFEST),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const titleInput = await screen.findByDisplayValue(LOADED_RECORD.title);
    expect(titleInput.hasAttribute("disabled")).toBe(true);

    const whenToUseInput = screen.getByDisplayValue(LOADED_RECORD.when_to_use);
    expect(whenToUseInput.hasAttribute("disabled")).toBe(true);

    const subjectInput = screen.getByDisplayValue(LOADED_RECORD.subject);
    expect(subjectInput.hasAttribute("disabled")).toBe(true);

    const outcomeTrigger = screen.getByLabelText("Fallback outcome");
    expect(outcomeTrigger.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(LOADED_RECORD.fallback.outcome)).toBeTruthy();

    const actionTrigger = screen.getByLabelText("Fallback referral (action)");
    expect(actionTrigger.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(LOADED_RECORD.fallback.referral.action)).toBeTruthy();

    const recipientTrigger = screen.getByLabelText("Fallback referral (recipient)");
    expect(recipientTrigger.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(LOADED_RECORD.fallback.referral.recipient)).toBeTruthy();

    const registerTrigger = screen.getByLabelText("Consolidation register");
    expect(registerTrigger.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(LOADED_RECORD.consolidation_register)).toBeTruthy();
  });
});

describe("CaseVersionEditorScreen — a released version's own read-only render (criterion 5)", () => {
  it("shows no Save, Release… or Discard draft control when the loaded record's own state is already released", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(RELEASED_RECORD_WITH_MANIFEST),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    await screen.findByDisplayValue(LOADED_RECORD.title);

    expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Release…" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Discard draft" })).toBeNull();
  });
});

describe("CaseVersionEditorScreen — a released version's own manifest listing (criterion 6)", () => {
  it("lists every manifest entry in the response's own order, each with its declared position, hypothesis name, revision and criterion", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(RELEASED_RECORD_WITH_MANIFEST),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");

    expect(rows).toHaveLength(3);

    const firstRow = rows[1];
    expect(within(firstRow).getByText("3")).toBeTruthy();
    expect(within(firstRow).getByText("Delayed payment history")).toBeTruthy();
    expect(within(firstRow).getByText("4")).toBeTruthy();
    expect(
      within(firstRow).getByText("At least two late payments in the last 90 days"),
    ).toBeTruthy();

    const secondRow = rows[2];
    expect(within(secondRow).getByText("1")).toBeTruthy();
    expect(within(secondRow).getByText("Disputed invoice pattern")).toBeTruthy();
    expect(within(secondRow).getByText("2")).toBeTruthy();
    expect(
      within(secondRow).getByText("Three or more disputes filed against the same invoice"),
    ).toBeTruthy();
  });

  it("renders an explicit empty-manifest sentence rather than a header-only table when the response's own manifest is empty", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse({ ...LOADED_RECORD, state: "released" as const, manifest: [] }),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    expect(
      await screen.findByText("This version's manifest holds no entry."),
    ).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
});

describe("CaseVersionEditorScreen — the manifest listing's own scope", () => {
  it("renders no Manifest section, and keeps Save present, for a draft version's own load even when its manifest already holds entries", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse({
            ...LOADED_RECORD,
            state: "draft" as const,
            manifest: RELEASED_MANIFEST,
          }),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    await screen.findByDisplayValue(LOADED_RECORD.title);
    expect(screen.queryByText("Manifest")).toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeTruthy();
  });
});
