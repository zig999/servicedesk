---
title: revise-hypothesis operation
summary: Creates a new hypothesis-revision — and the hypothesis's own identity, the first time its name is used — never altering an existing revision and never touching any manifest.
rationale: None — the scope's §0 distinction ("revise-hypothesis and place-hypothesis are two operations, not one") states this task's boundary directly.
sources:
- work/case-lifecycle/intake/scope.md
objective: A curator may revise a hypothesis's own content, producing a new numbered revision without altering any existing one and without changing any version's manifest.
criteria:
- Revising a hypothesis never named for the case creates its identity and its first revision, numbered 1.
- Revising a hypothesis already named for the case creates a new revision numbered one past its own highest existing revision, never altering an existing revision's own row.
- Revising with an empty collects list is refused, naming that the revision collects no concept.
- Revising with a collected concept the glossary does not currently hold is refused, naming the concept.
- Revising with a collected concept that does not accept the case version's own declared subject type is refused, naming both.
- revise-hypothesis on its own changes no version's manifest.
depends_on:
- task/case-lifecycle-persistence/relational-case-store-for-lifecycle
- task/case-lifecycle-domain-model/aggregate-types-and-structural-validation
implements:
- contracts/knowledge/case-lifecycle
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- domain/knowledge/case-version
- rules/knowledge/a-hypothesis-revision-number-is-never-reused
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/a-hypothesis-name-is-unique-within-its-case
- rules/knowledge/case-terms-exist-in-the-glossary
- rules/knowledge/a-concept-accepts-the-declared-subject-type
---

## What it is

The one place a hypothesis's content changes, always by adding a revision rather than editing one.
Placing that revision into a draft's manifest is a different operation, one task over.

## Notes

UNDERDETERMINED, from the specification — rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft states that a hypothesis is revised only while its case holds a draft version. No criterion of this task refuses revising when the case's draft version is missing; only the subject-type-anchoring clause of that same rule's statement is answered, by criterion 5. A test must exclude: an implementation of revise-hypothesis that creates a hypothesis's identity and first revision (or a next revision) for a case that currently holds no draft version at all — every existing version released, or the case holding no version yet — without refusing, while still satisfying every one of criteria 1 through 6 exactly as written.
REMAINDER, from the specification — rules/knowledge/every-collected-concept-has-a-read-only-capability states that every concept a hypothesis-revision names has a registered read-only capability declaring an output schema and a timeout. No criterion of this task refuses a collected concept that lacks one, alongside the three refusals criteria 3-5 do state. Belongs to: the case-version read/validation act described by rules/knowledge/validation-runs-at-every-read and rules/knowledge/the-contract-check-reads-the-current-registration, which frame the capability check as re-verified at every read of a case version against the registry as it currently stands, not as a revise-hypothesis-time refusal.
