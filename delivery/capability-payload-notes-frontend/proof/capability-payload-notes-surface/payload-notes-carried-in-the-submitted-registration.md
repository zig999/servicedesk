---
target: frontend
title: payload_notes forwarded from both capability form hooks' submitted bodies
summary: Hook-level tests proving both PUT-body-building hooks forward payload_notes by name from live
  form state, submit it as absent-or-empty where the operator declared none, and do not refuse a submission
  that leaves it so.
implementation: sha256:5e5ff7f7fe6d41669e54387742110c8e359d2c93c9805f595c6eafdcb8d8640c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/capability-payload-notes-surface-payload-notes-carried-in-the-submitted-registration-suite-2
tests:
- file: src/hooks/use-capability-detail-payload-notes-submission.spec.ts
  name: 'useCapabilityDetail -- the submitted body carries payload_notes as the form value holds it (criterion
    1): forwards a payload_notes value the operator just set into the PUT body, unchanged'
  proves: The registration body use-capability-detail submits carries payload_notes as the form value
    holds it.
  fails_when: The PUT body use-capability-detail submits omits payload_notes, hardcodes it, or carries
    anything other than the exact string the operator just set on the form.
- file: src/hooks/use-capability-detail-payload-notes-submission.spec.ts
  name: 'useCapabilityDetail -- an untouched payload_notes reaches the registry as undeclared, and the
    submission is not refused for leaving it so (criteria 3 and 4): carries no payload_notes property
    in the submitted body, and still dispatches the PUT, when the field was never edited'
  proves: Where the operator declared no payload notes, the submitted body states payload_notes as absent
    or as an empty string and as no other content; and where every required attribute is declared and
    payload notes is left undeclared, the contract rule does not refuse the submission and the register-capability
    call is issued.
  fails_when: The submitted body carries a payload_notes property (null, an empty-string placeholder inserted
    by a fallback, or any other value) when the operator never touched the field, or the PUT call is never
    dispatched at all under that same condition.
- file: src/hooks/use-capability-detail-payload-notes-submission.spec.ts
  name: 'useCapabilityDetail -- payload_notes typed then cleared is submitted as exactly an empty string
    (criterion 3): carries payload_notes as an empty string in the submitted body, and no other content'
  proves: Where the operator typed and then cleared payload_notes, the submitted body carries it as exactly
    an empty string and no other content.
  fails_when: A form value of "" is forwarded as null, dropped from the body entirely, or replaced with
    any content other than the exact empty string.
- file: src/hooks/use-capability-form-payload-notes-submission.spec.ts
  name: 'useCapabilityForm -- the submitted body carries payload_notes as the form value holds it (criterion
    2): forwards a payload_notes value the operator just set into the PUT body, unchanged'
  proves: The registration body use-capability-form submits carries payload_notes as the form value holds
    it.
  fails_when: The PUT body use-capability-form submits omits payload_notes, hardcodes it, or carries anything
    other than the exact string the operator just set on the form.
not_applicable:
- edge_case: A second submit dispatched before the first settles (two operations against one subject at
    once).
  why: The de-duplication that ignores a second submit is pre-existing guarding logic this task did not
    touch and no criterion of this task names; it is already covered, independent of payload_notes, in
    an existing test.
- edge_case: A dependency (the register-capability call) that fails or is refused by the registry once
    dispatched.
  why: The task's own Notes state that whether the registry accepts it is decided elsewhere and is not
    claimed here -- criterion 4 asserts only that the frontend does not refuse and that the call is issued,
    never what the registry does with it.
untested:
- Node domain/integration/capability's fact spans the whole nine-attribute aggregate contract and its
  full responsibility to declare that contract completely and refuse what departs from it. This task's
  two files forward one optional attribute by name into a PUT body; no finite frontend test decides the
  node's fact whole, since most of it is neither implemented nor reachable from these files. A reading
  remains on duty for the node as a whole.
- Node rules/integration/a-capability-declares-its-contract states a backend invariant -- which attributes
  are required, the sixty-second default timeout, the absent-or-empty definition of undeclared, and the
  HTTP 422 IncompleteCapabilityContractError refusal. These two frontend hooks contain none of that enforcement
  logic; forwarding payload_notes by name cannot be asserted, by any frontend test, to decide the refusal
  rule whole. The corner this task actually touches -- that leaving payload_notes undeclared does not
  itself trigger a frontend-side refusal -- is covered as criterion 4, not as a demonstration of the node's
  own fact.
---
## What it is

Four new tests, across two new spec files, prove all four criteria of this task: both hooks forward payload_notes unchanged, an untouched field reaches the registry as undeclared without blocking the submission, and a typed-then-cleared field is submitted as exactly an empty string.

## Notes

The first suite attempt (run/capability-payload-notes-surface-payload-notes-carried-in-the-submitted-registration-suite) failed at typecheck on an unused `init` parameter in the test-author's own file; fixed by renaming it to `_init` per the project's ESLint convention, and the suite passed on the next attempt.
