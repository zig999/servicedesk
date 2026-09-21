---
title: The manifest builder offers placing an already-composed hypothesis into a draft version's manifest
summary: The frontend holds no control that places an existing hypothesis of a case into a draft version's
  manifest -- the manifest builder's only placing affordance composes a new hypothesis identity -- so
  a curator who composes a hypothesis can never get it into the manifest it was composed for, and the
  version stays refused for declaring no hypothesis.
rationale: One epic for the one gap the scope names, covering the whole impact-set closure the situate
  step computed around the manifest builder and the case/hypothesis/manifest-entry domain; the narrowing
  of what any single task answers for is left to per-task binding rather than to a smaller covers claim.
sources:
- work/case-not-valid-surface-presentation-corrective/intake/scope-manifest-builder-places-an-existing-hypothesis.md
covers:
- contracts/knowledge/case-query
- rules/knowledge/a-placing-offered-on-a-manifest-surface-carries-the-cases-hypotheses-that-version-does-not-already-hold
- rules/knowledge/a-placement-into-a-manifest-holding-no-entry-pins-the-revision-the-curator-names
- rules/knowledge/a-first-placements-position-is-the-one-the-curator-declares
- constraints/a-case-is-read-whole
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/consolidation-runs-behind-a-port
- constraints/diagnosis-answers-synchronously
- constraints/every-screen-discloses-that-authentication-is-unenforced
- constraints/evidence-normalization-is-an-anticorruption-layer
- constraints/hypotheses-are-judged-in-isolated-parallel-calls
- constraints/judgment-runs-behind-a-port
- constraints/listings-are-paged
- constraints/no-route-enforces-authentication
- constraints/the-capability-identity-read-is-rate-limited
- constraints/the-capability-identity-read-refuses-an-unregistered-identity
- constraints/the-concept-read-refuses-an-unanswered-concept
- constraints/the-connection-pool-is-bounded-by-configuration
- constraints/the-consolidation-prompt-is-closed
- constraints/the-database-is-externally-provisioned
- constraints/the-deadline-is-an-absolute-propagated-instant
- constraints/the-diagnosis-and-simulation-routes-are-rate-limited
- constraints/the-domain-depends-on-no-infrastructure
- constraints/the-evidence-cache-admits-only-ok-results
- constraints/the-judgment-prompt-is-closed
- constraints/the-openapi-document-is-fetched-by-the-backend
- constraints/the-pool-bounds-are-positive-integers
- constraints/the-register-capability-route-defers-completeness-to-the-registry
- constraints/the-register-capability-route-defers-the-nature-vocabulary-to-the-registry
- constraints/the-schema-replays-from-its-scripts
- constraints/the-stored-schema-mirrors-the-declared-model
- constraints/the-system-persists-to-one-relational-database
- contracts/knowledge/case-lifecycle
- domain/glossary/subject-type
- domain/knowledge/case
- domain/knowledge/case-version
- domain/knowledge/case-version-state
- domain/knowledge/consolidation-register
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- domain/knowledge/manifest-entry
- domain/knowledge/resolution
- rules/glossary/a-registered-concept-is-never-removed
- rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
- rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
- rules/investigation/a-simulation-result-is-stale-once-its-source-changes
- rules/investigation/a-simulation-writes-no-investigation
- rules/investigation/only-a-released-case-version-is-diagnosed
- rules/investigation/the-outcome-comes-from-the-case
- rules/knowledge/a-case-has-at-least-one-hypothesis
- rules/knowledge/a-case-has-at-most-one-draft
- rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug
- rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
- rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
- rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
- rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
- rules/knowledge/a-case-version-is-written-once
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-case-version-number-is-never-reused
- rules/knowledge/a-case-versions-authored-at-is-fixed-when-its-creating-write-settles
- rules/knowledge/a-case-versions-input-requirements-are-derived
- rules/knowledge/a-case-versions-listing-answers-highest-numbered-first
- rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version
- rules/knowledge/a-concept-accepts-the-declared-subject-type
- rules/knowledge/a-concept-answered-by-none-or-several-capabilities-contributes-no-input-requirement
- rules/knowledge/a-draft-case-versions-discard-reproduces-the-cases-own-slug
- rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
- rules/knowledge/a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case
- rules/knowledge/a-hypothesis-composition-states-which-of-its-reads-did-not-complete
- rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/a-hypothesis-name-is-unique-within-its-case
- rules/knowledge/a-hypothesis-position-is-unique-within-its-case
- rules/knowledge/a-hypothesis-revision-history-stands-on-a-reading-whose-cases-current-version-does-not-read-back-as-a-case
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- rules/knowledge/a-hypothesis-revision-number-is-never-reused
- rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest
- rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
- rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
- rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
- rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
- rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
- rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives
- rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
- rules/knowledge/a-presented-case-version-states-its-own-declared-attributes
- rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
- rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state
- rules/knowledge/a-release-refusal-with-no-named-violation-says-so
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
- rules/knowledge/a-revise-hypothesis-requests-own-subject-type-is-never-read
- rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
- rules/knowledge/a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case
- rules/knowledge/a-successful-case-version-creation-lands-on-the-created-versions-own-surface
- rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets
- rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
- rules/knowledge/an-abandoned-case-version-edit-writes-nothing
- rules/knowledge/an-abandoned-revision-composition-writes-nothing
- rules/knowledge/case-terms-exist-in-the-glossary
- rules/knowledge/every-position-declares-a-resolution
- rules/knowledge/hypotheses-are-ordered-by-precedence
- rules/knowledge/only-a-draft-case-version-may-be-discarded
- rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act
- rules/knowledge/remove-hypothesis-for-an-absent-name-succeeds-with-no-effect
- rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses
- rules/knowledge/the-contract-check-reads-the-current-registration
- rules/knowledge/validation-runs-at-every-read
- scenarios/investigation/a-draft-case-version-is-simulated
- scenarios/investigation/a-draft-case-version-refuses-diagnosis
- scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
- scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
- scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
- scenarios/knowledge/a-catalog-entry-follows-the-released-version
- scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
- scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
- scenarios/knowledge/a-released-version-keeps-its-original-revision
- scenarios/knowledge/a-subject-mismatch-refuses-the-case
- scenarios/knowledge/no-confirmation-falls-back
- scenarios/knowledge/placing-a-manifest-entry-is-never-refused-for-a-drafts-revision-state
- scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
uncovered:
- node: constraints/a-case-is-read-whole
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/consolidation-runs-behind-a-port
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/diagnosis-answers-synchronously
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/every-screen-discloses-that-authentication-is-unenforced
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/judgment-runs-behind-a-port
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/listings-are-paged
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/no-route-enforces-authentication
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-capability-identity-read-is-rate-limited
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-concept-read-refuses-an-unanswered-concept
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-connection-pool-is-bounded-by-configuration
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-consolidation-prompt-is-closed
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-database-is-externally-provisioned
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-diagnosis-and-simulation-routes-are-rate-limited
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-domain-depends-on-no-infrastructure
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-evidence-cache-admits-only-ok-results
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-judgment-prompt-is-closed
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-pool-bounds-are-positive-integers
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-register-capability-route-defers-completeness-to-the-registry
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-register-capability-route-defers-the-nature-vocabulary-to-the-registry
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-schema-replays-from-its-scripts
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-stored-schema-mirrors-the-declared-model
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: constraints/the-system-persists-to-one-relational-database
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: domain/glossary/subject-type
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: domain/knowledge/case
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: domain/knowledge/case-version
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: domain/knowledge/case-version-state
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: domain/knowledge/consolidation-register
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: domain/knowledge/hypothesis
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: domain/knowledge/hypothesis-revision
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: domain/knowledge/resolution
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/glossary/a-registered-concept-is-never-removed
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/investigation/a-simulation-writes-no-investigation
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/investigation/only-a-released-case-version-is-diagnosed
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/investigation/the-outcome-comes-from-the-case
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-case-has-at-most-one-draft
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-case-version-is-written-once
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-case-version-number-is-never-reused
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-case-versions-authored-at-is-fixed-when-its-creating-write-settles
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-case-versions-listing-answers-highest-numbered-first
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-concept-answered-by-none-or-several-capabilities-contributes-no-input-requirement
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-draft-case-versions-discard-reproduces-the-cases-own-slug
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-hypothesis-composition-states-which-of-its-reads-did-not-complete
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-hypothesis-revision-history-stands-on-a-reading-whose-cases-current-version-does-not-read-back-as-a-case
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-presented-case-version-states-its-own-declared-attributes
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-revise-hypothesis-requests-own-subject-type-is-never-read
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-successful-case-version-creation-lands-on-the-created-versions-own-surface
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/an-abandoned-case-version-edit-writes-nothing
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/an-abandoned-revision-composition-writes-nothing
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/case-terms-exist-in-the-glossary
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/every-position-declares-a-resolution
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/remove-hypothesis-for-an-absent-name-succeeds-with-no-effect
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: rules/knowledge/validation-runs-at-every-read
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: scenarios/investigation/a-draft-case-version-is-simulated
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: scenarios/investigation/a-draft-case-version-refuses-diagnosis
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: scenarios/knowledge/a-released-version-keeps-its-original-revision
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: scenarios/knowledge/no-confirmation-falls-back
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: scenarios/knowledge/placing-a-manifest-entry-is-never-refused-for-a-drafts-revision-state
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  why: Part of the impact-set closure around the case/hypothesis/manifest-entry domain the epic's seed
    area (the manifest builder screen and hook) touches, but outside this task's narrow scope -- placing
    an already-composed hypothesis into a draft version's manifest -- and untouched by this task.
---


## What it is
The manifest builder's surface for putting a hypothesis the case already holds into a draft version's manifest. Today the builder's only placing affordance is the "+ Add hypothesis" link, which opens the New Hypothesis screen and composes another hypothesis identity, so a hypothesis composed a moment ago has no route into the manifest it was composed for. The backend act (place-hypothesis, PUT over the manifest entry) and the reads that name a case's hypotheses and their revisions all exist already; what is missing is the frontend choice-and-place surface over them.

## Notes
None.
