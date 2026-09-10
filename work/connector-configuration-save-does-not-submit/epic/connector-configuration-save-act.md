---
title: The register act on the connector configuration screen
summary: What an operator's save on the connector configuration screen must reach, and the proof that fails when it
  does not.
rationale: 'Seeded from trace.py --encodes over the file the human named, then closed one hop over the specification
  the same way step 1 closes any impact set: the encoded set names what that file already answered for, and a save
  that never dispatches is a failure of the act, which reaches every rule the connector-configuration domain node
  and the registration surface state, whether or not this correction touches it.'
sources:
- intake/scope.md
covers:
- contracts/integration/connector-configuration-registry
- domain/integration/capability
- domain/integration/connector-configuration
- rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
- rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
- rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered
- rules/integration/a-connector-configuration-holds-a-well-formed-object
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- rules/integration/a-connector-configuration-listing-routes-presence-turns-on-nothing-further
- rules/integration/a-connector-configuration-names-its-connector
- rules/integration/a-connector-configuration-placeholder-is-written-in-one-of-three-forms
- rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
- rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
- rules/integration/a-connector-placeholder-refusal-reports-every-orphaned-placeholder
- rules/integration/a-diagnostic-response-masks-a-resolved-credential
- rules/integration/a-failed-connector-configuration-read-is-reissued-only-on-the-operators-act
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
- rules/integration/a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under
- rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
- rules/integration/a-presented-connector-configurations-four-readings-are-mutually-distinguishable
- rules/integration/a-registration-outcome-is-never-stated-before-the-registry-answers
- rules/integration/a-return-to-origin-routes-presence-turns-on-nothing-further
- rules/integration/a-return-to-origin-with-no-surface-to-return-to-lands-on-the-registrys-listing
- rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
- rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
- rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
- rules/integration/a-surface-holding-no-read-registration-offers-no-discard
- rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
- rules/integration/an-abandonment-with-no-surface-to-return-to-registers-nothing
- rules/integration/an-authoring-surface-includes-an-unsubmitted-edit-of-a-standing-registration
- rules/integration/an-http-connector-configuration-declares-its-call
- rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary
- rules/integration/an-incomplete-or-unresolvable-connector-call-descriptor-ends-unavailable
- rules/integration/an-unclassified-status-ends-unavailable
- rules/integration/an-unreachable-connector-ends-unavailable
- rules/integration/an-unresolvable-observation-ends-unavailable
- rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation
- rules/integration/applying-a-drafted-configuration-changes-only-the-local-edit
- scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
- scenarios/integration/a-drafts-method-mismatches-what-is-registered
- scenarios/integration/an-optional-attribute-absent-degrades-its-observation
- scenarios/integration/applying-a-draft-over-an-unsaved-edit-asks-for-confirmation
uncovered:
- node: domain/integration/capability
  why: The capability registry and its authoring surface are a different registration surface this correction never
    touches; the connector configuration save control is the whole of what dispatches nothing here.
- node: rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
  why: The configuration helper is unaffected by restoring the save control's form ownership; no criterion of this
    task reaches it.
- node: rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered
  why: The drafts-method comparison runs before any save is attempted and is unchanged by this correction.
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  why: The object's well-formedness is already validated by the delivered composition; this correction changes no
    field of it, only whether activating save reaches the form at all.
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  why: The test panel is a separate surface from the authoring screen's save control and this correction does not
    touch it.
- node: rules/integration/a-connector-configuration-listing-routes-presence-turns-on-nothing-further
  why: The listing screen and its routes are untouched; no criterion of this task reaches them.
- node: rules/integration/a-connector-configuration-names-its-connector
  why: The connector name the configuration carries is unchanged by this correction.
- node: rules/integration/a-connector-configuration-placeholder-is-written-in-one-of-three-forms
  why: Placeholder writing is a property of the configuration's content, unchanged by restoring the save control's
    form ownership.
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  why: This is a read-path refusal, prior to any save the operator attempts, and this correction touches only the
    submit path.
