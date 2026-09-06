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

export const DRAFT_MANIFEST_HYPOTHESIS_NAME = "late-payment-hypothesis";
export const DRAFT_MANIFEST_REVISION = 1;

export const DRAFT_MANIFEST = [
  {
    position: 1,
    hypothesis_revision: {
      hypothesis: { name: DRAFT_MANIFEST_HYPOTHESIS_NAME },
      revision: DRAFT_MANIFEST_REVISION,
      criterion: "At least one late payment in the last 90 days",
      collects: ["late-payment"],
    },
  },
];

export const DRAFT_RECORD = {
  ...LOADED_RECORD,
  state: "draft" as const,
  manifest: DRAFT_MANIFEST,
};

export const RELEASED_RECORD = { ...LOADED_RECORD, state: "released" as const, manifest: [] };

export const CONCEPTS_ACCEPTING_SUBJECT = {
  data: [{ name: "late-payment", accepts: [LOADED_RECORD.subject] }],
};

export function hypothesisRevisionsPath(hypothesisName: string): string {
  return `/v1/cases/${SLUG}/hypotheses/${hypothesisName}/revisions`;
}

export function hypothesisRevisionsPage(state: "draft" | "released"): {
  readonly data: readonly unknown[];
  readonly total: number;
  readonly offset: number;
  readonly limit: number;
} {
  return {
    data: [
      {
        revision: DRAFT_MANIFEST_REVISION,
        criterion: "At least one late payment in the last 90 days",
        collects: ["late-payment"],
        resolution: {
          outcome: "resolved",
          referral: { action: "escalate", recipient: "supervisor" },
        },
        state,
      },
    ],
    total: 1,
    offset: 0,
    limit: 20,
  };
}

export function releaseHandlers(
  overrides: Record<string, FetchResponder> = {},
): Record<string, FetchResponder> {
  return baseHandlers({
    [`GET ${VERSION_PATH}`]: () => jsonResponse(DRAFT_RECORD),
    [`GET ${CONCEPTS_PATH}`]: () => jsonResponse(CONCEPTS_ACCEPTING_SUBJECT),
    [`GET ${hypothesisRevisionsPath(DRAFT_MANIFEST_HYPOTHESIS_NAME)}`]: () =>
      jsonResponse(hypothesisRevisionsPage("released")),
    ...overrides,
  });
}

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
