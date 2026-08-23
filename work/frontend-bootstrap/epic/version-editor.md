---
title: Version Editor
summary: The full-replace draft-editing form (PATCH, with its own clean/dirty/saving/conflict state machine and 404/409 handling), the New Draft origination flow, the two terminal actions -- Release and Discard -- that close a draft's lifecycle from the same screen, a read-only render of a released version, and seeding a new draft's blank form from the case's latest released version.
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

  Onda 7 adds two tasks, both landing here rather than in a new epic: viewing a released version
  read-only extends edit-draft-version's own screen and hook (its "ready" union already carries
  release/discard as optional exactly so a read-only render can return the same literal without
  them), and seeding New Draft from the case's latest released version extends new-draft-creation's
  own blank-form flow -- neither introduces a domain this epic does not already claim. I bundled
  each capability's entry-point change (the Versions-tab "View" action; the pre-populated form) and
  its own destination behavior into one task apiece, the same way new-draft-creation already
  bundled its own button-visibility, blank-form trigger and POST handling under one reason to
  change ("how a curator starts a new version") -- here the reason is "how a curator views a
  released version" and "what a new draft starts holding," respectively, each a single falsifiable
  outcome spanning its own entry point and destination. rules/knowledge/a-new-drafts-manifest-is-
  copied-from-an-existing-version newly joins this epic's covers: the seeding task is the first to
  have the frontend itself name (or, for a case's first-ever draft, deliberately omit)
  source_version in the create-draft POST body, exercising the rule's naming/defaulting clause
  directly rather than leaving it entirely to the backend's own default. domain/knowledge/hypothesis,
  domain/knowledge/hypothesis-revision and rules/knowledge/hypotheses-are-ordered-by-precedence stay
  out even though the read-only render lists each manifest entry's hypothesis name, revision and
  criterion: no criterion here tests a hypothesis's own name uniqueness, a revision's own numbering
  or immutability, or that the declared order is the precedence the experts affirmed -- it renders
  already-validated, already-ordered data exactly as the backend returns it, the same facts
  manifest-hypothesis-authoring already fully covers with its own tasks. None of this onda's own
  uncovered entries move: neither new task originates a case, contends over the case-version-number
  counter, revalidates a read against every validator rule, or reads a capability's own registry.
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
  - rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
uncovered:
  - node: rules/knowledge/a-case-version-number-is-never-reused
    why: >-
      Discard removes the draft version, but no criterion in this epic observes or asserts that its
      number is never reissued to a later draft -- proving that would require originating a
      subsequent draft afterward and inspecting the version number the backend assigns it, which no
      task here does, including Onda 7's own seeding task, whose own criteria stop at the POST body
      it sends rather than the number the backend returns. The backend alone guarantees the
      invariant; nothing in this epic exercises it.
  - node: rules/knowledge/validation-runs-at-every-read
    why: >-
      No task's criteria assert or exercise read-time revalidation of a stored case version. Onda
      7's read-only render loads only released versions, which stay valid forever once released, and
      its own seeding task reads a released version for the same reason -- neither ever exercises the
      refusal branch this rule names.
  - node: rules/knowledge/a-slug-identifies-one-case
    why: >-
      Every task in this epic, including Onda 7's own two, acts against an existing case's own
      already-known slug, read from the route. No task in this epic originates a brand-new case
      identity.
  - node: rules/knowledge/every-collected-concept-has-a-read-only-capability
    why: >-
      No task in this epic reads GET /v1/capabilities, a domain (domain/integration/capability) no
      task in this initiative has touched -- Onda 6's own territory.
sources:
  - intake/onda-3-scope.md
  - intake/onda-5-scope.md
  - intake/onda-7-scope.md
---

## What it is
The Version Editor screen that replaces CaseVersionPlaceholder, editing an existing draft's full content via full-replace PATCH.
The New Draft origination flow, sharing the same field form the editor already offers for editing, now seeded from the case's latest released version.
The clean/dirty/saving/conflict UI state machine section 4 of the proposal describes, since the backend offers no optimistic concurrency of its own.
The Release confirmation and Discard confirmation the earlier ondas describe.
A read-only render of a released version, reached from a new "View" action on Case Detail's Versions tab.

## Notes
Manifest Builder stays out of this epic, delivered by manifest-hypothesis-authoring instead.
Release and Discard, once deferred, now ship in this same epic.
The two placeholder routes stay exactly as unreachable as before.
