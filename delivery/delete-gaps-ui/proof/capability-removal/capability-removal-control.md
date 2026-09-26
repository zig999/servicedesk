---
target: frontend
title: Capability removal control behind a further explicit act — proof
summary: Screen-level tests over CapabilityDetailScreen establish that the capability
  detail surface offers a removal control gated by a Cancel/confirm dialog that asks
  before anything happens, issues no DELETE on opening or on decline, issues exactly
  one DELETE to the capability's own resource path only on confirm, leaves the capability's
  presented identity unchanged after a decline, and asks for no typed name or version.
implementation: sha256:6da0cb57fb9263e7163deeab421018fee8a47cd49d0fb4243fe5253fcfea0b79
tests:
- file: src/routes/capability-detail-screen-removal.spec.ts
  name: renders a Remove capability control alongside the capability it presents
  proves: Criterion — the capability's surface at /capabilities/:name/:version offers
    a removal control for the capability it presents.
  fails_when: No control labeled "Remove capability" is rendered once the capability
    detail screen has finished loading.
- file: src/routes/capability-detail-screen-removal.spec.ts
  name: opens a confirmation dialog asking whether the capability's removal is to
    be performed
  proves: Criterion — taking the removal control asks whether the capability's removal
    is to be performed.
  fails_when: Clicking the removal control does not open a dialog carrying the text
    "Remove this capability?" before anything else happens.
- file: src/routes/capability-detail-screen-removal.spec.ts
  name: issues no DELETE request merely by opening the confirmation dialog
  proves: Criterion — taking the removal control issues no DELETE request.
  fails_when: Opening the confirmation dialog by itself causes a DELETE request to
    the capability's resource path.
- file: src/routes/capability-detail-screen-removal.spec.ts
  name: issues exactly one DELETE request to the presented capability's own resource
    path once the further act is confirmed
  proves: Criterion — confirming the removal in the further act issues one DELETE
    request to /v1/capabilities/:name/:version carrying the presented capability's
    name and version.
  fails_when: Confirming the dialog issues zero or more than one DELETE request, or
    issues one to a path other than the presented capability's own name and version.
- file: src/routes/capability-detail-screen-removal.spec.ts
  name: issues no DELETE request when Cancel is clicked in the confirmation dialog
  proves: Criterion — declining the further act issues no DELETE request.
  fails_when: Clicking Cancel inside the confirmation dialog causes a DELETE request
    to be issued.
- file: src/routes/capability-detail-screen-removal.spec.ts
  name: still presents the capability under its original name and version once the
    further act is declined
  proves: Criterion — after the further act is declined, the surface still presents
    the capability unchanged under the same name and version.
  fails_when: After Cancel is clicked, the Name or Version field no longer shows the
    capability's original name or version.
- file: src/routes/capability-detail-screen-removal.spec.ts
  name: offers no text input inside the confirmation dialog
  proves: Criterion — the further act does not ask the operator to type the capability's
    name or version.
  fails_when: The confirmation dialog renders a text input (any element with role
    textbox).
not_applicable:
- edge_case: The HTTP 409 CapabilityCitedByEvidenceError refusal, or any other DELETE
    failure response, once it is issued.
  why: This task stops once the DELETE is issued; stating the outcome is the outcome-disclosure
    task's own obligation.
- edge_case: A second, concurrent confirm click issuing a second DELETE.
  why: No criterion requires protection against a repeated issuance, and the confirm
    control is a DialogClose that unmounts on click.
- edge_case: Removal of a capability whose name or version contains characters that
    require URL-encoding.
  why: The DELETE reuses the identical name/version closure variables the hook's existing
    GET and PUT calls already address through the same encoding.
- edge_case: Whether the removal control appears before the capability has loaded
    (loading, load-error, or not-registered phases).
  why: No criterion states the control's absence in those phases; the control lives
    only inside the ready view.
untested:
- domain/integration/capability — the node's fact states the aggregate's full declared
  contract; no finite test reachable from this task decides that whole fact. This
  task's DELETE addresses the aggregate only by its identity (name, version).
- rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act
  — the rule's stated fact spans three surfaces; only the capability branch reaches
  a criterion here, per the task's own REMAINDER note.
- The implementation's own inference that the Remove capability trigger is disabled
  while a delete is already pending is a decision about behavior no criterion states;
  it is not pinned by a test here.
run: run/concept-removal-concept-in-use-refusal-recognition-suite-3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
Proof for the capability removal control gated by a further explicit act.

## Notes
None.
