---
title: cases-list-screen.tsx's CaseSummary comment corrected to cite the current specification nodes
summary: Rewrote the stale two claims in CaseSummary's JSDoc — "an edge no governing node addresses" and
  "this task's own inference" — to quote what domain/knowledge/case-summary and rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  now state about the zero-version case, keeping the still-valid case-store.port.ts citation for why a
  case can reach zero versions.
task: sha256:6c023fcb44052cb22da80b34531898a825b5a2e7d445a0abd3e2ae2912ea4296
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/cases-list-screen-stale-comment-comment-cites-the-current-nodes-build
files:
- path: src/routes/cases-list-screen.tsx
  effect: the JSDoc comment above the CaseSummary type (previously lines 82-93) now cites domain/knowledge/case-summary's
    conditional-presence statement and rules/knowledge/a-case-summary-is-derived-from-its-existing-versions's
    zero-version statement by quoting each directly, instead of calling the zero-version case an edge
    no governing node addresses or attributing the resulting undefined fields to this task's own inference;
    no other line of the file changed
criteria:
- criterion: The comment no longer states or implies that the zero-version case is "an edge no governing
    node addresses."
  met: true
  how: that phrase is removed; the comment now says the zero-version handling is decided by the two named
    nodes, quoting each
- criterion: The comment no longer attributes the zero-version handling to "this task's own inference."
  met: true
  how: that phrase is removed from this comment; the comment now reads "both decided, not this screen's
    own inference," attributing the handling to the two nodes instead
- criterion: The comment cites domain/knowledge/case-summary's own conditional-presence statement for
    current_state and last_updated.
  met: true
  how: the comment quotes the node's own sentence — 'current_state and last_updated are present only where
    the case currently holds at least one version; a case whose every version was ever discarded before
    release holds none to derive either from, and both are absent rather than invented'
- criterion: The comment cites rules/knowledge/a-case-summary-is-derived-from-its-existing-versions's
    own statement of the zero-version case (version_count zero, neither current_state nor last_updated).
  met: true
  how: the comment quotes the rule's own sentence — 'a case currently holding no version has version_count
    zero and neither current_state nor last_updated, there being no version to derive either from'
- criterion: No behavior changes — the CaseSummary type, fetchCaseSummary, and every other line of the
    file are unchanged; only the comment's own text changes.
  met: true
  how: the edit touched only the comment block above the CaseSummary type; the type declaration, fetchCaseSummary,
    caseVersionsUrl, and every other line are byte-identical to before
nodes:
- node: domain/knowledge/case-summary
  encoded_at:
  - src/routes/cases-list-screen.tsx
  how: the comment above CaseSummary now quotes this node's own conditional-presence statement verbatim
    as the reason currentState and lastUpdated are optional, replacing the prior stale 'edge no governing
    node addresses' framing
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  encoded_at:
  - src/routes/cases-list-screen.tsx
  how: the comment quotes this rule's own statement of the zero-version case verbatim, alongside the domain
    node's statement, as the current, decided source of the zero-version handling
deferred:
- what: a second, unrelated occurrence of the phrase 'this task's own inference' further down the file
    (above fetchCaseSummary's call-pattern comment, ~line 107) — describing the two-call probe strategy
    for reading a case's highest-numbered version, which no node mandates.
  why: outside this task's scope, which names only the CaseSummary JSDoc; also not stale — that comment's
    own claim (no node mandates this call pattern) is still true, unlike the two claims this task corrected.
---

## What it is

A corrective increment: two stale claims in one comment, corrected to cite what the specification
decided since the comment was written. No behavior change.

## Notes

None.
