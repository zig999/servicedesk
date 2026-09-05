import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import { toast } from "sonner";
import {
  emptyManifest,
  jsonResponse,
  manifestPath,
  manifestPinning,
  mountHypothesisRevisionHistory,
  revisionsPath,
  SLUG,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

const HYPOTHESIS_NAME = "H1";
const TARGET_VERSION = 9;

type FetchResponder = () => Response | Promise<Response>;
type ReleaseFetchMock = Mock<(input: string | URL | Request, init?: RequestInit) => Promise<Response>>;

function createReleaseFetchStub(handlers: Record<string, FetchResponder>): ReleaseFetchMock {
  return vi.fn(async (input: string | URL | Request, _init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(
        `hypothesis-revision-history-release-action.spec.ts: no mocked response registered for ${url}`,
      );
    }
    return handler();
  });
}

function releasePath(hypothesisName: string, revision: number): string {
  return `${revisionsPath(hypothesisName)}/${revision}/release`;
}

function apiErrorResponse(code: string, message: string, status = 409): Response {
  return jsonResponse({ error: { code, message } }, status);
}

function revisionItem(
  revision: number,
  state: "draft" | "released",
): Record<string, unknown> {
  return {
    revision,
    criterion: `Criterion ${revision}`,
    collects: ["ConceptA"],
    resolution: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
    state,
  };
}

function findRow(rows: readonly HTMLElement[], revision: number): HTMLElement {
  const match = rows.find((row) => within(row).queryByText(String(revision)) !== null);
  if (!match) {
    throw new Error(
      `hypothesis-revision-history-release-action.spec.ts: no row found for revision ${revision}`,
    );
  }
  return match;
}

function callsTo(
  fetchMock: ReleaseFetchMock,
  url: string,
): readonly [string | URL | Request, RequestInit?][] {
  return fetchMock.mock.calls.filter(
    ([input]) => (typeof input === "string" ? input : input.toString()) === url,
  );
}

async function mount(
  revisions: readonly Record<string, unknown>[],
  overrides: Record<string, FetchResponder> = {},
  pinnedRevision: number | null = null,
): Promise<ReleaseFetchMock> {
  const fetchMock = createReleaseFetchStub({
    [revisionsPath(HYPOTHESIS_NAME)]: () =>
      jsonResponse({ data: revisions, total: revisions.length }),
    [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: TARGET_VERSION, state: "released" }] }),
    [manifestPath(TARGET_VERSION)]: () =>
      jsonResponse(
        pinnedRevision === null
          ? emptyManifest()
          : manifestPinning(HYPOTHESIS_NAME, pinnedRevision),
      ),
    ...overrides,
  });
  await mountHypothesisRevisionHistory(fetchMock, {
    slug: SLUG,
    hypothesisName: HYPOTHESIS_NAME,
    onBack: vi.fn(),
  });
  return fetchMock;
}

async function openAndConfirmRelease(rows: readonly HTMLElement[], revision: number): Promise<void> {
  const row = findRow(rows, revision);
  fireEvent.click(within(row).getByRole("button", { name: "Release…" }));
  await screen.findByRole("dialog");
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Release" }));
}

describe("HypothesisRevisionHistory -- releasing a revision directly (criterion 1)", () => {
  it("offers a release control on the row of a revision whose own state is draft", async () => {
    await mount([revisionItem(2, "draft"), revisionItem(1, "released")]);
    const rows = await screen.findAllByRole("row");
    expect(within(findRow(rows, 2)).getByRole("button", { name: "Release…" })).toBeTruthy();
  });
});

describe("HypothesisRevisionHistory -- releasing a revision directly (criterion 2)", () => {
  it("offers no release control on the row of a revision whose own state is released", async () => {
    await mount([revisionItem(2, "draft"), revisionItem(1, "released")]);
    const rows = await screen.findAllByRole("row");
    expect(within(findRow(rows, 1)).queryByRole("button", { name: "Release…" })).toBeNull();
  });
});

