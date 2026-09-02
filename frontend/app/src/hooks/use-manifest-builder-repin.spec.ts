import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useManifestBuilder } from "./use-manifest-builder";
import {
  AFTER_REPIN_THREE_ENTRY_MANIFEST,
  AFTER_REPIN_TWO_ENTRY_MANIFEST,
  SLUG,
  THREE_ENTRY_MANIFEST,
  TWO_ENTRY_MANIFEST,
  VERSION,
  VERSION_PATH,
  apiErrorResponse,
  createFetchStub,
  createWrapper,
  getCallCount,
  jsonResponse,
  manifestPath,
  noContentResponse,
  parsedPutBody,
  putCallCount,
  putUrl,
  readyState,
  rowFor,
  sequentialGetHandler,
  stubFetch,
} from "./use-manifest-builder.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

describe("useManifestBuilder — repinning issues one PUT to the existing place endpoint (criterion 1, onRepin's shape)", () => {
  it("issues exactly one PUT to that hypothesis's own manifest endpoint when onRepin is called", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
      [`PUT ${manifestPath("H2")}`]: () => noContentResponse(),
    });
    stubFetch(fetchMock);
    const { result } = renderHook(() => useManifestBuilder(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      rowFor(result.current, "H2").onRepin(9);
    });

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(putUrl(fetchMock)).toBe(manifestPath("H2"));
  });
});

describe("useManifestBuilder — the PUT body a repin sends (criteria 2 and 3)", () => {
  it("carries the row's own unchanged position paired with the newly chosen revision", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
      [`PUT ${manifestPath("H2")}`]: () => noContentResponse(),
    });
    stubFetch(fetchMock);
    const { result } = renderHook(() => useManifestBuilder(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(rowFor(result.current, "H2").position).toBe(2);

    act(() => {
      rowFor(result.current, "H2").onRepin(9);
    });

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual({ revision: 9, position: 2 });
  });
});

describe("useManifestBuilder — every position after a successful repin (criterion 4)", () => {
  it("reads exactly as it did before the repin for every manifest entry, once the re-read manifest arrives", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([
        THREE_ENTRY_MANIFEST,
        AFTER_REPIN_THREE_ENTRY_MANIFEST,
      ]),
      [`PUT ${manifestPath("H2")}`]: () => noContentResponse(),
    });
    stubFetch(fetchMock);
    const { result } = renderHook(() => useManifestBuilder(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      rowFor(result.current, "H2").onRepin(7);
    });

    await waitFor(() => expect(rowFor(result.current, "H2").revision).toBe(7));
    expect(readyState(result.current).rows.map((row) => row.position)).toEqual([1, 2, 3]);
  });
});

describe("useManifestBuilder — the only manifest fact that differs after a successful repin (criterion 5)", () => {
  it("changes only the repinned entry's own referenced revision, leaving every other entry's revision untouched", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([
        THREE_ENTRY_MANIFEST,
        AFTER_REPIN_THREE_ENTRY_MANIFEST,
      ]),
      [`PUT ${manifestPath("H2")}`]: () => noContentResponse(),
    });
    stubFetch(fetchMock);
    const { result } = renderHook(() => useManifestBuilder(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      rowFor(result.current, "H2").onRepin(7);
    });

    await waitFor(() => expect(rowFor(result.current, "H2").revision).toBe(7));
    expect(rowFor(result.current, "H1").revision).toBe(2);
    expect(rowFor(result.current, "H3").revision).toBe(9);
  });
});

describe("useManifestBuilder — a re-read from the server, not the mutation's own response (criterion 6)", () => {
  it("issues a second GET and shows the revision that GET answered, even though the PUT itself answered no body", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([
        TWO_ENTRY_MANIFEST,
        AFTER_REPIN_TWO_ENTRY_MANIFEST,
      ]),
      [`PUT ${manifestPath("H2")}`]: () => noContentResponse(),
    });
    stubFetch(fetchMock);
    const { result } = renderHook(() => useManifestBuilder(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      rowFor(result.current, "H2").onRepin(9);
    });

    await waitFor(() => expect(getCallCount(fetchMock)).toBe(2));
    await waitFor(() => expect(rowFor(result.current, "H2").revision).toBe(9));
  });
});

describe("useManifestBuilder — the hypothesis-revisions listing (criterion 7)", () => {
  it("does not invalidate a hypothesis-revisions query cached under a different key", async () => {
    const { Wrapper } = createWrapper();
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([
        TWO_ENTRY_MANIFEST,
        AFTER_REPIN_TWO_ENTRY_MANIFEST,
      ]),
      [`PUT ${manifestPath("H2")}`]: () => noContentResponse(),
    });
    stubFetch(fetchMock);
    const revisionsQueryFn = vi.fn().mockResolvedValue({ data: [], total: 0 });

    const { result: builderResult } = renderHook(() => useManifestBuilder(SLUG, VERSION), {
      wrapper: Wrapper,
    });
    const { result: revisionsResult } = renderHook(
      () => useQuery({ queryKey: ["hypothesis-revisions", SLUG, "H2"], queryFn: revisionsQueryFn }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(builderResult.current.phase).toBe("ready"));
    await waitFor(() => expect(revisionsResult.current.isSuccess).toBe(true));
    expect(revisionsQueryFn).toHaveBeenCalledTimes(1);

    act(() => {
      rowFor(builderResult.current, "H2").onRepin(9);
    });

    await waitFor(() => expect(getCallCount(fetchMock)).toBe(2));
    expect(revisionsQueryFn).toHaveBeenCalledTimes(1);
  });
});

