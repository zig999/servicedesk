import { fireEvent, screen, within } from "@testing-library/react";
import {
  apiErrorResponse,
  baseHandlers,
  createFetchStub,
  jsonResponse,
  LOADED_RECORD,
  mountCaseVersionEditor,
  SLUG,
  VERSION_PATH,
  type FetchResponder,
} from "./case-version-editor-screen.test-support";

// Shared fixtures and helpers for task/version-editor/release-draft-version's own proof,
// split across case-version-editor-screen-release-control.spec.ts,
// case-version-editor-screen-release-checklist.spec.ts and
// case-version-editor-screen-release-outcomes.spec.ts (this project's own max-lines rule).
// Builds on case-version-editor-screen.test-support.ts's own fixtures and mounting helper
// -- this task extends the very same hook and screen, never a second surface -- rather
// than duplicating the router/QueryClient wiring a second time.

export {
  apiErrorResponse,
  createFetchStub,
  jsonResponse,
  LOADED_RECORD,
  mountCaseVersionEditor,
  SLUG,
  VERSION_PATH,
};
export type { FetchResponder };

export const RELEASE_PATH = `${VERSION_PATH}/release`;
export const CONCEPTS_PATH = "/v1/glossary/concepts";

/** The one manifested hypothesis-revision the checklist's own third item reads (criterion 2). */
export const DRAFT_MANIFEST = [{ hypothesis_revision: { collects: ["late-payment"] } }];

/** A loaded version whose own state is draft and whose manifest holds one entry -- the
 * baseline every Release-control test starts from, since LOADED_RECORD itself
 * (edit-draft-version's own fixture) carries neither field (this task's own inference: a
 * record with no `state` at all is "not currently draft"). */
export const DRAFT_RECORD = {
  ...LOADED_RECORD,
  state: "draft" as const,
  manifest: DRAFT_MANIFEST,
};

export const RELEASED_RECORD = { ...LOADED_RECORD, state: "released" as const, manifest: [] };

/** A GET /v1/glossary/concepts page whose one concept accepts LOADED_RECORD's own subject
 * ("billing-dispute") and matches DRAFT_MANIFEST's own collected concept name -- the
 * checklist's third item is satisfied against this by default. */
export const CONCEPTS_ACCEPTING_SUBJECT = {
  data: [{ name: "late-payment", accepts: [LOADED_RECORD.subject] }],
};

/** baseHandlers() (edit-draft-version's own fixture set: the version GET and the three
 * glossary GETs) plus DRAFT_RECORD as the loaded version and a satisfied concepts page --
 * every Release-control test's own starting point, overridden per test as each one needs. */
export function releaseHandlers(
  overrides: Record<string, FetchResponder> = {},
): Record<string, FetchResponder> {
  return baseHandlers({
    [`GET ${VERSION_PATH}`]: () => jsonResponse(DRAFT_RECORD),
    [`GET ${CONCEPTS_PATH}`]: () => jsonResponse(CONCEPTS_ACCEPTING_SUBJECT),
    ...overrides,
  });
}

/** Consumes one entry of `responses` per call, staying on the last one once exhausted --
 * proves a checklist item is computed from a fresh re-read rather than whatever the form's
 * own initial load already held, mirroring version-manifest-screen.test-support.ts's own
 * sequentialGetHandler for the same reason. */
export function sequentialHandler(responses: readonly unknown[]): FetchResponder {
  let call = 0;
  return () => {
    const body = responses[Math.min(call, responses.length - 1)];
    call += 1;
    return jsonResponse(body);
  };
}

function callsFor(
  fetchMock: ReturnType<typeof createFetchStub>,
  method: string,
  path: string,
): unknown[] {
  return fetchMock.mock.calls.filter(([input, init]) => {
    const url = typeof input === "string" ? input : input.toString();
    return url === path && (init?.method ?? "GET").toUpperCase() === method;
  });
}

export function releaseCallCount(fetchMock: ReturnType<typeof createFetchStub>): number {
  return callsFor(fetchMock, "POST", RELEASE_PATH).length;
}

export function versionGetCallCount(fetchMock: ReturnType<typeof createFetchStub>): number {
  return callsFor(fetchMock, "GET", VERSION_PATH).length;
}

export function releasePostInit(
  fetchMock: ReturnType<typeof createFetchStub>,
): RequestInit | undefined {
  const call = fetchMock.mock.calls.find(([input, init]) => {
    const url = typeof input === "string" ? input : input.toString();
    return url === RELEASE_PATH && (init?.method ?? "GET").toUpperCase() === "POST";
  });
  return call?.[1];
}

/** Opens the Release Dialog from its own trigger, and waits for it to actually mount. */
export async function openReleaseDialog(): Promise<void> {
  const trigger = await screen.findByRole("button", { name: "Release…" });
  fireEvent.click(trigger);
  await screen.findByRole("dialog");
}

export function releaseConfirmButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Release" });
}

export function releaseCancelButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" });
}