describe("HypothesisRevisionHistory -- releasing a revision directly (criterion 3)", () => {
  it("issues exactly one POST to the release endpoint for the row's own revision number when the control is confirmed", async () => {
    const fetchMock = await mount([revisionItem(4, "draft")], {
      [releasePath(HYPOTHESIS_NAME, 4)]: () => new Response(null, { status: 204 }),
    });
    const rows = await screen.findAllByRole("row");
    await openAndConfirmRelease(rows, 4);

    await waitFor(() => {
      expect(callsTo(fetchMock, releasePath(HYPOTHESIS_NAME, 4))).toHaveLength(1);
    });
  });
});

describe("HypothesisRevisionHistory -- releasing a revision directly (criterion 4)", () => {
  it("sends the release request with no body, no headers and no other case version or manifest data", async () => {
    const fetchMock = await mount([revisionItem(4, "draft")], {
      [releasePath(HYPOTHESIS_NAME, 4)]: () => new Response(null, { status: 204 }),
    });
    const rows = await screen.findAllByRole("row");
    await openAndConfirmRelease(rows, 4);

    await waitFor(() => {
      expect(callsTo(fetchMock, releasePath(HYPOTHESIS_NAME, 4))).toHaveLength(1);
    });
    const [, init] = callsTo(fetchMock, releasePath(HYPOTHESIS_NAME, 4))[0];
    expect(init?.method).toBe("POST");
    expect(init?.body).toBeUndefined();
    expect(init?.headers).toBeUndefined();
  });
});

describe("HypothesisRevisionHistory -- releasing a revision directly (criterion 5)", () => {
  it("shows the released revision's row as released, without re-reading the listing, after the release succeeds", async () => {
    const fetchMock = await mount([revisionItem(4, "draft")], {
      [releasePath(HYPOTHESIS_NAME, 4)]: () => new Response(null, { status: 204 }),
    });
    const rows = await screen.findAllByRole("row");
    expect(callsTo(fetchMock, revisionsPath(HYPOTHESIS_NAME))).toHaveLength(1);

    await openAndConfirmRelease(rows, 4);

    await waitFor(() => {
      expect(
        within(findRow(screen.getAllByRole("row"), 4)).getByText("Released"),
      ).toBeTruthy();
    });
    expect(callsTo(fetchMock, revisionsPath(HYPOTHESIS_NAME))).toHaveLength(1);
  });
});

describe("HypothesisRevisionHistory -- releasing a revision directly (criterion 6)", () => {
  it("offers the release control to an unmanifested draft revision on the same terms as one the manifest pins", async () => {
    await mount([revisionItem(2, "draft"), revisionItem(5, "draft")], {}, 2);
    const rows = await screen.findAllByRole("row");
    expect(within(findRow(rows, 2)).getByRole("button", { name: "Release…" })).toBeTruthy();
    expect(within(findRow(rows, 5)).getByRole("button", { name: "Release…" })).toBeTruthy();
  });
});

describe("HypothesisRevisionHistory -- releasing a revision directly (criterion 7)", () => {
  it("leaves every case version's own state unread and unrefetched after a release succeeds", async () => {
    const fetchMock = await mount([revisionItem(4, "draft")], {
      [releasePath(HYPOTHESIS_NAME, 4)]: () => new Response(null, { status: 204 }),
    });
    const rows = await screen.findAllByRole("row");
    expect(callsTo(fetchMock, VERSIONS_PATH)).toHaveLength(1);
    expect(callsTo(fetchMock, manifestPath(TARGET_VERSION))).toHaveLength(1);

    await openAndConfirmRelease(rows, 4);

    await waitFor(() => {
      expect(
        within(findRow(screen.getAllByRole("row"), 4)).getByText("Released"),
      ).toBeTruthy();
    });
    expect(callsTo(fetchMock, VERSIONS_PATH)).toHaveLength(1);
    expect(callsTo(fetchMock, manifestPath(TARGET_VERSION))).toHaveLength(1);
  });
});

