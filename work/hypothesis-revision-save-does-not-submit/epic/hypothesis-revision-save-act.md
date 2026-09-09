---
title: The revise act on the hypothesis revision screen
summary: What a curator's save on the hypothesis revision screen must reach, and the proof that fails when it does
  not.
rationale: 'Seeded from trace.py --encodes over the file the human named, then extended by reading to the four rules
  that state the revise moment itself and the three the screen''s own pre-checks answer: the encoded set names what
  that file already answered for, and a save that never dispatches is a failure of the act, which lives in nodes
  no binding on that file had yet reached.'
sources:
- intake/scope.md
covers:
- domain/glossary/action
- domain/glossary/concept
- domain/glossary/outcome
- domain/glossary/recipient
- domain/glossary/subject-type
- domain/knowledge/case-version
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- domain/knowledge/referral
- domain/knowledge/resolution
- rules/knowledge/an-abandoned-revision-composition-writes-nothing
- rules/knowledge/case-terms-exist-in-the-glossary
- rules/knowledge/every-position-declares-a-resolution
- rules/knowledge/a-revise-answers-the-revision-number-it-saved
- rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/a-hypothesis-declares-a-criterion
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- rules/knowledge/a-concept-accepts-the-declared-subject-type
uncovered:
- node: domain/glossary/action
  why: The referral's action reaches the revise from a selection this correction does not touch; the save carries
    whatever the composition already held.
- node: domain/glossary/concept
  why: The collects selection is unchanged by this correction; the save carries the concepts the composition already
    held.
- node: domain/glossary/outcome
  why: The resolution outcome reaches the revise from a selection this correction does not touch.
- node: domain/glossary/recipient
  why: The referral's recipient reaches the revise from a selection this correction does not touch.
- node: domain/glossary/subject-type
  why: 'The save composes no subject type: a revise-hypothesis request declares none, and the acceptance check reads
    the draft version''s own subject type server-side.'
- node: domain/knowledge/case-version
  why: The save touches no case version; the draft this revise is anchored to is read by the operation, server-side.
- node: domain/knowledge/referral
  why: Carried into the revise by the composition unchanged; no criterion of this plan states its shape.
- node: domain/knowledge/resolution
  why: Carried into the revise by the composition unchanged; no criterion of this plan states its shape.
- node: rules/knowledge/case-terms-exist-in-the-glossary
  why: Its refusal is the revise-hypothesis operation's, server-side, and the terms a case version itself names
    belong to case-version authoring.
- node: rules/knowledge/every-position-declares-a-resolution
  why: The hypothesis-revision half is already held by the delivered composition, which this correction does not
    change; the case version's fallback half belongs to case-version authoring.
- node: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
  why: No criterion of this task reaches the offer a completed revise owes; the task carries the binder's underdetermined
    note over it, and answering it is a separate increment.
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  why: Where a revise's write lands is the revise-hypothesis operation's, delivered server-side.
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  why: The draft anchor and its refusal are the revise-hypothesis operation's, server-side.
- node: rules/knowledge/a-hypothesis-declares-a-criterion
  why: The delivered composition already carries a criterion; this correction changes no field of it, and the refusal
    is server-side.
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  why: The delivered composition already carries the collects selection; this correction changes no field of it,
    and the refusal is server-side.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  why: The acceptance check and its refusal are the revise-hypothesis operation's, server-side.
---

## What it is

The one epic of a corrective increment: a save control on the hypothesis revision screen that dispatches nothing, and the proof that would have caught it.
It claims the nodes the trace already binds to the file the behavior lives in, plus the nodes that state what a submitted revise does and what the screen refuses before submitting.
It claims nothing about the two further screens carrying the same defect; the scope records them and leaves them out.

## Notes

The claim was seeded mechanically from trace.py --encodes over src/routes/hypothesis-revision-form-fields.tsx, whose output the report carries verbatim.
The seven nodes added beyond that output are disclosed in this epic's own rationale.
