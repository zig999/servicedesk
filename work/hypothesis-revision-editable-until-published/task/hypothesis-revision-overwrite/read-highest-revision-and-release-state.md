---
title: Read a hypothesis's highest revision and whether a release holds it
summary: The case-store port capability, and its relational answer, reporting the highest revision a hypothesis currently holds and whether a case version in released state references it.
rationale: The choice between overwriting and creating turns on a fact about a different aggregate than the one being written, and the survey reports no query answers it today; it is cut apart from the write because reading that fact and replacing a revision's content change for different reasons, and apart from the operation because the port and its consumer are two sides of one seam.
sources:
- intake/scope.md
objective: The case store answers, for one hypothesis, the highest revision number it currently holds and whether any case version in released state references that revision.
criteria:
- For a hypothesis holding at least one revision, the answer carries the highest revision number that hypothesis currently holds.
- For a hypothesis holding no revision at all, the answer says it holds none.
- The answer says the highest revision is referenced by a released case version when a case version in released state pins that revision in its manifest.
- The answer says the highest revision is referenced by no released case version when only case versions in draft state pin it.
- The answer says the highest revision is referenced by no released case version when a released case version pins a lower revision of that same hypothesis and not the highest.
- The fact reaches its caller through the case-store port, and the module that consumes it imports no driver, framework or provider client.
implements:
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- domain/knowledge/case-version
- domain/knowledge/manifest-entry
- constraints/the-domain-depends-on-no-infrastructure
---

## What it is
One read over the case store answering both halves of the fact the overwrite decision turns on, in a single answer.
It names the highest revision by its number and reports whether a released case version has adopted that revision.

## Notes
The survey reports the existing revisions read is an ascending listing of all revisions and computes neither the highest nor the released reference, so both are new.
UNDERDETERMINED, from the specification — no criterion says what the answer reports about released reference when the hypothesis holds no revision at all; criteria three, four and five are each conditioned on there being a highest revision some case version pins, so they hold vacuously when none exists, and criterion two constrains only the revision-number half. rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased states that a hypothesis holding no revision yet always creates revision 1, never the frozen branch, so an answer reporting the frozen branch for such a hypothesis is one the specification refuses; an implementation defaulting the released-reference flag to true whenever no highest revision was found would satisfy every criterion here while routing a caller onto the wrong branch.
REMAINDER, from the specification — rules/knowledge/a-released-hypothesis-revision-is-never-altered's refusal (HTTP 409 ReleasedHypothesisRevisionNotAlterableError on an attempted alteration) reaches no criterion of this task, which performs no alteration and issues no refusal; it only reports the fact the refusal's condition is read from. This belongs to the task implementing the write side of revise-hypothesis, where the attempted alteration and its 409 refusal occur.
REMAINDER, from the specification — of rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased's statement, this task's criteria answer only the reading its condition turns on; its write clauses (replacing the highest revision's content in place, creating the next revision when released-referenced, creating revision 1 for a hypothesis holding none) reach no criterion here. This belongs to the task implementing the write side of revise-hypothesis, which chooses between overwrite and create from the fact this task reads.
REMAINDER, from the specification — rules/knowledge/a-hypothesis-revision-number-is-never-reused's statement (first-ever revision numbered 1, each later one exactly one past the highest existing, a number never reused) reaches no criterion of this task, which reads the highest revision number and assigns none. This belongs to the task that creates a hypothesis-revision and assigns its number, on the write side of revise-hypothesis.
REMAINDER, from the specification — rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft's statement (revision only while the case holds a draft version, the concept-acceptance check using that draft version's declared subject type, HTTP 409 CaseHoldsNoDraftError otherwise) reaches no criterion of this task; nothing in this read consults the case's draft, performs a concept-acceptance check, or refuses a revision. This belongs to the task implementing the write side of revise-hypothesis.
ADVISORY, from the specification — constraints/the-schema-replays-from-its-scripts is a candidate but governs no criterion as the task is written; if the delivery finds the read needs a schema addition (an index or a column), the constraint governs it and the task should name it.
ADVISORY, from the specification — contracts/knowledge/case-lifecycle is left out of implements: its operations list is the curator's published surface and this task publishes no operation, reaching its caller through the case-store port internally; the routing fact its Description restates is owned by rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased.
