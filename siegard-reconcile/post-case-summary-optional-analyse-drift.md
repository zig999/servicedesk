---
contract_version: siegard-reconcile/1
title: 'cases-list-screen.tsx: case-summary binding stale on two fronts, both healed except two stale
  comments'
summary: 'This file''s own domain/knowledge/case-summary binding is stale twice over: its content changed
  in a later, unrelated frontend delivery that rebound the file''s other 4 nodes but not this one, and
  the specification side also moved — an /analyse (c9b7594) made current_state and last_updated optional
  for a zero-version case, and extended the deriving rule''s own statement to cover it, because this file
  already implemented the zero-version case correctly. The human states the file''s actual behavior is
  correct and unchanged by either move.'
target: frontend
files:
- path: src/routes/cases-list-screen.tsx
  change: no behavioral change since its last delivery (1c8f24a); the specification moved under it and
    one binding (domain/knowledge/case-summary) was never restamped by that delivery, which rebound the
    file's other nodes
nodes:
- node: contracts/knowledge/case-query
  conforms: true
  how: fetchCaseSummary and fetchCasesWithSummaries exercise exactly list-cases, list-case-versions and
    read-case, without restating the contract's own shape
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case
  conforms: true
  how: the CaseIdentity type carries slug alone, matching the node
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case-summary
  conforms: false
  how: 'the CaseSummary type and the zero-version branch of fetchCaseSummary already match the node''s
    current, optional-field statement exactly (versionCount always present, currentState/lastUpdated present
    only where at least one version exists). The finding is not behavioral: the JSDoc above the type (lines
    82-93) still asserts that currentState and lastUpdated are undefined for the zero-version case "an
    edge no governing node addresses" — a claim that was true before c9b7594 and is false now that this
    node states the conditional-presence fact directly. A reader trusting the comment would believe this
    behavior answers to no node and is free to change it without checking the specification.'
  observed_at:
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case-version-state
  conforms: true
  how: the CaseVersionState type and CASE_STATE_CELL mapping mirror the enumeration for ordinary wire-typing,
    matching the node, with no divergent behavior
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: false
  how: 'fetchCaseSummary''s derivation (the highest-numbered version read, plus the versionCount === 0
    branch) already matches the rule''s current statement exactly, including the zero-version case. The
    finding is not behavioral: the same JSDoc (lines 90-92) attributes the zero-version absence to "this
    task''s own inference, disclosed in its delivery record" — but the rule now states this outcome directly
    ("a case currently holding no version has version_count zero and neither current_state nor last_updated").
    A later edit made on the strength of this comment would look like tidying an inference when it would
    actually be a silent departure from the rule.'
  observed_at:
  - src/routes/cases-list-screen.tsx
notes: One delegation, over the one named file, against all 5 nodes the trace binds to it. domain/knowledge/case-summary
  and rules/knowledge/a-case-summary-is-derived-from-its-existing-versions were read as they stand today,
  per c9b7594's own amendment — behavior already conforms to both, but the file's own JSDoc comment (lines
  82-93) still describes the zero-version handling as answering to no node and as this task's own unassisted
  inference, which the specification's later amendment makes false. That finding is not bound; the other
  3 nodes cleared and are.
---

## What it is

Reconciles cases-list-screen.tsx's 5 trace bindings after a later, unrelated delivery changed
the file without restamping domain/knowledge/case-summary, and after an /analyse amended that
node and its deriving rule to state the zero-version case this file already implemented. 3 of 5
clear; 2 carry a stale-comment finding, not a behavioral one.

## Notes

None.
