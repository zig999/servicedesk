---
title: Fix post-case-lifecycle stale citations in four investigation/case doc comments
summary: Corrects doc-comment attributions in validate-case-coherence.ts, judgment-stage.ts, citation-validation.ts
  and resolve-and-narrow-input.ts so title, when_to_use, subject, fallback, collects, resolution and criterion
  cite domain/knowledge/case-version and domain/knowledge/hypothesis-revision instead of the now-stale
  domain/knowledge/case and domain/knowledge/hypothesis, with no change to any file's runtime behavior.
task: sha256:bd88368e64a34e1cd934456595efdfaefcb1bd089f0300abd1c80a5d60cd2b2e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:20acdee5acacafd214df11f468ff2cd7230209da84a65f7883a30698c000a28d
run: run/fix-post-case-lifecycle-stale-citations-fix-stale-citations-build-2
files:
- path: src/case/validate-case-coherence.ts
  effect: unchanged behavior; namedVocabularyTerms()'s doc comment now cites domain/knowledge/case-version
    for the declared subject and the fallback's own resolution and domain/knowledge/hypothesis-revision
    for each hypothesis's own resolution, and conceptViolations()'s doc comment now cites domain/knowledge/case-version
    for the case's collection plan
- path: src/investigation/judgment-stage.ts
  effect: unchanged behavior; the module header, runIsolatedCall()'s doc comment and hypothesisNamed()'s
    doc comment now attribute the CaseContext's title/when_to_use and the pinned lookup to the case version
    rather than to the case identity ("the pinned case version" instead of "the pinned case")
- path: src/investigation/citation-validation.ts
  effect: unchanged behavior; HypothesisCitationContext's doc comment now cites domain/knowledge/hypothesis-revision
    for collects instead of domain/knowledge/hypothesis
- path: src/investigation/resolve-and-narrow-input.ts
  effect: unchanged behavior; the module header's citation for NarrowedInput's shape now reads domain/knowledge/hypothesis-revision
    for a hypothesis's own criterion and domain/knowledge/case-version for the case version's when_to_use,
    instead of domain/knowledge/hypothesis and domain/knowledge/case
criteria:
- criterion: src/case/validate-case-coherence.ts's namedVocabularyTerms() doc comment cites domain/knowledge/case-version
    for subject and fallback, and domain/knowledge/hypothesis-revision for the hypotheses' own resolutions,
    instead of domain/knowledge/case and domain/knowledge/hypothesis.
  met: true
  how: The doc comment above namedVocabularyTerms() now reads "...the declared subject and the fallback's
    own resolution (domain/knowledge/case-version), and every outcome, action and recipient of every hypothesis's
    own resolution (domain/knowledge/hypothesis-revision, domain/knowledge/resolution, domain/knowledge/referral)."
    No code in the function changed — only the citation and its wording.
- criterion: src/case/validate-case-coherence.ts's conceptViolations() doc comment cites domain/knowledge/case-version
    for the case's collection plan, instead of domain/knowledge/case.
  met: true
  how: 'conceptViolations()''s doc comment now reads "...deduplicated the way the case''s own collection
    plan deduplicates them (domain/knowledge/case-version): a concept the glossary does not hold is named..."
    — only the parenthetical citation changed.'
- criterion: src/investigation/judgment-stage.ts's caseContext construction and hypothesisNamed() attribute
    title and when_to_use to the case version, never to the case identity, in their comments/naming.
  met: true
  how: The module header now reads "The pinned case version's own CaseContext — its title and when_to_use
    — is computed once from the case version this call was given..."; runIsolatedCall()'s doc comment
    now reads "The pinned case version's own caseContext rides along unchanged..."; hypothesisNamed()'s
    doc comment now reads "The hypothesis named within the pinned case version — ...". The caseContext
    construction itself and hypothesisNamed()'s lookup logic are byte-identical; only the prose describing
    what theCase stands for was corrected.
- criterion: src/investigation/citation-validation.ts's HypothesisCitationContext doc comment and src/investigation/resolve-and-narrow-input.ts's
    NarrowedInput doc comment both cite domain/knowledge/hypothesis-revision for collects and/or criterion,
    instead of domain/knowledge/hypothesis.
  met: true
  how: citation-validation.ts's HypothesisCitationContext doc comment now reads "...its own collects (or
    just that array, per domain/knowledge/hypothesis-revision — this check takes the plain array...)".
    resolve-and-narrow-input.ts's module header, which states NarrowedInput's own shape, now cites "(domain/knowledge/hypothesis-revision,
    domain/knowledge/case-version)" for "a hypothesis's own criterion or the case version's when_to_use",
    in place of "(domain/knowledge/hypothesis, domain/knowledge/case)".
- criterion: 'No runtime behavior in any of the four files changes: the existing test suite passes unchanged.'
  met: true
  how: Every edit across the four files is confined to a doc comment or header block; no function body,
    branch, return value, type, export or import was touched in any edit. A diff of each file shows only
    comment text changed.
