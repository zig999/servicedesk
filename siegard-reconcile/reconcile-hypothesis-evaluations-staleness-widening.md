---
contract_version: siegard-reconcile/1
title: Six-file rebind after the hypothesis-evaluations-staleness delivery
summary: 'implement-task simulation-staleness-binding: deliver mark-hypothesis-evaluations-stale-on-return
  changed 6 files (adding an optional `stale` field to CockpitEvaluation and its two narrowed consumer
  types, marking every currently-held evaluation stale on a detected return, and rendering a Stale indicator
  in both consuming regions). That delivery''s own bind restamped only the 2 nodes it implements (the
  rule and its scenario), leaving 42 pre-existing bindings across these 6 files stale. The human asked
  to reconcile the whole file set against every node the trace binds it to.'
target: frontend
files:
- path: src/hooks/use-case-simulation-cockpit.ts
  change: the return-detection effect now also marks every currently-held per-hypothesis evaluation stale,
    alongside the existing history.markLastRunStale() call; the header comment's criterion-6 section was
    rewritten to describe both regions
- path: src/routes/case-simulation-cockpit-adapters.ts
  change: 'CockpitEvaluation gained an optional `stale?: boolean`, always explicitly set false by the
    two normalizers and carried through unchanged by the two narrowing functions'
- path: src/routes/case-simulation-hypotheses-table-row.ts
  change: 'SimulationHypothesisEvaluation gained `stale?: boolean`'
- path: src/routes/case-simulation-detail-types.ts
  change: 'SimulationEvaluation gained `stale?: boolean`'
- path: src/routes/case-simulation-hypotheses-table.tsx
  change: COLUMNS gained a "Stale" entry (appended after "actions") rendering a CaseSimulationStatusDot
    when a row's evaluation is stale
- path: src/routes/case-simulation-detail-panel.tsx
  change: renders a Stale CaseSimulationStatusDot beside the verdict dot when the selected evaluation
    is stale
nodes:
- node: contracts/investigation/case-simulation
  conforms: true
  how: each file's own handling of the two simulate operations (case-level and hypothesis-level) and their
    responses matches the contract's own description of what each returns, unchanged by this delivery's
    own edits.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-hypotheses-table.tsx
  - src/routes/case-simulation-detail-panel.tsx
- node: domain/investigation/assessment
  conforms: true
  how: each file continues to carry the assessment's own fields (outcome, referral, determining_hypothesis,
    text, register) exactly as before, or to never construct/read an Assessment at all where it did not
    before -- this delivery's own edits (the `stale` field, the Stale column/indicator) touch none of
    this node's own fields.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
  - src/routes/case-simulation-hypotheses-table.tsx
- node: domain/investigation/investigation
  conforms: true
  how: use-case-simulation-cockpit.ts imports and constructs no Investigation-shaped value (honored by
    absence, unchanged); case-simulation-detail-types.ts's own SimulationJudgmentCall still carries model/promptVersion
    as this node's own two required attributes, unchanged.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/routes/case-simulation-detail-types.ts
- node: domain/investigation/subject
  conforms: true
  how: use-case-simulation-cockpit.ts still assembles the subject source from the case-version record's
    own subject/manifest unchanged by this delivery.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
- node: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  conforms: true
  how: every file's own `stale` field (CockpitEvaluation and its two narrowed consumer types) and the
    return-effect's own marking of both the Case Result region's last run and every currently-held per-hypothesis
    evaluation now honor the rule's own "evaluations and, where produced, its assessment" over both halves,
    matching the rule's own text and each other across every file that carries a piece of the mechanism.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-hypotheses-table.tsx
  - src/routes/case-simulation-detail-panel.tsx
- node: scenarios/investigation/a-draft-case-version-is-simulated
  conforms: true
  how: neither file branches on the version's draft/released state before dispatching a simulate call,
    unchanged by this delivery.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/routes/case-simulation-hypotheses-table.tsx
- node: scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
  conforms: true
  how: the return-effect's own marking (both regions) and each region's own Stale indicator (CaseSimulationStatusDot)
    together encode the scenario's "marked stale"/"told" pair, consistently across every file that renders
    a piece of it.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/routes/case-simulation-hypotheses-table.tsx
  - src/routes/case-simulation-detail-panel.tsx
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  conforms: true
  how: each file continues to honor "no outcome and no assessment are resolved" for a single-hypothesis
    run -- history.recordRun is still called only from the case-level completion effect, and the Hypotheses
    table's summary/durations lines are still gated on an optional `summary` prop this delivery did not
    touch.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/routes/case-simulation-hypotheses-table.tsx
