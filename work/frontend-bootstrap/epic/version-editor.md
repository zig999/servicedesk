---
title: Version Editor
summary: The full-replace draft-editing form (PATCH, with its own clean/dirty/saving/conflict state machine and 404/409 handling), the New Draft origination flow, and the two terminal actions -- Release (POST, a client-side best-effort checklist before the click and every backend violation rendered verbatim after it) and Discard (DELETE, a slug-typed destructive confirmation) -- that close a draft's lifecycle from the same screen.
rationale: >-
  I cut a new epic instead of evolving cases-list-and-detail or folding into
  case-authoring-console because this onda's territory -- resolution, referral and the four
  glossary vocabularies feeding the fallback/subject fields -- is claimed by neither existing
  epic's covers list with an actual screen behind it: case-authoring-console claims that domain
  but has delivered only build tooling against it, and cases-list-and-detail is read-only by its
  own stated scope. contracts/knowledge/case-lifecycle and rules/knowledge/a-case-has-at-most-one-
  draft do appear in cases-list-and-detail's own covers too, marked uncovered there with the
  explicit note that origination was deferred to this onda -- the overlap is that deferral
  resolving, not an error.

  Grown after edit-draft-version's own binder found domain/knowledge/consolidation-register
  missing from its candidate set: the task's own consolidation_register field is a closed
  enumeration (formal/plain) declared by that node, which the original impact-set closure missed
  by not following case-version.md's own attribute-type reference outward. Added here so the
  binder can re-run against the complete candidate set.

  Grown again for Onda 5's Release and Discard. I kept these two terminal actions inside this same
  epic rather than cutting a new one: they attach to the exact screen and hook (case-version-
  editor-*.tsx, use-edit-draft-version-form.ts) this epic already owns, and this epic's own Onda 3
  cut is what deferred both rules/knowledge/a-case-version-moves-through-its-declared-lifecycle and
  rules/knowledge/a-case-version-number-is-never-reused here by name -- a new epic would split one
  screen's own lifecycle across two plans for no reason the scope states. I resolved the scope's
  own open decision (a TUI Dialog opening in place within the Version Editor, versus navigating to
  the two already-registered placeholder routes) in favor of the in-place Dialog: it matches the
  wireframe's own centered-modal-overlaying-the-editor drawing, not a full-page transition, and it
  follows the one precedent this tree already establishes for a destructive confirmation --
  task/manifest-hypothesis-authoring/manifest-builder's own Remove flow, a Dialog with no
  navigation. The two placeholder routes ("/cases/$slug/versions/$version/release" and
  ".../discard") stay exactly as unreachable as the inventory found them, a disclosed deferral each
  task's own Notes carries rather than something either task retires -- the same treatment
  task/manifest-hypothesis-authoring/hypotheses-tab already gave its own stray route.

  I also decided which of this onda's newly-read specification nodes actually join this epic's own
  covers: domain/knowledge/hypothesis, domain/knowledge/hypothesis-revision, rules/knowledge/a-
  hypothesis-revision-number-is-never-reused and rules/knowledge/a-released-hypothesis-revision-is-
  never-altered stay out, because neither release nor discard exercises a fact belonging to a
  hypothesis-revision's own identity or numbering -- both are already fully covered, with tasks
  implementing them, by manifest-hypothesis-authoring. rules/knowledge/every-position-declares-a-
  resolution stays out for the same reason: the pre-release checklist re-checks only the fallback's
  own terms and the collected concepts' subject-acceptance (the scope's own finding #3), never a
  manifest entry's own resolution completeness, which authoring-time validation in the other epic
  already owns.
covers:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/consolidation-register
  - domain/knowledge/manifest-entry
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - domain/glossary/concept
  - domain/glossary/subject-type
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
  - contracts/knowledge/case-lifecycle
  - contracts/knowledge/case-query
  - contracts/glossary/glossary-query
  - rules/knowledge/a-case-has-at-least-one-hypothesis
  - rules/knowledge/a-case-has-at-most-one-draft
  - rules/knowledge/a-case-version-is-written-once
  - rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  - rules/knowledge/a-case-version-number-is-never-reused
  - rules/knowledge/a-concept-accepts-the-declared-subject-type
  - rules/knowledge/case-terms-exist-in-the-glossary
  - rules/knowledge/every-collected-concept-has-a-read-only-capability
  - rules/knowledge/only-a-draft-case-version-may-be-discarded
  - rules/knowledge/validation-runs-at-every-read
  - rules/knowledge/a-slug-identifies-one-case
uncovered:
  - node: rules/knowledge/a-case-version-number-is-never-reused
    why: >-
      Discard removes the draft version, but no criterion in this epic observes or asserts that its
      number is never reissued to a later draft -- proving that would require originating a
      subsequent draft afterward and inspecting the version number the backend assigns it, which no
      task here does. The backend alone guarantees the invariant; nothing in this epic exercises it.
  - node: rules/knowledge/validation-runs-at-every-read
    why: >-
      No task's criteria assert or exercise read-time revalidation of a stored case version, in this
      onda or the ones before it. Release's own reload-on-409 behavior re-fetches the version's
      current state but asserts nothing about a stored version reading back as a case only while
      every validator rule still holds.
  - node: rules/knowledge/a-slug-identifies-one-case
    why: >-
      Every task in this epic, including this onda's release and discard, acts against an existing
      case's own already-known slug, read from the route -- discard's own typed-confirmation compares
      that typed text to the same known slug, never asserting uniqueness against any other case. No
      task in this epic originates a brand-new case identity.
  - node: rules/knowledge/every-collected-concept-has-a-read-only-capability
    why: >-
      The scope's own finding #3 excludes this rule from the pre-release checklist by name: verifying
      it would require reading GET /v1/capabilities, a domain (domain/integration/capability) no
      task in this initiative has touched -- that is Onda 6's own territory. A real capability
      failure surfaces only in the real POST's own 422 response, rendered the same generic way as
      every other violation, never as a checklist item computed ahead of the click.
sources:
  - intake/onda-3-scope.md
  - intake/onda-5-scope.md
---

## What it is
The Version Editor screen that replaces CaseVersionPlaceholder, editing an existing draft's full content via full-replace PATCH.
The New Draft origination flow, sharing the same field form the editor already offers for editing.
The clean/dirty/saving/conflict UI state machine section 4 of the proposal describes, since the backend offers no optimistic concurrency of its own.
The Release confirmation section 2.6 of the proposal describes: an in-place TUI Dialog listing a client-computed pre-release checklist, POST .../release, and every 422 violation the backend's own response names rendered verbatim on failure.
The Discard confirmation section 2.7 of the proposal describes: an in-place TUI Dialog requiring the case's own slug typed to confirm before DELETE .../versions/{version}.

## Notes
Manifest Builder (the wireframe's "manifest holds N hypotheses [open →]" navigation link) stays out of this epic, delivered by manifest-hypothesis-authoring instead.
The inventory's own risk on GET /v1/cases/:slug/versions/:version's manifest.min(1) response constraint is answered inside the new-draft-creation task, not here.
Release and Discard, once deferred here to Onda 5, now ship in this same epic, closing both deferrals this epic's own earlier cut named.
The two routes wired since Onda 1 ("/cases/$slug/versions/$version/release" and ".../discard", VersionReleasePlaceholder/VersionDiscardPlaceholder) stay exactly as unreachable as before: this epic's Dialog-in-place decision means neither task points a Link or a button at them.
