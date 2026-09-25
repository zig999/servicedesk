import { afterEach, describe, expect, it, vi } from "vitest";
// The first describe below mounts the version editor twice inside a single test body to walk
// it through two readings of the same version; automatic cleanup only runs between separate
// it()s, not between renders inside one, so the second mount unmounts the first render itself
// before mounting again.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup, screen, within } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import {
  baseHandlers,
  createFetchStub,
  jsonResponse,
  LOADED_RECORD,
  mountCaseVersionEditor,
  SLUG,
  VERSION_PATH,
  type FetchResponder,
} from "./case-version-editor-screen.test-support";

const NOT_VALID_BANNER_TITLE = "This version does not read back as a case";
const LOAD_ERROR_TEXT = "Unable to load this version right now.";
const NO_CONSOLIDATION_REGISTER_TEXT = "This version declares no consolidation register.";

const VERSIONS_LIST_PATH = `/v1/cases/${SLUG}/versions`;
const DECLARED_ATTRIBUTES_PATH = `${VERSION_PATH}/declared-attributes`;

function notValidResponse(): Response {
  return jsonResponse(
    { error: { code: "CaseVersionNotValidError", message: "validation failed" } },
    409,
  );
}

const DRAFT_RECORD = {
  title: "The refused draft's own title",
  when_to_use: "The refused draft's own when_to_use",
  subject: "billing-dispute",
  fallback: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
  consolidation_register: "formal" as const,
};

const RECORD_WITHOUT_REGISTER = {
  title: DRAFT_RECORD.title,
  when_to_use: DRAFT_RECORD.when_to_use,
  subject: DRAFT_RECORD.subject,
  fallback: DRAFT_RECORD.fallback,
};

