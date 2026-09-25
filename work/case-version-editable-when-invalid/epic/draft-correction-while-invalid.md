---
title: Correcting a draft that does not read back as a case
summary: The backend reads a draft version's own declared attributes and accepts an
  update-draft over them, whichever validator rule fails over that draft.
rationale: The scope names three rules and states no grouping; correction and discard
  are cut into two epics because they change for different reasons — correction adds
  a read and changes what update-draft answers, while discard's acceptance already
  stands in the source and is only held by proof.
sources:
  - work/case-version-editable-when-invalid/intake/scope.md
covers:
  - rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  - rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes
  - constraints/a-successful-case-version-own-record-read-answers-with-http-200
  - scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing
  - rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading
  - domain/knowledge/case-version
  - rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  - constraints/a-malformed-request-is-refused-with-a-validation-error
  - constraints/a-case-is-read-whole
  - constraints/a-domain-error-unmapped-by-status-is-refused-generically
  - domain/knowledge/case
  - domain/knowledge/case-summary
  - domain/knowledge/manifest-entry
  - domain/investigation/investigation
  - domain/glossary/subject-type
  - contracts/knowledge/case-query
  - rules/knowledge/validation-runs-at-every-read
  - rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  - rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
  - rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  - rules/knowledge/a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case
  - rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
  - rules/knowledge/a-case-has-at-least-one-hypothesis
  - rules/knowledge/a-presented-case-version-states-its-own-declared-attributes
  - rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
  - rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  - rules/knowledge/a-hypothesis-revision-history-stands-on-a-reading-whose-cases-current-version-does-not-read-back-as-a-case
  - rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest
  - rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone
  - rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version
  - rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  - scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
  - rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
  - rules/knowledge/an-abandoned-case-version-edit-writes-nothing
  - rules/knowledge/a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case
  - rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets
uncovered:
  - node: rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading
    why: The route carries only the slug and version number the reader supplied and
      depends on nothing the backend answers, so this backend-only scope has nothing
      to deliver for it; the surface that carries the route is in the frontend target.
  - node: constraints/a-case-is-read-whole
    why: read-case still assembles and validates a version whole or refuses it; the
      new read answers declared attributes only and is not a read for diagnosis.
  - node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
    why: No new domain error is introduced; the new read reuses CaseNotFoundError,
      which the status map already maps.
  - node: domain/knowledge/case
    why: No attribute, relationship or operation of the case changes.
  - node: domain/knowledge/case-summary
    why: The case listings and the summary they derive are untouched.
  - node: domain/knowledge/manifest-entry
    why: No task reads, writes or presents a manifest entry.
  - node: domain/investigation/investigation
    why: Diagnosis and replay are untouched.
  - node: domain/glossary/subject-type
    why: The draft's subject is read and written as stored, and no task checks it
      against the glossary.
  - node: rules/knowledge/validation-runs-at-every-read
    why: read-case still validates at every read; no validator rule is added, removed
      or relaxed.
  - node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
    why: read-case still answers HTTP 409 CaseVersionNotValidError over a version
      failing a validator rule, and no task changes it.
  - node: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
    why: A surface fact of the frontend target; no backend answer it depends on
      changes.
  - node: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
    why: A surface fact of the frontend target, and the read-case refusal it stands
      on is unchanged.
  - node: rules/knowledge/a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case
    why: Hypothesis composition is untouched.
  - node: rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
    why: The manifest surface and place-hypothesis are untouched, and rule 2 explicitly
      leaves the manifest to this node.
  - node: rules/knowledge/a-case-has-at-least-one-hypothesis
    why: Release still requires a hypothesis; nothing here reads an empty manifest
      as a case.
  - node: rules/knowledge/a-presented-case-version-states-its-own-declared-attributes
    why: The version-keyed reading it governs rests on read-case, which is unchanged;
      the editing surface's reading of a failing draft belongs to rule 2.
  - node: rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
    why: A surface route in the frontend target; nothing backend changes for it.
  - node: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
    why: A surface fact of the frontend target; no new error code is introduced.
  - node: rules/knowledge/a-hypothesis-revision-history-stands-on-a-reading-whose-cases-current-version-does-not-read-back-as-a-case
    why: Hypothesis revision listings are untouched.
  - node: rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest
    why: A surface route in the frontend target; the version listing is untouched.
  - node: rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone
    why: The case listing is untouched.
  - node: rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version
    why: No pin is read or presented by these tasks.
  - node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
    why: The summary derivation is untouched.
  - node: scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
    why: A case with no version is outside every failing-draft condition here and
      is answered as before.
  - node: rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
    why: A surface fact about a newly created draft's content in the frontend target;
      create-draft is untouched.
  - node: rules/knowledge/an-abandoned-case-version-edit-writes-nothing
    why: Abandonment writes nothing and is a surface fact of the frontend target.
  - node: rules/knowledge/a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case
    why: The revise path is untouched; it is the precedent for rule 2's reading,
      not work of this plan.
  - node: rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets
    why: Release and what a surface discloses about it are untouched.
---

## What it is

This epic holds the backend work that lets a curator's editing surface get a draft's own declared attributes, and have an update-draft accepted, while that draft does not read back as a case.

## Notes

The scope suggests changing readCase() so it returns the constructed Case with its violation list; this cut does not take that path, because a-case-version-failing-validation-at-a-read-is-refused-by-name keeps read-case answering 409, constraints/a-case-is-read-whole keeps it whole-or-nothing, and rule 2 reads none of the attributes through case-query's whole-case assembly.
The scope's instruction that structural corruption stays blocking holds for read-case, which is unchanged; for the editing surface, rule 2 covers any failing validator rule, the declared attributes' own included, so the scope's instruction does not narrow that read.
parse-case-document.ts is not re-cut to separate NO_HYPOTHESIS_PROBLEM, because no rule here depends on that separation.
The specification says nothing about what a released version's editing surface presents, so no criterion decides what the new read answers for a released version; the caller has to settle that before implementation.
Step 4's decided-fact route named the draft's own-record read: contracts/knowledge/case-query now publishes read-case-version beside read-case, decided into the specification and logged, and this epic's covers grew to include contracts/knowledge/case-query for it.
The frontend editor loads through read-case and re-hydrates its form from the update-draft answer, so rule 2 holds at the surface only once a frontend plan switches it to the new read and to update-draft's new answer.
