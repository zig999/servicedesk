---
title: Judgment reads only the evidence snapshot
summary: A hypothesis's judgment, and the citation check over its answer, become a
  pure function of the evidence's own snapshotted semantics — never a live read of
  the glossary or the capability registry.
rationale: Split out as the consumer side — the evaluator port, its prompt, and the
  citation/judgment orchestration all change for one reason (judgment must stop depending
  on a live registry read), distinct from the producer epic's own reason (what collection
  captures).
covers:
- domain/investigation/citation
- domain/investigation/hypothesis-evaluator
- constraints/the-judgment-prompt-is-closed
- rules/investigation/a-cited-field-exists-in-the-capability-output-schema
- rules/investigation/judgment-reads-the-evidence-snapshot
- scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
- scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
- domain/knowledge/hypothesis-revision
- rules/investigation/a-decided-evaluation-cites-evidence
- rules/investigation/a-citation-stays-within-the-hypothesis-collects
- scenarios/investigation/a-foreign-citation-is-refused
- domain/investigation/assessment-consolidator
- constraints/the-consolidation-prompt-is-closed
uncovered:
- node: domain/knowledge/hypothesis-revision
  why: A hypothesis-revision's own collects/criterion shape is untouched; only what
    grounds its judgment moves to a snapshot.
- node: rules/investigation/a-decided-evaluation-cites-evidence
  why: The at-least-one-citation requirement is unaffected by where a citation's field
    vocabulary is read from.
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  why: The concept-membership check (citesACollectedConcept) is unchanged by this
    scope; only the field-existence check moves to the snapshot.
- node: scenarios/investigation/a-foreign-citation-is-refused
  why: The retry-or-fallback policy over a foreign citation is unchanged; only what
    "foreign" is checked against moves to the snapshot.
- node: domain/investigation/assessment-consolidator
  why: Consolidation reads evaluations, cited evidence and the register generically,
    with no field-level content named; nothing here changes what it consumes.
- node: constraints/the-consolidation-prompt-is-closed
  why: The consolidation prompt's own closed content is unaffected — unlike the judgment
    prompt, its permitted content does not name the snapshotted field semantics.
sources:
- intake/scope.md
---

## What it is
The evaluator port and the production prompt carry each evidence item's own snapshotted field and concept semantics.
Citation validation checks a field against its own cited evidence item's snapshot, never a live schema lookup.
Judgment no longer depends on the capability registry to judge a hypothesis.

## Notes
None.
