import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useHypothesisRevisionForm } from "./use-hypothesis-revision-form";
import {
  baseHandlers,
  caseVersionResponse,
  createFetchStub,
  createWrapper,
  jsonResponse,
  manifestEntry,
  readyState,
  revisionsPath,
  SLUG,
  stubFetch,
  VERSION,
  VERSION_PATH,
} from "./use-hypothesis-revision-form.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const HYPOTHESES_PATH = `/v1/cases/${SLUG}/hypotheses`;

const VALID_REVISION = {
  revision: 2,
  criterion: "Some criterion",
  collects: ["ConceptA"],
  resolution: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
};

describe("the pin compared against a save's answer is the one held immediately before that save, not one re-read when the save completes", () => {
  it("still reports no manifest-builder offer for a same-revision save even though the draft's own manifest entry has since moved to a lower pin while that save was still in flight", async () => {
    let resolvePost: (response: Response) => void = () => {};
    const postPromise = new Promise<Response>((resolve) => {
      resolvePost = resolve;
    });

    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse(caseVersionResponse([manifestEntry("H1", 2)])),
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse({ data: [VALID_REVISION] }),
        [`POST ${HYPOTHESES_PATH}`]: () => postPromise,
      }),
    );
    stubFetch(fetchMock);

    const { Wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => useHypothesisRevisionForm(SLUG, VERSION, "H1"), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      readyState(result.current).onSubmit();
    });

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) => url === HYPOTHESES_PATH && init?.method === "POST",
        ),
      ).toBe(true);
    });

    queryClient.setQueryData(
      ["case-version", SLUG, VERSION],
      caseVersionResponse([manifestEntry("H1", 1)]),
    );

    await act(async () => {
      resolvePost(jsonResponse({ hypothesis_name: "H1", revision: 2 }, 201));
    });

    await waitFor(() => expect(result.current.phase).toBe("success"));
    if (result.current.phase !== "success") {
      throw new Error("expected the success phase");
    }
    expect(result.current.offerManifestBuilder).toBe(false);
  });
});
