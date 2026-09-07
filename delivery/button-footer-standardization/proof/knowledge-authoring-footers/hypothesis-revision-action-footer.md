---
title: Hypothesis revision action footer proof
summary: Proves the footer composition, the Cancel's write-nothing and return-to-origin behaviour, its fill-state-invariant offer, and the revision-release gate the task's own note names, leaving the unchanged submit, validation, subject, loading and manifest-offer behaviour to the pre-existing suite that already proves it.
implementation: sha256:3182b8f9e1a2204305ee8294b8f4326cb2909d6a130969e7d4e3f237f8a8bfbf
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/knowledge-authoring-footers-hypothesis-revision-action-footer-suite
tests:
- file: src/routes/hypothesis-revision-form-fields-footer.spec.ts
  name: renders its action row through the shared footer > wraps Save hypothesis inside an accessible group named Actions, rather than a bare flex row
  proves: hypothesis-revision-form-fields renders its Save hypothesis button through ButtonFooter rather than through its own end-aligned flex row.
  fails_when: Save hypothesis stops being reachable inside the group accessibly named Actions, for instance the footer reverting to a plain end-aligned div.
- file: src/routes/hypothesis-revision-form-fields-footer.spec.ts
  name: the footer carries a Cancel alongside Save > renders Cancel inside the same accessible actions group as Save hypothesis, not as a separate control outside it
  proves: 'The first clause of the Cancel criterion: the footer carries a Cancel.'
  fails_when: Cancel is absent from the rendered screen, or renders outside the footer's own accessible group.
- file: src/routes/hypothesis-revision-form-fields-footer.spec.ts
  name: the trailingActions slot is optional and owned by the caller > renders only Save hypothesis when the form-fields component is used with no trailing element passed
  proves: The implementation record's inference that Cancel is threaded through a slot the screen owns and populates, rather than hard-coded inside the form-fields component.
  fails_when: The form-fields component renders a Cancel of its own even when no trailing element is passed to it.
- file: src/routes/hypothesis-revision-screen-cancel.spec.ts
  name: Cancel's offer does not turn on how much of the composition was filled in > is present and enabled both on a freshly opened, blank form and once every field has been filled in
  proves: The Cancel is offered for as long as the composition has not been submitted, and neither its presence nor its enablement turns on how much of the composition was filled in.
  fails_when: Cancel is disabled or absent on the blank form, or becomes disabled once every field is filled in, for instance gated on validity or dirtiness.
- file: src/routes/hypothesis-revision-screen-cancel.spec.ts
  name: Cancel is offered only for as long as the composition has not been submitted > is no longer rendered once a save has succeeded
  proves: 'The same criterion''s first half: the offer ends when the composition is submitted.'
  fails_when: Cancel remains rendered after a successful save moves the form to its success phase.
- file: src/routes/hypothesis-revision-screen-cancel.spec.ts
  name: Cancel abandons the composition without writing a revision > issues no request to the hypotheses endpoint when clicked, even after every field was filled in
  proves: 'The Cancel criterion''s writes-nothing clause: abandoning writes no revision and leaves the hypothesis''s revisions and its case''s draft version as they were.'
  fails_when: Clicking Cancel triggers the revise request, the only call this composition has that could write a revision or touch the manifest or the draft version.
- file: src/routes/hypothesis-revision-screen-cancel.spec.ts
  name: Cancel returns the curator to the screen the composition was actually opened from > navigates back to the case simulation screen it was reached from, rather than a fixed destination such as the manifest builder
  proves: The Cancel criterion's return clause, and the implementation record's inference that the destination is resolved through navigation history rather than one fixed link. It is proven against an arbitrary prior screen rather than the manifest builder, so a hard-coded destination could not pass it.
  fails_when: Cancel navigates to a fixed destination instead of returning to whatever screen the router's own history holds as prior, or does not navigate at all.
- file: src/routes/hypothesis-revision-screen-cancel.spec.ts
  name: Cancel's offer does not turn on the hypothesis's own revision-release state > still renders Cancel when the hypothesis's highest existing revision has already been released
  proves: The task's underdetermined note, which names an implementation rendering Cancel only while the hypothesis's highest existing revision is still draft and hiding it once released, leaving a curator composing against a released revision with no way out.
  fails_when: Cancel is hidden or absent when the hypothesis's highest existing revision answers as released.
not_applicable:
- edge_case: Cancel clicked while a save from the same composition is still in flight.
  why: 'No criterion states an outcome for this overlap: the abandonment rule''s own scope is a composition that has not been submitted, and this scenario is left the moment Save was clicked. Asserting an outcome here would assert taste rather than a stated criterion.'
- edge_case: Cancel's presence during the loading and load-error phases, before the ready-phase form and its footer exist at all.
  why: The criteria's Cancel language is scoped to the footer and the composition, neither of which is rendered before the ready phase, and no criterion requires Cancel while the draft or the vocabularies are still being read.
- edge_case: Cancel clicked twice in quick succession.
  why: The repeated-invocation semantics of the router's own history are the library's concern, and no criterion states a distinct outcome for a second Cancel click.
untested:
- That the three real entry points into this composition — the manifest builder's add link, the case-simulation table's revise link and the revision history's revise link — each reach it through a pushed navigation rather than a replace, which a history back would not undo cleanly, is assumed rather than verified here. This proof exercises only this composition's own Cancel against an arbitrary prior history entry, which is what this task's own files can be held to; whether each of those three links pushes rather than replaces is a fact about files outside this task's list.
contested:
- what: The implementation record frames the divergence from the inventory's Cancel-as-link convention as necessary because this composition has three distinct opening screens, and states the history-based return as what answers the criterion's return clause.
  why: The criterion cannot be satisfied by one fixed link across three distinct entry points, and the test written here proves the history-based return against an arbitrary prior screen. What is noted rather than accepted is that this proof cannot independently verify that all three real entry points push rather than replace their navigation into this composition, those files sitting outside this task's own delivery; that is recorded under untested rather than taken as established.
---

## What it is
Eight assertions over the hypothesis revision composition's new action row and its first Cancel, two of them written to fail over exactly the implementations the task's own note and the record's own inference would otherwise let pass.
The unchanged submit, validation, subject, loading and manifest-offer behaviour is left to the pre-existing suite that already proves it.

## Notes
Two of the eight are the ones that matter most, and both were written to be defeatable.
The return test uses an arbitrary prior screen rather than the manifest builder, so a Cancel wired to a fixed destination fails it; the availability test puts the hypothesis's highest existing revision in its released state, which is precisely where the gate the underdetermined note names would hide the control.
The contested entry agrees with the implementation's divergence and still names what this proof cannot establish: whether the three real entry points push rather than replace, which decides whether a history back returns cleanly, and which lives in files this task never touched.
