---
title: Case Detail's Attributes tab withdrawal
summary: The withdrawal of the Attributes tab from Case Detail, the relocation of the one disclosure only
  that tab produced, and the removal of everything in the frontend tree that existed only for the tab.
rationale: 'One epic because the scope withdraws one surface from one screen; it claims the specification
  nodes that withdrawn surface read from so the claim is reconciled rather than left implicit. Two of
  its candidates were unstated when this epic was first cut and were decided into the specification during
  binding, blind to any task: one requires a case-keyed surface to keep disclosing a current version that
  fails validation, which this epic answers with a third task rather than accepting the loss; the other
  requires a version reading to show its own declared attributes, already satisfied by the pre-existing
  Version Editor screen untouched by this plan. A third rule, discovered by the same binding pass, states
  a backend read refusal this epic does not implement (its target is the frontend tree alone) and does
  not depend on.'
sources:
- work/case-detail-attributes-tab-removal/intake/scope.md
covers:
- domain/knowledge/case
- domain/knowledge/case-version
- domain/knowledge/case-version-state
- domain/knowledge/case-summary
- domain/knowledge/resolution
- domain/knowledge/referral
- domain/knowledge/consolidation-register
- contracts/knowledge/case-query
- rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version
- rules/knowledge/validation-runs-at-every-read
- rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
- rules/knowledge/a-presented-case-version-states-its-own-declared-attributes
- rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
uncovered:
- node: domain/knowledge/case
  why: The withdrawn tab was keyed by a case's slug; nothing in this plan changes what a case is or how
    any surviving surface reads one, and the case listing and the Version Editor screen continue to read
    it.
- node: domain/knowledge/case-version
  why: The tab presented a version's own declared attributes and this plan stops presenting them there;
    the version and every other surface reading it are untouched by this plan.
- node: domain/knowledge/case-version-state
  why: The withdrawn action branched on draft versus released; the state itself is unchanged and the Versions
    tab that still presents it is untouched by this plan.
- node: domain/knowledge/case-summary
  why: The catalog surface that answers a case-summary sits outside this plan's files and is not touched
    by any task.
- node: domain/knowledge/resolution
  why: The tab displayed the fallback outcome and nothing in this plan alters a resolution or any other
    surface that presents one.
- node: domain/knowledge/referral
  why: The tab displayed the fallback referral's action and recipient and nothing in this plan alters
    a referral or any other surface that presents one.
- node: domain/knowledge/consolidation-register
  why: The tab displayed the version's consolidation register and nothing in this plan alters the register
    or any other surface that presents it.
- node: contracts/knowledge/case-query
  why: The withdrawn tab called read-case for one version; this plan removes a caller and changes no operation
    of the contract, and list-case-versions stays called by the surviving Versions panel.
- node: rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version
  why: The withdrawn tab derived a current version to present its own attributes; this plan removes that
    presentation and leaves the pins and every other reader of them untouched.
- node: rules/knowledge/validation-runs-at-every-read
  why: The read and its refusal are unchanged by this plan; the replacement presentation this plan writes
    is governed by a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case, which
    names this rule's own condition rather than restating it.
- node: rules/knowledge/a-presented-case-version-states-its-own-declared-attributes
  why: Already satisfied, independent of this plan's deletions, by the pre-existing Version Editor screen
    (case-version-editor-form-fields.tsx), which shows a version's title, when_to_use, subject, fallback
    outcome/referral and consolidation_register (stating "Not set" where absent) for both draft and released
    state; no task of this plan touches that file.
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  why: A backend invariant over the HTTP status and error name read-case answers with; this epic's target
    is the frontend tree alone. The frontend already distinguishes this state by the response body's error
    code regardless of HTTP status (frontend/app/src/services/error-ui-state.ts keys on error.code, not
    on the numeric status), confirmed directly, so no task here depends on the backend's own conformance
    to this rule.
---

## What it is
The Attributes tab is the third tab on Case Detail, alongside Versions and Hypotheses, presenting the case's current version's declared attributes with a state-sensitive navigation action and an explicit case-not-valid refusal state.
This epic holds three tasks: one takes the tab off the screen, one relocates the one disclosure only that tab produced onto the Versions panel that remains, and one takes the tab's modules and their dedicated tests out of the tree once nothing needs them.
It claims the specification nodes the withdrawn surface read from, including two decided into the specification during this epic's own binding pass, and declares each of them either answered by a task or left untouched by this plan.

## Notes
The scope states this is a capability's-surface removal, not a change to any domain fact; binding it against the specification surfaced two genuine silences, now decided nodes, and a third fact about backend behavior this epic does not implement.
The inventory reports no siegard-trace.json entry for either of the two modules this plan removes, searched directly.
