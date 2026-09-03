---
title: The store derives each listed case's summary from its own versions
summary: The case listing in the persistence store answers, per case in the requested page, the six-attribute
  summary derived from that case's existing versions.
rationale: The scope named title, when_to_use and the version that counts as released, while domain/knowledge/case-summary
  states six attributes as one summary and scenarios/knowledge/a-catalog-entry-follows-the-released-version
  asserts current_state in the same catalog read as those three, so I cut the derivation as one task over
  the whole value object; splitting it by field would leave that scenario's own middle statement demonstrable
  by neither half. The two sources the derivation reads from — a case's highest-numbered version and its
  highest-numbered released version — are stated by one rule as one summary and one read, so they are
  not two tasks either.
sources:
- intake/scope.md
objective: The case store answers a page of the catalog with, for each case in that page, the summary
  derived from that case's own existing versions.
criteria:
- The listing's entry declares all six attributes domain/knowledge/case-summary names, with version_count
  the only one always present.
- The entry carries no field beyond those six and the slug of the case it summarizes.
- An entry's title, when_to_use and released_version are read from the highest-numbered version of that
  case whose state is released.
- An entry for a case currently holding no released version carries none of title, when_to_use and released_version,
  each absent rather than null or empty.
- An entry for a case whose highest-numbered version is a draft above a released one carries the released
  version's when_to_use and never the draft's.
- An entry's current_state and last_updated are read from the case's highest-numbered version, whatever
  state that version is in.
- An entry's version_count is the number of versions that case currently holds.
- An entry for a case currently holding no version has version_count 0 and carries neither current_state
  nor last_updated.
- A case currently holding no version still appears in the page as its own entry.
- No case appears more than once in a page, whatever number of versions it holds.
- The page's total is the number of cases currently held, unaffected by how many versions any case holds.
- The same offset and limit select the same cases, in the same order, as they did before the summary fields
  were derived.
implements:
- domain/knowledge/case-summary
- rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
- scenarios/knowledge/a-catalog-entry-follows-the-released-version
- rules/knowledge/a-case-listing-answers-cases-in-slug-order
- constraints/listings-are-paged
---

## What it is

One read in the persistence store that returns, per case in the page, the summary domain/knowledge/case-summary declares.
Two derivations meet in that one entry: title, when_to_use and released_version off the case's highest-numbered released version, and current_state, version_count and last_updated off its highest-numbered version whatever its state.
Every field the case has nothing to derive from is absent from the entry rather than answered with a stand-in.
The page itself is cut from every case currently held, ordered by slug ascending, per rules/knowledge/a-case-listing-answers-cases-in-slug-order.

## Notes

The store already expresses "the highest-numbered version in released state" for a different purpose, per the inventory, so the same fact need not be worded a second way.
The entry's shape is the interface the published read consumes, which is why the answered contract is a task of its own.
UNDERDETERMINED, from the specification — no criterion requires the page's cases to be ordered by slug ascending, which rules/knowledge/a-case-listing-answers-cases-in-slug-order states and its expression requires of the page cut; the only criterion touching order fixes it to whatever the store already answered rather than to slug order, so a store listing that leaves the existing ordering untouched (no ORDER BY, or ordered by insertion sequence or primary key) while adding only the six derived fields per entry would satisfy every criterion as written while answering pages the rule refuses. Where the store's existing arrangement is already ascending slug, as the inventory found ("SELECT slug FROM cases ORDER BY slug"), the two criteria and the rule already agree; the divergence is in the criterion's own wording, not in the store's current behavior.
REMAINDER, from the specification — three clauses of constraints/listings-are-paged reach no criterion of this task: the limit defaulting to a configured default, the limit being clamped to a configured maximum, and the answer carrying the page count applied. They belong to task/case-catalog/list-cases-answers-the-summary, which composes the published answer.
REMAINDER, from the specification — constraints/listings-are-paged is stated over every list operation the published api offers, and contracts/knowledge/case-query declares four listings besides read-case; this task's criteria reach the cases listing alone, so the constraint's reach over list-case-versions, list-hypotheses and list-hypothesis-revisions is unanswered here and belongs to no task of this plan.
ADVISORY, from the specification — contracts/knowledge/case-query is not implemented by this task: it declares the published api's operation set and direction, and no criterion here addresses an operation or what the published api answers. It belongs to task/case-catalog/list-cases-answers-the-summary.
