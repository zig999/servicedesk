---
type: policy
statement: >-
  The act of placing a hypothesis that a surface presenting a case version's manifest offers
  carries as its candidates exactly the hypotheses of that case the surface's read of the
  case's hypotheses answered, less every hypothesis that surface's answer for the version holds
  a manifest entry for, and where that read has answered and no candidate remains the surface
  states explicitly that this case holds no hypothesis that is not already in this version's
  manifest, distinguishably from a reading whose read of the case's hypotheses has not answered,
  on which reading it carries no candidate and states no such absence.
expression: >-
  For a case c, a version v of c and a surface presenting v's manifest to the curator: let H be
  the hypotheses of c that the read the surface made through list-hypotheses answered, and let M
  be the hypotheses the answer that surface holds for v states a manifest entry for. The
  candidates the placing act offered on that surface carries are exactly H less M — every
  hypothesis in H that M does not hold is a candidate, and no hypothesis M holds is one. Where
  the surface holds no answer for v at all, its read of v having been refused, whatever the
  refusal named, or not yet having answered, M is empty and every hypothesis in H is a
  candidate. Where the read of c's hypotheses has answered and H less M is empty — because H is
  empty, or because M holds every hypothesis H carries — the surface states that c holds no
  hypothesis that is not already in v's manifest; a curator tells that statement apart from what
  the surface states while its read of c's hypotheses has not answered, and while that read has
  not answered the surface carries no candidate and makes no such statement. Whether the placing
  act is offered at all is untouched here and stays exactly where
  a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions put
  it, and what a place-hypothesis then issued over v answers is untouched too.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis
  - domain/knowledge/manifest-entry
consistency: eventual
---

## Description

`a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions` decides that the act is reachable and on which readings, and closes by leaving what it may name to the interface — so which of a case's hypotheses a curator can actually choose from was addressable nowhere. The choice can be drawn from one place only: a hypothesis belongs to the case identity rather than to any one version (`domain/knowledge/hypothesis`), `contracts/knowledge/case-query` publishes `list-hypotheses` as the read that answers a case's hypotheses, and `domain/knowledge/manifest-entry` pins exactly one of them per line. What the surface can offer is therefore what that read answered, and nothing recovered from anywhere else — the same refusal of substituted content `a-manifest-entrys-pinned-revision-is-always-shown` makes for a pin.

A hypothesis the reading's own manifest answer already holds an entry for is not among them. `a-hypothesis-is-manifested-at-most-once-in-a-case-version` reads a manifest as holding one entry for a hypothesis or none, and says in as many words that it decides nothing about what `place-hypothesis` answers for a hypothesis the manifest already holds; `a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for` holds a telling of its own for exactly two refusals and repeats that this one is expressly left open, so every other refusal reaches the curator as the notice for a request that failed for a reason the surface does not recognise. Offering such a hypothesis therefore offers an act whose outcome this specification has not stated and whose refusal, if it is refused, the surface cannot name — the curator learns only that something unknown happened to a manifest that already held what they asked for. Nothing is lost by leaving it out: every hypothesis left out is one the manifest already carries, already presented by the entry the rules over a presented manifest entry govern.

The subtraction is made over what the reading answered, never over the stored manifest, because that is the only manifest the surface has. Where the read of the version was refused or has not answered, no manifest answer stands and nothing is subtracted; withholding every candidate there would withhold the whole choice exactly on the reading where the placing is the curator's only correction — `validation-runs-at-every-read` and `a-case-version-failing-validation-at-a-read-is-refused-by-name` refuse the read of a draft whose manifest declares no hypothesis, and `a-case-has-at-least-one-hypothesis` is what the placing satisfies. That is the same reading the offer rule kept the act on, for the same reason, and the call still answers any collision itself: `a-hypothesis-is-manifested-at-most-once-in-a-case-version`, `a-hypothesis-position-is-unique-within-its-case` and `a-case-version-moves-through-its-declared-lifecycle` each answer exactly as they did before.

Where the read has answered and leaves nothing to choose, the surface says so. An empty chooser with nothing said reads alike whether the case composed no hypothesis at all, whether every hypothesis it holds is already placed, whether the read failed, or whether it is still pending — the silence `a-case-holding-no-versions-is-told-explicitly` already rejects for a case's versions and `a-cases-current-pins-come-from-its-highest-numbered-version` already rejects for a hypothesis with no pin. The two ways a case can leave nothing to choose take one statement because the curator's next act is the same in both: compose a hypothesis, which is what `a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case` keeps reachable, and place it afterwards. The reading whose read of the case's hypotheses has not answered is the one that must be told apart, since it sends the curator to no act at all but waiting, and `a-hypothesis-composition-states-which-of-its-reads-did-not-complete` is the same containment taken across the several reads one screen makes: a statement is held to the read it is a fact about.

This states what the placing act carries and what is said where it carries nothing. It moves no pin, adds no disclosure to any manifest entry, writes no entry and refuses no call, and it leaves the offer's presence exactly as its own rule decided — the act is offered on every reading that rule names, whether or not the reading leaves it a candidate to carry. Which control carries the choice, how the absence is worded and where either sits are form and belong to the interface, as they do wherever else this specification states what a surface tells a reader.

Consistency is eventual: the fact spans the case's own hypotheses and the manifest of one of its versions, each read separately.