- node: rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
  why: The route to the listing is untouched; no criterion of this task reaches it.
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  why: Placeholder declaration is a capability-authoring concern this correction does not reach.
- node: rules/integration/a-connector-placeholder-refusal-reports-every-orphaned-placeholder
  why: This refusal is unchanged by restoring the save control's form ownership; no criterion of this task reaches
    it.
- node: rules/integration/a-diagnostic-response-masks-a-resolved-credential
  why: Diagnostic responses belong to the test panel, a separate surface this correction does not touch.
- node: rules/integration/a-failed-connector-configuration-read-is-reissued-only-on-the-operators-act
  why: This is a read-path behavior, prior to any save, unchanged by this correction.
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  why: The discard control is unaffected by restoring the save control's form ownership; no criterion of this task
    reaches it.
- node: rules/integration/a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under
  why: This presentation state is read-path, prior to any save, and unchanged by this correction.
- node: rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
  why: This presentation state is read-path, prior to any save, and unchanged by this correction.
- node: rules/integration/a-presented-connector-configurations-four-readings-are-mutually-distinguishable
  why: This is a read-path presentation property, unchanged by this correction.
- node: rules/integration/a-return-to-origin-routes-presence-turns-on-nothing-further
  why: The return-to-origin control's routing is a distinct control from the abandon control this task's fifth
    criterion reaches, and this correction does not touch it.
- node: rules/integration/a-return-to-origin-with-no-surface-to-return-to-lands-on-the-registrys-listing
  why: The return-to-origin control is distinct from the abandon control this task's fifth criterion reaches, and
    this correction does not touch it.
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  why: This states the return-to-origin control offered on every reading, a control this correction does not touch;
    it also governs the capability registry's own surface, which this correction never reaches.
- node: rules/integration/a-surface-holding-no-read-registration-offers-no-discard
  why: The discard control's availability is unaffected by restoring the save control's form ownership.
- node: rules/integration/an-authoring-surface-includes-an-unsubmitted-edit-of-a-standing-registration
  why: How the authoring surface composes an unsubmitted edit is unchanged by this correction, which reaches only
    whether activating save dispatches it.
- node: rules/integration/an-http-connector-configuration-declares-its-call
  why: The call descriptor's shape is unchanged by this correction.
- node: rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary
  why: The method and status vocabulary are unchanged by this correction.
- node: rules/integration/an-incomplete-or-unresolvable-connector-call-descriptor-ends-unavailable
  why: This governs the test panel's own dispatch, a separate surface this correction does not touch.
- node: rules/integration/an-unclassified-status-ends-unavailable
  why: This governs the test panel's own dispatch, a separate surface this correction does not touch.
- node: rules/integration/an-unreachable-connector-ends-unavailable
  why: This governs the test panel's own dispatch, a separate surface this correction does not touch.
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  why: This governs the test panel's own dispatch, a separate surface this correction does not touch.
- node: rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation
  why: Applying a drafted configuration over an unsaved edit is a distinct control this correction does not touch.
- node: rules/integration/applying-a-drafted-configuration-changes-only-the-local-edit
  why: Applying a drafted configuration is a distinct control this correction does not touch.
- node: scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
  why: This scenario walks a read-path refusal this correction does not touch.
- node: scenarios/integration/a-drafts-method-mismatches-what-is-registered
  why: This scenario walks the drafts-method comparison, unchanged by this correction.
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  why: This scenario walks the test panel's observation degrade, a separate surface this correction does not touch.
- node: scenarios/integration/applying-a-draft-over-an-unsaved-edit-asks-for-confirmation
  why: This scenario walks the apply-draft-over-unsaved-edit confirmation, a distinct control this correction does
    not touch.
---

## What it is

The one epic of a corrective increment: a save control on the connector configuration screen that dispatches nothing, and the proof that would have caught it.
It claims the nodes the trace already binds to the file the behavior lives in, plus the nodes one hop from them over the specification's own connections — the whole neighbourhood the file already answers for, whether or not this correction reaches each one.

## Notes

The claim was seeded mechanically from trace.py --encodes over src/routes/connector-configuration-form-fields.tsx, whose output the report carries verbatim, then closed one hop with spec.py --impact over that output.
