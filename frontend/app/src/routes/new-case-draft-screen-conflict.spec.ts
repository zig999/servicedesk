import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import { toast } from "sonner";
import {
  apiErrorResponse,
  baseHandlers,
  CREATE_PATH,
  createFetchStub,
  fillValidForm,
  jsonResponse,
  mountNewCaseDraft,
  NEW_DRAFT_PATH,
  RELEASED_VERSION_RECORD,
  SLUG,
  versionPath,
  VERSIONS_PATH,
} from "./new-case-draft-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

describe("NewCaseDraftScreen — 409 CaseAlreadyHasDraftError", () => {
  it("shows a toast that a draft already exists for the case, and navigates to that case's existing draft version", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () =>
          apiErrorResponse("CaseAlreadyHasDraftError", 409, "a draft already exists"),
        [`GET ${VERSIONS_PATH}`]: () =>
          jsonResponse({
            data: [
              { version: 4, state: "released" },
              { version: 5, state: "draft" },
            ],
          }),

        [`GET ${versionPath(4)}`]: () => jsonResponse(RELEASED_VERSION_RECORD),
      }),
    );
    const router = await mountNewCaseDraft(fetchMock);
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(`A draft already exists for the case "${SLUG}".`);
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(`/cases/${SLUG}/versions/5`);
    });
  });

  it("stays on the New Draft screen without navigating when the version list read for the redirect names no draft", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () =>
          apiErrorResponse("CaseAlreadyHasDraftError", 409, "a draft already exists"),
        [`GET ${VERSIONS_PATH}`]: () =>
          jsonResponse({ data: [{ version: 4, state: "released" }] }),

        [`GET ${versionPath(4)}`]: () => jsonResponse(RELEASED_VERSION_RECORD),
      }),
    );
    const router = await mountNewCaseDraft(fetchMock);
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledTimes(1);
    });
    expect(router.state.location.pathname).toBe(NEW_DRAFT_PATH);
  });

  it("stays on the New Draft screen without throwing when reading the version list for the redirect itself fails", async () => {

    let versionsCallCount = 0;
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () =>
          apiErrorResponse("CaseAlreadyHasDraftError", 409, "a draft already exists"),
        [`GET ${VERSIONS_PATH}`]: () => {
          versionsCallCount += 1;
          if (versionsCallCount === 1) {
            return jsonResponse({ data: [] });
          }
          throw new Error("network down");
        },
      }),
    );
    const router = await mountNewCaseDraft(fetchMock);
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledTimes(1);
    });
    expect(router.state.location.pathname).toBe(NEW_DRAFT_PATH);
  });
});
