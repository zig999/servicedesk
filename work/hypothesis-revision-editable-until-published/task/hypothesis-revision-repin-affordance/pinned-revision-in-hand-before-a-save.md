---
title: The editing form holds the draft manifest entry's pinned revision
summary: The hypothesis-editing form reporting, from the draft case version's own manifest entry, which revision of the hypothesis being revised that draft currently pins.
rationale: Cut as its own task because obtaining the pin answers to a different specification node than the affordance that compares against it — the entry's own reference rather than the overwrite policy — and because it changes for its own reason, namely how the draft case version's manifest is read; the criterion that no new request is issued is this planning's decision, taken from the survey's report that the manifest already arrives in the case-version read the form performs.
sources:
- intake/scope-frontend.md
objective: The hypothesis-editing form reports, for the hypothesis being revised, the revision number the draft case version's manifest entry pins for it, or reports none where that hypothesis has no entry in that manifest.
criteria:
- With a draft case version whose manifest entry for the hypothesis being revised pins revision 2, the form reports 2 as that hypothesis's pinned revision.
- Where the hypothesis being revised has no entry in that draft case version's manifest, the form reports no pinned revision for it rather than a number.
- Where the screen is opened for a hypothesis identity that does not exist yet, the form reports no pinned revision.
- Where the draft's manifest entry pins a revision number that the answered page of that hypothesis's revisions does not carry, the form still reports that pinned revision number.
- Opening the screen requests no path it does not request today.
- Where the case-version read fails, the form reports its existing load-error state rather than any state carrying a pinned revision.
implements:
- rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
- rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version
- rules/knowledge/a-case-has-at-most-one-draft
- domain/knowledge/case-version
- domain/knowledge/manifest-entry
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis
---

## What it is
The form reading the manifest of the draft case version named by the screen it was opened on, and taking from it the one entry that pins the hypothesis under revision.
The number it reports is the entry's own reference, whatever set of that hypothesis's revisions arrived beside it.

## Notes
The survey reports the form already performs this case-version read for the draft's subject type and types the answer as that field alone, and that the manifest-builder hook narrows the same cached read to the manifest.
The survey reports a helper reducing a revision list to its highest entry already exists and is shared by two hooks; the pinned revision this task reports is not that number.
UNDERDETERMINED, from the specification — no criterion covers the case where the hypothesis's case holds no version in draft state at all; rules/knowledge/a-case-has-at-most-one-draft states "at most one", which admits zero, and every criterion here is conditioned on a draft case version existing, so the form's behaviour with no draft is left open. The node that settles what a revise screen does when the case holds no draft, rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft, is outside this task's candidate set.
Decision, beyond the covers — stand: the screen is reached only through routes already scoped to the case's current draft (per the survey, NewHypothesisScreen and ReviseHypothesisScreen forward slug and version to it), so the no-draft case is refused earlier, by routing and by revise-hypothesis's own CaseHoldsNoDraftError, never by this read-only form; growing this epic's claim to rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft would duplicate a guarantee the backend epic at this work root already carries.
REMAINDER, from the specification — rules/knowledge/a-case-has-at-most-one-draft's second clause (create-draft asked of a case that already holds a draft is refused with an HTTP 409 response reporting a CaseAlreadyHasDraftError) reaches no criterion of this task, which only reads the draft the case already holds. This belongs to the task delivering create-draft on contracts/knowledge/case-lifecycle.
REMAINDER, from the specification — rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown states its guarantee over every entry of a case version's manifest a curator reads; this task's criteria reach only the single entry for the hypothesis being revised. This belongs to the task presenting a case version's whole manifest to a curator.
REMAINDER, from the specification — rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version is used here only as the fact that makes "the manifest entry for the hypothesis" singular and "one entry or none" exhaustive; its enforcement (that composing a manifest never produces a second entry for one hypothesis) reaches no criterion of this read-only form. This belongs to the task delivering place-hypothesis, which composes a draft's manifest.
ADVISORY, from the specification — rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move turns on "the revision number d's manifest entry for h held immediately before the revise", while this task's criteria fix only that the form reports the pin as of opening the screen; no criterion here states whether the held value must be re-read at the revise or may be the one loaded at open, so the consuming task inherits that question.
ADVISORY, from the specification — the form reports a draft manifest entry's pinned revision, which may make it a surface presenting a manifest entry; rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis requires such a presentation to state that a higher revision of the entry's hypothesis exists whenever one does.
Decision, beyond the covers — stand: the survey reports this disclosure is already delivered on the manifest-builder screen (version-manifest-screen.tsx), the surface a curator reaches through the offer this epic's sibling task adds; the editing form reports a save's own answer to the curator who just made it, not a stationary read of the manifest, so it is not the surface that rule addresses, and growing this epic's claim to it would duplicate a guarantee already delivered elsewhere.
