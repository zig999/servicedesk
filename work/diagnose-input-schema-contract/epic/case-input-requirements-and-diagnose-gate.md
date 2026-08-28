---
title: Derived case-version input requirements and the diagnose entry gate
summary: The derived read of a case version's input requirements from its collection
  plan's capabilities, and the diagnose entry-point refusal that holds a subject to
  what those requirements name required.
sources:
- work/diagnose-input-schema-contract/intake/scope.md
covers:
- domain/glossary/subject-attribute
- domain/glossary/concept
- domain/investigation/subject
- domain/investigation/subject-attribute-value
- domain/knowledge/case-version
- domain/knowledge/case-summary
- domain/knowledge/case-input-requirement
- domain/knowledge/hypothesis-revision
- domain/knowledge/manifest-entry
- rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
- rules/investigation/only-a-released-case-version-is-diagnosed
- rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
- rules/investigation/a-subject-carries-at-least-one-attribute
- rules/investigation/a-cited-field-exists-in-the-capability-output-schema
- rules/knowledge/a-case-versions-input-requirements-are-derived
- rules/knowledge/every-collected-concept-has-a-read-only-capability
- rules/knowledge/the-contract-check-reads-the-current-registration
- rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
- rules/knowledge/case-terms-exist-in-the-glossary
- contracts/knowledge/case-input-requirements
- contracts/knowledge/capability-check
- contracts/knowledge/case-query
- contracts/investigation/diagnosis
- contracts/investigation/case-simulation
- scenarios/integration/a-legacy-capability-declares-no-input-attributes
- scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
uncovered:
- node: domain/glossary/subject-attribute
  why: The vocabulary entry itself is unchanged; this plan reads existing entries
    rather than defining new ones.
- node: domain/glossary/concept
  why: Unchanged; read through the collection plan, never altered by this increment.
- node: domain/investigation/subject
  why: The scope states no new field on the diagnose request's subject; the gate reads
    its existing attribute-values.
- node: domain/investigation/subject-attribute-value
  why: Unchanged; read by the gate, not altered.
- node: domain/knowledge/case-summary
  why: Unrelated to input requirements; this plan adds no fact to the case-level summary
    read.
- node: domain/knowledge/hypothesis-revision
  why: Its collects/criterion shape is unchanged; the derived read consumes the existing
    collection-plan operation.
- node: domain/knowledge/manifest-entry
  why: Unchanged; the collection plan it feeds is read as-is.
- node: rules/investigation/only-a-released-case-version-is-diagnosed
  why: The released-state check already stands ahead of where this plan's gate sits;
    this increment does not touch it.
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  why: Unchanged; unrelated to whether a required attribute is present, only to whether
    an attribute name is governed.
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  why: Unchanged pre-existing invariant, unrelated to case-input coverage.
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  why: Concerns the output schema and citations, not the input schema this increment
    governs.
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  why: An existing output-side check at hypothesis-revision authoring time, distinct
    from the new input-side derivation.
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  why: Unrelated to input requirements.
- node: rules/knowledge/case-terms-exist-in-the-glossary
  why: Unrelated to the input-schema contract.
- node: contracts/knowledge/capability-check
  why: The existing output-side consumed read is untouched; this plan adds a sibling
    input-side read rather than extending it.
- node: contracts/knowledge/case-query
  why: The existing read-case operation is consumed as-is; this plan adds no new operation
    to it.
- node: contracts/investigation/case-simulation
  why: The scope confines the new refusal to diagnose's own entry point; simulate-case
    and simulate-hypothesis are not held to it.
rationale: This epic groups the knowledge-context derivation and the investigation-context
  gate that consumes it, since the gate cannot be demonstrated without the derived
  requirements existing first. Domain and rule nodes describing case, subject and
  glossary shapes that this plan reads but does not alter are covered here and marked
  uncovered, since they sit closest to the two tasks that do change behavior.
---

## What it is
The derived, per-case-version read of which subject attributes its collection plan's capabilities require or accept, and which capabilities ask for each.
The diagnose entry-point refusal that holds an incoming subject to what that derived read names required, before any collection runs.

## Notes
None.
