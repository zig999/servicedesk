---
contract_version: siegard-reconcile/1
title: Frontend first sweep — cases-list-screen.tsx
summary: Same premise as frontend-first-sweep-clean.md, reconciled separately because this file's own
  judge returned two findings.
target: frontend
files:
- path: src/routes/cases-list-screen.tsx
  change: never reconciled
nodes:
- node: contracts/knowledge/case-query
  conforms: true
  how: exercises exactly list-cases, list-case-versions and read-case, each named in the contract's operations
    list.
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case
  conforms: true
  how: CaseIdentity = { slug } matches the node's stable identity attribute.
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case-summary
  conforms: false
  how: 'CaseSummary''s own type makes current_state and last_updated optional (readonly currentState?:
    CaseVersionState; readonly lastUpdated?: string), but domain/knowledge/case-summary declares both
    required, computed per rules/knowledge/a-case-summary-is-derived-from-its-existing-versions. The screen
    decided, on its own, that a case holding zero versions gets a case-summary with both fields absent
    — a value the node does not describe as case-summary at all.'
  observed_at:
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case-version-state
  conforms: true
  how: CaseVersionState = 'draft' | 'released' matches the node's two values exactly.
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: true
  how: fetchCaseSummary reads the highest-numbered version's state and authored_at, matching the rule
    exactly.
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
  conforms: false
  how: The doc comment above CaseSummary says the zero-version edge is 'an edge no governing node addresses,'
    but scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly states exactly this situation
    and requires the read to state it explicitly. The comment neither cites the scenario nor confirms
    the total===0 branch actually satisfies 'states it explicitly' rather than assuming any zero count
    already does.
  observed_at:
  - src/routes/cases-list-screen.tsx
notes: One delegation over this one file, handed its own 5-node trace-bound set plus the batch candidate
  union. 3 of 5 clear.
---
