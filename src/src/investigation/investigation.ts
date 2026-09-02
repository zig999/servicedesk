import type { Assessment } from './assessment.js';
import type { Cost } from './cost.js';
import type { Durations } from './durations.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';
import type { Subject } from './subject.js';

export type PinnedCase = {
  readonly slug: string;
  readonly version: number;
};

export type Investigation = {
  readonly id: string;
  readonly requester: string;

  readonly ticket_ref?: string;
  readonly narrative: string;
  readonly subject: Subject;
  readonly pinned_case: PinnedCase;
  readonly prompt_version: string;
  readonly model: string;
  readonly evidence: readonly Evidence[];
  readonly evaluations: readonly Evaluation[];
  readonly assessment: Assessment;
  readonly cost: Cost;
  readonly durations: Durations;

  readonly written_at?: string;
};
