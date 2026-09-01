import { ApiError } from "./api-client";
import type { GlossaryVocabularyOptions } from "../hooks/use-glossary-vocabulary";
import type { ConceptOption } from "../hooks/use-concept-options";
import type { CaseVersionRecord } from "./case-version-record";

export type ReleaseChecklistItem = {
  readonly label: string;
  readonly satisfied: boolean;
};

export type ReleaseDialogContent =
  | { readonly kind: "checklist"; readonly items: readonly ReleaseChecklistItem[] }
  | { readonly kind: "violations"; readonly violations: readonly string[] };

export type ReleaseControlState = {
  readonly version: number;

  readonly canRelease: boolean;
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly dialog: ReleaseDialogContent;
  readonly isConfirming: boolean;
  readonly onConfirm: () => void;
};

export function buildReleaseChecklist(params: {
  readonly record: CaseVersionRecord;
  readonly outcomeOptions: GlossaryVocabularyOptions;
  readonly actionOptions: GlossaryVocabularyOptions;
  readonly recipientOptions: GlossaryVocabularyOptions;
  readonly concepts: readonly ConceptOption[];
}): readonly ReleaseChecklistItem[] {
  const { record, outcomeOptions, actionOptions, recipientOptions, concepts } = params;
  const manifestEntries = record.manifest ?? [];

  const fallbackTermsExist =
    outcomeOptions.options.some((option) => option.value === record.fallback.outcome) &&
    actionOptions.options.some((option) => option.value === record.fallback.referral.action) &&
    recipientOptions.options.some(
      (option) => option.value === record.fallback.referral.recipient,
    );

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