- node: domain/investigation/evaluation-reason
  conforms: true
  how: CockpitEvaluation.reason and SimulationHypothesisEvaluation.reason both still carry exactly the
    three-value enum unchanged by this delivery's own `stale` addition.
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
- node: domain/investigation/verdict
  conforms: true
  how: every file's own verdict field/enum is unchanged by this delivery.
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-detail-panel.tsx
- node: domain/investigation/durations
  conforms: true
  how: SimulationDurations and its rendering in the Hypotheses table are unchanged by this delivery.
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
  - src/routes/case-simulation-hypotheses-table.tsx
- node: domain/investigation/usage
  conforms: true
  how: SimulationUsage and its two carriers (the row type and the detail type) are unchanged by this delivery.
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
  - src/routes/case-simulation-detail-types.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: every file's own narrowed hypothesis-revision fact (criterion, collects) is unchanged by this delivery.
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-detail-panel.tsx
- node: domain/knowledge/manifest-entry
  conforms: true
  how: position/collects on SimulationManifestRow, and the table's own precedence-order sort, are unchanged
    by this delivery.
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
  - src/routes/case-simulation-hypotheses-table.tsx
- node: domain/knowledge/referral
  conforms: true
  how: SimulationReferral is unchanged by this delivery.
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
- node: domain/knowledge/resolution
  conforms: true
  how: the doc comment's own outcome/referral co-required pairing is unchanged by this delivery.
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
- node: domain/investigation/citation
  conforms: true
  how: SimulationCitation and its two renderers (the citations list, the detail panel) are unchanged by
    this delivery.
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-detail-panel.tsx
- node: domain/investigation/evidence
  conforms: true
  how: SimulationEvidenceItem is unchanged by this delivery.
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: SimulationEvidenceResult is unchanged by this delivery.
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
- node: domain/knowledge/case-version
  conforms: true
  how: the Hypotheses table's own manifest-order sort and its header comment's reference to the case-version's
    manifest are unchanged by this delivery.
  encoded_at:
  - src/routes/case-simulation-hypotheses-table.tsx
- node: domain/investigation/evaluation
  conforms: false
  how: 'Conforms in three of the four files it was read in (case-simulation-cockpit-adapters.ts, case-simulation-hypotheses-table-row.ts,
    case-simulation-detail-types.ts all still carry this node''s own fields -- verdict, citations, reason,
    usage/elapsed_ms/prompt -- unchanged by this delivery). case-simulation-detail-panel.tsx''s own judge
    found a finding against it: the file''s JSDoc header comment (Criterion 6 paragraph) groups "the judgment''s
    model, prompt version, token usage and elapsed time" as one undifferentiated set, but domain/investigation/evaluation
    names only usage, elapsed_ms and prompt as "the call''s own record" -- model and prompt_version are
    domain/investigation/investigation''s own investigation-wide facts (one pinned pair per whole investigation),
    not part of a per-hypothesis evaluation. A reader taking the comment at its word looks for a per-hypothesis
    model/prompt-version field the specification never put there. Since a node conforms only where every
    delegation that read one of its files cleared it, this node does not conform over the file set as
    a whole, even though three of its four files were individually clean.'
  observed_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-detail-panel.tsx
notes: 'Six delegations ran, one per file, together. 20 of the 21 unique nodes across the whole file set
  cleared; domain/investigation/evaluation did not, because one of its four files (case-simulation-detail-panel.tsx)
  carried a finding against it while the other three were individually clean -- a node conforms only where
  every delegation that read one of its files cleared it. That finding is about this delivery''s own new
  JSDoc prose (conflating a per-hypothesis fact with an investigation-wide one), not about the `stale`
  field or the staleness mechanism this reconciliation''s premise concerns. It is handed back rather than
  resolved here: a comment-wording correction to case-simulation-detail-panel.tsx is the route, through
  /plan-work''s corrective increment or an ordinary code-comment fix depending on how the human wants
  to route it.'
---

## What it is

A reconciliation of the 6 files delivery implement-task simulation-staleness-binding: deliver
mark-hypothesis-evaluations-stale-on-return touched, against every node the trace binds each of
them to.

## Notes

See the record's own `notes` field above for the one finding this act surfaced and did not
resolve.
