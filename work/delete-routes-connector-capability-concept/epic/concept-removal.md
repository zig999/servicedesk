---
title: Removing a registered concept
summary: remove-concept end to end — a deletion of the concept row with its accepted subject types, the
  operation that refuses where a capability answers the concept or evidence, a citation or a hypothesis-revision's
  collects names it, and the DELETE route on the concept name.
rationale: Cut as its own epic because its guard has four conditions over three different stores, one
  reason to change that no other removal shares. As with the capability removal, the guard and the removal
  stay in one task because they are branches of one rule statement. The store task is separated from the
  operation because the glossary store port has no delete-shaped method at all and the concept's accepted-subject-type
  rows are a second relation the deletion must reach.
sources:
- intake/scope.md
covers:
- contracts/glossary/glossary-authoring
- domain/glossary/concept
- constraints/a-successful-concept-removal-answers-with-no-content
- rules/glossary/a-registered-concept-is-never-removed
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- constraints/no-route-enforces-authentication
- constraints/the-domain-depends-on-no-infrastructure
- constraints/the-system-persists-to-one-relational-database
- domain/glossary/subject-type
- rules/glossary/a-concept-declares-its-description
- rules/glossary/a-concept-with-an-empty-description-is-read-as-awaiting-one
- rules/glossary/a-description-states-meaning-never-policy
- rules/glossary/a-vocabulary-holds-each-name-once
- rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
- rules/knowledge/case-terms-exist-in-the-glossary
- rules/knowledge/a-collected-concept-declares-a-ttl
- rules/knowledge/a-concept-accepts-the-declared-subject-type
- rules/knowledge/a-case-versions-input-requirements-are-derived
- rules/knowledge/a-concept-answered-by-none-or-several-capabilities-contributes-no-input-requirement
- domain/knowledge/case-input-requirement
- domain/knowledge/case-version
- constraints/a-case-is-read-whole
uncovered:
- node: rules/glossary/a-concept-declares-its-description
  why: A registration-time refusal over a submitted concept; a removal submits none and reads no description.
- node: rules/glossary/a-concept-with-an-empty-description-is-read-as-awaiting-one
  why: Governs how a read presents a legacy concept; a removal presents nothing.
- node: rules/glossary/a-description-states-meaning-never-policy
  why: Governs what a description may say; no task here authors or reads one.
- node: rules/glossary/a-vocabulary-holds-each-name-once
  why: A read-time refusal where a name is held twice, unchanged by a removal.
- node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
  why: The read already refuses the state a successful removal leaves behind; no task changes it.
- node: rules/knowledge/case-terms-exist-in-the-glossary
  why: The removal guard exists so this rule stays true, and adds nothing to what it already requires
    of a hypothesis-revision at curation time; its own refusal is untouched.
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  why: A registration-time and curation-time requirement on a concept's ttl, unchanged.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  why: A curation-time refusal comparing a collected concept's accepts against a version's subject type,
    unchanged by a removal.
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  why: The derivation is recomputed on every read and stores nothing, so a removal changes no stored requirement
    and no task alters the derivation.
- node: rules/knowledge/a-concept-answered-by-none-or-several-capabilities-contributes-no-input-requirement
  why: Part of that same derivation, untouched.
- node: domain/knowledge/case-input-requirement
  why: Derived and never stored, so nothing about it is read or written by a removal.
- node: domain/knowledge/case-version
  why: The guard was decided over any hypothesis-revision's own collects, manifested or not, so it reads
    no case version's manifest and no version's own record.
- node: constraints/a-case-is-read-whole
  why: Governs the assembled, validated read a diagnosis performs; no removal performs it.
---

## What it is
The removal with the widest guard: four conditions the rule names, spanning a registered capability's own concept, a recorded evidence item, an evaluation's citation and any hypothesis-revision's collects.
Its store method, its guarded operation and its route are three tasks, the store port and the route each being an interface whose consumer is the task before it.

## Notes
The decision log records the guard being broadened from manifested revisions to any hypothesis-revision's own collects, because every foreign key against the concepts relation carries no cascade regardless of manifestation.
The rule's first clause — that registering concepts removes no concept already held — is standing behavior rather than new work, and this plan cuts no task for it.
The specification states no HTTP status and no error name for this refusal; the criteria hold it to being named in the status map rather than to a particular status.
