import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  jsonResponse,
  LOADED_RECORD,
  mountCaseVersionEditor,
  SLUG,
  VERSION_PATH,
} from "./case-version-editor-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function revisionsPath(hypothesisName: string): string {
  return `/v1/cases/${SLUG}/hypotheses/${encodeURIComponent(hypothesisName)}/revisions`;
}

const MANIFEST_WITH_OFF_PAGE_PIN = [
  {
    position: 1,
    hypothesis_revision: {
      hypothesis: { name: "Delayed payment history" },
      revision: 3,
      criterion: "At least two late payments in the last 90 days",
      collects: [],
    },
  },
];

const RECORD_WITH_OFF_PAGE_PIN = {
  ...LOADED_RECORD,
  state: "released" as const,
  manifest: MANIFEST_WITH_OFF_PAGE_PIN,
};

describe("CaseVersionEditorScreen — the released-view manifest table's pinned-revision state resolved off the default page (criterion 2)", () => {
  it("states the pinned revision's own state once found on a later page of a hypothesis holding more revisions than the listing's own configured maximum page size", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(RECORD_WITH_OFF_PAGE_PIN),
        [`GET ${revisionsPath("Delayed payment history")}`]: () =>
          jsonResponse({
            data: [
              { revision: 1, state: "draft" },
              { revision: 2, state: "draft" },
            ],
            total: 3,
            offset: 0,
            limit: 2,
          }),
        [`GET ${revisionsPath("Delayed payment history")}?offset=2`]: () =>
          jsonResponse({
            data: [{ revision: 3, state: "released" }],
            total: 3,
            offset: 2,
            limit: 2,
          }),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const row = await screen.findByRole("row", { name: /Delayed payment history/ });

    expect(await within(row).findByText("Released")).toBeTruthy();
  });
});
