---
title: Hypothesis revision overwritten until a release adopts it
summary: The write path for revise-hypothesis, from the schema rule that permits an
  alteration through the store's decision fact to the operation's choice between replacing
  the highest revision's content and creating the next.
rationale: The scope names one rule and the three rules it decides against, all of
  which land on one operation and the one write path beneath it, so this plan is a
  single epic rather than a split between storage and behavior that no reader of the
  scope would recognise; the covers list is wider than the five nodes the scope names
  because the write path answers to the domain nodes those rules constrain and to
  the schema constraint the migration lands under, and the five uncovered entries
  are the neighbouring nodes of the same impact set a reviewer would otherwise expect
  a task for.
sources:
- intake/scope.md
covers:
- contracts/knowledge/case-lifecycle
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/a-hypothesis-revision-number-is-never-reused
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- domain/knowledge/case-version
- domain/knowledge/manifest-entry
- scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
- scenarios/knowledge/revising-a-released-revision-creates-the-next
- scenarios/knowledge/a-released-version-keeps-its-original-revision
- constraints/the-schema-replays-from-its-scripts
- constraints/the-domain-depends-on-no-infrastructure
- constraints/the-stored-schema-mirrors-the-declared-model
- rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
- rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
- rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
- scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
uncovered:
- node: constraints/the-stored-schema-mirrors-the-declared-model
  why: The schema work in this plan replaces a rewrite rule over an existing relation
    and adds no relation and no column, so the column-to-attribute pairing this constraint
    states is neither extended nor changed by anything here.
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  why: The scope asks for the target a revise writes to and nothing about how a hypothesis's
    revisions are listed back; the survey reports the existing listing answers ascending,
    and no task here reads or reorders it.
- node: rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
  why: Disclosure is a condition on a surface presenting an entry, and this backend
    plan builds no presentation; an in-place overwrite leaves the pinned number the
    highest the hypothesis holds, so it raises nothing for that surface to disclose.
- node: rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
  why: The survey reports this comparison is unbuilt today, and the scope names only
    revise-hypothesis's choice of target revision; this plan leaves it exactly as
    it found it.
- node: scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
  why: Marking a shown simulation result stale is the case-simulation read's own concern;
    this plan writes the revision and marks nothing.
- node: scenarios/knowledge/a-released-version-keeps-its-original-revision
  why: Its given requires a second draft adopting a later revision and that later version
    itself being released, a flow no task here states; the released-side guarantee it
    demonstrates is already carried by scenarios/knowledge/revising-a-released-revision-creates-the-next's
    own then-clauses (the released version's manifest and its referenced revision unchanged
    after a further revise), which one of this epic's tasks does implement.
---

## What it is
The one grouping for everything revise-hypothesis needs in order to write into the hypothesis's own highest existing revision while no released case version has adopted it, and to create the next revision once one has.
It reaches from the stored schema's refusal of an alteration, through the fact the store answers about the highest revision, to the operation that chooses between the two writes.

## Notes
The survey reports the existing schema refuses every UPDATE to a hypothesis revision unconditionally rather than only a released one, which is why a schema task sits inside this epic rather than beside it.
The survey reports the always-insert write path already in place is reused for the create-the-next half, so no task here rebuilds it.
No task here changes what the operation answers to its caller.
