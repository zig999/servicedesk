---
type: invariant
statement: >-
  A surface presenting a draft case version offers the curator the act of discarding it,
  and a discard of it is accepted, whether or not every validator rule of
  validation-runs-at-every-read holds for that version at that reading.
expression: >-
  For a draft case version v and a surface presenting v: the surface offers the curator an
  act whose performance issues a discard of v, and a discard so issued is accepted,
  regardless of whether every validator rule of validation-runs-at-every-read holds for v
  at that reading — v's manifest holding no entry, or any other validator rule failing over
  v, included. The offer and the acceptance turn on nothing but
  only-a-draft-case-version-may-be-discarded's own condition, v's own state holding draft,
  and on releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act's own
  condition, the curator reproducing the case's own slug.
constrains:
  - domain/knowledge/case-version
---

## Description

`only-a-draft-case-version-may-be-discarded` decides discard by v's own state alone — draft, never released — and needs no case assembled whole to decide it: v's state is one of v's own stored attributes, read without reading v's manifest, its title or any other attribute `validation-runs-at-every-read` might find failing. Nothing `constraints/a-case-is-read-whole` binds is a condition of discard, so a refusal that gate answers is not a condition discard was ever waiting on.

`a-newly-created-draft-offers-no-act-before-its-own-record-arrives` already withholds discard for one interval and one reason — no answer for v's own record has arrived yet — and says of that withholding that it "turns on nothing else": not on which existing version the draft's manifest was copied from, not on the surface the creation was reached from. A version whose own record has arrived, and whose manifest simply holds no entry or whose declared attributes fail some other validator rule, is outside that interval; withholding discard there on the ground of a check discard was never conditioned on would be deciding the same question a second way.

A version a curator cannot correct and cannot abandon is a version stuck exactly where `an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case` and `a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions` already refuse to leave the manifest and the declared attributes: this is the third door out of the same state, the one that ends the draft rather than repairing it, and it is `releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act`'s and `a-draft-case-versions-discard-reproduces-the-cases-own-slug`'s own further act, unchanged — the curator still reproduces the case's own slug to take it, whatever v's validation currently answers.

Release is not this act and is not decided here. `a-case-has-at-least-one-hypothesis` and the release conditions still hold every validator rule of validation-runs-at-every-read before a draft may be released, because release publishes a version for diagnosis and a version diagnosis runs against is exactly what those conditions guard; discarding takes nothing to diagnosis and asks nothing of it.

Which control carries the offer, its wording and where it sits are form and belong to the interface, not here.
