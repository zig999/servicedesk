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
  RELEASED_VERSION_RECORD,
  SLUG,
  versionPath,
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
        // task/version-editor/seed-new-draft-from-latest-released: this list
        // now also feeds useNewDraftVersionForm's own seeding read on mount
        // (version 4 is its own latest released version), not only the 409
        // redirect's later, separate read of this same endpoint -- both
        // consumers share this fixture's version list, so this record must
        // exist for the form to ever reach "ready" and be fillable at all.
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
        // Same reason as the previous test's own added handler above: this
        // list now also feeds the seeding read on mount, not only the 409
        // redirect's later read.
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
    // This same endpoint now also feeds useNewDraftVersionForm's own seeding
    // read on mount (task/version-editor/seed-new-draft-from-latest-released),
    // which must succeed for the blank form to render and be fillable at all
    // -- only the later, separate read the 409 redirect performs is what this
    // test means to fail, so the handler answers the first call normally (no
    // released version, matching this test's own pre-existing intent of a
    // case whose seeding is irrelevant here) and only the second call throws.
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
