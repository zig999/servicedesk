import type { ConsolidationRegister } from '../investigation/consolidation-register.js';

export type Referral = {

  readonly action: string;

  readonly recipient: string;
};

export type Resolution = {

  readonly outcome: string;
  readonly referral: Referral;
};

export type HypothesisIdentity = {
  readonly name: string;
};

export type HypothesisRevision = {
  readonly hypothesis: HypothesisIdentity;
  readonly revision: number;

  readonly criterion: string;

  readonly collects: readonly string[];
  readonly resolution: Resolution;
};

export type ManifestEntry = {
  readonly position: number;
  readonly hypothesis_revision: HypothesisRevision;
};

export const CASE_VERSION_STATES = ['draft', 'released'] as const;

export type CaseVersionState = (typeof CASE_VERSION_STATES)[number];

export type Hypothesis = {
  readonly name: string;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: Resolution;
};

export type Case = {

  readonly slug: string;
  readonly title: string;

  readonly when_to_use: string;
  readonly version: number;

  readonly authored_at: string;

  readonly subject: string;

  readonly fallback: Resolution;

  readonly consolidation_register?: ConsolidationRegister;

  readonly state: CaseVersionState;

  readonly released_at?: string;

  readonly manifest: readonly ManifestEntry[];

  readonly hypotheses: readonly Hypothesis[];
};