describe("useManifestBuilder — a repin answered with 409 CaseVersionNotDraftError (criterion 8)", () => {
  it("sets isBlocked, the same flag the existing ConflictBanner reads", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
      [`PUT ${manifestPath("H2")}`]: () =>
        apiErrorResponse("CaseVersionNotDraftError", 409, "the version is no longer a draft"),
    });
    stubFetch(fetchMock);
    const { result } = renderHook(() => useManifestBuilder(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(readyState(result.current).isBlocked).toBe(false);

    act(() => {
      rowFor(result.current, "H2").onRepin(9);
    });

    await waitFor(() => expect(readyState(result.current).isBlocked).toBe(true));
  });
});

describe("useManifestBuilder — the shown manifest after a blocked repin attempt (criterion 9)", () => {
  it("leaves every row reading exactly as it did before the attempt, issuing no further GET", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
      [`PUT ${manifestPath("H2")}`]: () =>
        apiErrorResponse("CaseVersionNotDraftError", 409, "the version is no longer a draft"),
    });
    stubFetch(fetchMock);
    const { result } = renderHook(() => useManifestBuilder(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      rowFor(result.current, "H2").onRepin(9);
    });

    await waitFor(() => expect(readyState(result.current).isBlocked).toBe(true));
    expect(getCallCount(fetchMock)).toBe(1);
    expect(rowFor(result.current, "H2").revision).toBe(5);
    expect(rowFor(result.current, "H2").position).toBe(2);
  });
});

describe("useManifestBuilder — a repin failing for an unnamed reason (criterion 10)", () => {
  it("raises the existing generic-failure toast, the same one the move actions already raise", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
      [`PUT ${manifestPath("H2")}`]: () =>
        apiErrorResponse("SomeUnexpectedError", 500, "internal error"),
    });
    stubFetch(fetchMock);
    const { result } = renderHook(() => useManifestBuilder(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      rowFor(result.current, "H2").onRepin(9);
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Something went wrong while saving. Try again."),
    );
    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});

describe("useManifestBuilder — a repin's own failure message (criterion 11, this delivery's own copy choice)", () => {
  it("reports the failure against the row it was attempted on, worded around the revision rather than a move, leaving the other row untouched", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
      [`PUT ${manifestPath("H2")}`]: () =>
        apiErrorResponse("SomeUnexpectedError", 500, "internal error"),
    });
    stubFetch(fetchMock);
    const { result } = renderHook(() => useManifestBuilder(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      rowFor(result.current, "H2").onRepin(9);
    });

    await waitFor(() =>
      expect(rowFor(result.current, "H2").revisionErrorMessage).toBe(
        "Could not switch to that revision. Try again.",
      ),
    );
    expect(rowFor(result.current, "H1").revisionErrorMessage).toBeNull();
  });
});

describe("useManifestBuilder — the revision-error path adds to, rather than replaces, the generic toast (disclosed inference)", () => {
  it("still raises the generic-failure toast on the same failure that sets the row's own revisionErrorMessage", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
      [`PUT ${manifestPath("H2")}`]: () =>
        apiErrorResponse("SomeUnexpectedError", 500, "internal error"),
    });
    stubFetch(fetchMock);
    const { result } = renderHook(() => useManifestBuilder(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      rowFor(result.current, "H2").onRepin(9);
    });

    await waitFor(() => expect(rowFor(result.current, "H2").revisionErrorMessage).not.toBeNull());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong while saving. Try again.");
  });
});

describe("useManifestBuilder — the success telemetry a repin emits (criterion 12)", () => {
  it("emits moved: false, never reporting the entry as having moved", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([
        TWO_ENTRY_MANIFEST,
        AFTER_REPIN_TWO_ENTRY_MANIFEST,
      ]),
      [`PUT ${manifestPath("H2")}`]: () => noContentResponse(),
    });
    stubFetch(fetchMock);
    const { result } = renderHook(() => useManifestBuilder(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => {
      rowFor(result.current, "H2").onRepin(9);
    });

    await waitFor(() =>
      expect(infoSpy).toHaveBeenCalledWith("telemetry:manifest.hypothesis_placed", {
        slug: SLUG,
        version: VERSION,
        hypothesis_name: "H2",
        position: 2,
        moved: false,
      }),
    );
    infoSpy.mockRestore();
  });
});
