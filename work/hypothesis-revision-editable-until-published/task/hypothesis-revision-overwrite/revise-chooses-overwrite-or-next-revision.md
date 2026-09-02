---
title: Revising chooses between overwriting the highest revision and creating the next
summary: The revise-hypothesis operation deciding, from the fact the store answers, whether to replace its hypothesis's highest existing revision in place or to originate the next one.
rationale: This is the outcome the scope states, cut as the one task that holds the decision, with the schema rule, the fact-read and the replace-write it builds on delivered separately so each is demonstrable on its own; the decision itself sits here rather than in the store because it is a policy the specification states, not a detail of how a row is written.
sources:
- intake/scope.md
depends_on:
- task/hypothesis-revision-overwrite/read-highest-revision-and-release-state
- task/hypothesis-revision-overwrite/overwrite-a-revisions-content-in-place
objective: Revising a hypothesis writes into that hypothesis's own highest existing revision while no case version in released state references it, and creates the hypothesis's next revision once one does.
criteria:
- Revising a hypothesis whose highest existing revision is referenced by no case version in released state leaves that hypothesis's highest revision number unchanged.
- After such a revise, that revision's content reads as the content the revise carried.
- Three successive revises of a hypothesis whose highest existing revision is referenced by no case version in released state leave that hypothesis holding exactly the revisions it held before the first of them.
- After those three revises, the hypothesis's highest revision reads the content of the most recent of them.
- Revising a hypothesis whose highest existing revision is referenced by a case version in released state creates a revision numbered exactly one past that highest revision.
- After such a revise, the revision that released case version references reads exactly the content it read before the revise.
- After such a revise, that released case version's manifest still references the revision number it referenced before.
- Revising a hypothesis that holds no revision creates that hypothesis's revision 1.
- A revise requested while the case holds no draft version is refused with an HTTP 409 response reporting a CaseHoldsNoDraftError.
- A revise refused because the case holds no draft version leaves every existing revision of that hypothesis reading exactly as it did, and creates none.
- After a revise that replaced the highest revision's content in place, the case's draft manifest entry for that hypothesis references the same revision number it referenced before the revise.
implements:
- contracts/knowledge/case-lifecycle
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/a-hypothesis-revision-number-is-never-reused
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- domain/knowledge/case-version
- domain/knowledge/manifest-entry
- scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
- scenarios/knowledge/revising-a-released-revision-creates-the-next
- constraints/the-domain-depends-on-no-infrastructure
---

## What it is
The operation reading, before it writes, whether its hypothesis's highest existing revision has been adopted by a released case version, and writing into that revision or past it accordingly.
A hypothesis holding no revision yet takes the same path to revision 1.

## Notes
The survey reports an existing unit specification asserts this operation always numbers a new revision one past the highest and leaves the earlier one unaltered, and that those assertions invert whenever the highest revision is unreleased, so that specification is rewritten by this task rather than left standing beside a contradicting one.
The survey reports the HTTP layer passes the request body through unchanged, and no criterion here asks it to answer anything it does not answer today.
UNDERDETERMINED, from the specification — rules/knowledge/a-released-hypothesis-revision-is-never-altered now states that an attempt to alter such a revision's content is refused at the point of the attempt with an HTTP 409 response reporting a ReleasedHypothesisRevisionNotAlterableError, rather than accepted and left with no effect; no criterion of this task states that refusal. Criteria five through seven exercise only the routing that keeps an alteration from being aimed at such a revision, and the rule itself allows the attempt to be reached anyway, since the released-reference reading it turns on is declared eventual (a read that goes stale between the read and the write). An implementation that routes correctly on the ordinary read, and on the rare stale-read race silently drops the write and answers as though the revise succeeded, would satisfy every criterion here while the rule requires the HTTP 409.
REMAINDER, from the specification — the second clause of rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft's statement (the concept-acceptance check the new revision undergoes uses the draft version's declared subject type) reaches no criterion of this task; criteria nine and ten answer only the draft-exists condition and its refusal. This belongs to the task implementing the concept-acceptance check performed on a revise-hypothesis.
ADVISORY, from the specification — scenarios/knowledge/a-released-version-keeps-its-original-revision is a candidate this task's implements omits: its given requires a second draft adopting a later revision and that version being released, a flow no criterion of this task states; the released-side facts these criteria do reach are exactly the then-clauses of scenarios/knowledge/revising-a-released-revision-creates-the-next, which is implemented.
ADVISORY, from the specification — scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves carries a fourth then-clause (the entry does not disclose a higher revision) that no criterion of this task states; criteria three and eleven reach only the revision set and the pinned revision number.
ADVISORY, from the specification — constraints/the-schema-replays-from-its-scripts is a candidate this task's implements omits: no criterion states a schema change, and both paths write against structures the depended-on tasks already presuppose; should delivering this task turn out to require a migration script, the constraint governs and the implements set is short by one.
