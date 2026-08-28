---
contract_version: siegard-reconcile/1
title: Cockpit hook rebind after its own citation-update delivery
summary: 'use-case-simulation-cockpit.ts''s header comment was just edited (via implement-task simulation-staleness-binding:
  deliver bind-cockpit-staleness-citations-and-proof) to cite rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  and scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result in place of "D8". That
  delivery''s own bind restamped only those two nodes, leaving the file''s other 6 pre-existing bindings
  asserting a digest the file no longer holds. The human asked to reconcile this file against every node
  the trace binds it to.'
target: frontend
files:
- path: src/hooks/use-case-simulation-cockpit.ts
  change: header comment's criterion-6 section now cites the rule and scenario above by identity in place
    of "D8"; no runtime behavior changed
nodes:
- node: contracts/investigation/case-simulation
  conforms: true
  how: 'the two dispatch bodies (simulate-case and simulate-hypothesis) call caseSim.onSimulate({ case:
    { slug, version }, subject, requester }) and hypSim.onSimulate(hypothesisName, subject, requester),
    matching the contract unchanged from before the citation edit.'
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
- node: domain/investigation/assessment
  conforms: true
  how: the comment grounding why a single-hypothesis run cannot populate Case result (CaseResultRun requires
    outcome/referral, which only a case-level run resolves) is unchanged and still holds.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
- node: domain/investigation/investigation
  conforms: true
  how: requester is forwarded unchanged on both dispatch calls, and neither a narrative nor a ticket_ref
    is restated here -- unaffected by the citation edit.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
- node: domain/investigation/subject
  conforms: true
  how: the subject is assembled from the case-version record (record.subject, record.manifest) and handed
    to useSimulationSubject rather than derived or restated here, unchanged from before.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
- node: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  conforms: false
  how: 'the rule states that a case-simulation result -- "its evaluations and, where one was produced,
    its assessment" -- is stale once its source changes. The return-from-editing effect (lines 200-214)
    calls history.markLastRunStale(), which by the file''s own criterion-5 comment only ever reaches what
    history.recordRun populated -- case-level Case Result runs. The evaluations map, written by the hypothesis-level
    completion effect and read by the Hypotheses table and the Detail panel, is never touched by the return
    effect: a curator who simulated one hypothesis, edited that hypothesis''s revision, and returned to
    the cockpit is shown that hypothesis''s evaluation with no staleness marking at all, even though the
    same mount''s query invalidation refreshes the manifest data around it. This is not a citation problem
    -- the rule''s own text names "evaluations" as a first-class subject of staleness, distinct from the
    assessment, and the delivered mechanism does not reach it.'
  observed_at:
  - src/hooks/use-case-simulation-cockpit.ts
- node: scenarios/investigation/a-draft-case-version-is-simulated
  conforms: true
  how: the hook takes any CaseVersionRecord and dispatches the same simulate calls regardless of the version's
    state -- the scenario's own concern (a draft version being simulated) is untouched by the citation
    edit.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
- node: scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
  conforms: true
  how: lines 50-51's comment and the effect at lines 200-214 exercise exactly this scenario's concrete
    case for the Case result region -- the region this scenario's own worked example describes; the gap
    found above sits in the rule's broader reach over evaluations, not in this scenario's own narrower
    case.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  conforms: true
  how: the comment at lines 40-44 still states this scenario's own "no outcome and no assessment are resolved"
    fact -- a single-hypothesis run could not be shaped into a CaseResultRun even if the file tried, unchanged
    by the citation edit.
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
notes: 'One delegation ran, over this file''s whole node set (8 nodes) rather than only the 6 left stale
  by the prior delivery''s own bind -- a reconciliation reads every node a named file answers to, never
  the subset that happened to drift. 7 of the 8 cleared; the 8th carries a genuine finding rather than
  a citation mismatch: the rule requires staleness for per-hypothesis evaluations, not only the case-level
  assessment, and the delivered mechanism reaches only the latter. That node is not bound by this act
  -- its existing binding (from the delivery moments before this reconciliation) stands as recorded, and
  this finding is handed back rather than resolved here: the route is a /plan-work corrective increment
  extending the return-from-editing effect to stale the evaluations map as well, delivered through /implement-task
  like any other task.'
---

## What it is

A reconciliation of use-case-simulation-cockpit.ts against every node the trace binds it to,
following the citation-only delivery that restamped only 2 of the file's 8 bound nodes.

## Notes

See the record's own `notes` field above for the one finding this act surfaced and did not
resolve.
