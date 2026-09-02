---
title: Replace an existing revision's content in place
summary: The case-store port capability, and its relational write, that replaces a named revision's criterion, collects and resolution while leaving its number as it stands.
rationale: Cut apart from the read because replacing content and answering a fact change for different reasons, and apart from the operation because the port and its consumer are two sides of one seam; it is the only task here that needs the schema's alteration rule already conditioned, which is why it carries that edge and the read does not.
sources:
- intake/scope.md
depends_on:
- task/hypothesis-revision-overwrite/revision-alteration-refused-only-when-released
objective: The case store replaces the content of one named existing revision of a hypothesis, leaving that revision's number exactly as it was.
criteria:
- After the replacement, that revision's number is the number it held before.
- After the replacement, reading that revision answers the criterion and the resolution the replacement carried.
- After the replacement, reading that revision's collects answers exactly the concepts the replacement carried.
- After the replacement, none of the concepts the revision collected before the replacement is answered by that revision's collects.
- After the replacement, the hypothesis holds exactly the revisions it held before, no more and no fewer.
- The replacement assigns no revision number that the hypothesis had already assigned to a different revision.
implements:
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- rules/knowledge/a-hypothesis-revision-number-is-never-reused
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- constraints/the-domain-depends-on-no-infrastructure
---

## What it is
A write path that overwrites one revision's own content rather than adding a numbered one beside it.
Its collects are replaced wholesale, so a concept dropped from the revision stops being collected by it.

## Notes
The survey reports the collects relation already carries a release-conditioned delete rule, so replacing the collected concepts of an unreleased revision is unblocked at the schema level and only unwritten in code.
UNDERDETERMINED, from the specification — no criterion makes the replacement read whether any case version in released state references the named revision, so a store replace that overwrites unconditionally satisfies all six criteria as written. rules/knowledge/a-released-hypothesis-revision-is-never-altered places the HTTP 409 ReleasedHypothesisRevisionNotAlterableError refusal at the point of the attempt, and its dependency task carries that refusal, but nothing in these criteria holds this task's own write to it.
REMAINDER, from the specification — the clause of rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased's statement selecting the target ("writes into that hypothesis's own highest existing revision") reaches no criterion here: this task replaces a revision named to it and never decides which revision that is. This belongs to the task of this epic that implements the revise-hypothesis operation and picks the revision it writes into.
REMAINDER, from the specification — the clause "a hypothesis holding no revision yet always creates revision 1" reaches no criterion of this task, which replaces one existing revision and creates none. This belongs to the task of this epic that creates a hypothesis's first revision.
REMAINDER, from the specification — two clauses of rules/knowledge/a-hypothesis-revision-number-is-never-reused's statement (first revision numbered 1; each later one exactly one past the highest existing) reach no criterion here; only the third clause, a number once assigned never reused, is answered by criteria one and six. This belongs to the task of this epic that creates a hypothesis's next (or first) revision and numbers it.
REMAINDER, from the specification — no clause of rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft's statement reaches a criterion of this task; criterion three accepts whatever concepts the replacement carried without any check. This belongs to the task of this epic that implements the revise-hypothesis operation against the case's draft version.
ADVISORY, from the specification — scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves demonstrates exactly this task's replacement, but two of its then-clauses (the draft's manifest entry still pins revision 2; the entry does not disclose a higher revision) are manifest-entry reads this store write cannot answer, so it is left out of implements.
ADVISORY, from the specification — contracts/knowledge/case-lifecycle, domain/knowledge/case-version and domain/knowledge/manifest-entry are left unimplemented here: this task delivers the store port and its relational write, not the published operation, and neither reads nor writes a case version or a manifest entry.
ADVISORY, from the specification — constraints/the-schema-replays-from-its-scripts is not named because no criterion asks for a schema change; should the relational write need one (for instance to the revision's collects links), that constraint governs and this task would owe a numbered migration script.
