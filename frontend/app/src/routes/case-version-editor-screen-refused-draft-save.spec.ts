import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import { toast } from "sonner";
import {
  baseHandlers,
  createFetchStub,
  jsonResponse,
  mountCaseVersionEditor,
  parsedPatchBody,
  patchCallCount,
  SLUG,
  VERSION_PATH,
  type FetchResponder,
} from "./case-version-editor-screen.test-support";

const VERSIONS_LIST_PATH = `/v1/cases/${SLUG}/versions`;
const DECLARED_ATTRIBUTES_PATH = `${VERSION_PATH}/declared-attributes`;

const NO_CONSOLIDATION_REGISTER_TEXT = "This version declares no consolidation register.";
const NOT_VALID_BANNER_TITLE = "This version does not read back as a case";

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

// Mounts the not-valid reading enriched with a form: the version read is refused with
// CaseVersionNotValidError, the versions listing reports this same version as "draft", and the
// declared-attributes read answers DRAFT_RECORD -- the same shape
// case-version-editor-screen-refused-draft.spec.ts builds for the rendering it proves, needed
// again here because this file exercises that phase's own submit path rather than its rendering.
function notValidDraftHandlers(
  overrides: Record<string, FetchResponder> = {},
): Record<string, FetchResponder> {
  return baseHandlers({
    [`GET ${VERSION_PATH}`]: notValidResponse,
    [`GET ${VERSIONS_LIST_PATH}`]: () => jsonResponse({ data: [{ version: 3, state: "draft" }] }),
    [`GET ${DECLARED_ATTRIBUTES_PATH}`]: () => jsonResponse(DRAFT_RECORD),
    ...overrides,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

describe(
  "CaseVersionEditorScreen — submitting a correction on the refused reading issues an " +
    "update-draft carrying the edited title (criterion 1)",
  () => {
    it("sends a PATCH to this same version carrying the changed title, together with the rest of the draft's own record, when Save changes is clicked on the not-valid reading", async () => {
      const fetchMock = createFetchStub(
        notValidDraftHandlers({
          [`PATCH ${VERSION_PATH}`]: () =>
            jsonResponse({ ...DRAFT_RECORD, title: "Corrected on the refused reading" }),
        }),
      );
      await mountCaseVersionEditor(fetchMock);

      const titleInput = await screen.findByLabelText("Title");
      fireEvent.change(titleInput, { target: { value: "Corrected on the refused reading" } });
      fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => expect(patchCallCount(fetchMock)).toBe(1));
      expect(parsedPatchBody(fetchMock)).toEqual({
        title: "Corrected on the refused reading",
        when_to_use: DRAFT_RECORD.when_to_use,
        subject: DRAFT_RECORD.subject,
        fallback: DRAFT_RECORD.fallback,
        consolidation_register: DRAFT_RECORD.consolidation_register,
      });
    });
  },
);

describe(
  "CaseVersionEditorScreen — an accepted update-draft on the refused reading refills the form " +
    "from its own answer (criterion 2)",
  () => {
    it("shows the title the 200 answer carries, not the title as typed, once the update-draft accepted on the not-valid reading settles", async () => {
      const fetchMock = createFetchStub(
        notValidDraftHandlers({
          [`PATCH ${VERSION_PATH}`]: () =>
            jsonResponse({ ...DRAFT_RECORD, title: "Server-normalized correction" }),
        }),
      );
      await mountCaseVersionEditor(fetchMock);

      const titleInput = await screen.findByLabelText("Title");
      fireEvent.change(titleInput, { target: { value: "Locally typed edit" } });
      fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

      expect(await screen.findByDisplayValue("Server-normalized correction")).toBeTruthy();
    });
  },
);

describe(
  "CaseVersionEditorScreen — an accepted update-draft on the refused reading answering no " +
    "consolidation_register leaves the form holding none (criterion 3)",
  () => {
    it("states that the version declares no consolidation register once a 200 answer carrying no consolidation_register settles, though the draft held one before the submit", async () => {
      const fetchMock = createFetchStub(
        notValidDraftHandlers({
          [`PATCH ${VERSION_PATH}`]: () =>
            jsonResponse({
              title: DRAFT_RECORD.title,
              when_to_use: DRAFT_RECORD.when_to_use,
              subject: DRAFT_RECORD.subject,
              fallback: DRAFT_RECORD.fallback,
            }),
        }),
      );
      await mountCaseVersionEditor(fetchMock);

      const titleInput = await screen.findByLabelText("Title");
      fireEvent.change(titleInput, { target: { value: "Edited while register drops" } });
      fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

      expect(await screen.findByText(NO_CONSOLIDATION_REGISTER_TEXT)).toBeTruthy();
    });
  },
);

describe(
  "CaseVersionEditorScreen — an accepted update-draft on the refused reading shows no " +
    "save-failure notice (criterion 4)",
  () => {
    it("issues no toast error once a 200 answer carrying no manifest settles for an update-draft submitted on the not-valid reading", async () => {
      const fetchMock = createFetchStub(
        notValidDraftHandlers({
          [`PATCH ${VERSION_PATH}`]: () =>
            jsonResponse({ ...DRAFT_RECORD, title: "Server-answered title with no manifest" }),
        }),
      );
      await mountCaseVersionEditor(fetchMock);

      const titleInput = await screen.findByLabelText("Title");
      fireEvent.change(titleInput, {
        target: { value: "Locally typed edit before the 200 answer settles" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => expect(patchCallCount(fetchMock)).toBe(1));
      expect(await screen.findByDisplayValue("Server-answered title with no manifest")).toBeTruthy();
      expect(toast.error).not.toHaveBeenCalled();
    });
  },
);

describe(
  "CaseVersionEditorScreen — a correction on the refused reading is issued whichever validator " +
    "rule is the one failing, never only when the manifest is the empty one (UNDERDETERMINED entry 1)",
  () => {
    it("still sends the PATCH when the declared-attributes record answers a manifest holding an entry, refuting a gate keyed to a-case-has-at-least-one-hypothesis specifically", async () => {
      const recordWithHypothesis = {
        ...DRAFT_RECORD,
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
        notValidDraftHandlers({
          [`GET ${DECLARED_ATTRIBUTES_PATH}`]: () => jsonResponse(recordWithHypothesis),
          [`PATCH ${VERSION_PATH}`]: () =>
            jsonResponse({ ...DRAFT_RECORD, title: "Corrected despite a non-empty manifest" }),
        }),
      );
      await mountCaseVersionEditor(fetchMock);

      const titleInput = await screen.findByLabelText("Title");
      fireEvent.change(titleInput, { target: { value: "Corrected despite a non-empty manifest" } });
      fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => expect(patchCallCount(fetchMock)).toBe(1));
    });
  },
);

describe(
  "CaseVersionEditorScreen — an accepted correction on the refused reading refills every " +
    "declared attribute from the answer, not the title alone (UNDERDETERMINED entry 2)",
  () => {
    it("shows the when_to_use the 200 answer carries, not the value locally typed before submit, refuting an editor that keeps the form's pre-submit when_to_use", async () => {
      const fetchMock = createFetchStub(
        notValidDraftHandlers({
          [`PATCH ${VERSION_PATH}`]: () =>
            jsonResponse({ ...DRAFT_RECORD, when_to_use: "Server-corrected when_to_use" }),
        }),
      );
      await mountCaseVersionEditor(fetchMock);

      const whenToUseInput = await screen.findByLabelText("When to use");
      fireEvent.change(whenToUseInput, {
        target: { value: "Locally typed when_to_use, not the server's" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

      expect(await screen.findByDisplayValue("Server-corrected when_to_use")).toBeTruthy();
    });
  },
);

describe(
  "CaseVersionEditorScreen — the not-read-back-as-a-case statement stays after an accepted " +
    "correction over a draft whose manifest still holds no entry (UNDERDETERMINED entry 3)",
  () => {
    it("still shows the not-read-back-as-a-case banner once the update-draft settles, refuting an editor that moves to its ordinary ready state on an accepted answer alone", async () => {
      const fetchMock = createFetchStub(
        notValidDraftHandlers({
          [`PATCH ${VERSION_PATH}`]: () =>
            jsonResponse({ ...DRAFT_RECORD, title: "Corrected, manifest still empty" }),
        }),
      );
      await mountCaseVersionEditor(fetchMock);

      const titleInput = await screen.findByLabelText("Title");
      fireEvent.change(titleInput, { target: { value: "Corrected, manifest still empty" } });
      fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

      await screen.findByDisplayValue("Corrected, manifest still empty");
      expect(screen.getByText(NOT_VALID_BANNER_TITLE)).toBeTruthy();
    });
  },
);
