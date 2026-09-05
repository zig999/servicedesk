import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";
import {
  useHypothesisRevisions,
  HYPOTHESIS_REVISION_STATE_CELL,
  type HypothesisRevisionsPage,
  type HypothesisRevisionState,
} from "./use-hypothesis-revisions";

export type PinnedRevisionStateResult =
  | { readonly status: "pending" }
  | { readonly status: "failed" }
  | { readonly status: "resolved"; readonly state: HypothesisRevisionState };

const PENDING_PIN_STATE_CELL = {
  color: "bg-muted-foreground",
  label: "Still being read",
} as const;

const FAILED_PIN_STATE_CELL = {
  color: "bg-destructive",
  label: "Could not be read",
} as const;

export function pinnedRevisionStateCell(
  result: PinnedRevisionStateResult,
): { readonly color: string; readonly label: string } {
  if (result.status === "pending") {
    return PENDING_PIN_STATE_CELL;
  }
  if (result.status === "failed") {
    return FAILED_PIN_STATE_CELL;
  }
  return HYPOTHESIS_REVISION_STATE_CELL[result.state] ?? FAILED_PIN_STATE_CELL;
}

function revisionsPageAt(slug: string, hypothesisName: string, offset: number): string {
  return `/v1/cases/${encodeURIComponent(slug)}/hypotheses/${encodeURIComponent(hypothesisName)}/revisions?offset=${offset}`;
}

async function resolveOffPageState(
  slug: string,
  hypothesisName: string,
  pinnedRevision: number,
  defaultPage: HypothesisRevisionsPage,
): Promise<HypothesisRevisionState | undefined> {
  let offset = defaultPage.offset + defaultPage.limit;
  while (offset < defaultPage.total) {
    const page = await apiFetch<HypothesisRevisionsPage>(
      revisionsPageAt(slug, hypothesisName, offset),
    );
    const found = page.data.find((item) => item.revision === pinnedRevision);
    if (found !== undefined) {
      return found.state;
    }
    if (page.limit <= 0) {
      return undefined;
    }
    offset += page.limit;
  }
  return undefined;
}

export function offPageRevisionStateQueryOptions(
  slug: string,
  hypothesisName: string,
  pinnedRevision: number,
  defaultResult: UseQueryResult<HypothesisRevisionsPage>,
): {
  queryKey: readonly unknown[];
  queryFn: () => Promise<HypothesisRevisionState | undefined>;
  enabled: boolean;
} {
  const defaultPage = defaultResult.data;
  const foundOnDefaultPage = defaultPage?.data.find((item) => item.revision === pinnedRevision);
  return {
    queryKey: [
      "pinned-revision-off-page",
      slug,
      hypothesisName,
      pinnedRevision,
      defaultPage?.offset,
      defaultPage?.limit,
      defaultPage?.total,
    ],
    queryFn: () =>
      defaultPage === undefined
        ? Promise.resolve(undefined)
        : resolveOffPageState(slug, hypothesisName, pinnedRevision, defaultPage),
    enabled: defaultResult.status === "success" && foundOnDefaultPage === undefined,
  };
}

export function pinnedRevisionStateOf(
  defaultResult: UseQueryResult<HypothesisRevisionsPage>,
  offPageResult: UseQueryResult<HypothesisRevisionState | undefined>,
  pinnedRevision: number,
): PinnedRevisionStateResult {
  const foundOnDefaultPage = defaultResult.data?.data.find(
    (item) => item.revision === pinnedRevision,
  );
  if (foundOnDefaultPage !== undefined) {
    return { status: "resolved", state: foundOnDefaultPage.state };
  }
  if (defaultResult.status === "pending") {
    return { status: "pending" };
  }
  if (defaultResult.status === "error") {
    return { status: "failed" };
  }
  if (offPageResult.status === "pending") {
    return { status: "pending" };
  }
  if (offPageResult.status === "error" || offPageResult.data === undefined) {
    return { status: "failed" };
  }
  return { status: "resolved", state: offPageResult.data };
}

export function usePinnedRevisionState(
  slug: string,
  hypothesisName: string,
  pinnedRevision: number,
): PinnedRevisionStateResult {
  const defaultResult = useHypothesisRevisions(slug, hypothesisName);
  const offPageResult = useQuery(
    offPageRevisionStateQueryOptions(slug, hypothesisName, pinnedRevision, defaultResult),
  );
  return pinnedRevisionStateOf(defaultResult, offPageResult, pinnedRevision);
}