nodes:
- node: domain/knowledge/case
  how: The fix removes every citation of this node from the four files' doc comments that had wrongly
    attributed a case-version fact (subject, fallback, collection plan) to it. The node's own remaining
    fact among these files — the case's stable slug — was never itself misattributed, so this task honors
    the node without newly encoding any of its facts in these four files.
- node: domain/knowledge/hypothesis
  how: The fix removes the two stale citations of this node (validate-case-coherence.ts's namedVocabularyTerms()
    and citation-validation.ts's HypothesisCitationContext) that had attributed a hypothesis-revision
    fact (a resolution's outcome/action/recipient, and collects) to it. The node's own remaining fact
    among the four files — a hypothesis's stable name — was already correctly unattributed to any node
    citation.
- node: domain/knowledge/case-version
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: namedVocabularyTerms()'s and conceptViolations()'s doc comments in validate-case-coherence.ts now
    cite this node for the subject, the fallback's own resolution and the collection plan; judgment-stage.ts's
    module header and its caseContext-construction and hypothesisNamed() doc comments now attribute title,
    when_to_use and the pinned lookup to the case version rather than the case identity; resolve-and-narrow-input.ts's
    header comment now cites this node for the case version's when_to_use.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/investigation/citation-validation.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: namedVocabularyTerms()'s doc comment in validate-case-coherence.ts now cites this node for each
    hypothesis's own resolution; citation-validation.ts's HypothesisCitationContext doc comment now cites
    this node for collects; resolve-and-narrow-input.ts's header comment now cites this node for a hypothesis's
    own criterion.
inferences:
- inferred: namedVocabularyTerms()'s doc comment splits its citation rather than using one blanket node
    — case-version for the declared subject and the fallback's own resolution, hypothesis-revision for
    every hypothesis's own resolution — instead of citing both nodes for everything jointly.
  from: domain/knowledge/case-version.md declares subject and fallback as its own attributes, and domain/knowledge/hypothesis-revision.md
    declares resolution as its own attribute; the function's own code (declaredResolutions()) already
    treats the hypotheses' resolutions and the fallback's resolution as coming from those two distinct
    sources.
- inferred: resolve-and-narrow-input.ts's header citation for the case's when_to_use was corrected to
    domain/knowledge/case-version alongside the hypothesis-to-hypothesis-revision swap the criterion named,
    rather than left citing domain/knowledge/case.
  from: the task objective's general mandate ("every doc comment... that currently attributes a fact to
    domain/knowledge/case or domain/knowledge/hypothesis... cites the correct node") and domain/knowledge/case-version.md's
    own text, which states when_to_use now belongs to case-version rather than case — the same fact criterion
    3 already required correcting in judgment-stage.ts's comments, applied consistently to the one parenthetical
    in this file that named both stale nodes together.
preserved:
- validate-case-coherence.ts's namedVocabularyTerms(), vocabularyViolations(), conceptViolations(), capabilityViolations()
  and answerGaps() return exactly the same violation strings and check exactly the same rules as before.
- judgment-stage.ts's judgeHypotheses()/judgeOneHypothesis()/runIsolatedCall()/retryOrFail() pool, deadline,
  retry and citation-validation control flow, and the CaseContext values passed to evaluator.evaluate(),
  are unchanged.
- citation-validation.ts's isCitationValid()/acceptedCitations()/declaredFieldsOf() structural checks
  are unchanged.
- resolve-and-narrow-input.ts's resolveAndNarrow()/narrowInput()/narrowedEvidenceOf() outcome resolution
  and narrowing logic are unchanged.
deferred:
- what: src/case/case.ts's doc comment on Case.authored_at ("domain/knowledge/case's own authored_at")
    is stale the same way — authored_at now belongs to case-version per domain/knowledge/case-version.md
    — and src/investigation/hypothesis-evaluator.port.ts's CaseContext and IHypothesisEvaluator doc comments
    still attribute title and when_to_use to "the pinned case" generically, and judgment-stage.ts's own
    header line 1 ("a pinned case's required hypotheses") was left as prose about hypotheses rather than
    about title/when_to_use.
  why: None of these is one of the four files this task names, and the task's objective and criteria are
    scoped to exactly those four; correcting other files or comments carrying the same stale attribution
    would widen a corrective task cut for a specific, named set of citations.
---

## What it is

A corrective increment: fixes four already-delivered doc-comment citations, stale since the case-lifecycle initiative split case/hypothesis identity from case-version/hypothesis-revision content, surfaced by /reconcile.

## Notes

This is a corrective increment (task/fix-post-case-lifecycle-stale-citations/fix-stale-citations): the survey and decomposition steps did not run, per the corrective-increment path — the scope is one documentation-only citation fix across four named files, held by the human rather than discovered from the tree. Deferred: two further files (case.ts, hypothesis-evaluator.port.ts) carry the same class of stale citation but sit outside the four files this task names — left for a future task.
