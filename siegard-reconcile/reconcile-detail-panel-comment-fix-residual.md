---
contract_version: siegard-reconcile/1
title: Residual rebind after the Detail-panel comment-wording hotfix
summary: 'implement-task detail-panel-judgment-comment-fix: deliver reword-criterion-6-comment reworded
  case-simulation-detail-panel.tsx''s own Criterion 6 comment. That delivery''s own bind restamped only
  the 2 nodes it implements (domain/investigation/evaluation and domain/investigation/investigation, on
  that one file), leaving 6 other, already-cleared bindings on the same file stale again (its digest moved
  a second time), plus 3 domain/investigation/evaluation bindings on three sibling files (case-simulation-cockpit-adapters.ts,
  case-simulation-detail-types.ts, case-simulation-hypotheses-table-row.ts) that a prior reconciliation
  (siegard-reconcile/reconcile-hypothesis-evaluations-staleness-widening.md) had left unbound because
  of the very finding this delivery fixed. The human asked to reconcile all 4 files against every node
  the trace binds each of them to.'
target: frontend
files:
- path: src/routes/case-simulation-detail-panel.tsx
  change: the Criterion 6 comment now correctly separates domain/investigation/evaluation's own per-hypothesis
    fields from domain/investigation/investigation's own investigation-wide facts
- path: src/routes/case-simulation-cockpit-adapters.ts
  change: unchanged; read fresh on its own merits, independent of the sibling file's now-fixed comment
- path: src/routes/case-simulation-detail-types.ts
  change: unchanged; read fresh on its own merits
- path: src/routes/case-simulation-hypotheses-table-row.ts
  change: unchanged; read fresh on its own merits
nodes:
- node: contracts/investigation/case-simulation
  conforms: true
  how: each file's own props/type shapes remain consistent with the contract's own description of what
    a simulation run returns, unchanged by the comment rewording.
  encoded_at:
  - src/routes/case-simulation-detail-panel.tsx
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
- node: domain/investigation/citation
  conforms: true
  how: SimulationCitation and its two renderers (the citations list, the detail panel) are unchanged.
  encoded_at:
  - src/routes/case-simulation-detail-panel.tsx
  - src/routes/case-simulation-detail-types.ts
- node: domain/investigation/evaluation
  conforms: true
  how: each file still carries exactly this node's own fields (verdict, citations, reason, usage/elapsed_ms/prompt)
    as its own call-level record; case-simulation-detail-panel.tsx's own comment now correctly attributes
    usage/elapsed_ms/prompt to this node, closing the prior finding.
  encoded_at:
  - src/routes/case-simulation-detail-panel.tsx
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
- node: domain/investigation/verdict
  conforms: true
  how: every file's own verdict field/enum is unchanged.
  encoded_at:
  - src/routes/case-simulation-detail-panel.tsx
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: every file's own narrowed hypothesis-revision fact (criterion, collects) is unchanged.
  encoded_at:
  - src/routes/case-simulation-detail-panel.tsx
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
- node: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  conforms: true
  how: every file's own `stale` field/handling is unchanged by the comment rewording; case-simulation-detail-panel.tsx's
    own comment now correctly separates this rule's own per-hypothesis scope from the investigation-wide
    facts it does not cover.
  encoded_at:
  - src/routes/case-simulation-detail-panel.tsx
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
- node: scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
  conforms: true
  how: the Stale indicator rendering in case-simulation-detail-panel.tsx is unchanged.
  encoded_at:
  - src/routes/case-simulation-detail-panel.tsx
- node: domain/investigation/assessment
  conforms: true
  how: case-simulation-cockpit-adapters.ts and case-simulation-hypotheses-table-row.ts both still carry
    the assessment's own fields exactly as before.
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: the three-value enum is unchanged in both files.
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
- node: domain/investigation/evidence
  conforms: true
  how: SimulationEvidenceItem is unchanged.
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: SimulationEvidenceResult is unchanged.
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
- node: domain/investigation/usage
  conforms: true
  how: SimulationUsage and its two carriers are unchanged.
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
- node: domain/investigation/durations
  conforms: true
  how: SimulationDurations is unchanged.
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: position/collects on SimulationManifestRow are unchanged.
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
- node: domain/knowledge/referral
  conforms: true
  how: SimulationReferral is unchanged.
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
- node: domain/knowledge/resolution
  conforms: true
  how: the doc comment's own outcome/referral co-required pairing is unchanged.
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
- node: domain/investigation/investigation
  conforms: false
  how: 'Conforms in case-simulation-detail-panel.tsx (its comment now correctly names model and prompt_version
    as this node''s own investigation-wide facts, one pinned pair per whole investigation). Does not conform
    in case-simulation-detail-types.ts: its SimulationJudgmentCall comment and type extend the co-occurrence
    rule domain/investigation/evaluation states only for usage/elapsed_ms/prompt to model and prompt_version
    as well, saying they "join the same branch for the same reason: they too are part of ''the call''s
    own record'' and are never available without it" -- and the discriminated union makes both fields
    vanish entirely in the `{ called: false }` branch. domain/investigation/investigation.md declares
    model and prompt_version as required attributes unconditionally, with no clause conditioning their
    presence on any one hypothesis''s own call happening. The source states a narrower rule than the node
    holds and attributes that narrower rule to the node itself. Since a node conforms only where every
    delegation that read one of its files cleared it, this node does not conform over the file set as
    a whole.'
  observed_at:
  - src/routes/case-simulation-detail-panel.tsx
  - src/routes/case-simulation-detail-types.ts
notes: 'Four delegations ran, one per file, together. 16 of the 17 unique nodes across the whole file
  set cleared. domain/investigation/investigation did not: while case-simulation-detail-panel.tsx''s own
  comment is now correct, case-simulation-detail-types.ts''s own SimulationJudgmentCall comment and type
  were found to state a narrower, conditional-presence rule for model/prompt_version than domain/investigation/investigation
  actually holds (which requires both unconditionally) -- a new, distinct finding from the one this initiative''s
  own delivery fixed, surfaced only because this reconciliation reread every file the node binds rather
  than assuming the sibling file''s fix settled the whole node. Handed back rather than resolved here:
  a further correction to case-simulation-detail-types.ts''s own SimulationJudgmentCall shape or its comment
  is the route.'
---

## What it is

A reconciliation of the 4 files left with stale or unbound bindings after
implement-task detail-panel-judgment-comment-fix: deliver reword-criterion-6-comment, against
every node the trace binds each of them to.

## Notes

See the record's own `notes` field above for the new finding this act surfaced and did not
resolve.
