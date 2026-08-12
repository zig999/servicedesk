// The investigation aggregate as data (domain/investigation/investigation):
// one diagnosis of one subject under one pinned case, written once and
// never mutated. Every declared attribute, plus the pinned-case
// relationship the node's own relationships section names (cardinality
// exactly one, target domain/knowledge/case) — materialized here as
// `pinned_case`, carrying exactly the two pins
// rules/investigation/replay-is-pinned names for the case itself: slug and
// version, by the same two field names the case aggregate itself declares
// them by (src/case/case.ts) — never a digest over the case's content
// (task/case-and-investigation-model/investigation-record-shape narrows
// this from the three fields, including hash, an earlier delivery carried;
// a version is written once, so the pair alone names one content and no
// module needs to derive or read a digest to build an investigation). No
// node states this relationship's concrete field shape; see
// investigation-factory.ts's own delivery record for the inference behind
// choosing a nested PinnedCase over a flat, evidence.ts-style
// capability_name/capability_version pair. `written_at` is the datetime
// recording when the investigation's one write happened
// (domain/investigation/investigation's own "written_at records when the
// one write happened") — required, and never derived from the pinned case
// or the other three replay pins, which it is not one of. This module
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
 * cardinality 1, target domain/knowledge/case): exactly the slug and the
 * version rules/investigation/replay-is-pinned names for the case, by the
 * same two field names the case aggregate itself declares them by
 * (src/case/case.ts) — never the whole case, and never a digest over its
 * content, since a version is written once and the pair alone already
 * names one content without one
 * (task/case-and-investigation-model/investigation-record-shape).
 */
export type PinnedCase = {
  readonly slug: string;
  readonly version: number;
};

/**
 * One diagnosis of one subject under one pinned case
 * (domain/investigation/investigation): written once and never mutated,
 * built whole by investigation-factory.ts's own buildInvestigation and
 * nowhere else — no intermediate or partial investigation exists anywhere.
 * `pinned_case`, `model`, `prompt_version` and `evidence` are the four
 * replay pins (rules/investigation/replay-is-pinned); every other
 * attribute is the already-completed stage output the factory received
 * unchanged. `written_at` is not one of those four pins — it records when
 * the investigation's one write happened, is never set to anything next,
 * and nothing reads it to decide whether the investigation is finished
 * (domain/investigation/investigation's own description).
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
  /** When this investigation's one write happened, as an ISO-8601 instant — required, and copied straight from the given build options rather than computed by the factory (task/case-and-investigation-model/investigation-record-shape). */
  readonly written_at: string;
};
