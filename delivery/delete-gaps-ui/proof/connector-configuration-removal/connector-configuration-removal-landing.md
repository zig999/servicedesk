---
target: frontend
title: Connector configuration removal landing proof
summary: Tests that a connector configuration removal answered with HTTP 204 lands the operator
  unconditionally on /connectors, with the removed row gone from the listing, no read refusal
  shown, and the success statement not lost to the move.
implementation: sha256:31f47d5bb7be0c5379fa0b65006519677b9c42eba0ba54f965890d8dfccfd60b
tests:
- file: src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
  name: navigates to /connectors once the DELETE answers 204
  proves: Criterion 1 -- after a removal answered with HTTP 204, the operator is at /connectors.
  fails_when: The operator is left anywhere other than /connectors once the DELETE answers
    204.
- file: src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
  name: navigates to /connectors, not back to the origin surface reached from, once the DELETE
    answers 204
  proves: Criterion 2 -- after a removal answered with HTTP 204, the operator is at /connectors
    even when navigation history holds an earlier entry.
  fails_when: Landing falls back to an earlier history entry (e.g. through a history-aware
    back navigation, as onCancel uses) instead of unconditionally landing at /connectors.
- file: src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
  name: no longer lists the removed connector's row once the listing refetches on landing,
    even though its row was cached from an earlier visit
  proves: Criterion 3 -- after a removal answered with HTTP 204, the connectors listing shows
    no row for the removed connector's name.
  fails_when: The connectors listing still shows a row for the removed connector's name after
    landing (e.g. because the removal's cache invalidation did not force the listing to refetch
    past a stale, longer-lived cache entry).
- file: src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
  name: never shows the read-refused message for the removed connector, even where a refetch
    of its own now-unregistered query would answer refused
  proves: Criterion 4 -- after a removal answered with HTTP 204, the refusal of a read of
    the removed connector's name is never shown.
  fails_when: The read-refusal message for the removed connector's name is rendered anywhere
    in the document once the removal has succeeded, including from a later-resolving refetch
    of its own now-unregistered query.
- file: src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
  name: stays on the connector's own surface while the DELETE is outstanding, and again once
    it is refused, never reaching /connectors without a 204 -- an implementation navigating
    as soon as the removal is issued, or on a refusal, would fail this
  proves: UNDERDETERMINED, from the specification -- an implementation that navigates to /connectors
    as soon as the removal is issued, or on any answer including an HTTP 400 or HTTP 500 refusal,
    would still pass every stated criterion.
  fails_when: The implementation navigates to /connectors before the DELETE settles, or on
    any settled answer other than HTTP 204 (a refusal such as HTTP 400).
- file: src/routes/connector-configuration-detail-screen-remove-landing.spec.ts
  name: still emits the removal's success statement naming the connector in the same onSuccess
    that also navigates to /connectors -- an implementation dropping the statement in favor
    of only navigating would fail this
  proves: UNDERDETERMINED, from the specification -- an implementation that navigates straight
    to /connectors on HTTP 204 and drops the issuing surface's state, so the operator never
    sees the success statement, would still pass every stated criterion.
  fails_when: The onSuccess handler navigates to /connectors on a successful removal without
    also emitting the success statement naming the connector, dropping it in favor of only
    navigating.
not_applicable:
- edge_case: A second removal click, or a removal confirmed while a prior removal is still
    in flight.
  why: No criterion of this task states what a repeat or concurrent confirm does to navigation;
    the sibling removal-control task already owns the DELETE-issuance side of this concern,
    and nothing here makes navigation behave differently for a second attempt.
- edge_case: The connectors listing having zero remaining rows after the removal (an empty-state
    render rather than a shorter table).
  why: Criterion 3 only requires the removed connector's own row is absent; whether the listing
    then renders a table of remaining rows or its own empty-state message is the listing's
    own rule (API-04), not owned by this landing task.
untested:
- rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing -- this
  node's fact spans a successful removal of a concept, a capability, or a connector configuration
  alike; this task's own Notes record that the concept and capability clauses reach no criterion
  here and belong to sibling tasks, so no test in this proof decides the node's fact whole
  -- only its connector-configuration instance is exercised.
- domain/integration/connector-configuration -- this task's tests exercise only the addressing-by-name
  half (the DELETE is keyed by the connector name); the value-object's create, read and replace-on-edit
  semantics are untouched by this task and not decided by any test here.
- constraints/a-successful-connector-configuration-removal-answers-with-no-content -- the
  fact is the published HTTP surface's own answer (both branches answering HTTP 204 with an
  empty body), whose own fitness function the node names as a backend automated test; this
  frontend proof only reacts to a 204 status handed to it as a precondition and cannot decide
  whether the backend itself answers that way for a registered or an unregistered name.
- The implementation's own inference that a plain (push) navigate rather than replace satisfies
  the criteria -- no criterion or node states whether the navigation to /connectors replaces
  or pushes the history entry, so nothing here tests whether the just-removed connector's
  own surface remains reachable through the browser's back button after a successful removal.
run: run/delete-gaps-ui-remaining-six-suite-4
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
Proof for landing on the connectors listing after a successful connector configuration removal.

## Notes
None.
