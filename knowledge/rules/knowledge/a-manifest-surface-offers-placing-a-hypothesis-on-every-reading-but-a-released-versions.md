---
type: invariant
statement: >-
  A surface presenting a case version's manifest offers the curator the act of placing a
  hypothesis into that version's manifest on every reading of that surface except one
  whose read answered that the version is released — including a reading whose read of
  the version was refused, whatever that refusal named, and a reading whose read answered
  a manifest holding no entry at all.
expression: >-
  For a case version v and a surface presenting v's manifest to the curator: that surface
  offers an act whose performance issues a place-hypothesis over v, and the offer's
  presence turns on one thing alone — where the read that surface made for v answered and
  that answer states v's state as released, the act is not offered. Every other reading
  carries it: an answer stating v's state as draft, whether v's manifest carries entries
  or carries none at all; a read of v refused, whatever the refusal named, the refusal
  a-case-version-failing-validation-at-a-read-is-refused-by-name states included; and a
  read of v that has not yet answered. Nothing else narrows the offer — not how many
  entries v's manifest holds, not whether v reads back as a case at that reading, and not
  the surface v's manifest was reached from. What a place-hypothesis then issued answers
  is untouched here: a-case-version-moves-through-its-declared-lifecycle,
  a-hypothesis-is-manifested-at-most-once-in-a-case-version and
  a-hypothesis-position-is-unique-within-its-case each answer their own call exactly as
  they did before, and no entry is written by the offer's presence.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

`a-listed-case-version-offers-a-route-to-its-own-manifest` carries the curator to a version's manifest on every reading of a case's versions listing and says, in as many words, that it decides nothing about what may then be done through the route.
What the manifest surface at the end of that route *offers* was addressable nowhere: `contracts/knowledge/case-lifecycle` publishes `place-hypothesis` and `domain/knowledge/case-version` declares it among the version's own operations, both stating what the call does and neither stating that any surface offers it, so whether a curator standing on a manifest can reach the act at all — and on which readings — fell to whatever a surface happened to render.

Placing is the act the manifest exists to be composed by. `a-cases-current-pins-come-from-its-highest-numbered-version` already states that a hypothesis with no entry must stay in view precisely so the curator can reach `place-hypothesis` for it, and `a-revise-offers-the-draft-manifest-only-when-the-pin-must-move` routes a completed revise to the draft's manifest on the ground that nothing written reaches any version until the hypothesis is placed there. Both nodes send the curator somewhere on the assumption that the placing is reachable once they arrive; this states that it is.

The two readings where the surface knows least are the readings where the offer matters most.
A read of the version refused tells the surface nothing about the manifest, and `validation-runs-at-every-read` makes one refusal in particular — the version that does not read back as a case — the state a placing is the correction for: a draft whose manifest holds no entry fails validation at every read, so a surface that withheld the placing on that refusal would withhold the only act that ends the refusal, leaving the version unreachable by the very curator who must repair it.
A manifest answered holding no entry is the same condition read from the other end, and `a-case-has-at-least-one-hypothesis` names it as what a release will be held to. Neither reading is an edge of the store: `a-new-drafts-manifest-is-copied-from-an-existing-version` gives a case's first-ever draft no manifest to copy, so the empty manifest is where every case begins.

The version's own state is the one thing that narrows the offer, and it narrows it exactly where the surface has read it. `a-case-version-is-written-once` and `domain/knowledge/case-version` free the manifest to be composed while draft state holds and never after, and `a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis` already holds the division this takes: a version's state governs what may be composed, never how much of what is true about it a reader is shown. So a surface that has read the version as released offers no placing — the composition that version can never take — while a surface whose read was refused or has not answered has read no state to withhold on, and the stored state still answers the call itself if one is issued.

This withholds nothing `a-newly-created-draft-offers-no-act-before-its-own-record-arrives` offers and offers nothing it withholds. That rule names three acts — release, discard, the correction of the version's own declared attributes — and withholds each because it is performed against content the surface is forbidden to show in that interval: two irreversible endings and a blind overwrite. A placing is none of those. It ends nothing, alters no entry and overwrites no value: it adds an entry the curator composed themselves, and every way it can collide with a manifest nobody has read is already refused by name — `a-hypothesis-position-is-unique-within-its-case` for an occupied position, `a-hypothesis-is-manifested-at-most-once-in-a-case-version` for a hypothesis already held, `a-case-version-moves-through-its-declared-lifecycle` for a version not in draft. The curator learns the conflict from a refusal that names it, having lost nothing; that is why the interval that withholds those three acts does not withhold this one.

Which control carries the offer, its wording and where it sits are form and belong to the interface, as this specification's other surface rules leave them.
