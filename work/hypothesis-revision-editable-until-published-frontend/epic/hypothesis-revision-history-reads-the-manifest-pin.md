---
title: The hypothesis revision history reads the target version's own manifest pin
summary: The case detail screen's hypothesis revision history correcting its notion of "current" to the
  case version's own manifest entry, instead of the hypothesis's own highest-ever revision number.
rationale: 'The corrective route''s own procedure: covers is seeded mechanically from trace.py --encodes
  over the one file the human named, closed one hop through the specification exactly as an ordinary epic''s
  constraints/ candidates are closed, never by reading for topical relevance.'
sources:
- intake/corrective-hypothesis-revision-history-pin.md
covers:
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-hypothesis-revision-number-is-never-reused
- domain/glossary/concept
- domain/knowledge/resolution
- domain/knowledge/hypothesis
- domain/knowledge/manifest-entry
- rules/glossary/a-registered-concept-is-never-removed
- rules/glossary/an-outcome-is-contributed-by-a-confirmable-hypothesis
- rules/investigation/a-citation-stays-within-the-hypothesis-collects
- rules/investigation/a-simulation-result-is-stale-once-its-source-changes
- rules/knowledge/a-collected-concept-declares-a-ttl
- rules/knowledge/a-concept-accepts-the-declared-subject-type
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- rules/knowledge/a-hypothesis-declares-a-criterion
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
- rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
- rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
- rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/a-revise-answers-the-revision-number-it-saved
- rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
- rules/knowledge/case-terms-exist-in-the-glossary
- rules/knowledge/every-collected-concept-has-a-read-only-capability
- rules/knowledge/every-position-declares-a-resolution
- rules/knowledge/one-falsifiable-claim-per-criterion
- scenarios/investigation/a-single-hypothesis-is-simulated
- scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
- scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
- scenarios/knowledge/a-released-version-keeps-its-original-revision
- scenarios/knowledge/revising-a-released-revision-creates-the-next
- rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version
- domain/knowledge/case-version
- rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version
uncovered:
- node: domain/glossary/concept
  why: Reached only through hypothesis-revision's declared collects attribute type; this task reads no
    collects field, only compares revision numbers to mark a row.
- node: domain/knowledge/hypothesis
  why: Reached through manifest-entry's relationship target and the fact's own vocabulary ("the case's
    hypotheses"); no criterion resolves a hypothesis's own identity or name — the task takes the hypothesis
    it is opened for as given.
- node: domain/knowledge/resolution
  why: Reached only through hypothesis-revision's declared resolution attribute type; no criterion reads
    or renders a resolution.
- node: rules/glossary/a-registered-concept-is-never-removed
  why: Reached only through hypothesis-revision's collects relationship; this task never reads, removes
    or registers a concept.
- node: rules/glossary/an-outcome-is-contributed-by-a-confirmable-hypothesis
  why: Reached only through hypothesis-revision's resolution outcome; no criterion touches an outcome.
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  why: Reached only through hypothesis-revision's collects relationship; this task is a display marking,
    never an investigation citation.
- node: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  why: Reached through hypothesis-revision's own involved list; this task marks a manifest pin in a revision-history
    table, never a simulation result or its staleness.
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  why: Reached only through hypothesis-revision's collects relationship; untouched by a revision-marking
    fix.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  why: Reached only through hypothesis-revision's collects constrains; no criterion performs a subject-type
    check.
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  why: Reached only through hypothesis-revision's constrains; untouched by a revision-marking fix.
- node: rules/knowledge/a-hypothesis-declares-a-criterion
  why: Reached only through hypothesis-revision's constrains; the criterion text is rendered by this table
    but never asserted or validated by this task's own criteria.
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  why: Governs the revise operation's own draft-gate refusal; this task fixes which row is marked current
    and neither performs nor gates a revise. Belongs to the task implementing the revise-hypothesis action's
    own offer condition.
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  why: Governs where a revise itself writes (in place or the next revision); this task takes the pinned
    revision as given and performs no write.
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  why: Its numbering-uniqueness guarantee is never asserted or exercised by a read-only marking fix; seeded
    from the file's pre-existing trace binding, not from anything this correction changes.
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  why: Governs the answer order of the hypothesis-revisions listing this table renders; this task decides
    only which row is marked, never the order or paging of the listing. Belongs to the task delivering
    that listing's own answer order.
- node: rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
  why: Governs a disclosure on the presented manifest entry itself (that a higher revision exists); this
    task's marking is inside the revision history table, not on the entry as presented. Belongs to another
    task of this epic, over the presented manifest entry's own disclosure.
- node: rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
  why: Governs the same presented-entry disclosure (whether the pin is the latest); this task creates
    exactly the situation it governs but states nothing about it. Belongs to the same task as the node
    above.
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  why: Governs a revise's own refusal against a frozen revision; this task performs no write and neither
    offers nor refuses a revise.
- node: rules/knowledge/a-revise-answers-the-revision-number-it-saved
  why: Governs what a completed revise states to a curator; this task never performs or completes a revise.
- node: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
  why: Governs the post-revise manifest-builder offer; unrelated to marking a row current in the revision
    history table before any revise runs.
- node: rules/knowledge/case-terms-exist-in-the-glossary
  why: Reached only through hypothesis-revision's collects glossary constraint; untouched by a revision-marking
    fix.
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  why: Reached only through hypothesis-revision's constrains; untouched by a revision-marking fix.
- node: rules/knowledge/every-position-declares-a-resolution
  why: Reached only through hypothesis-revision's constrains (a manifest position's own resolution pairing);
    this task marks a revision row, never a manifest position.
- node: rules/knowledge/one-falsifiable-claim-per-criterion
  why: Reached only through hypothesis-revision's constrains (the criterion's own wording rule); untouched
    by a revision-marking fix.
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  why: Reached through hypothesis-revision's own involved list; this task never simulates a hypothesis.
- node: scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
  why: Reached through hypothesis-revision's own involved list; this task never marks or reads a simulation
    result's staleness.
- node: scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
  why: Reached through hypothesis-revision's own involved list; its then-clauses are store-side facts
    about an overwrite this read-only task neither writes nor demonstrates.
- node: scenarios/knowledge/a-released-version-keeps-its-original-revision
  why: Reached through hypothesis-revision's own involved list; its then-clauses are about a released
    version's own stored content, which this task neither writes nor demonstrates.
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  why: Reached through hypothesis-revision's own involved list; its then-clauses are store-side facts
    about creating a next revision, which this read-only marking task neither writes nor demonstrates.
---

## What it is
The one screen this correction reaches: the case detail screen's per-hypothesis revision history, which today labels "current" by the hypothesis's own highest revision number rather than by what the target case version's manifest actually pins.

## Notes
None.
