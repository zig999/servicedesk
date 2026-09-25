---
type: invariant
statement: >-
  A draft case version's own editing surface presents that version's title, when_to_use,
  subject, fallback and consolidation_register exactly as its own stored record carries
  them, and accepts an update-draft over them, on a reading whose read of that version was
  refused because some validator rule of validation-runs-at-every-read does not hold for it
  at that reading.
expression: >-
  For a draft case version v and v's own editing surface, on a reading where some validator
  rule of validation-runs-at-every-read does not hold for v: the surface presents v's
  title, when_to_use, subject, fallback (its outcome and its referral) and
  consolidation_register exactly as v's own stored record carries them — stating explicitly
  that v declares none where v's consolidation_register is absent — reading none of them
  from any other version of v's case and reading none of them through
  contracts/knowledge/case-query's whole-case assembly. The surface accepts an update-draft
  over these attributes on this same reading, whichever validator rule is the one failing,
  v's own declared attributes themselves included. Nothing here presents v's manifest or
  any entry of it, and nothing here decides what v's manifest surface presents or accepts:
  a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
  already answers that.
constrains:
  - domain/knowledge/case-version
---

## Description

`a-presented-case-version-states-its-own-declared-attributes` already fixes what a curator reading v's title, when_to_use, subject, fallback and consolidation_register is shown, and its own Description sets the refused reading aside on purpose: "`validation-runs-at-every-read` still decides whether a stored version reads back as a case at all; this says what a reading states, never that a version failing that validation is presented anyway." This is the node that answers what that other node left open, for the one surface where the answer cannot be silence without also closing the correction.

The editing surface is not the surface `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` and `a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case` govern. Those two state what a reading presents as the case's current content, standing behind `constraints/a-case-is-read-whole`'s whole-or-nothing assembly; what they forbid is a title, a fallback or a manifest entry shown *as that content* while validation has declined to read it back as a case. This surface presents the same title and the same fallback for a different purpose — not as the case's current, validated content, but as the draft's own stored record, open for the curator to correct — exactly the distinction `a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case` already draws for a single attribute read toward a different act: that policy reads v's declared subject type "exactly as the draft's own stored record carries it," never as the case's read-whole content, and accepts the call the whole-case gate would otherwise have blocked. This states the same reading over the remaining declared attributes, and states it toward update-draft rather than toward a concept-acceptance check.

Gating update-draft on v's own validity would make the correcting act require the correction, the same reasoning `a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case`'s own Description already gives for revise: a draft whose title or subject is itself the failing attribute is a draft update-draft exists to fix, and a version whose manifest holds no entry is corrected by a hypothesis placed into it, never by a title left uneditable beside it. `a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading` already keeps the route to this surface open on exactly this reading; a route ending in a surface with nothing to present would open onto nothing.

The manifest stays outside what this states. `a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions` already answers what v's manifest surface presents and accepts on this same refused reading, and nothing here narrows or restates it — a curator's route from this surface to that one is `a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading`'s own.

Release is untouched. `a-case-has-at-least-one-hypothesis` and the release conditions `a-surface-offering-release-states-which-release-conditions-the-draft-meets` discloses still hold every validator rule of validation-runs-at-every-read to release, and nothing here reads as a case what that gate still refuses to publish for diagnosis; only the correction and the discard of a draft that has not yet met those conditions are settled here and in `a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case`.

Which control carries each field, its wording and where it sits are form and belong to the interface, not here.
