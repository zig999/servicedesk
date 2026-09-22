# Corrective increment: concept-usage-reader's fourth branch misses a manifested hypothesis-revision

## The wrong behavior

`/review-change`'s conformance pass over this initiative's own delivery found that
`resolveConceptUsage`'s fourth branch in `src/factories/concept-usage-reader.factory.ts` calls
`caseStore.isConceptCollectedByUnmanifestedHypothesisRevision(concept)` — which answers only for a
hypothesis-revision no case version currently manifests. `rules/glossary/a-registered-concept-is-never-removed`
was decided during this same initiative's own `/analyse` to cover a concept collected by *any*
hypothesis-revision's own `collects`, manifested or not, because `hypothesis_revision_collects.concept_name`
carries no `ON DELETE CASCADE`. A concept collected by a **manifested** hypothesis-revision therefore
never trips this branch, so `remove-concept` can proceed against it — the glossary row is removed
while a manifested `hypothesis_revision_collects` row still names it, precisely the dangling reference
the rule exists to prevent.

## Reproduction

1. Register a concept.
2. Author a hypothesis-revision whose `collects` lists that concept.
3. Manifest that revision in a case version's own manifest (so a `case_version_manifest_entries` row —
   or equivalent — now points at it).
4. Call `GlossaryService.removeConcept(name)` (or `DELETE /v1/glossary/concepts/:name`) for that concept.
5. Observed: the removal succeeds (204), and the concept row is gone, even though the manifested
   hypothesis-revision still names it in its own `collects`.
6. Expected, per the rule's own decided text: the removal is refused with `ConceptInUseError`
   (reference `hypothesis-revision-collects`), exactly as it already is for the *unmanifested* case.

## File

`src/factories/concept-usage-reader.factory.ts` — specifically `resolveConceptUsage`'s fourth
conditional branch (lines 36-38 at time of observation), which calls
`isConceptCollectedByUnmanifestedHypothesisRevision` where the rule's decided text requires
checking whether *any* hypothesis-revision's own `collects` lists the concept.
