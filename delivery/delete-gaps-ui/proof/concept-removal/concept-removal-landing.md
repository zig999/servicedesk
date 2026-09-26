---
target: frontend
title: Landing on the concepts listing after a successful concept removal
summary: Tests that a removal answered with HTTP 204 leaves the concepts tab shown with the
  removed row gone and a surviving row intact, and that no leftover surface still names the
  removed concept.
implementation: sha256:3f715394212b01246a95f311e1c2563566efa430059de7e769e893df4b87864b
tests:
- file: src/routes/glossary-browser-screen-concept-removal-landing.spec.ts
  name: GlossaryBrowserScreen -- concepts listing reflects a successful removal (criterion
    2) > drops the removed concept's row from the listing once its removal answers 204, while
    an unrelated concept's row stays listed under its own name
  proves: 'Criterion: After a removal answered with HTTP 204, the concepts listing shows no
    row for the removed concept''s name.'
  fails_when: useRemoveGlossaryConcept's onSuccess stops invalidating the ["glossary","concepts-with-ttl"]
    query -- the removed concept's row would then still be present after the DELETE resolves,
    because the listing never refetches.
- file: src/routes/glossary-browser-screen-concept-removal-landing.spec.ts
  name: GlossaryBrowserScreen -- the operator stays on the concepts tab after a removal succeeds
    (criterion 1) > keeps the Concepts tab selected, with the panel's own New concept control
    still present, once a removal answers 204
  proves: 'Criterion: After a removal answered with HTTP 204, the glossary shows its concepts
    tab.'
  fails_when: A removal's success handler ever switches the active tab or otherwise takes
    the operator off the concepts tab (the Concepts tab trigger stops being aria-selected,
    or the concepts panel's own New concept control stops being rendered) once the DELETE
    resolves.
- file: src/routes/glossary-browser-screen-concept-removal-landing.spec.ts
  name: GlossaryBrowserScreen -- no surface addressed by the removed identity survives the
    removal (underdetermined, from the specification) > shows the removed concept's own name
    nowhere on the screen once its removal answers 204, not only absent from the listing's
    own rows
  proves: UNDERDETERMINED, from the specification -- the reading that would still pass both
    stated criteria by landing the operator on the removed concept's own address, next to
    a panel showing a refused read of that now-unheld name, rather than nowhere near it.
  fails_when: The screen renders any element -- a per-concept panel, a route, a refused-read
    surface addressed by the removed concept's own identity -- that still displays the removed
    concept's name after its removal answers 204, even though the listing's own rows no longer
    include it.
not_applicable:
- edge_case: The removal that empties the listing to zero concepts.
  why: Both stated criteria only require the removed row to be gone; how the listing renders
    once no concepts remain is the empty-state fact glossary-browser-screen.spec.ts's own
    "Concepts tab empty state" tests already decide, and this task adds no new rendering path
    for that state.
- edge_case: A refused removal (HTTP 409, ConceptInUseError).
  why: constraints/a-successful-concept-removal-answers-with-no-content and both criteria
    here address only the HTTP 204 success path; the refused-removal condition is the REMAINDER
    this task's own notes hand to the task that states a refused concept removal's condition
    to the operator.
- edge_case: Two concurrent removal requests against the same or different rows.
  why: The Remove control is already disabled while a removal is pending -- a guard the concept-row-removal-control
    task owns and tests; no criterion of this landing task reaches concurrent dispatch.
untested:
- 'rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing: its statement
  spans three elements (concept, capability, connector configuration) across two contexts.
  This task''s own REMAINDER notes say the capability and connector-configuration clauses
  are out of reach here, so no test in this proof -- confined to the concept clause -- decides
  the node''s fact whole; a test claiming to would assert part of it as the whole.'
- 'constraints/a-successful-concept-removal-answers-with-no-content: its own fitness note
  names an automated test against the backend''s remove-concept route asserting HTTP 204 with
  an empty body -- a backend fact this frontend proof cannot decide. This task''s tests assume
  a 204 response (mocked) and verify the frontend''s reaction to it; they do not verify that
  the API itself answers that way.'
- 'domain/glossary/concept: this task reads and changes none of its attributes (name, accepts,
  ttl, description) -- the implementation record itself says so. The value-object''s full
  shape round-tripping through the concepts listing is already exercised by use-glossary-concepts.spec.ts''s
  pre-existing tests, written for an earlier task; nothing this task added decides that fact,
  so no test here claims it.'
run: run/delete-gaps-ui-remaining-six-suite-4
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
Proof for landing on the concepts listing after a successful concept removal.

## Notes
One assertion originally used waitFor + getByRole, which the project's lint rule (testing-library/prefer-find-by) refuses; changed to findByRole before this proof's tests were confirmed passing.
