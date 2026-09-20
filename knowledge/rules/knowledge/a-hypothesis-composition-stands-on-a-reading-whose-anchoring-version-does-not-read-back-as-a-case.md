---
type: policy
statement: >-
  A surface on which a curator composes a hypothesis revision presents that
  composition's own fields and keeps offered the act whose performance issues the
  revise, on a reading whose read of the case version that composition is anchored to
  was refused because some validator rule of validation-runs-at-every-read does not
  hold for that version at that reading.
expression: >-
  For a curator composing a revision of hypothesis h anchored to case version v, and a
  reading of the composing surface where that surface's read of v was refused because
  some validator rule of validation-runs-at-every-read does not hold for v at that
  reading: the surface presents the fields the composition is made of, and it offers an
  act whose performance issues a revise-hypothesis for h. Neither presence turns on
  which validator rule failed over v — v's manifest holding no entry at all included,
  and v's own declared subject type being the failing attribute included — and nothing
  further about that refusal narrows either. This settles no other reading of that
  surface: not one whose read of v answered, and not one whose read of v has not
  answered or did not complete. What the surface states on this reading is untouched
  here, and what a revise-hypothesis the act issues is then answered with is untouched
  too: a-hypothesis-is-revised-only-against-its-cases-draft and
  a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case
  each answer their own call exactly as they did before, and nothing is written by the
  composition's presence.
constrains:
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/case-version
consistency: eventual
---

## Description

`a-hypothesis-composition-states-which-of-its-reads-did-not-complete` is written over this very surface and says, in as many words, that it decides only what is stated there — that whether composing, or any act on the surface, stays offered while a read has not completed is not settled by it and is not narrowed by anything it states.
`a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` and `a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case` reach the reading this rule is about, and each closes on the same boundary: what a surface offers a curator over such a version is decided where this specification decides what surfaces offer, and not there.
So whether the composition itself survives a refused read of its anchor fell to whatever a surface happened to render.

The refused reading is the one the composition exists for. `validation-runs-at-every-read` makes a draft whose manifest declares no hypothesis not read back as a case, `a-case-version-failing-validation-at-a-read-is-refused-by-name` gives that read its refusal, and `a-new-drafts-manifest-is-copied-from-an-existing-version` leaves a case's first-ever draft with no manifest to copy — so the empty manifest is where every case begins and the refusal is where every case begins with it. The revision composed here is the content `place-hypothesis` then puts into that manifest; a composition withheld on this reading withholds the one thing the correcting act has to place, and the curator who must repair the version is left holding a route with nothing at the end of it.

The act the surface keeps offered is already an act that lands. `a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case` states that a revise is accepted while its case's draft does not read back as a case, that no validator rule failing over that draft refuses it, and that none of them reaches the curator as a CaseVersionNotValidError. An offer standing here is therefore not an offer of something the store will decline; the two readings are the two halves of one correction, and deciding them apart would leave the call accepted and unreachable.

The composition takes nothing from the read that was refused, which is why presenting it states nothing that read declined to answer. `domain/knowledge/hypothesis-revision` makes the criterion, the collected concepts and the resolution the hypothesis's own content, reached by the hypothesis's revisions and by the glossary — the two reads `a-hypothesis-composition-states-which-of-its-reads-did-not-complete` holds apart from the version's — and `a-revise-hypothesis-requests-own-subject-type-is-never-read` keeps the subject type off the request altogether, leaving the version's read supplying no field the composition is made of. What the neighbouring rules forbid stands exactly as they wrote it: the surface still states that the version does not read back as a case, and still presents no attribute of that version and no entry of its manifest as the content standing at that identity. Nothing here is an attribute of the version; it is the curator's own unwritten content.

`a-newly-created-draft-offers-no-act-before-its-own-record-arrives` withholds three acts in its own interval, and its reason does not transfer. Each of those three — release, discard, the correction of the version's declared attributes — is performed against content that surface is forbidden to show, so each is an ending or a blind overwrite. Composing a revision is neither. It ends nothing; and where it overwrites, `a-hypothesis-revision-is-overwritten-while-unreleased` puts the overwrite on the hypothesis's own highest draft revision, which the revisions read showed the curator — a different read from the one refused here, whose failure teaches the surface nothing about the revision's content.

This is the last link of a chain this specification has already laid on this same reading. `a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading` carries the curator from a refused version to its manifest, and `a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions` keeps the placing offered when they arrive; a composition withheld would break the route at its end, after two nodes have spent their reasoning getting the curator there.

This decides the refused reading alone. What the surface offers where its read of the version answered, where it has not answered, or where it did not complete is not settled here, and what the surface states on any of them stays where `a-hypothesis-composition-states-which-of-its-reads-did-not-complete` and its two neighbours put it. Which control carries the composition and the act, how each is worded and where it sits are form and belong to the interface, as this specification's other surface rules leave them.

Consistency is eventual: the fact spans the hypothesis-revision being composed and the case version the composition is anchored to, each read separately.
