import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

// sonner is the network/DOM-adjacent boundary use-new-draft-version-form.ts's
// own 409 handler calls into; mocking it here (mirroring services/
// query-client.spec.ts's own established convention) intercepts that call
// directly, so these assertions never depend on a real Toaster mounting
// anything -- NewCaseDraftScreen's own test router (below) does not mount
// AppShell/Toaster at all.
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
  SLUG,
  VERSIONS_PATH,
} from "./new-case-draft-screen.test-support";

// 409 CaseAlreadyHasDraftError coverage for task/version-editor/
// new-draft-creation's own criterion 6. Blank-form coverage lives in
// new-case-draft-screen.spec.ts and POST/switch coverage lives in
// new-case-draft-screen-save.spec.ts, split out to stay under this project's
// own max-lines rule; all three share the fixtures and mounting helpers in
// new-case-draft-screen.test-support.ts.

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
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () =>
          apiErrorResponse("CaseAlreadyHasDraftError", 409, "a draft already exists"),
        [`GET ${VERSIONS_PATH}`]: () => {
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
