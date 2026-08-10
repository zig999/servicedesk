// The investigation aggregate as data (domain/investigation/investigation):
// one diagnosis of one subject under one pinned case, written once and
// never mutated. Every declared attribute, plus the pinned-case
// relationship the node's own relationships section names (cardinality
// exactly one, target domain/knowledge/case) — materialized here as
// `pinned_case`, carrying exactly the three pins
// rules/investigation/replay-is-pinned names for the case: slug, version
// and hash, by the same three field names the case aggregate itself
// declares them by (src/case/case.ts). No node states this relationship's
// concrete field shape; see investigation-factory.ts's own delivery record
// for the inference behind choosing a nested PinnedCase over a flat,
// evidence.ts-style capability_name/capability_version pair. This module
// states the shape only, no behavior — the one factory that can build a
// valid value is investigation-factory.ts — importing nothing but this
// context's own sibling plain-data types
// (constraints/the-domain-depends-on-no-infrastructure).

import type { Assessment } from './assessment.js';
import type { Cost } from './cost.js';
import type { Durations } from './durations.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';
import type { Subject } from './subject.js';

/**
 * The pinned-case relationship, materialized
 * (domain/investigation/investigation's own `pinned-case` relationship,
 * cardinality 1, target domain/knowledge/case): exactly the three pins
 * rules/investigation/replay-is-pinned names for the case, by the same
 * field names the case aggregate itself declares them by
 * (src/case/case.ts) — never the whole case, since only these three
 * identify it for replay.
 */
export type PinnedCase = {
  readonly slug: string;
  readonly version: number;
  readonly hash: string;
};

/**
 * One diagnosis of one subject under one pinned case
 * (domain/investigation/investigation): written once and never mutated,
 * built whole by investigation-factory.ts's own buildInvestigation and
 * nowhere else — no intermediate or partial investigation exists anywhere.
 * `pinned_case`, `model`, `prompt_version` and `evidence` are the four
 * replay pins (rules/investigation/replay-is-pinned); every other
 * attribute is the already-completed stage output the factory received
 * unchanged.
 */
export type Investigation = {
  readonly id: string;
  readonly requester: string;
  readonly ticket_ref: string;
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
};
