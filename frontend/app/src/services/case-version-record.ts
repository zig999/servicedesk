import type { CaseVersionFormValues } from "./case-version-form-schema";

export type CaseVersionManifestEntry = {
  readonly position: number;
  readonly hypothesis_revision: {
    readonly hypothesis: {
      readonly name: string;
    };
    readonly revision: number;
    readonly criterion: string;
    readonly collects: readonly string[];
  };
};

export type CaseVersionRecord = {
  readonly title: string;
  readonly when_to_use: string;
  readonly subject: string;
  readonly fallback: CaseVersionFormValues["fallback"];
  readonly consolidation_register?: CaseVersionFormValues["consolidation_register"];

  readonly state?: "draft" | "released";

  readonly manifest?: readonly CaseVersionManifestEntry[];
};
