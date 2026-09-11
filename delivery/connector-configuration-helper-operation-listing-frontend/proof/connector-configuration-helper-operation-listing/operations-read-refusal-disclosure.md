---
target: frontend
title: Proof — state a refused operations read to the operator
summary: Tests for the operations-read disclosure function and its rendering, covering the two named refusal
  conditions, the unrecognised fallback, the before-answer silence, and the two alerts standing independently.
implementation: sha256:cacdba08e6151c87cc614d09ead2b05752e2620c79943693095287d8efd8ffa4
tests:
- file: src/services/connector-configuration-operations-read-disclosure.spec.ts
  name: 'maps both idle and pending to exactly {kind: "none"}'
  proves: While the operations read has not answered, no refusal of it is stated.
  fails_when: either idle or pending maps to anything other than {kind:"none"}
  demonstrates: rules/integration/no-operations-read-refusal-is-stated-before-the-operation-answers
- file: src/services/connector-configuration-operations-read-disclosure.spec.ts
  name: names a network failure as the reason the link could not be fetched
  proves: An unfetchable-link outcome is stated as a message naming that the link named in the helper
    could not be fetched.
  fails_when: the message stops naming the fetch failure or stops naming it as a network failure
- file: src/services/connector-configuration-operations-read-disclosure.spec.ts
  name: names a timeout as the reason the link could not be fetched
  proves: That message names which of network-failure, timeout or status-outside-2xx the answer carried,
    and names the answered status where it carried status-outside-2xx.
  fails_when: the message stops naming the fetch failure or stops naming it as a timeout
- file: src/services/connector-configuration-operations-read-disclosure.spec.ts
  name: names status-outside-2xx together with the answered status
  proves: That message names which of network-failure, timeout or status-outside-2xx the answer carried,
    and names the answered status where it carried status-outside-2xx.
  fails_when: the message stops naming the fetch failure or drops the answered status code
- file: src/services/connector-configuration-operations-read-disclosure.spec.ts
  name: states the fetched document could not be read as an OpenAPI 3.x document
  proves: An unreadable-document outcome is stated as a message naming that the fetched document could
    not be read as an OpenAPI 3.x document.
  fails_when: the unreadable-document message stops naming that condition or starts also naming the unfetchable-link
    wording
- file: src/services/connector-configuration-operations-read-disclosure.spec.ts
  name: states a reason this helper does not recognise, naming neither named condition
  proves: An outcome naming neither of those two conditions is stated as neither of them.
  fails_when: the unrecognized-failure message adopts either named condition's wording or stops naming
    an unrecognised reason
- file: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
  name: renders the operations-read refusal message in a role=alert element carrying text-sm text-destructive
  proves: The refusal is rendered inside the helper's aria-live container, in an element carrying role=alert
    and the same text-sm text-destructive classes the draft's refusal already uses.
  fails_when: the refusal is not rendered as role=alert, or drops either class
- file: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
  name: renders no operations-read alert while the read is idle
  proves: While the operations read has not answered, no refusal of it is stated.
  fails_when: an alert renders while the operations read is idle
- file: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
  name: renders both alerts at once when the operations read and the draft request are each refused
  proves: The unfetchable-link message and the unreadable-document message are different messages, and
    neither is stated for the other's outcome; and every message connector-configuration-draft-disclosure.ts
    states for a draft outcome is unchanged by this task.
  fails_when: either alert is missing, or one message bleeds into the other, when both reads are refused
    simultaneously
not_applicable:
- edge_case: A test for the "operations" (successful read) outcome rendering no refusal.
  why: No criterion requires it; a successful read trivially renders nothing in the new branch, and the
    sibling tasks' own proofs cover the successful-read path.
- edge_case: A non-regression test asserting connector-configuration-draft-disclosure.ts's own messages
    are unchanged (criterion 8).
  why: That module was not modified by this task; its own pre-existing spec file already protects every
    message it states, unchanged.
untested:
- The aria-live-container-nesting half of criterion 7 (that the refusal renders inside the helper's existing
  aria-live="polite" wrapper, not merely somewhere on the page) — asserting DOM ancestry (element.closest(),
  container.querySelector()) is refused by this project's testing-library/no-node-access and no-container
  lint rules, and no existing test in this codebase (including the pre-existing draft-refusal alert this
  task mirrors) asserts this nesting either; verified by code review of connector-configuration-helper-fields.tsx
  instead, where the new branch sits inside the same aria-live div as the draft's own.
- rules/integration/a-refused-operations-read-states-its-refusal-to-the-operator, whole — its fact spans
  five distinct clauses; no single test decides all of them at once without failing for more than one
  reason (SPEC-004 R9). The tests above collectively cover every clause the task's criteria state, each
  failing for exactly one reason, but none is named as demonstrating this node whole.
- rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document,
  whole — its HTTP-422/error-value half is the backend's own (see the task's own REMAINDER note); only
  the naming-distinction half reaches this task, covered by the tests above rather than by one test naming
  this node.
- The openapi-document-declares-no-version outcome kind — no criterion or node names it distinctly from
  openapi-document-not-readable; the implementation groups both under the same message per the specification's
  own account that both fall under the same OpenApiDocumentNotReadableError refusal family (see the implementation
  record's own inference). No test pins that grouping as if a criterion required it.
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-helper-operation-listing-operations-read-refusal-disclosure-suite-5
---

## What it is

Tests connector-configuration-operations-read-disclosure.ts directly for every named refusal condition and the before-answer silence, and connector-configuration-helper-fields.tsx at the component level for the rendered alert.

## Notes

Earlier suite attempts failed for reasons unrelated to the obligations themselves: -suite (typecheck), -suite-2/-suite-3 (lint, testing-library/no-node-access and no-container from a DOM-ancestry assertion, removed rather than worked around), -suite-4 (test, getByRole's name matcher does not compute an accessible name from text content for role=alert, replaced with a plain getByRole plus a separate textContent assertion).
