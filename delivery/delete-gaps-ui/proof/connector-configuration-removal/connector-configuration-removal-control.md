---
target: frontend
title: Connector configuration removal control proof
summary: Tests that the connector configuration detail screen offers a removal control
  gated by an explicit-confirm dialog, issuing the DELETE only on confirm, never on
  open or decline, never withheld for a capability naming the connector, and never
  triggered by an unchosen dismissal.
implementation: sha256:a6ad0e7b37116ff8ed443a98f3a4ddf1dc87bc6d979fb67306d83cb4368374d1
tests:
- file: src/routes/connector-configuration-detail-screen-remove.spec.ts
  name: offers a Remove connector configuration control alongside the presented configuration
  proves: Criterion 1 -- the connector configuration's surface at /connectors/:connector
    offers a removal control for the configuration it presents.
  fails_when: The ready view renders with no removal control reachable from the footer.
- file: src/routes/connector-configuration-detail-screen-remove.spec.ts
  name: opens a confirmation dialog stating what taking the control would do, rather
    than acting immediately
  proves: Criterion 2 -- taking the removal control asks whether the configuration's
    removal is to be performed.
  fails_when: Taking the removal control performs the removal directly, or opens nothing
    asking for confirmation.
- file: src/routes/connector-configuration-detail-screen-remove.spec.ts
  name: issues no DELETE request merely from opening the confirmation dialog
  proves: Criterion 3 -- taking the removal control issues no DELETE request.
  fails_when: Opening the confirmation dialog itself issues a DELETE request.
- file: src/routes/connector-configuration-detail-screen-remove.spec.ts
  name: issues exactly one DELETE request to /v1/connectors/:connector, carrying the
    presented connector name, once the further act confirms
  proves: Criterion 4 -- confirming the removal in the further act issues one DELETE
    request to /v1/connectors/:connector carrying the presented configuration's connector
    name.
  fails_when: Confirming issues zero DELETE requests, more than one, or one addressed
    to a connector name other than the one presented.
- file: src/routes/connector-configuration-detail-screen-remove.spec.ts
  name: issues no DELETE request when Keep configuration is clicked
  proves: Criterion 5 -- declining the further act issues no DELETE request.
  fails_when: Declining (Keep configuration) issues a DELETE request.
- file: src/routes/connector-configuration-detail-screen-remove.spec.ts
  name: still presents the same configuration under the same connector name after
    Keep configuration is clicked
  proves: Criterion 6 -- after the further act is declined, the surface still presents
    the configuration unchanged under the same connector name.
  fails_when: Declining changes the presented configuration text or the connector
    name shown.
- file: src/routes/connector-configuration-detail-screen-remove.spec.ts
  name: offers only Keep configuration and Remove connector configuration buttons
    in the dialog, with no text input
  proves: Criterion 7 -- the further act does not ask the operator to type the connector's
    name.
  fails_when: The confirmation dialog contains a text input, in particular one asking
    for the connector's name.
- file: src/routes/connector-configuration-detail-screen-remove.spec.ts
  name: still offers an enabled Remove connector configuration control when a registered
    capability names this connector as its own
  proves: Criterion 8 -- the removal control is not withheld where a capability names
    the connector as its own.
  fails_when: The removal control is hidden or disabled because a registered capability
    names this connector as its own.
- file: src/routes/connector-configuration-detail-screen-remove.spec.ts
  name: issues no DELETE request when the confirmation dialog is dismissed through
    its own close control rather than through Keep configuration or Remove connector
    configuration
  proves: UNDERDETERMINED, from the specification -- a reading treating any dismissal
    with no explicit choice as confirmation would still pass every stated criterion.
  fails_when: An implementation that issues the DELETE request when the confirmation
    dialog is dismissed with no explicit Keep-configuration or Remove-connector-configuration
    choice.
not_applicable:
- edge_case: A second removal click, or a removal confirmed while a prior removal
    is still in flight.
  why: No criterion states what a repeat or concurrent confirm does.
- edge_case: The DELETE request failing (network error, an unmapped domain error,
    a validation error).
  why: REMAINDER — stating a submitted removal's outcome belongs to the outcome-disclosure
    task.
- edge_case: A removal naming a connector nothing is currently registered under.
  why: REMAINDER — belongs to the backend remove-connector route, not observable from
    a frontend test against a mocked fetch.
- edge_case: Offering or withholding the removal control while the read is still pending,
    has failed, or found nothing registered under the name.
  why: ADVISORY — the first criterion is read as holding only while a configuration
    is presented; other states are left open by the specification.
- edge_case: The concept and capability removal controls (the rule's other two branches).
  why: REMAINDER — assigned to sibling tasks; this task's criteria and files cover
    only the connector-configuration surface.
untested:
- domain/integration/connector-configuration -- this task's tests exercise only the
  addressing-by-name half; the replace-on-edit half is a fact of the PUT flow this
  task did not touch.
- rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act
  -- spans three surfaces; only the connector-configuration branch is tested here.
- rules/integration/removing-a-connector-configuration-is-unconditional -- only the
  capability-naming branch (criterion 8) is tested here; the unregistered-name branch
  is REMAINDER, belonging to the backend route.
run: run/concept-removal-concept-in-use-refusal-recognition-suite-3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
Proof for the connector configuration removal control gated by a further explicit act.

## Notes
None.
