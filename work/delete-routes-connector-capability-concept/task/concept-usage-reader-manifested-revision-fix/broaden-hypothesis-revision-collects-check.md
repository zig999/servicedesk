---
title: concept-usage-reader's fourth branch answers named for a manifested hypothesis-revision too
summary: resolveConceptUsage's hypothesis-revision-collects branch reports a concept as named whether or
  not a case version currently manifests the hypothesis-revision that collects it, matching the governing
  rule's own decided text.
rationale: Corrective increment. The wrong behavior is observed, not planned — /review-change's conformance
  pass found resolveConceptUsage's fourth branch calling isConceptCollectedByUnmanifestedHypothesisRevision,
  which answers named only for an unmanifested hypothesis-revision — the narrower reading the rule held before
  knowledge/decision-log.md's 2026-09-18 entry broadened it to any hypothesis-revision's own collects.
sources:
- intake/2026-09-22-concept-usage-reader-manifested-revision-gap.md
objective: The concept usage reader's hypothesis-revision-collects branch reports a concept as named
  when any hypothesis-revision's own collects lists it, whether or not a case version currently manifests
  that revision.
criteria:
- Given a hypothesis-revision whose own collects lists the queried concept, and a case version that currently
  manifests that revision, the reader answers that the concept is named, through reference "hypothesis-revision-collects",
  regardless of whether that hypothesis-revision's own state is draft or released.
- Given a hypothesis-revision whose own collects lists the queried concept, and no case version that manifests
  that revision, the reader still answers that the concept is named, through reference "hypothesis-revision-collects",
  exactly as it already did, regardless of whether that hypothesis-revision's own state is draft or released.
- Given no hypothesis-revision whose own collects lists the queried concept, the reader does not answer
  named through this reference, whether or not any case version manifests any hypothesis-revision at all,
  and whatever state any hypothesis-revision in the case holds.
reference:
- src/src/factories/concept-usage-reader.factory.ts
- src/src/persistence/relational-case-store.repository.ts
- knowledge/decision-log.md
implements:
- rules/glossary/a-registered-concept-is-never-removed
- domain/knowledge/hypothesis-revision
- constraints/the-domain-depends-on-no-infrastructure
---

## What it is
The one-branch fix: resolveConceptUsage's fourth condition no longer excludes a manifested hypothesis-revision
from the hypothesis-revision-collects reference.

## Notes
BLOCKING notes do not apply here; this is a corrective increment answering an observed defect, not a
planning silence.
REMAINDER, from the specification — the rule's registering clause, its other three usage conditions
(capability, evidence, citation), its HTTP 409/ConceptInUseError transport shape, and its subject-type
closing clause all reach no criterion of this task; each belongs to a sibling delivered task, per the
epic's own Notes.
ADVISORY, from the specification — constraints/the-domain-depends-on-no-infrastructure governs this task
(the fix spans the factory and the case-store port) but no criterion demonstrates it directly; the fix
must reach the broadened check through the existing port, never by importing a driver into the factory.
unstated, from the specification — resolved before this task was finalized: no node stated that the reader
reports a reference identifying what still names a concept, or that the reference for the
hypothesis-revision-collects condition is that literal string. The material
(intake/2026-09-22-concept-usage-reader-manifested-revision-gap.md) already stated both halves, so
rules/glossary/a-registered-concept-is-never-removed.md's statement now states it too, disclosed in
knowledge/decision-log.md.
