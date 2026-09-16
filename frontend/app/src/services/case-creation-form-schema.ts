import { z } from "zod";
import { caseVersionFormSchema } from "./case-version-form-schema";

export const caseCreationFormSchema = caseVersionFormSchema.extend({
  slug: z.string().min(1),
});

export type CaseCreationFormValues = z.infer<typeof caseCreationFormSchema>;

export type RequiredCaseCreationField = {
  readonly path: string;
  readonly label: string;
};

const REQUIRED_CASE_CREATION_FIELDS: readonly RequiredCaseCreationField[] = [
  { path: "slug", label: "Slug" },
  { path: "title", label: "Title" },
  { path: "when_to_use", label: "When to use" },
  { path: "subject", label: "Subject type" },
  { path: "fallback.outcome", label: "Fallback outcome" },
  { path: "fallback.referral.action", label: "Fallback referral action" },
  { path: "fallback.referral.recipient", label: "Fallback referral recipient" },
];

export type CaseCreationRequiredValues = {
  readonly slug?: string;
  readonly title?: string;
  readonly when_to_use?: string;
  readonly subject?: string;
  readonly fallback?: {
    readonly outcome?: string;
    readonly referral?: {
      readonly action?: string;
      readonly recipient?: string;
    };
  };
};

function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim() === "";
}

function readRequiredFieldValue(
  values: CaseCreationRequiredValues,
  path: string,
): string | undefined {
  switch (path) {
    case "slug":
      return values.slug;
    case "title":
      return values.title;
    case "when_to_use":
      return values.when_to_use;
    case "subject":
      return values.subject;
    case "fallback.outcome":
      return values.fallback?.outcome;
    case "fallback.referral.action":
      return values.fallback?.referral?.action;
    case "fallback.referral.recipient":
      return values.fallback?.referral?.recipient;
    default:
      return undefined;
  }
}

export function stillAbsentRequiredFields(
  values: CaseCreationRequiredValues,
): readonly RequiredCaseCreationField[] {
  return REQUIRED_CASE_CREATION_FIELDS.filter((field) =>
    isBlank(readRequiredFieldValue(values, field.path)),
  );
}
