import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useEditDraftVersionForm, type EditDraftVersionFormState } from "./use-edit-draft-version-form";
import {
  createRouterWrapper,
  declaredAttributesPath,
  jsonResponse,
  notValidResponse,
  patchCallCount,
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
};

function get(url: string): string {
  return `GET ${url}`;
}

function draftHandlers(): Record<string, () => Response> {
  return {
    [get(versionPath())]: () => notValidResponse(),
    [get(declaredAttributesPath())]: () => jsonResponse(DRAFT_RECORD),
    [get(VERSIONS_LIST_PATH)]: () => versionsListResponse([{ version: VERSION, state: "draft" }]),
  };
}

function isEnriched(
  state: EditDraftVersionFormState,
): state is Extract<EditDraftVersionFormState, { phase: "not-valid" }> {
  return state.phase === "not-valid" && Boolean(state.form) && Boolean(state.onCancel);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "useEditDraftVersionForm -- a refused draft whose form is unchanged is not blocked (criterion 16)",
  () => {
    it("carries isBlocked: false once the draft's own record has loaded and nothing has been edited", async () => {
      stubFetch(draftHandlers());

      const { result } = renderHook(() => useEditDraftVersionForm(SLUG, VERSION), {
        wrapper: createRouterWrapper().Wrapper,
      });

      await waitFor(() => expect(isEnriched(result.current)).toBe(true));
      expect(isEnriched(result.current) && result.current.isBlocked).toBe(false);
    });
  },
);

describe(
  "useEditDraftVersionForm -- cancelling a refused draft's edit issues no update-draft and " +
    "returns the curator to the previous history entry (criteria 17, 18)",
  () => {
    it("issues no PATCH request and navigates back to the entry the editor was opened from when onCancel is invoked", async () => {
      const fetchMock = stubFetch(draftHandlers());
      const openedFrom = `/cases/${SLUG}`;
      const { Wrapper, router } = createRouterWrapper([
        openedFrom,
        `/cases/${SLUG}/versions/${VERSION}`,
      ]);

      const { result } = renderHook(() => useEditDraftVersionForm(SLUG, VERSION), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(isEnriched(result.current)).toBe(true));
      expect(patchCallCount(fetchMock)).toBe(0);

      act(() => {
        if (isEnriched(result.current)) {
          result.current.onCancel?.();
        }
      });

      expect(router.history.location.pathname).toBe(openedFrom);
      expect(patchCallCount(fetchMock)).toBe(0);
    });
  },
);

describe(
  "useEditDraftVersionForm -- the refused reading never offers release, so no release condition " +
    "is ever stated as met or unmet without having been decided (criterion 19)",
  () => {
    it("carries no release field on the not-valid phase, for a draft refused for validation or for a released version refused for validation alike", async () => {
      stubFetch(draftHandlers());
      const { result: draftResult, unmount: unmountDraft } = renderHook(
        () => useEditDraftVersionForm(SLUG, VERSION),
        { wrapper: createRouterWrapper().Wrapper },
      );
      await waitFor(() => expect(isEnriched(draftResult.current)).toBe(true));
      expect("release" in draftResult.current).toBe(false);
      unmountDraft();
      vi.unstubAllGlobals();

      stubFetch({
        [get(versionPath())]: () => notValidResponse(),
        [get(VERSIONS_LIST_PATH)]: () =>
          versionsListResponse([{ version: VERSION, state: "released" }]),
      });
      const { result: releasedResult } = renderHook(
        () => useEditDraftVersionForm(SLUG, VERSION),
        { wrapper: createRouterWrapper().Wrapper },
      );
      await waitFor(() => expect(releasedResult.current.phase).toBe("not-valid"));
      expect("release" in releasedResult.current).toBe(false);
    });
  },
);
