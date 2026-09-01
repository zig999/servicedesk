import type { Citation } from './citation.js';
import type { EvaluationReason } from './evaluation-reason.js';
import type { Usage } from './usage.js';
import type { Verdict } from './verdict.js';

export type Evaluation =
  | {
      readonly hypothesis: string;
      readonly verdict: 'confirmed';
      readonly citations: readonly [Citation, ...Citation[]];
      readonly usage?: Usage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    }
  | {
      readonly hypothesis: string;
      readonly verdict: 'refuted';
      readonly citations: readonly [Citation, ...Citation[]];
      readonly usage?: Usage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    }
  | {
      readonly hypothesis: string;
      readonly verdict: Exclude<Verdict, 'confirmed' | 'refuted'>;
      readonly reason: EvaluationReason;
      readonly citations: readonly Citation[];
      readonly usage?: Usage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    };
