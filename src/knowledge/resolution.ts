import type { OutcomeName } from '../glossary/outcome';
import type { Referral } from './referral';

/**
 * Encodes `definition/knowledge/resolution`.
 *
 * What an investigation concluded and what somebody should do about it, taken
 * together: an outcome bound by identity, and a referral embedded whole.
 *
 * A resolution is declared by the case and never produced during an
 * investigation, which is why this module declares the shape and no way to
 * build one. Whoever is handed a resolution carries it; nothing here makes one.
 *
 * A resolution is a value object, so every field is read-only.
 */
export type Resolution = {
  readonly outcome: OutcomeName;
  readonly referral: Referral;
};
