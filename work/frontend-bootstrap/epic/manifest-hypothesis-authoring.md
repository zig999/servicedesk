---
title: Manifest Builder and Hypothesis Authoring
summary: The three surfaces Onda 4 lands over the Onda 1-3 console -- reordering and removing a draft's manifest, originating or revising a hypothesis's own content, and browsing a case's hypotheses and their revision history -- sharing one draft's manifest state and one shared authoring form as their common exit action.
rationale: >-
  I cut a new epic rather than folding these tasks into version-editor or case-authoring-console
  because this wave's territory -- composing which hypothesis-revisions a draft's manifest holds
  and at what precedence, originating or revising a hypothesis's own content, and browsing a
  case's hypotheses across versions -- is a different reason to change than either sibling epic
  claims with an actual screen behind it: version-editor's own scope is a case-version's own
  scalar attributes (title, when_to_use, consolidation_register, fallback), explicitly deferring
  "the wireframe's 'manifest holds N hypotheses [open ->]' navigation link" to this wave; and
  case-authoring-console has delivered only build tooling against the domain, no screen. The
  three tasks below stay in one epic, matching the scope's own instruction that they ship
  together in one wave because they share the draft's manifest state and the same shared
  authoring form as their exit action -- but each is still its own task because each answers a
  different falsifiable question (can the manifest be reordered/pruned; can a hypothesis's
  content be submitted; can a case's hypotheses be browsed).

  Two decomposition choices the scope left open are settled here, not by the scope itself. First,
  the scope's own material flags that reusing route-tree.tsx's existing
  "manifest/hypotheses/$hypothesisName" route directly for both "New hypothesis" and "Revise"
  risks a real hypothesis literally named "new" colliding with the create flow; I resolved this by
  cutting a distinct "New hypothesis" route from the name-addressed "Revise" route, following the
  already-established convention (a static segment ranking over a same-prefix dynamic one, as
  "versions/new" already does beside "versions/$version") rather than inventing a new pattern.
  Second, the scope frames the wireframe's "Referenced by" column and per-revision attribution as
  needing either a specification decision or a scope decision to defer, because it would cost an
  N+1 read across every version of the case per hypothesis listed -- a cost that grows with the
  case's whole version history, unlike the bounded per-hypothesis "Revisions" count. I took the
  scope deferral route it named as available, cutting "Referenced by" (both the list's own column
  and the revision-history view's per-revision attribution) out of this wave's tasks; the
  "current"/"frozen" labeling stays in, since it never needed that cross-version read -- no
  revision is ever edited in place regardless of release status, so comparing revision numbers
  alone tells current from frozen.
covers:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
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
  - rules/knowledge/a-collected-concept-declares-a-ttl
  - rules/knowledge/a-concept-accepts-the-declared-subject-type
  - rules/knowledge/a-hypothesis-collects-at-least-one-concept
  - rules/knowledge/a-hypothesis-declares-a-criterion
  - rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  - rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  - rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  - rules/knowledge/a-hypothesis-revision-number-is-never-reused
  - rules/knowledge/a-released-hypothesis-revision-is-never-altered
  - rules/knowledge/case-terms-exist-in-the-glossary
  - rules/knowledge/every-collected-concept-has-a-read-only-capability
  - rules/knowledge/every-position-declares-a-resolution
  - rules/knowledge/hypotheses-are-ordered-by-precedence
  - rules/knowledge/validation-runs-at-every-read
  - rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  - rules/knowledge/a-case-version-is-written-once
uncovered:
  - node: domain/knowledge/case
    why: Every task in this wave addresses a case only through its already-known slug, read from the route; no task originates a case, reads its own next_version counter, or asserts its identity's uniqueness.
  - node: rules/knowledge/a-case-has-at-most-one-draft
    why: Every task in this wave acts against a draft the case already holds, originated in Onda 3; no task in this wave originates, discards or contends over that draft, so the policy is never exercised.
  - node: rules/knowledge/a-collected-concept-declares-a-ttl
    why: No screen in this wave surfaces a concept's own ttl; the Collects field shows only a concept's name and, for filtering, its accepts list.
  - node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
    why: The one endpoint that could violate this rule, POST /v1/cases/{slug}/hypotheses, treats a name it already holds as the hypothesis to revise rather than a collision to reject, so the invariant is upheld by that endpoint's own semantics, never by a check any task in this wave performs.
  - node: rules/knowledge/every-collected-concept-has-a-read-only-capability
    why: This rule concerns the integration context's own capability registry, checked at diagnosis time; no task in this wave reads or displays anything from that registry.
  - node: rules/knowledge/validation-runs-at-every-read
    why: No task's criteria assert or exercise read-time revalidation of a stored case version; every GET this wave issues is treated as already reading back as a case.
  - node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
    why: This rule governs what a brand-new draft's manifest starts holding at creation, which is Onda 3's own territory (new-draft-creation); no task in this wave originates a draft.
sources:
  - intake/onda-4-scope.md
---

## What it is
This epic replaces VersionManifestPlaceholder, ManifestHypothesisPlaceholder and CaseHypothesesPlaceholder with three real screens.
Manifest Builder reorders and removes a draft's manifest entries against the real PUT/DELETE endpoints.
Revise-or-originate-a-hypothesis is the one shared form both "+ Add hypothesis" and "Revise ->" open, submitting to POST /v1/cases/{slug}/hypotheses.
The Hypotheses tab lists a case's hypotheses and each one's own revision history, read-only.

## Notes
Release and Discard stay out of this epic's scope, deferred to Onda 5, as the scope itself states.
The "Try it" diagnose sandbox stays out of every wave's scope, as the scope itself states.
Mapping the four unmapped hypothesis-revision domain errors in the backend is explicitly out of scope for this initiative's frontend target; the generic-failure-message behavior in revise-hypothesis-form is this wave's own accommodation, not a fix.
