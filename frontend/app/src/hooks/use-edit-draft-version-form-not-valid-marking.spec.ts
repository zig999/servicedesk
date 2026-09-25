import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEditDraftVersionForm } from "./use-edit-draft-version-form";
import {
  createRouterWrapper,
  declaredAttributesPath,
  jsonResponse,
  notValidResponse,
  SLUG,
  stubFetch,
  unrecognizedErrorResponse,
  versionPath,
  versionsListResponse,
  VERSIONS_LIST_PATH,
  VERSION,
} from "./use-edit-draft-version-form-not-valid.test-support";

const LOADED_RECORD = {
  title: "Original title",
  when_to_use: "Use when the case needs manual review",
  subject: "billing-dispute",
  fallback: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
};

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
  "useEditDraftVersionForm -- the not-valid phase marks a version failing validation, distinct " +
    "from the ready phase a version that reads back cleanly carries (criteria 11, 12)",
  () => {
    it('resolves to phase "not-valid" for a draft read-case refuses with CaseVersionNotValidError, and to phase "ready" carrying no such mark once read-case answers the version', async () => {
      const refusedFetch = stubFetch({
        [get(versionPath())]: () => notValidResponse(),
        [get(declaredAttributesPath())]: () => jsonResponse(LOADED_RECORD),
        [get(VERSIONS_LIST_PATH)]: () => versionsListResponse([{ version: VERSION, state: "draft" }]),
      });
      const { result: refusedResult, unmount: unmountRefused } = renderHook(
        () => useEditDraftVersionForm(SLUG, VERSION),
        { wrapper: createRouterWrapper().Wrapper },
      );
      await waitFor(() => expect(refusedResult.current.phase).toBe("not-valid"));
      expect(fetchWasCalledWith(refusedFetch, versionPath())).toBe(true);
      unmountRefused();
      vi.unstubAllGlobals();

      stubFetch({
        [get(versionPath())]: () => jsonResponse(LOADED_RECORD),
        [get(VERSIONS_LIST_PATH)]: () =>
          versionsListResponse([{ version: VERSION, state: "released" }]),
      });
      const { result: readyResult, unmount: unmountReady } = renderHook(
        () => useEditDraftVersionForm(SLUG, VERSION),
        { wrapper: createRouterWrapper().Wrapper },
      );
      await waitFor(() => expect(readyResult.current.phase).toBe("ready"));
      unmountReady();
    });
  },
);

describe(
  "useEditDraftVersionForm -- while read-case-version has not answered, the state is the bare " +
    'loading phase, offering no act (criterion 13; rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record; ' +
    "rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives; UNDERDETERMINED entry 5)",
  () => {
    it('reports exactly { phase: "loading" }, with no release, discard or update-draft offer, while read-case-version is still pending for a draft read-case refused', async () => {
      const fetchMock = stubFetch({
        [get(versionPath())]: () => notValidResponse(),
        [get(declaredAttributesPath())]: () => new Promise<Response>(() => {}),
        [get(VERSIONS_LIST_PATH)]: () => versionsListResponse([{ version: VERSION, state: "draft" }]),
      });

      const { result } = renderHook(() => useEditDraftVersionForm(SLUG, VERSION), {
        wrapper: createRouterWrapper().Wrapper,
      });

      await waitFor(() =>
        expect(fetchWasCalledWith(fetchMock, declaredAttributesPath())).toBe(true),
      );
      expect(result.current).toEqual({ phase: "loading" });
    });
  },
);

describe(
  "useEditDraftVersionForm -- a refusal of read-case-version this hook holds no presentation of " +
    "its own for is stated as a read that did not complete, disclosing neither its error code nor " +
    "its message (criterion 14; rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete; " +
    "UNDERDETERMINED entry 4)",
  () => {
    it('resolves to exactly { phase: "load-error", retryLoad }, carrying neither the refusal\'s error code nor its own message, when read-case-version fails for a draft read-case refused', async () => {
      stubFetch({
        [get(versionPath())]: () => notValidResponse(),
        [get(declaredAttributesPath())]: () => unrecognizedErrorResponse(),
        [get(VERSIONS_LIST_PATH)]: () => versionsListResponse([{ version: VERSION, state: "draft" }]),
      });

      const { result } = renderHook(() => useEditDraftVersionForm(SLUG, VERSION), {
        wrapper: createRouterWrapper().Wrapper,
      });

      await waitFor(() => expect(result.current.phase).toBe("load-error"));
      expect(Object.keys(result.current).sort()).toEqual(["phase", "retryLoad"]);
    });
  },
);

describe(
  "useEditDraftVersionForm -- a released version read-case refuses for validation carries none " +
    "of that version's declared attributes, distinguishable from a read that did not complete " +
    "(criterion 15; rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case)",
  () => {
    it("resolves to the bare not-valid phase with no other field, never reading read-case-version, for a released version, and to a distinct load-error phase when the prerequisite read instead fails to complete", async () => {
      const releasedFetch = stubFetch({
        [get(versionPath())]: () => notValidResponse(),
        [get(VERSIONS_LIST_PATH)]: () =>
          versionsListResponse([{ version: VERSION, state: "released" }]),
      });
      const { result: releasedResult, unmount: unmountReleased } = renderHook(
        () => useEditDraftVersionForm(SLUG, VERSION),
        { wrapper: createRouterWrapper().Wrapper },
      );
      await waitFor(() => expect(releasedResult.current.phase).toBe("not-valid"));
      expect(Object.keys(releasedResult.current)).toEqual(["phase"]);
      expect(fetchWasCalledWith(releasedFetch, declaredAttributesPath())).toBe(false);
      unmountReleased();
      vi.unstubAllGlobals();

      stubFetch({
        [get(versionPath())]: () => notValidResponse(),
        [get(VERSIONS_LIST_PATH)]: () => unrecognizedErrorResponse(),
      });
      const { result: failedPrerequisiteResult, unmount: unmountFailedPrerequisite } = renderHook(
        () => useEditDraftVersionForm(SLUG, VERSION),
        { wrapper: createRouterWrapper().Wrapper },
      );
      await waitFor(() => expect(failedPrerequisiteResult.current.phase).toBe("load-error"));
      unmountFailedPrerequisite();
    });
  },
);
