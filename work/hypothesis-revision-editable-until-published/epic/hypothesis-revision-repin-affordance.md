---
title: The post-save repin affordance on the hypothesis-editing screen
summary: The curator's hypothesis-editing screen deciding, from the revision the draft's manifest entry pinned, whether the save it just made left anything to repin.
rationale: The scope names one screen and one affordance on it, so this is one epic rather than a split between reading the draft's manifest and rendering the offer, which no reader of the scope would recognise as two deliverables; it is cut as two tasks because the pin's availability answers to a different specification node than the offer's condition and each is falsifiable on its own. The covers list reaches past the one rule the scope names because the comparison the affordance turns on is a manifest entry's pinned revision inside a draft case version, and the eight uncovered entries are the neighbouring nodes of the same impact set a reviewer would otherwise expect a frontend task for.
sources:
- intake/scope-frontend.md
covers:
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
- rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
- rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
- rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
- rules/investigation/a-simulation-result-is-stale-once-its-source-changes
- domain/knowledge/manifest-entry
- domain/knowledge/hypothesis-revision
- domain/knowledge/case-version
- domain/knowledge/hypothesis
- contracts/knowledge/case-lifecycle
- scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
- scenarios/knowledge/revising-a-released-revision-creates-the-next
- scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
- constraints/listings-are-paged
- rules/knowledge/a-revise-answers-the-revision-number-it-saved
- rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
- rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version
- rules/knowledge/a-case-has-at-most-one-draft
uncovered:
- node: rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
  why: The obligation is on a surface presenting a case version's manifest entry, and this plan builds no such presentation; the survey reports the manifest screen already states that a higher revision exists by comparing the row's pinned revision against the highest one listed, and no task here changes that screen.
- node: rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
  why: The survey reports this comparison is already carried by the manifest screen's own row rendering; the screen this plan changes presents a save's answer rather than a manifest entry, and no task here alters what an entry states.
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  why: The order a hypothesis's revisions are answered in is the listing read's own concern, and no task here reads that order or reorders it; the pinned revision this plan compares against is taken from the manifest entry precisely so that no page of that listing decides it.
- node: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  why: Marking a shown simulation result stale belongs to the cockpit that shows it, and the scope names only what the hypothesis-editing screen offers after a save; no task here reads or marks a simulation result.
- node: contracts/knowledge/case-lifecycle
  why: The screen calls revise-hypothesis exactly as it calls it today and this plan changes neither the operation's request nor what it answers; the whole change is what one screen does with the revision number the existing answer already carries.
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  why: Every one of its then-clauses is a fact about stored revisions and a released version's manifest, which the backend epic at this work root delivers; this plan consumes the created-revision outcome and asserts none of those facts.
- node: scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
  why: Its then-clauses are about a shown simulation result being marked stale on return to the cockpit, which no task here reaches; it appears in this epic only because its given is the same in-place overwrite the affordance now recognises.
- node: constraints/listings-are-paged
  why: No listing is built or paged by this plan; the constraint stands behind one criterion here only as the reason a pinned revision is never recovered from a page of revisions, which rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown already states outright.
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  why: Both tasks under this epic take the revision number a revise wrote as given and decide only what the screen does with it; which revision that write lands on is the backend epic's own task at this work root, and neither frontend task reads or decides the released-reference fact this rule turns on.
- node: scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
  why: Every one of its then-clauses is a fact about the stored revision and the draft's own manifest entry after three overwrites, which the backend epic at this work root delivers and proves; the frontend screen this epic changes neither writes a revision nor asserts what the store now holds, only what it shows a curator given the revision number a save already answered.
---

## What it is
The one grouping for the frontend half of revising a hypothesis in place: the editing screen learning what its draft's manifest already pins, and offering the manifest-builder step only where the save moved the pin behind.
It reaches from the case-version read the form already performs to the success surface the curator lands on after saving.

## Notes
The survey reports the screen holds no logic beyond dispatching on the form state's phase, so the condition this epic introduces lands in the form hook rather than in the screen.
The survey reports the success phase renders exactly one control today, the manifest-builder button, and this plan states no replacement control for the case where that button is not offered.
The survey reports the form prefills from the highest revision the revisions listing answered, and no task here changes which revision the form prefills.
The survey reports the same case-version read is already cached under one key and narrowed differently by two hooks, and no task here adds a second request for the manifest.