describe("HypothesisRevisionHistory -- releasing a revision directly (criterion 8)", () => {
  it("re-reads the listing from the server, rather than leaving the pre-attempt row, when the release is refused because the revision is no longer draft", async () => {
    let revisionsCallCount = 0;
    await mount([], {
      [revisionsPath(HYPOTHESIS_NAME)]: () => {
        revisionsCallCount += 1;
        return jsonResponse({
          data: [revisionItem(4, revisionsCallCount === 1 ? "draft" : "released")],
          total: 1,
        });
      },
      [releasePath(HYPOTHESIS_NAME, 4)]: () =>
        apiErrorResponse(
          "HypothesisRevisionNotDraftAtReleaseError",
          "This revision is no longer in draft, so it cannot be released again.",
        ),
    });
    const rows = await screen.findAllByRole("row");
    expect(within(findRow(rows, 4)).getByText("Draft")).toBeTruthy();

    await openAndConfirmRelease(rows, 4);

    await waitFor(() => {
      expect(
        within(findRow(screen.getAllByRole("row"), 4)).getByText("Released"),
      ).toBeTruthy();
    });
    expect(revisionsCallCount).toBe(2);
  });
});

describe("HypothesisRevisionHistory -- releasing a revision directly (criterion 9)", () => {
  it("tells the curator exactly the refusal's own condition and message, and nothing else, after that refusal", async () => {
    const MESSAGE = "This revision is no longer in draft, so it cannot be released again.";
    await mount([revisionItem(4, "draft")], {
      [releasePath(HYPOTHESIS_NAME, 4)]: () =>
        apiErrorResponse("HypothesisRevisionNotDraftAtReleaseError", MESSAGE),
    });
    const rows = await screen.findAllByRole("row");

    await openAndConfirmRelease(rows, 4);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(MESSAGE);
    });
    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});

describe("HypothesisRevisionHistory -- release confirmation copy", () => {
  it("names the row's own revision number and warns that the content can never change again", async () => {
    await mount([revisionItem(4, "draft")]);
    const rows = await screen.findAllByRole("row");
    fireEvent.click(within(findRow(rows, 4)).getByRole("button", { name: "Release…" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Release revision 4?")).toBeTruthy();
    expect(
      within(dialog).getByText(
        "Once released, this revision's own content can never change again.",
      ),
    ).toBeTruthy();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(within(dialog).getByRole("button", { name: "Release" })).toBeTruthy();
  });
});

describe("HypothesisRevisionHistory -- release control composition", () => {
  it("composes the release control beside the existing Revise link in the same actions cell, adding no new column", async () => {
    await mount([revisionItem(2, "draft")], {}, 2);
    const rows = await screen.findAllByRole("row");
    const headers = screen.getAllByRole("columnheader").map((header) => header.textContent);
    expect(headers).toEqual(["Revision", "State", "Status", "Criterion", "Collects", "Actions"]);

    const row = findRow(rows, 2);
    expect(within(row).getByRole("link", { name: "Revise →" })).toBeTruthy();
    expect(within(row).getByRole("button", { name: "Release…" })).toBeTruthy();
  });
});

describe("HypothesisRevisionHistory -- a release refused by any other error", () => {
  it("leaves the dialog open and shows only a generic failure message, without disturbing the listing", async () => {
    const fetchMock = await mount([revisionItem(4, "draft")], {
      [releasePath(HYPOTHESIS_NAME, 4)]: () =>
        apiErrorResponse("SomeOtherUnmappedError", "backend exploded", 500),
    });
    const rows = await screen.findAllByRole("row");

    await openAndConfirmRelease(rows, 4);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong while releasing. Try again.");
    });
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(callsTo(fetchMock, revisionsPath(HYPOTHESIS_NAME))).toHaveLength(1);
  });
});

describe("HypothesisRevisionHistory -- releasing one revision leaves a sibling revision alone", () => {
  it("updates only the released revision's own row, leaving a sibling draft revision's row and control unaffected", async () => {
    await mount([revisionItem(4, "draft"), revisionItem(7, "draft")], {
      [releasePath(HYPOTHESIS_NAME, 4)]: () => new Response(null, { status: 204 }),
    });
    const rows = await screen.findAllByRole("row");

    await openAndConfirmRelease(rows, 4);

    await waitFor(() => {
      expect(
        within(findRow(screen.getAllByRole("row"), 4)).getByText("Released"),
      ).toBeTruthy();
    });
    const finalRows = screen.getAllByRole("row");
    expect(within(findRow(finalRows, 7)).getByText("Draft")).toBeTruthy();
    expect(
      within(findRow(finalRows, 7)).getByRole("button", { name: "Release…" }),
    ).toBeTruthy();
  });
});
