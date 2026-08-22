/**
 * The pre-Release checklist and the 422 violations reader for
 * task/version-editor/release-draft-version, factored out of
 * use-edit-draft-version-form.ts so that hook's own file stays under this
 * project's own max-lines rule -- a mechanical extraction, no behavior moved
 * with it.
 */

import { ApiError } from "./api-client";
import type { GlossaryVocabularyOptions } from "../hooks/use-glossary-vocabulary";
import type { ConceptOption } from "../hooks/use-concept-options";
import type { CaseVersionRecord } from "./case-version-record";

/** One row of the pre-Release checklist (task/version-editor/release-draft-version, criterion 2). */
export type ReleaseChecklistItem = {
  readonly label: string;
  readonly satisfied: boolean;
};

/**
 * What the Release Dialog's body currently shows: the best-effort checklist
 * before a first click, or -- once a 422 CaseVersionNotReleasableError has
 * been seen -- every violation that response named, verbatim, in its place
 * (criterion 6; this task's own Notes: "a fixed three-line checklist text
 * reused for the failure path would silently invent labels the backend never
 * returned"). A discriminated union (TYP-04) rather than the checklist items
 * and a nullable violations array sitting side by side, since the two are
 * mutually exclusive views of the same one Dialog body, never shown at once.
 */
export type ReleaseDialogContent =
  | { readonly kind: "checklist"; readonly items: readonly ReleaseChecklistItem[] }
  | { readonly kind: "violations"; readonly violations: readonly string[] };

/** Everything a "ready"-phase caller needs to render the Release control and its Dialog (task/version-editor/release-draft-version). */
export type ReleaseControlState = {
  readonly version: number;
  /** True only while the loaded version's own state is draft and this session has not just released it (criterion 1). */
  readonly canRelease: boolean;
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly dialog: ReleaseDialogContent;
  readonly isConfirming: boolean;
  readonly onConfirm: () => void;
};

/**
 * The pre-Release checklist's own three items, computed client-side as
 * best-effort (intake/onda-5-scope.md's own finding #3, this task's own
 * `sources`: no dry-run endpoint exists, so this is honest about what is
 * cheap to check from data already loaded or already read elsewhere in this
 * same hook) -- never a capability-readiness item, which that same finding
 * states is undecidable client-side without reading
 * domain/integration/capability (out of this task's own scope, criterion 3).
 * Labels are the wireframe's own three phrases verbatim
 * (docs/frontend-triage-console-proposal.md §2.6, quoted in
 * intake/onda-5-scope.md) -- not a specification node's wording, this task's
 * own inference from its `sources`, disclosed in its delivery record.
 */
export function buildReleaseChecklist(params: {
  readonly record: CaseVersionRecord;
  readonly outcomeOptions: GlossaryVocabularyOptions;
  readonly actionOptions: GlossaryVocabularyOptions;
  readonly recipientOptions: GlossaryVocabularyOptions;
  readonly concepts: readonly ConceptOption[];
}): readonly ReleaseChecklistItem[] {
  const { record, outcomeOptions, actionOptions, recipientOptions, concepts } = params;
  const manifestEntries = record.manifest ?? [];

  // "Fallback resolution is set" (criterion 2): the field itself is always
  // present structurally (CaseVersionRecord.fallback is required) -- what
  // can actually go stale is one of its own three glossary-backed terms
  // having been removed since this version was authored, re-checked here
  // against the same outcome/action/recipient reads Onda 4 already performs.
  const fallbackTermsExist =
    outcomeOptions.options.some((option) => option.value === record.fallback.outcome) &&
    actionOptions.options.some((option) => option.value === record.fallback.referral.action) &&
    recipientOptions.options.some(
      (option) => option.value === record.fallback.referral.recipient,
    );

  // "Every collected concept accepts the case subject" (criterion 2,
  // rules/knowledge/a-concept-accepts-the-declared-subject-type): a concept
  // this manifest's own hypothesis-revisions no longer find in the glossary
  // is treated the same as one that does not accept the subject -- neither
  // is "satisfied", since case-terms-exist-in-the-glossary requires both.
  const conceptsAcceptSubject = manifestEntries.every((entry) =>
    entry.hypothesis_revision.collects.every((conceptName) => {
      const concept = concepts.find((candidate) => candidate.name === conceptName);
      return concept !== undefined && concept.accepts.includes(record.subject);
    }),
  );

  return [
    {
      label: `Manifest holds at least one hypothesis (${manifestEntries.length})`,
      satisfied: manifestEntries.length > 0,
    },
    { label: "Fallback resolution is set", satisfied: fallbackTermsExist },
    {
      label: "Every collected concept accepts the case subject",
      satisfied: conceptsAcceptSubject,
    },
  ];
}

/**
 * Narrows a 422 CaseVersionNotReleasableError's own `details` (ApiError's
 * own `unknown` field, api-client.ts) down to its own
 * `violations: readonly string[]` (CaseVersionNotReleasableError's own
 * context field, src/src/errors/case-version-not-releasable.error.ts)
 * through runtime checks rather than an assertion (TYP-01/TYP-02) -- an
 * empty array where the shape does not match is the same "render nothing
 * rather than guess" choice api-client.ts's own toApiError() already makes
 * for a response it cannot parse.
 */
export function extractReleaseViolations(error: unknown): readonly string[] {
  if (!(error instanceof ApiError)) {
    return [];
  }
  const { details } = error;
  if (typeof details !== "object" || details === null || !("violations" in details)) {
    return [];
  }
  const { violations } = details;
  return Array.isArray(violations)
    ? violations.filter((item): item is string => typeof item === "string")
    : [];
}
