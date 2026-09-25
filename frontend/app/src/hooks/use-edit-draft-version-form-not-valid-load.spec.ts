import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEditDraftVersionForm, type EditDraftVersionFormState } from "./use-edit-draft-version-form";
import type { CaseVersionFormValues } from "../services/case-version-form-schema";
import {
  createRouterWrapper,
  declaredAttributesPath,
  jsonResponse,
  notValidResponse,
  SLUG,
  stubFetch,
  versionPath,
  versionsListResponse,
  VERSIONS_LIST_PATH,
  VERSION,
} from "./use-edit-draft-version-form-not-valid.test-support";

const DRAFT_RECORD = {
  title: "The draft's own title",
  when_to_use: "The draft's own when_to_use",
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

function currentFormValues(state: EditDraftVersionFormState): CaseVersionFormValues | undefined {
  return state.phase === "not-valid" && state.form ? state.form.getValues() : undefined;
}

function fetchWasCalledWith(fetchMock: ReturnType<typeof stubFetch>, url: string): boolean {
  return fetchMock.mock.calls.some(
    ([input]) => (typeof input === "string" ? input : input.toString()) === url,
  );
}

function get(url: string): string {
  return `GET ${url}`;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "useEditDraftVersionForm -- a draft refused by read-case with CaseVersionNotValidError is read " +
    "through read-case-version, and its own declared attributes fill the editable form " +
    "(criteria 1, 2, 3, 4, 5, 6, 7, 8; rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record)",
  () => {
    it("calls read-case-version for the named draft and populates the form with exactly the title, when_to_use, subject, fallback and consolidation_register it answers", async () => {
      const fetchMock = stubFetch({
        [get(versionPath())]: () => notValidResponse(),
        [get(declaredAttributesPath())]: () => jsonResponse(DRAFT_RECORD),
        [get(VERSIONS_LIST_PATH)]: () => versionsListResponse([{ version: VERSION, state: "draft" }]),
      });

      const { Wrapper } = createRouterWrapper();
      const { result } = renderHook(() => useEditDraftVersionForm(SLUG, VERSION), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(currentFormValues(result.current)?.title).toBe(DRAFT_RECORD.title));
      expect(currentFormValues(result.current)).toEqual(DRAFT_RECORD);
      expect(fetchWasCalledWith(fetchMock, declaredAttributesPath())).toBe(true);
    });
  },
);

describe(
  "useEditDraftVersionForm -- read-case-version answering no consolidation_register (criterion 9)",
  () => {
    it("leaves the form's consolidation_register unset when the draft's own record answers none", async () => {
      stubFetch({
        [get(versionPath())]: () => notValidResponse(),
        [get(declaredAttributesPath())]: () => jsonResponse(RECORD_WITHOUT_REGISTER),
        [get(VERSIONS_LIST_PATH)]: () => versionsListResponse([{ version: VERSION, state: "draft" }]),
      });

      const { Wrapper } = createRouterWrapper();
      const { result } = renderHook(() => useEditDraftVersionForm(SLUG, VERSION), {
        wrapper: Wrapper,
      });

      await waitFor(() =>
        expect(currentFormValues(result.current)?.title).toBe(RECORD_WITHOUT_REGISTER.title),
      );
      expect(currentFormValues(result.current)?.consolidation_register).toBeUndefined();
    });
  },
);

describe(
  "useEditDraftVersionForm -- the form is scoped to the exact named version, never another " +
    "version of the same case (criterion 10)",
  () => {
    it("shows the named version's own title even where a different version of the same case carries a different one", async () => {
      const otherVersion = 4;
      const fetchMock = stubFetch({
        [get(versionPath())]: () => notValidResponse(),
        [get(declaredAttributesPath())]: () =>
          jsonResponse({ ...DRAFT_RECORD, title: "This version's own title" }),
        [get(declaredAttributesPath(otherVersion))]: () =>
          jsonResponse({ ...DRAFT_RECORD, title: "A different version's title" }),
        [get(VERSIONS_LIST_PATH)]: () => versionsListResponse([{ version: VERSION, state: "draft" }]),
      });

      const { Wrapper } = createRouterWrapper();
      const { result } = renderHook(() => useEditDraftVersionForm(SLUG, VERSION), {
        wrapper: Wrapper,
      });

      await waitFor(() =>
        expect(currentFormValues(result.current)?.title).toBe("This version's own title"),
      );
      expect(fetchWasCalledWith(fetchMock, declaredAttributesPath(otherVersion))).toBe(false);
    });
  },
);
