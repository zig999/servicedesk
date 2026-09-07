---
type: policy
statement: >-
  A surface offering the release of a draft case version states, before any release of that
  version is attempted, for every condition that release must satisfy which a version reading
  back as a case may still fail, whether that draft currently meets it — the met ones stated
  as met and the unmet ones as unmet, so that a surface showing no unmet condition is
  distinguishable from one that established none; where the surface has not read what
  deciding such a condition requires, it states that condition as not yet decided for that
  draft, never as met and never as unmet.
expression: >-
  For a draft case version v and a surface offering v's release: let C be the conditions a
  release of v must satisfy that a v reading back as a case may still violate — every rule
  constraining case-version whose violation a refused release of v would name among its own
  violations (a-release-refusal-with-no-named-violation-says-so), other than those already
  answered by v reading back as a case at all (validation-runs-at-every-read); as this
  specification currently states them, that is the manifest-pin condition of
  a-released-case-version-manifests-only-released-hypothesis-revisions. Before any release of
  v is attempted, and for every c in C, the surface states exactly one of three things of v
  and c: that v meets c, that v does not meet c, or that whether v meets c is not yet decided
  — the third only where the surface has not read what deciding c requires. The three are
  distinguishable from one another to the curator, and none of them is the presentation of a
  surface stating nothing of c. The statement turns on nothing further: not on a release of v
  having been attempted, and not on the curator opening any further control.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

Release is the one act that turns a draft into a version nothing may still merge into (`contracts/knowledge/case-lifecycle`), and it answers every rule at once, refusing together or not at all.
Left unstated here, the conditions that act evaluates reach the curator only through the act itself: a draft every condition holds for reads exactly like one where a condition does not, and the single thing that tells them apart is the attempt that fails.

This specification has already refused a silence of exactly this shape around exactly this act.
`a-presented-manifest-entry-states-its-pinned-revisions-state` states each pinned revision's own state on the manifest so that a curator learns it "never only from a refused release of that version".
That rule discloses one condition's *input*, on the surface where a manifest is presented; this states the *condition* where the release is offered, and the two are neither the same surface nor the same content.
A curator reading a manifest of many entries still has to assemble the release's own verdict out of them, and a surface offering release need not present the manifest at all.

Both sides are stated, not the failures alone.
A surface that names only what a draft does not meet leaves its own silence carrying two readings — every condition met, and no condition established — which is the confusion `a-case-holding-no-versions-is-told-explicitly` refused for an emptiness, `a-cases-current-pins-come-from-its-highest-numbered-version` refused for a pin nothing holds, and `a-draft-versions-content-is-presented-only-from-its-own-record` refused for an interval before an answer arrived.
For the same reason a condition whose inputs the surface has not read is stated as undecided rather than defaulted either way: presenting an unread condition as met states a fact nobody read, and presenting it as unmet reports a violation nobody found.

What release evaluates at the read itself is deliberately outside C.
`validation-runs-at-every-read` has a stored version read as a case only while every validator rule holds at that reading, draft as much as released, "no separate field marks it 'not ready'" — a version failing one does not read back as a case at all, and `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` already states what a surface says when it meets one.
So this adds no attribute to `domain/knowledge/case-version`, marks nothing on the stored version and reopens no intermediate gate; it states, on a surface, only what a release still weighs beyond the version reading back as a case — today the one condition `a-released-case-version-manifests-only-released-hypothesis-revisions` gates at release precisely because placement never gates it.

Nothing here moves what the refusal owes.
A release attempted over a draft that does not meet a condition is still refused once, naming every violated rule together (`a-release-refusal-with-no-named-violation-says-so`), and that naming stays the refusal's own; a disclosure read before the attempt is not that refusal, and the two are each answered at the moment they are read, so a draft changed in between is answered by the later reading rather than by the earlier one.
Nor does this restrict composition: placing an entry that pins a draft revision is still never refused, and a condition stated as unmet is a disclosure, not a warning this specification words.
It states what the surface discloses and nothing about whether the release may then be attempted or whether the offer is made at all — that stays where `a-case-version-moves-through-its-declared-lifecycle` and the release's own refusal already put it.

The rule is a policy holding eventually because the conditions are read across aggregate roots: the case version whose release is offered, and — for the condition this specification currently states — each pinned hypothesis-revision, whose own release reaches into no version's manifest to change it.
Which control carries the statements, their wording and where they sit are form and belong to the interface, not here.
