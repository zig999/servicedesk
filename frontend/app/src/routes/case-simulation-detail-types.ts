/**
 * Domain types the case-simulation Detail region renders
 * (task/simulation-cockpit/detail-panel): a hypothesis's own verdict,
 * citations and criterion text, its collected evidence, and its judgment
 * metadata -- narrowed from domain/investigation/evaluation,
 * domain/investigation/citation, domain/investigation/verdict,
 * domain/investigation/evidence, domain/investigation/evidence-result,
 * domain/investigation/evaluation-reason, domain/investigation/usage,
 * domain/integration/capability and domain/knowledge/hypothesis-revision to
 * exactly what this region's own criteria read.
 *
 * This module is fixture/props-driven on purpose (this task's own Notes):
 * task/simulation-cockpit/use-simulate-case and
 * task/simulation-cockpit/use-simulate-hypothesis are separate, sibling
 * tasks not yet delivered, so nothing here reads a query or a mutation --
 * every value is a prop a caller (eventually
 * task/simulation-cockpit/screen-assembly, once the two mutation hooks
 * exist) already holds from a completed simulation run.
 */

/** domain/investigation/verdict's own three values. */
export type SimulationVerdict = "confirmed" | "refuted" | "inconclusive";

/** domain/investigation/evidence-result's own four values. */
export type SimulationEvidenceResult = "ok" | "unavailable" | "denied" | "timeout";

/**
 * domain/investigation/citation: one concept and one field of the evidence
 * that grounded a verdict.
 */
export type SimulationCitation = {
  readonly concept: string;
  readonly field: string;
};

/** domain/investigation/usage: what one judgment call spent. */
export type SimulationUsage = {
  readonly inputTokens: number;
  readonly outputTokens: number;
};

/**
 * domain/investigation/evidence: one collected concept's own result.
 * `observation` is carried exactly as the record holds it (a string); this
 * region formats it for display rather than this type reshaping it.
 * `capabilityName` and `capabilityVersion` are domain/integration/
 * capability's own identity (name, version), read through the reference
 * domain/investigation/evidence carries -- flat fields, camelCase-normalized
 * the same way this type already normalizes `result_detail`/`elapsed_ms`
 * into `resultDetail`/`elapsedMs`, since both wire responses
 * (src/src/http/dto/simulate-case.dto.ts's and simulate-hypothesis.dto.ts's
 * own evidenceSchema) carry them as two flat fields,
 * `capability_name`/`capability_version`, never nested under a `capability`
 * object. `connector` is that same reference's own `connector` attribute,
 * read through evidence's own `origin` field (this task's own Notes: the
 * connector this evidence item came through is not a second fact modeled on
 * evidence itself, it is read through this same capability reference) --
 * also flattened onto the item directly rather than nested, for the same
 * reason. Corrected by flatten-detail-evidence-capability-reference, a
 * corrective increment: this type previously nested all three under a
 * `capability: { name, version, connector }` object that toDetailEvidence
 * (case-simulation-cockpit-adapters.ts) built from a wire shape
 * (use-simulate-case.ts's own SimulateEvidenceItem) that never actually
 * carried a nested `capability` object either -- crashing this region at
 * render time on a real response.
 */
/** One field's own snapshotted semantics (domain/investigation/field-semantics), camelCased for this region's own render types. */
export type SimulationFieldSemantics = {
  readonly name: string;
  readonly type?: string;
  readonly description?: string;
};

