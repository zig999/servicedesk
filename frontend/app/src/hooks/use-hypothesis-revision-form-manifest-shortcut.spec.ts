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

describe("useHypothesisRevisionForm — the always-visible manifest shortcut adds no request of its own (criterion 4)", () => {
  it("carries a callable onOpenManifest in the ready phase while the request set stays exactly the reads the screen already issues", async () => {
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

    expect(typeof readyState(result.current).onOpenManifest).toBe("function");
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