// Builds the fetch stub for the "refused draft" reading: the version read is refused with
// CaseVersionNotValidError, the versions listing reports this same version as "draft" (so the
// hook enriches the not-valid state with a form), and the declared-attributes read answers
// the given record.
function enrichedNotValidHandlers(
  record: Record<string, unknown> = DRAFT_RECORD,
  overrides: Record<string, FetchResponder> = {},
): Record<string, FetchResponder> {
  return baseHandlers({
    [`GET ${VERSION_PATH}`]: notValidResponse,
    [`GET ${VERSIONS_LIST_PATH}`]: () => jsonResponse({ data: [{ version: 3, state: "draft" }] }),
    [`GET ${DECLARED_ATTRIBUTES_PATH}`]: () => jsonResponse(record),
    ...overrides,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "CaseVersionEditorScreen — a refused draft carrying an editable form states explicitly that " +
    "the version does not read back as a case, distinct from a read that did not complete, " +
    "shows no attribute left over from an earlier successful read, and states none of this once " +
    "the same version reads back cleanly (criteria 1, 2, 3, 9; UNDERDETERMINED entry 3; " +
    "rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case)",
  () => {
    it("renders the draft's own title and the explicit statement, never the load-error text or an attribute cached from an earlier successful read, and renders none of this once the same version reads back as a validated case", async () => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      queryClient.setQueryData(["case-version", SLUG, 3], {
        title: "CACHED-SECRET-TITLE",
        when_to_use: "CACHED-SECRET-WHEN-TO-USE",
        subject: "billing-dispute",
        fallback: {
          outcome: "resolved",
          referral: { action: "escalate", recipient: "supervisor" },
        },
        consolidation_register: "formal",
        state: "released",
        authored_at: "2024-01-01T00:00:00Z",
        manifest: [
          {
            position: 1,
            hypothesis_revision: {
              hypothesis: { name: "CACHED-SECRET-MANIFEST-ENTRY" },
              revision: 1,
              criterion: "CACHED-SECRET-CRITERION",
              collects: [],
            },
          },
        ],
      });
      const fetchMock = createFetchStub(enrichedNotValidHandlers());
      await mountCaseVersionEditor(fetchMock, undefined, queryClient);

      expect(await screen.findByDisplayValue(DRAFT_RECORD.title)).toBeTruthy();
      expect(await screen.findByText(NOT_VALID_BANNER_TITLE)).toBeTruthy();
      expect(screen.queryByText(LOAD_ERROR_TEXT)).toBeNull();
      expect(screen.queryByText("CACHED-SECRET-TITLE")).toBeNull();
      expect(screen.queryByText("CACHED-SECRET-WHEN-TO-USE")).toBeNull();
      expect(screen.queryByText("CACHED-SECRET-MANIFEST-ENTRY")).toBeNull();
      expect(screen.queryByRole("table")).toBeNull();
      expect(screen.queryByRole("heading", { name: "Manifest" })).toBeNull();

      cleanup();
      vi.unstubAllGlobals();

      const readyFetch = createFetchStub(baseHandlers());
      await mountCaseVersionEditor(readyFetch);
      await screen.findByDisplayValue(LOADED_RECORD.title);
      expect(screen.queryByText(NOT_VALID_BANNER_TITLE)).toBeNull();
    });
  },
);

describe(
  "CaseVersionEditorScreen — the refused draft's own enriched reading presents every declared " +
    "attribute, not merely the title (UNDERDETERMINED entry 1)",
  () => {
    it("shows when_to_use, subject, the fallback outcome and referral, and a present consolidation_register exactly as the draft's own record, alongside the title", async () => {
      const fetchMock = createFetchStub(enrichedNotValidHandlers());
      await mountCaseVersionEditor(fetchMock);

      await screen.findByDisplayValue(DRAFT_RECORD.title);
      expect(screen.getByDisplayValue(DRAFT_RECORD.when_to_use)).toBeTruthy();
      expect(screen.getByDisplayValue(DRAFT_RECORD.subject)).toBeTruthy();
      expect(screen.getByText(DRAFT_RECORD.fallback.outcome)).toBeTruthy();
      expect(screen.getByText(DRAFT_RECORD.fallback.referral.action)).toBeTruthy();
      expect(screen.getByText(DRAFT_RECORD.fallback.referral.recipient)).toBeTruthy();
      expect(screen.getByText(DRAFT_RECORD.consolidation_register)).toBeTruthy();
    });
  },
);

describe(
  "CaseVersionEditorScreen — the refused draft's own enriched reading states the absent " +
    "consolidation register (criterion 8)",
  () => {
    it("states that the version declares no consolidation register when the draft's own record answers none", async () => {
      const fetchMock = createFetchStub(enrichedNotValidHandlers(RECORD_WITHOUT_REGISTER));
      await mountCaseVersionEditor(fetchMock);

      await screen.findByDisplayValue(RECORD_WITHOUT_REGISTER.title);
      expect(await screen.findByText(NO_CONSOLIDATION_REGISTER_TEXT)).toBeTruthy();
    });
  },
);

describe(
  "CaseVersionEditorScreen — the refused draft's own enriched reading leaves its form fields " +
    "enabled (criterion 4)",
  () => {
    it("renders the title, when_to_use, subject and fallback outcome controls without a disabled attribute", async () => {
      const fetchMock = createFetchStub(enrichedNotValidHandlers());
      await mountCaseVersionEditor(fetchMock);

      const titleInput = await screen.findByDisplayValue(DRAFT_RECORD.title);
      expect(titleInput.hasAttribute("disabled")).toBe(false);
      expect(screen.getByDisplayValue(DRAFT_RECORD.when_to_use).hasAttribute("disabled")).toBe(
        false,
      );
      expect(screen.getByDisplayValue(DRAFT_RECORD.subject).hasAttribute("disabled")).toBe(false);
      expect(screen.getByLabelText("Fallback outcome").hasAttribute("disabled")).toBe(false);
    });
  },
);

describe(
  "CaseVersionEditorScreen — the refused draft's own enriched reading offers Save changes and " +
    "Cancel (criteria 5, 6)",
  () => {
    it("renders both Save changes and Cancel inside the button footer", async () => {
      const fetchMock = createFetchStub(enrichedNotValidHandlers());
      await mountCaseVersionEditor(fetchMock);

      const footer = await screen.findByRole("group", { name: "Actions" });
      expect(within(footer).getByRole("button", { name: "Save changes" })).toBeTruthy();
      expect(within(footer).getByRole("button", { name: "Cancel" })).toBeTruthy();
    });
  },
);

describe(
  "CaseVersionEditorScreen — the refused draft's own enriched reading carries a route to this " +
    "same version's manifest (criterion 7)",
  () => {
    it("renders a Manifest link targeting this same version's own manifest route", async () => {
      const fetchMock = createFetchStub(enrichedNotValidHandlers());
      await mountCaseVersionEditor(fetchMock);

      const link = await screen.findByRole("link", { name: "Manifest" });
      expect(link.getAttribute("href")).toBe(`/cases/${SLUG}/versions/3/manifest`);
    });
  },
);
