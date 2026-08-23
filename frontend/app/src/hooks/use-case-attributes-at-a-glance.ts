/**
 * Case Detail's third view, "Attributes at a glance"
 * (task/cases-list-and-detail/case-attributes-at-a-glance): resolves "the
 * case's current version" (criterion 2 -- the case's own draft version when
 * it holds one, otherwise its latest released version) from the same
 * list-case-versions page case-detail-timeline's own Versions tab already
 * reads (useCaseVersions, reused here rather than re-fetched -- this
 * screen's own established "must_not_duplicate" convention), then reads that
 * one version whole through read-case (GET /v1/cases/{slug}/versions/
 * {version}, contracts/knowledge/case-query) -- the same call and
 * case-version-record.ts shape use-edit-draft-version-form.ts already
 * established for the Version Editor, reused here under the identical
 * ["case-version", slug, version] query key so switching between this view
 * and the editor never re-fetches what the other one already holds.
 *
 * "The case's own draft version when it holds one, otherwise its latest
 * released version" (criterion 2) reuses rules/knowledge/a-case-summary-is-
 * derived-from-its-existing-versions's own reasoning (already covered by
 * this epic from cases-list-screen): the highest-numbered version a case
 * holds is always the most recently authored one, whichever of draft or
 * released its own state is -- so, absent a draft, the highest-numbered item
 * this same list holds is the case's own latest released version. This
 * hook's own inference (this task's own Notes, ADVISORY) additionally
 * presupposes a case holds at most one draft at a time
 * (rules/knowledge/a-case-has-at-most-one-draft) -- named in this epic's own
 * covers but outside this task's own candidate set -- for "the case's own
 * draft version" to be a well-defined singular thing to resolve at all.
 *
 * A case currently holding no version at all (a discarded-only-draft case
 * reads identically to one that never held a version --
 * scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly, which
 * this task's own Notes explicitly does not extend to close) resolves no
 * "current version" to read at all; this hook's own "no-version" phase below
 * exists only so the view degrades to case-detail-timeline's own existing
 * empty-state sentence for that same fact rather than an indefinitely
 * "loading" screen (API-04, EDG-02) -- it introduces no new wording of its
 * own for that scenario.
 *
 * Business logic lives here rather than inline in the tab's own JSX
 * (ARC-03), matching every other Case Detail tab's own convention
 * (use-case-hypotheses.ts, use-edit-draft-version-form.ts).
 */

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";
import { errorStateKind } from "./use-edit-draft-version-form";
import { useCaseVersions, type CaseVersionListItem, type CaseVersionState } from "./use-case-versions";
import type { CaseVersionRecord } from "../services/case-version-record";

export type CaseAttributesAtAGlanceState =
  | { readonly phase: "loading" }
  | { readonly phase: "no-version" }
  | { readonly phase: "load-error"; readonly retryLoad: () => void }
  | {
      /**
       * The current version's own read via read-case itself refused --
       * criterion 5's own explicit named state, distinguishable from the
       * generic "load-error" phase above (error-ui-state.ts's own new
       * "case-not-valid" kind, added by this task for exactly this
       * distinction; see that module's own header comment). `version` is
       * carried so the view can still offer "Continue editing" to it,
       * exactly the same link the draft phase below would otherwise show.
       */
      readonly phase: "case-not-valid";
      readonly version: number;
    }
  | {
      readonly phase: "ready";
      readonly version: number;
      readonly versionState: CaseVersionState;
      readonly record: CaseVersionRecord;
    };

/**
 * Finds the highest-numbered item a version list holds -- the case's own
 * latest released version once no draft is present (this file's own header
 * comment). A plain reduction rather than sorting the whole array, since
 * only the maximum is ever read.
 */
function highestNumbered(
  versions: readonly CaseVersionListItem[],
): CaseVersionListItem | undefined {
  return versions.reduce<CaseVersionListItem | undefined>(
    (latest, item) => (latest === undefined || item.version > latest.version ? item : latest),
    undefined,
  );
}

export function useCaseAttributesAtAGlance(slug: string): CaseAttributesAtAGlanceState {
  const versionsQuery = useCaseVersions(slug);
  const versions = versionsQuery.data?.data;
  const draft = versions?.find((item) => item.state === "draft");
  const current = draft ?? (versions ? highestNumbered(versions) : undefined);

  const versionQuery = useQuery({
    queryKey: ["case-version", slug, current?.version ?? null],
    queryFn: () => {
      // `enabled` below never lets this run while `current` is undefined
      // (mirrors use-edit-draft-version-form.ts's own "structurally
      // unreachable" guards for the same nullable-until-resolved shape) --
      // this is a type-level narrowing of that structural guarantee, not a
      // path this hook expects to actually take.
      if (current === undefined) {
        throw new Error("cannot read a version before one has been resolved");
      }
      return apiFetch<CaseVersionRecord>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${current.version}`,
      );
    },
    enabled: current !== undefined,
  });

  if (versionsQuery.isLoading) {
    return { phase: "loading" };
  }
  if (versionsQuery.isError) {
    return { phase: "load-error", retryLoad: () => void versionsQuery.refetch() };
  }
  if (current === undefined) {
    return { phase: "no-version" };
  }

  if (versionQuery.isError) {
    if (errorStateKind(versionQuery.error) === "case-not-valid") {
      return { phase: "case-not-valid", version: current.version };
    }
    return { phase: "load-error", retryLoad: () => void versionQuery.refetch() };
  }
  if (versionQuery.isLoading || !versionQuery.data) {
    return { phase: "loading" };
  }

  return {
    phase: "ready",
    version: current.version,
    versionState: current.state,
    record: versionQuery.data,
  };
}
