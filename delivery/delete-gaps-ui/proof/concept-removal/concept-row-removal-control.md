---
target: frontend
title: Proof for the glossary concept row's removal control, gated by a further explicit
  act
summary: Tests that every concept row offers a Remove control that only asks on the
  first act, issues the DELETE to /v1/glossary/concepts/:name for the acted-upon row's
  own name only on confirmation, issues none on decline or on a no-choice dismissal,
  leaves the row unchanged on decline, and never asks the operator to type the concept's
  name.
implementation: sha256:1aca8bc4496a0585e6e444290ef86be2124823179e46dab6d080aa75fb615dd5
tests:
- file: src/routes/glossary-concepts-panel-removal-control.spec.tsx
  name: 'ConceptsPanel — per-row removal control (criterion 1): offers a Remove control
    on every row the concepts listing shows'
  proves: Criterion — Each row of the concepts listing offers a removal control for
    that row's concept.
  fails_when: A row the concepts listing renders carries no Remove control.
- file: src/routes/glossary-concepts-panel-removal-control.spec.tsx
  name: 'ConceptsPanel — taking the removal control (criteria 2 and 3): asks whether
    the concept''s removal is to be performed and issues no DELETE request on that
    asking alone'
  proves: Criteria — Taking a row's removal control asks whether that concept's removal
    is to be performed; and taking it issues no DELETE request.
  fails_when: Taking the row's Remove control either fails to open a dialog asking
    about the removal, or issues a DELETE request before any further, separate confirming
    act.
- file: src/routes/glossary-concepts-panel-removal-control.spec.tsx
  name: 'ConceptsPanel — declining the further act (criteria 5 and 6): issues no DELETE
    request and leaves the row listed unchanged under the same name when Cancel is
    taken'
  proves: Criteria — Declining the further act issues no DELETE request; and after
    it is declined, the concept's row is still listed unchanged under the same name.
  fails_when: Clicking Cancel issues a DELETE request, or the concept's row stops
    being listed after Cancel is taken.
- file: src/routes/glossary-concepts-panel-removal-control.spec.tsx
  name: 'ConceptsPanel — confirming the further act (criterion 4): issues exactly
    one DELETE to /v1/glossary/concepts/:name carrying the acted-upon row''s own concept
    name, not a different row''s'
  proves: Criterion — Confirming the removal in the further act issues one DELETE
    request to /v1/glossary/concepts/:name carrying that row's concept name.
  fails_when: Confirming issues no DELETE, more than one, one to the wrong path, or
    one carrying a different row's concept name.
- file: src/routes/glossary-concepts-panel-removal-control.spec.tsx
  name: 'ConceptsPanel — no name-typing in the further act (criterion 7): carries
    no text input asking the operator to type the concept''s name'
  proves: Criterion — The further act does not ask the operator to type the concept's
    name.
  fails_when: The confirmation dialog renders any text input the operator could type
    the concept's name into.
- file: src/routes/glossary-concepts-panel-removal-control.spec.tsx
  name: 'ConceptsPanel — dismissing the confirmation with no explicit choice (underdetermined,
    from the specification): issues no DELETE request, neither immediately nor after
    time passes, when the confirmation is dismissed with no explicit choice rather
    than declined or confirmed'
  proves: UNDERDETERMINED, from the specification — the reading dismissing with no
    explicit choice as confirmation, or auto-confirming after a delay, would still
    pass every stated criterion.
  fails_when: A DELETE request is issued either after time passes with the dialog
    merely left open, or upon dismissing the dialog with no explicit Cancel or Remove
    act.
untested:
- rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act
  — spans three elements across two contexts; this task implements and this proof
  exercises only the concept instance.
- domain/glossary/concept — this task's only engagement is the identity attribute
  (name); the node's whole four-attribute fact is not decided here.
- The Remove button is disabled while a removal is already pending — an inference
  not stated by any criterion or node; no test pins it.
not_applicable:
- edge_case: A concept name containing characters that require percent-encoding in
    the DELETE URL.
  why: How a special character is percent-encoded is encodeURIComponent's own guarantee,
    not a distinct behavior any criterion asserts a boundary over.
- edge_case: The concepts listing holding zero concepts.
  why: Rendering an explicit empty-state message is pre-existing, unchanged behavior;
    with no row there is no removal control to exercise.
- edge_case: Two rows presenting the same concept name.
  why: Name is the concept's own identity; the glossary cannot hold two registrations
    under the same name.
- edge_case: The DELETE request is refused (409 ConceptInUseError) or fails outright.
  why: REMAINDER, per the task's own notes — stating the outcome is deferred to a
    separate outcome-disclosure task.
run: run/concept-removal-concept-in-use-refusal-recognition-suite-3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
Proof for the per-row concept removal control gated by a further explicit act.

## Notes
One assertion in this proof's own test ("asks whether the concept's removal is to be performed and issues no DELETE request on that asking alone") originally matched the dialog text with a bare /remove/i regex, which matched both the dialog's title and its description and raised a multiple-elements error; tightened to /remove concept/i, which matches the title uniquely, before this proof's tests were confirmed passing.
run/concept-removal-concept-in-use-refusal-recognition-suite-2 failed with cause: code — this proof's own deleteCalls helper's return type annotated a required-but-possibly-undefined second tuple element where fetchMock.mock.calls carries an optional one, a type mismatch TypeScript refused; corrected to an optional element before the following attempt, which passed clean.
