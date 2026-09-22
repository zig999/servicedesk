---
type: invariant
statement: >-
  A place-hypothesis over a case version whose manifest holds no entry for the hypothesis it
  names writes that entry at exactly the position the request declares, which the curator
  supplies, and derives no position from the entries that manifest already holds.
expression: >-
  For a case version v, a hypothesis h and a place-hypothesis issued over v naming h and
  declaring position n, where v's manifest holds no entry for h: the entry written declares
  position n, n is read from the request alone, and nothing about v's manifest enters the value
  — not how many entries it holds, not the highest or the lowest position among them, not the
  order in which they were placed — the curator standing on the surface that issues the
  placement being who chooses n. What the placement answers where n is a position a different
  hypothesis of v's manifest already holds is a-hypothesis-position-is-unique-within-its-case's,
  exactly as before; what it answers for a hypothesis v's manifest already holds an entry for
  stays where a-hypothesis-is-manifested-at-most-once-in-a-case-version left it, undecided here.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

`hypotheses-are-ordered-by-precedence` states that a case version's declared order is the precedence the experts affirm, each entry's own position, declared rather than arranged; `a-hypothesis-position-is-unique-within-its-case` refuses a placement at a position a different hypothesis already holds. Neither says where the number comes from at the moment a hypothesis first enters a manifest holding no entry for it. `domain/knowledge/manifest-entry` declares position required and `domain/knowledge/case-version` says only that a hypothesis may be placed at a position, while `contracts/knowledge/case-lifecycle` publishes place-hypothesis without stating who supplies it — so whether the curator names the position or the act appended one behind them fell to whatever an implementation happened to compute.

The curator names it, because precedence is the one fact the manifest exists to declare. A position the act derived — one past the highest the manifest holds, the count of its entries, the order placements happened to arrive in — is an arrangement, which is what `hypotheses-are-ordered-by-precedence` refuses in as many words: the hypothesis would stand at a precedence no expert affirmed, and the affirmation would have to be recovered afterwards by a correction nobody asked for.

A derived position also leaves this specification stating conditions nothing could reach. `a-hypothesis-position-is-unique-within-its-case` refuses a placement at an occupied position, and `a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for` owes the curator a telling of its own for that refusal, naming the act that clears it as choosing another position; a position the act derives collides with no entry, so both the refusal and the telling it is owed would stand over a call no curator could make. `contracts/knowledge/case-lifecycle` publishes no act that moves a standing entry either, so the placement is the moment at which a new entry's precedence is declared at all — an act that chose for the curator there would leave that precedence never affirmed by anyone.

This bounds the first placement alone, and adds nothing to the calls around it: `a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions` still decides on which readings the act is offered, `a-case-version-moves-through-its-declared-lifecycle` still answers a version not in draft, and `placing-a-manifest-entry-is-never-refused-for-a-drafts-revision-state` still holds the pinned revision's own state out of the check. Which control carries the position, how it is worded, and whether the curator states it as a number or as a place among the entries already shown are form and belong to the interface, as this specification's other surface rules leave them.
