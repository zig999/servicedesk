---
target: frontend
title: Connector configuration removal outcome disclosure proof
summary: Tests that use-connector-configuration-detail states a removal's answered outcome
  to the operator -- success naming the removed connector, a generic refusal for every refused
  condition, and silence while the removal is unanswered.
implementation: sha256:2ed34584a28b37d5f498d05a4a80f34b7b808dedd8b5a347f77892797ac8ae1d
tests:
- file: src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
  name: calls toast.success with a message naming the removed connector's own name
  proves: Criterion 1 -- a removal answered with HTTP 204 states success naming the removed
    connector.
  fails_when: toast.success is never called, or its message does not contain the connector's
    name.
- file: src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
  name: states nothing was removed in the refusal toast (HTTP 400 VALIDATION_ERROR)
  proves: Criterion 2 -- a refusal answered with HTTP 400 VALIDATION_ERROR states that nothing
    was removed.
  fails_when: The refusal toast's message does not state that nothing was removed.
- file: src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
  name: states nothing was removed in the refusal toast (HTTP 500 INTERNAL_ERROR)
  proves: Criterion 3 -- a refusal answered with HTTP 500 INTERNAL_ERROR states that nothing
    was removed.
  fails_when: The refusal toast's message does not state that nothing was removed.
- file: src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
  name: states nothing was removed in the refusal toast (an error code the surface does not
    recognise)
  proves: Criterion 4 -- a refusal carrying an error code the surface does not recognise states
    that nothing was removed.
  fails_when: The refusal toast's message does not state that nothing was removed.
- file: src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
  name: calls neither toast.success nor toast.error before the DELETE settles, and states
    the outcome only once it does
  proves: Criterion 5 -- while the removal has not been answered, the surface states neither
    success nor refusal.
  fails_when: Either toast fires before the DELETE request settles, or neither fires once
    it does.
- file: src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
  name: states the connector's configuration is no longer registered, not merely a generic
    confirmation naming it
  proves: UNDERDETERMINED, from the specification -- a-submitted-removal-states-its-outcome-to-the-operator's
    success wording; the implementation's own choice to state removal/no-longer-registered
    rather than a bare generic confirmation.
  fails_when: The success message names the connector but never states its configuration is
    removed or no longer registered (e.g. a bare "Request ... completed successfully").
- file: src/hooks/use-connector-configuration-detail-removal-outcome.spec.ts
  name: produces one identical statement across a 400, a 500 and an unrecognised code -- fails
    over a reading that distinguishes any of the three refusal conditions from another
  proves: UNDERDETERMINED, from the specification -- a-submitted-removal-states-its-outcome-to-the-operator's
    own condition apart from every other condition; the implementation's disclosed, legitimate
    choice under this note (per its own deferred/inferences sections) to give HTTP 400, HTTP
    500 and an unrecognised code the identical generic "nothing was removed" message, rather
    than distinguishing the three refusal conditions.
  fails_when: Any two of the three refusal conditions produce a different message from one
    another.
not_applicable:
- edge_case: A removal naming a connector nothing is currently registered under.
  why: REMAINDER -- belongs to the backend remove-connector route, not observable from a frontend
    test against a mocked fetch.
- edge_case: A second removal click, or a removal confirmed while a prior removal is still
    in flight.
  why: No criterion states what a repeat or concurrent confirm does; belongs to the removal-control
    task's own scope.
untested:
- rules/integration/a-submitted-removal-states-its-outcome-to-the-operator -- only the connector-configuration
  branch is tested here; concept and capability removal outcome disclosure are proven by their
  own sibling tasks' tests.
run: run/delete-gaps-ui-remaining-six-suite-4
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
Proof for stating a connector configuration removal's answered outcome to the operator via toast.

## Notes
One UNDERDETERMINED-derived test originally asserted a three-way-distinct refusal reading the implementation never took; the implementation's own disclosed choice merges HTTP 400/500/unrecognised into one message. The test was corrected to demonstrate the implementation's actual, legitimate reading rather than assert against it.
