import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useHypothesisRevisionForm } from "./use-hypothesis-revision-form";
import {
  baseHandlers,
  caseVersionResponse,
  createFetchStub,
  createWrapper,
  getCallCountFor,
  jsonResponse,
  manifestEntry,
  readyState,
  requestedGetUrls,
  revisionsPage,
  revisionsPath,
  SLUG,
  stubFetch,
  VERSION,
  VERSION_PATH,
} from "./use-hypothesis-revision-form.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useHypothesisRevisionForm — the draft's pinned revision for the hypothesis being revised (criterion 1)", () => {
  it("reports the revision number the draft's own manifest entry pins for that hypothesis", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse(caseVersionResponse([manifestEntry("H1", 2), manifestEntry("H2", 5)])),
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1])),
      }),
    );
    stubFetch(fetchMock);

    const { result } = renderHook(() => useHypothesisRevisionForm(SLUG, VERSION, "H1"), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    expect(readyState(result.current).pinnedRevision).toBe(2);
  });
});

describe("useHypothesisRevisionForm — no manifest entry for the hypothesis being revised (criterion 2)", () => {
  it("reports null rather than a number when the manifest holds entries for other hypotheses only", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse(caseVersionResponse([manifestEntry("H9", 3)])),
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1])),
      }),
    );
    stubFetch(fetchMock);

    const { result } = renderHook(() => useHypothesisRevisionForm(SLUG, VERSION, "H1"), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    expect(readyState(result.current).pinnedRevision).toBeNull();
  });

  it("also reports null when the draft's manifest holds no entries at all", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(caseVersionResponse([])),
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1])),
      }),
    );
    stubFetch(fetchMock);

    const { result } = renderHook(() => useHypothesisRevisionForm(SLUG, VERSION, "H1"), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    expect(readyState(result.current).pinnedRevision).toBeNull();
  });
});

describe("useHypothesisRevisionForm — a hypothesis identity that does not exist yet (criterion 3)", () => {
  it("reports no pinned revision when opened for a hypothesis not yet created", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse(caseVersionResponse([manifestEntry("H1", 2)])),
      }),
    );
    stubFetch(fetchMock);

    const { result } = renderHook(() => useHypothesisRevisionForm(SLUG, VERSION, null), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    expect(readyState(result.current).pinnedRevision).toBeNull();
  });
});

describe("useHypothesisRevisionForm — a pin the answered revisions page does not carry (criterion 4)", () => {
  it("still reports the manifest's own pinned number even though the paged revisions list never carries it", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse(caseVersionResponse([manifestEntry("H1", 9)])),
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2, 3])),
      }),
    );
    stubFetch(fetchMock);

    const { result } = renderHook(() => useHypothesisRevisionForm(SLUG, VERSION, "H1"), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    expect(readyState(result.current).pinnedRevision).toBe(9);
  });
});

describe("useHypothesisRevisionForm — no path beyond what opening the screen already requested (criterion 5)", () => {
  it("computes the pinned revision from the same request set the screen already issues, requesting nothing further", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse(caseVersionResponse([manifestEntry("H1", 3)])),
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1])),
      }),
    );
    stubFetch(fetchMock);

    const { result } = renderHook(() => useHypothesisRevisionForm(SLUG, VERSION, "H1"), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    expect(readyState(result.current).pinnedRevision).toBe(3);
    expect([...requestedGetUrls(fetchMock)].sort()).toEqual(
      [
        VERSION_PATH,
        revisionsPath("H1"),
        "/v1/glossary/concepts",
        "/v1/glossary/outcome",
        "/v1/glossary/action",
        "/v1/glossary/recipient",
      ].sort(),
    );
    expect(getCallCountFor(fetchMock, VERSION_PATH)).toBe(1);
  });
});

describe("useHypothesisRevisionForm — the case-version read failing (criterion 6)", () => {
  it("reports the load-error phase, carrying no pinned revision, rather than any state carrying one", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => {
          throw new Error("network down");
        },
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1])),
      }),
    );
    stubFetch(fetchMock);

    const { result } = renderHook(() => useHypothesisRevisionForm(SLUG, VERSION, "H1"), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("load-error"));

    expect(result.current).not.toHaveProperty("pinnedRevision");
  });
});
