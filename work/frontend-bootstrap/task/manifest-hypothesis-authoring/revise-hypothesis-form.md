---
title: Revise or originate a hypothesis
summary: The shared form both "New hypothesis" and "Revise" open, pre-checking Collects against the draft's own subject type client-side and submitting to the real POST /v1/cases/{slug}/hypotheses, with one generic failure state for any of that endpoint's current domain errors.
rationale: >-
  Kept as one task covering both the blank "New hypothesis" entry and the pre-loaded "Revise"
  entry, because both dispatch the same POST with the same body shape and share the same
  submission, filtering and failure-handling logic -- one reason to change (how a hypothesis's
  content is submitted), not two. I cut a distinct "New hypothesis" route from the
  name-addressed "Revise" route -- a decomposition choice the scope itself left open, framing the
  risk but not deciding it -- rather than reusing route-tree.tsx's existing
  "manifest/hypotheses/$hypothesisName" route for both: a hypothesis literally named "new" would
  otherwise be indistinguishable from the create trigger. The new static route follows the
  convention route-tree.tsx already establishes for "versions/new" ranking over "versions/$version",
  rather than inventing a second pattern for the same problem.
objective: Submitting the hypothesis form, whether started blank as a new hypothesis or pre-loaded from an existing hypothesis's current revision, persists a new hypothesis-revision via POST /v1/cases/{slug}/hypotheses, offering to open the Manifest Builder on success and showing one generic failure message for any of that endpoint's current domain errors.
criteria:
  - The "New hypothesis" entry point and the "Revise" entry point resolve to two distinct routes, so a hypothesis literally named "new" is addressed by the Revise route rather than being captured by the New-hypothesis route.
  - Visiting the New-hypothesis route renders a blank form with the current draft's own subject type shown fixed and non-editable, and no hypothesis name pre-filled.
  - Visiting the Revise route for an existing hypothesis pre-populates the form's criterion, collects, resolution outcome, and referral action/recipient fields from that hypothesis's current revision, with the hypothesis name shown fixed and non-editable.
  - The Collects field offers only concepts whose own accepts list, read from GET /v1/glossary/concepts, includes the draft version's declared subject type.
  - The resolution outcome dropdown offers exactly the terms GET /v1/glossary/outcome currently returns, and the referral action and recipient dropdowns each offer exactly the terms GET /v1/glossary/action and GET /v1/glossary/recipient currently return.
  - Submitting the form with no concept checked in Collects is refused before any request is sent.
  - Submitting the form with an empty criterion is refused before any request is sent.
  - Submitting the form with no resolution outcome selected, or no referral action or recipient selected, is refused before any request is sent.
  - Submitting a form that passes those checks issues POST /v1/cases/{slug}/hypotheses with a body of exactly { hypothesis_name, criterion, collects, resolution, subject } built from the form's own current content and the draft's own subject type.
  - A 201 response renders the returned hypothesis_name and revision, and offers a control that navigates to the Manifest Builder for the current draft version.
  - A CaseHoldsNoDraftError, HypothesisRevisionCollectsNoConceptError, ConceptNotInGlossaryError, ConceptRefusesSubjectTypeError, or any other error response to that POST renders one shared generic failure message, never a per-concept highlight.
implements:
  - contracts/glossary/glossary-query
  - contracts/knowledge/case-lifecycle
  - contracts/knowledge/case-query
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
  - rules/knowledge/a-concept-accepts-the-declared-subject-type
  - rules/knowledge/a-hypothesis-collects-at-least-one-concept
  - rules/knowledge/a-hypothesis-declares-a-criterion
  - rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  - rules/knowledge/case-terms-exist-in-the-glossary
  - rules/knowledge/every-position-declares-a-resolution
sources:
  - intake/onda-4-scope.md
---

## What it is
The section 2.5 New hypothesis/Revise form the scope describes, over the real POST body shape the scope's own backend-reading confirms (which includes subject explicitly, unlike the original wireframe).
Reuses the existing glossary-term-vocabulary hook as-is for the outcome/action/recipient dropdowns; concepts need their own accepts-aware read, since that hook only carries a term's name today.

## Notes
The single generic-failure-message behavior for any of the four hypothesis-revision domain errors is stated directly by the scope as a fact about the backend's real current behavior -- all four currently collapse to an indistinguishable 500 -- and is not a decomposition choice this task makes.
The client-side subject-type pre-check is a pre-checkage only, never the final authority; the server remains the authority the scope's own material states it to be.
The fifth criterion above (glossary-sourced resolution outcome/referral dropdowns) was added after this task's own binder first ran without it and returned an `underdetermined` note: as originally written, a free-text implementation of resolution outcome/referral would have satisfied every stated criterion while still letting a submission name an outcome, action or recipient the glossary does not hold, which rules/knowledge/case-terms-exist-in-the-glossary refuses. The binder was re-run against the corrected criteria and confirmed the gap closed.
rules/knowledge/case-terms-exist-in-the-glossary's subject-type clause is not reached here: this form only ever reads the draft's already-declared subject type as a fixed, non-editable value; it never originates or re-validates one. That clause belongs to the task that declares a case-version's own subject type (already delivered: new-draft-creation, Onda 3).
rules/knowledge/every-position-declares-a-resolution's fallback clause (a case version's own fallback resolution) is not reached here either: this form touches only a hypothesis-revision's own resolution. That clause belongs to the tasks that author a case-version's own fallback (already delivered: edit-draft-version and new-draft-creation, Onda 3).
