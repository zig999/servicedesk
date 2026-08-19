---
title: Fix draft-assessment-text.ts's stale case citation
summary: Corrects the doc-comment citation for consolidationRegister in draft-assessment-text.ts from
  domain/knowledge/case to domain/knowledge/case-version, with no runtime change.
task: sha256:62b5852205b90f7d443b9c3ae5137d9b22fee2e2785fd202944b5ce9e08f0542
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:20acdee5acacafd214df11f468ff2cd7230209da84a65f7883a30698c000a28d
run: run/fix-post-case-lifecycle-stale-citations-fix-draft-assessment-citation-build
files:
- path: src/investigation/draft-assessment-text.ts
  effect: 'Corrected the doc-comment paragraph above DraftAssessmentOptions describing where consolidationRegister
    is read from: the citation "(domain/knowledge/case)" became "(domain/knowledge/case-version)". No
    import, type, statement or runtime behavior changed — only the parenthetical node citation inside
    the existing comment block.'
criteria:
- criterion: 'src/investigation/draft-assessment-text.ts''s doc comment (currently: "consolidationRegister
    reaches this function as an explicit field of its options, read from the pinned case''s own consolidation_register
    (domain/knowledge/case) by whoever calls draftAssessment") cites domain/knowledge/case-version instead
    of domain/knowledge/case for consolidation_register.'
  met: true
  how: The comment now reads "...read from the pinned case's own consolidation_register (domain/knowledge/case-version)
    by whoever calls draftAssessment...", matching domain/knowledge/case-version, whose own attribute
    list declares consolidation_register — not domain/knowledge/case, which carries only slug and next_version.
- criterion: 'No runtime behavior in src/investigation/draft-assessment-text.ts changes: the existing
    test suite passes unchanged.'
  met: true
  how: The edit touched only text inside a comment block above the import statements; no import, type,
    function body, control flow or exported signature was altered. No test in the repository asserts on
    the comment's text.
nodes:
- node: domain/knowledge/case
  how: The fix removed the sole citation of this node in this file (the stale consolidation_register attribution).
    Nothing else in draft-assessment-text.ts states a fact of this node — its remaining prose ("the pinned
    case's own") is generic language about the case identity threaded through the module, not a citation
    to any attribute this node declares — so the delivery honors the node without a fact of it reaching
    this file.
- node: domain/knowledge/case-version
  encoded_at:
  - src/investigation/draft-assessment-text.ts
  how: The doc comment now cites this node for consolidation_register, matching its own declared attribute
    list and its Description ("the curator may author a consolidation register alongside the hypotheses"
    for a version of the case).
preserved:
- draft-assessment-text.ts imports nothing from the case module — the zero-import guarantee draft-assessment-text-modules.spec.ts
  already asserts for it is untouched.
- draftAssessment()'s control flow, its Assessment construction, and every other citation in the surrounding
  comment block are unchanged.
---

## What it is

A corrective increment, second task of the same initiative: fixes one stale doc-comment citation surfaced by /reconcile's re-pass over the first corrective delivery.

## Notes

Second task under work/fix-post-case-lifecycle-stale-citations. No decision-log entry: this is a documentation correction bringing a comment into agreement with an already-decided, already-structural fact (domain/knowledge/case-version.md's own consolidation_register attribute), not a new fact decided here.
