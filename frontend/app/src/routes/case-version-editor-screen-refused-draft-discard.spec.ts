import { afterEach, describe, expect, it, vi } from "vitest";
// The first test below mounts the version editor twice inside a single test body to walk it
// through the draft and the released readings of the same not-valid version; automatic cleanup
// only runs between separate it()s, not between renders inside one, so the second mount unmounts
// the first render itself before mounting again.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { act, cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import {
  createFetchStub,
  discardConfirmButton,
  discardHandlers,
  deleteCallCount,
  jsonResponse,
  mountForDiscard,
  noContentResponse,
  openDiscardDialog,
  SLUG,
  typeSlugConfirmation,
  VERSION_PATH,
  type FetchResponder,
} from "./case-version-editor-screen-discard.test-support";

const NOT_VALID_STATEMENT = "This case's current version does not read back as a case.";

const VERSIONS_LIST_PATH = `/v1/cases/${SLUG}/versions`;
const DECLARED_ATTRIBUTES_PATH = `${VERSION_PATH}/declared-attributes`;

function notValidResponse(): Response {
  return jsonResponse(
    { error: { code: "CaseVersionNotValidError", message: "validation failed" } },
    409,
  );
}

const DECLARED_ATTRIBUTES_RECORD = {
  title: "The refused draft's own title",
  when_to_use: "The refused draft's own when_to_use",
  subject: "billing-dispute",
  fallback: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
  consolidation_register: "formal" as const,
};

// Builds the fetch stub for the not-valid reading exercised here: the version read is refused
// with CaseVersionNotValidError, the versions listing reports this same version's own state (the
// gate the discard offer turns on), and the declared-attributes read answers a record whose
// manifest holds no entry unless an override says otherwise.
function notValidDraftHandlers(
  versionState: "draft" | "released",
  overrides: Record<string, FetchResponder> = {},
): Record<string, FetchResponder> {
  return discardHandlers({
    [`GET ${VERSION_PATH}`]: notValidResponse,
    [`GET ${VERSIONS_LIST_PATH}`]: () =>
      jsonResponse({ data: [{ version: 3, state: versionState }] }),
    [`GET ${DECLARED_ATTRIBUTES_PATH}`]: () => jsonResponse(DECLARED_ATTRIBUTES_RECORD),
    ...overrides,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "CaseVersionEditorScreen — the not-valid reading offers the Discard draft control only while " +
    "the version's own state is draft, never once it reads released (criteria 1, 2; " +
    "rules/knowledge/only-a-draft-case-version-may-be-discarded)",
  () => {
    it("renders the Discard draft control for a not-valid draft whose manifest holds no entry, and renders none once that same version's own state reads released", async () => {
      const draftFetch = createFetchStub(notValidDraftHandlers("draft"));
      await mountForDiscard(draftFetch);

      expect(await screen.findByRole("button", { name: "Discard draft" })).toBeTruthy();

      cleanup();
      vi.unstubAllGlobals();

      const releasedFetch = createFetchStub(notValidDraftHandlers("released"));
      await mountForDiscard(releasedFetch);

      await screen.findByText(NOT_VALID_STATEMENT);
      expect(screen.queryByRole("button", { name: "Discard draft" })).toBeNull();
    });
  },
);

describe(
  "CaseVersionEditorScreen — the not-valid reading's Discard offer turns on the version's own " +
    "state alone, not on the manifest's own emptiness (UNDERDETERMINED, from the specification)",
  () => {
    it("still renders the Discard draft control when the declared-attributes record answers a manifest holding an entry, refuting an editor that shows the control only when the draft's manifest is empty", async () => {
      const recordWithHypothesis = {
        ...DECLARED_ATTRIBUTES_RECORD,
        manifest: [
          {
            position: 1,
            hypothesis_revision: {
              hypothesis: { name: "Some hypothesis" },
              revision: 1,
              criterion: "some criterion",
              collects: [],
            },
          },
        ],
      };
      const fetchMock = createFetchStub(
        notValidDraftHandlers("draft", {
          [`GET ${DECLARED_ATTRIBUTES_PATH}`]: () => jsonResponse(recordWithHypothesis),
        }),
      );
      await mountForDiscard(fetchMock);

      expect(await screen.findByRole("button", { name: "Discard draft" })).toBeTruthy();
    });
  },
);

describe(
  "CaseVersionEditorScreen — asking for the discard without confirming it on the not-valid " +
    "reading (criterion 3)",
  () => {
    it("issues no DELETE when the confirm control is clicked before anything is typed", async () => {
      const fetchMock = createFetchStub(notValidDraftHandlers("draft"));
      await mountForDiscard(fetchMock);

      await openDiscardDialog();
      fireEvent.click(discardConfirmButton());

      expect(deleteCallCount(fetchMock)).toBe(0);
    });
  },
);

describe(
  "CaseVersionEditorScreen — confirming the discard on the not-valid reading only where the " +
    "typed text reproduces the case's own slug exactly (criteria 4, 5; " +
    "rules/knowledge/a-draft-case-versions-discard-reproduces-the-cases-own-slug)",
  () => {
    it("issues no DELETE for a typed value other than the exact slug, then issues exactly one DELETE against this version once the slug is typed exactly", async () => {
      const fetchMock = createFetchStub(
        notValidDraftHandlers("draft", {
          [`DELETE ${VERSION_PATH}`]: () => noContentResponse(),
        }),
      );
      await mountForDiscard(fetchMock);

      await openDiscardDialog();
      typeSlugConfirmation(`${SLUG}-not-the-slug`);
      fireEvent.click(discardConfirmButton());
      expect(deleteCallCount(fetchMock)).toBe(0);

      typeSlugConfirmation(SLUG);
      fireEvent.click(discardConfirmButton());
      await waitFor(() => expect(deleteCallCount(fetchMock)).toBe(1));
    });
  },
);

describe(
  "CaseVersionEditorScreen — a 204 answer to Discard on the not-valid reading (criterion 6)",
  () => {
    it("shows no discard-failure statement once a 204 answer settles", async () => {
      let resolveDelete: (response: Response) => void = () => {};
      const deletePromise = new Promise<Response>((resolve) => {
        resolveDelete = resolve;
      });
      const fetchMock = createFetchStub(
        notValidDraftHandlers("draft", { [`DELETE ${VERSION_PATH}`]: () => deletePromise }),
      );
      await mountForDiscard(fetchMock);

      await openDiscardDialog();
      typeSlugConfirmation(SLUG);
      fireEvent.click(discardConfirmButton());

      await act(async () => {
        resolveDelete(noContentResponse());
      });

      expect(screen.queryByRole("alert")).toBeNull();
    });
  },
);