export type SimulationEvidenceItem = {
  readonly concept: string;
  readonly result: SimulationEvidenceResult;
  readonly resultDetail?: string;
  readonly elapsedMs: number;
  readonly observation: string;
  readonly capabilityName: string;
  readonly capabilityVersion: string;
  readonly connector: string;
  /**
   * domain/investigation/evidence's own snapshotted semantics
   * (task/simulation-evidence-snapshot/evidence-snapshot-wire-types's own
   * criterion 4), read at this render type's own read site: optional
   * because a wire record collected before this snapshot existed carries
   * neither field at all, and that absence reads the identical honest-empty
   * way the node's own text already states for a legacy concept or an
   * unresolved capability -- no fields at all, an empty concept_description
   * -- never a read failure and never an invented semantics. A present but
   * empty array/string (a concept snapshotted with no description, or a
   * capability that never resolved) reads the same honest-empty way too;
   * nothing here distinguishes "wire omitted the key" from "wire sent an
   * empty value" because the node itself does not.
   */
  readonly fields?: readonly SimulationFieldSemantics[];
  /** See `fields` above. */
  readonly conceptDescription?: string;
};

/**
 * domain/investigation/evaluation's own description: "Usage, elapsed_ms and
 * prompt are the call's own record ... present exactly when a call
 * happened, absent when reason no-data means judgment was never called at
 * all." Modeled as a discriminated union (TYP-04) rather than three
 * independent optional fields, since the domain text itself states they
 * co-occur or are co-absent together -- no combination where only one or
 * two of them are present is a shape this region has to guard against
 * separately. `model` and `promptVersion` (domain/investigation/
 * investigation's own fields, carried once per simulation run rather than
 * per evaluation) join the same branch for the same reason: they too are
 * part of "the call's own record" and are never available without it.
 */
export type SimulationJudgmentCall =
  | {
      readonly called: true;
      readonly model: string;
      readonly promptVersion: string;
      readonly usage: SimulationUsage;
      readonly elapsedMs: number;
      readonly prompt: string;
    }
  | { readonly called: false };

/**
 * domain/investigation/evaluation: one hypothesis's own judgment, narrowed
 * to what this region's own criteria read -- `reason` is left off since no
 * criterion of this task shows it (that belongs to
 * task/simulation-cockpit/hypotheses-table's own row), and whether a
 * judgment call happened is already carried, unambiguously, by
 * `judgmentCall` above.
 */
export type SimulationEvaluation = {
  readonly hypothesis: string;
  readonly verdict: SimulationVerdict;
  readonly citations: readonly SimulationCitation[];
  readonly judgmentCall: SimulationJudgmentCall;
  /**
   * rules/investigation/a-simulation-result-is-stale-once-its-source-changes,
   * carried through from CockpitEvaluation (case-simulation-cockpit-
   * adapters.ts's own toDetailEvaluation) unchanged, symmetric to the Case
   * Result region's own CaseResultRun.stale. Optional rather than required,
   * matching CockpitEvaluation's own field: an absent value reads exactly as
   * "not stale" at this region's own read site (case-simulation-detail-panel.tsx
   * reads `evaluation.stale &&`), the correct reading for every
   * already-existing fixture that predates this field and was never stale to
   * begin with.
   */
  readonly stale?: boolean;
};

/**
 * The one hypothesis-revision fact this region shows: its own criterion
 * text (criterion 2) and what it collects (domain/knowledge/
 * hypothesis-revision), which the Evidence tab reads to select, per
 * collected concept, the matching evidence item.
 */
export type SimulationHypothesisRevisionSummary = {
  readonly criterion: string;
  readonly collects: readonly string[];
};

export type CaseSimulationDetailPanelProps = {
  readonly hypothesisRevision: SimulationHypothesisRevisionSummary;
  readonly evaluation: SimulationEvaluation;
  /**
   * The run's own evidence, keyed by concept -- for a full-case run this may
   * carry more concepts than this one hypothesis collects (other
   * hypotheses' own collects), so the Evidence tab selects only what
   * `hypothesisRevision.collects` names.
   */
  readonly evidence: readonly SimulationEvidenceItem[];
  /**
   * The raw response for this hypothesis, exactly as the transport carried
   * it -- the JSON tab's own criterion 5 ("verbatim and unsummarized").
   */
  readonly rawResponse: unknown;
};
