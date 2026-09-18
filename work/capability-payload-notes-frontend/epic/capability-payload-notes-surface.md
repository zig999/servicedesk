---
title: Payload notes on the capability authoring and detail surfaces
summary: Carry the capability's optional payload_notes attribute through the frontend's shared capability
  contract declarations, both form hooks' read and write paths, and the one field-rendering component
  the registration screen and the detail view both compose.
rationale: The scope names one attribute on two surfaces that already exist, so one epic holds the whole
  of it; the specification nodes it answers to are the attribute's own declaration, the reading that states
  every declared attribute as the read answered them, the discard that returns every field to that reading,
  and the contract rule whose refusal must not reach an attribute the registration may leave undeclared.
sources:
- work/capability-payload-notes-frontend/intake/scope.md
covers:
- domain/integration/capability
- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
- rules/integration/a-capability-declares-its-contract
- rules/integration/a-successful-capability-registration-lands-on-the-capabilitys-own-surface
- rules/integration/an-authoring-surface-includes-an-unsubmitted-edit-of-a-standing-registration
- rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
- rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
- rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
- rules/integration/a-registration-outcome-is-never-stated-before-the-registry-answers
- rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
- rules/integration/a-surface-holding-no-read-registration-offers-no-discard
- rules/integration/a-return-to-origin-routes-presence-turns-on-nothing-further
- rules/integration/a-return-to-origin-with-no-surface-to-return-to-lands-on-the-registrys-listing
- rules/integration/an-abandoned-capability-registration-entry-registers-nothing
- rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
- rules/integration/an-abandonment-with-no-surface-to-return-to-registers-nothing
- constraints/every-screen-discloses-that-authentication-is-unenforced
uncovered:
- node: rules/integration/a-successful-capability-registration-lands-on-the-capabilitys-own-surface
  why: Where a successful submission lands the operator turns on the name and version the entry carried
    and on nothing about payload notes, and that destination already stands in the tree.
- node: rules/integration/an-authoring-surface-includes-an-unsubmitted-edit-of-a-standing-registration
  why: This states which surfaces count as authoring for the abandonment destination, a classification
    no new field changes.
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  why: The return-to-origin act is detail-view chrome that carries no capability attribute, and the plan
    leaves that control exactly as it stands.
- node: rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
  why: The three presentations are held apart by chrome outside the field-rendering component, and the
    new field is rendered only inside the presentation the answered read already gates.
- node: rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
  why: The route to the listing is a control on the surface and states no capability attribute.
- node: rules/integration/a-registration-outcome-is-never-stated-before-the-registry-answers
  why: When an outcome may be stated turns on the registry's answer arriving, not on which attributes
    the submission carried.
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  why: The outcome names the capability's name and version and the refusal's condition, neither of which
    payload notes enters.
- node: rules/integration/a-surface-holding-no-read-registration-offers-no-discard
  why: Whether the discard act is offered at all turns on the surface holding a read registration, a condition
    this work does not touch.
- node: rules/integration/a-return-to-origin-routes-presence-turns-on-nothing-further
  why: The presence of the return control is unconditional and unrelated to the attributes the form holds.
- node: rules/integration/a-return-to-origin-with-no-surface-to-return-to-lands-on-the-registrys-listing
  why: This fixes a destination for a routing act the plan does not change.
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  why: What an abandonment registers is decided at the registry call, which this work adds no new occasion
    for.
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  why: An abandonment's destination is routing chrome the plan leaves untouched.
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-registers-nothing
  why: This forbids a write on an abandonment, and no task here adds or moves a registry call.
- node: constraints/every-screen-discloses-that-authentication-is-unenforced
  why: No screen is added or removed here, so the disclosure already standing on the registration screen
    and the detail view is untouched.
---
## What it is

The capability's payload_notes attribute reaches the frontend's capability type, its form schema, both form hooks and the shared field-rendering component.
An operator declares payload notes on the registration screen and sees and edits them on the capability's own detail surface.
The work is cut by seam rather than by file, because the two hooks each carry both a read path and a write path.

## Notes

The inventory records that capability-detail-ready-view composes the same CapabilityFormFields component the create screen composes, so there is no separate read-only display markup to cut a task for.
The inventory records that the backend DTOs already declare payload_notes as an optional string, so no task here touches the wire contract.
