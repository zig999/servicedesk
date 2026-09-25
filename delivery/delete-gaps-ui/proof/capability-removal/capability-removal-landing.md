---
target: frontend
title: Landing on the capabilities listing after a successful capability removal
summary: Proves that a capability removal answered with HTTP 204 takes the operator to /capabilities
  unconditionally (never back through navigation history), that the listing then carries no
  row for the removed name and version, that the removed identity's own refusal is never shown,
  and that no reading which navigates on issue or on a refusal instead of on 204 passes.
implementation: sha256:2484741a7701109e1dfd6f3aa7e870563de756b4bae4ee28bd5b262b313d2bf6
tests:
- file: src/routes/capability-detail-screen-removal-landing.spec.ts
  name: CapabilityDetailScreen -- a successful removal lands the operator on the capabilities
    listing (criterion 1) > navigates to /capabilities once the removal answers with HTTP
    204
  proves: 'Criterion 1: after a removal answered with HTTP 204, the operator is at /capabilities.'
  fails_when: the DELETE resolves with 204 and the router's location is anything other than
    /capabilities.
- file: src/routes/capability-detail-screen-removal-landing.spec.ts
  name: CapabilityDetailScreen -- the landing never returns to an earlier navigation-history
    entry instead (criterion 2) > lands at /capabilities rather than at the origin navigation
    history holds, once the removal answers with HTTP 204
  proves: 'Criterion 2: after a removal answered with HTTP 204, the operator is at /capabilities
    even when navigation history holds an earlier entry.'
  fails_when: mounted with an earlier history entry present (router.history.canGoBack() true),
    the DELETE resolves with 204 and the router's location is anything other than /capabilities
    -- in particular if it returns to the earlier entry the way onCancel's history-back branch
    would.
- file: src/routes/capability-detail-screen-removal-landing.spec.ts
  name: CapabilityDetailScreen -- the landing waits for the removal's own answer, never taken
    merely because the removal was issued (an underdetermined note in this task) > still presents
    the capability's own surface while the DELETE request is outstanding, navigating to /capabilities
    only once it resolves with HTTP 204
  proves: The UNDERDETERMINED note's counterexample reading -- "a surface that navigates to
    /capabilities as soon as the removal is issued" -- does not hold.
  fails_when: with the DELETE request left unresolved, the router's location has already changed
    to /capabilities before the answer arrives.
- file: src/routes/capability-detail-screen-removal-landing.spec.ts
  name: CapabilityDetailScreen -- a refused removal leaves the operator on the capability's
    own surface (an underdetermined note in this task) > stays at the capability's own detail
    route when the removal answers with a refusal instead of HTTP 204
  proves: The UNDERDETERMINED note's counterexample reading -- "or on any answer at all including
    a refusal" -- does not hold.
  fails_when: the DELETE resolves with a non-204 refusal (HTTP 409) and the router's location
    is anything other than the capability's own detail route -- in particular if it moved
    to /capabilities.
- file: src/routes/capability-detail-screen-removal-landing.spec.ts
  name: CapabilityDetailScreen -- a successful removal leaves no row for the removed name
    and version on the capabilities listing (criterion 3) > replaces a capabilities-listing
    cache that still held the removed row with one that no longer does, once the removal lands
    there
  proves: 'Criterion 3: after a removal answered with HTTP 204, the capabilities listing shows
    no row for the removed name and version.'
  fails_when: once landed on the real CapabilitiesBrowserScreen (whose cache was seeded with
    a row for the removed name and version before the removal), a row naming the removed name
    and version is still present, or the surviving capability's own row never appears.
- file: src/routes/capability-detail-screen-removal-landing.spec.ts
  name: CapabilityDetailScreen -- a successful removal never shows the removed identity's
    own read refusal (criterion 4) > never renders the removed capability's not-registered
    refusal once the removal lands on the listing
  proves: 'Criterion 4: after a removal answered with HTTP 204, the refusal of a read of the
    removed name and version is never shown.'
  fails_when: after landing on the real capabilities listing (with a subsequent read of the
    removed identity primed to answer HTTP 404 CapabilityIdentityNotFoundError, matching constraints/the-capability-identity-read-refuses-an-unregistered-identity),
    the "Unable to load this capability right now." refusal text appears anywhere on the screen.
not_applicable:
- edge_case: Two operators issuing a removal of the same identity concurrently.
  why: No criterion of this task reaches concurrent issuance; the race and its own refusal
    shape belong to rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
    and the route this task's REMAINDER notes name, not to where a successful removal's own
    answer takes the operator.
- edge_case: The capabilities listing itself failing to load once the operator has landed
    there.
  why: Governed by the listing screen's own pre-existing load-error behavior (EDG-02, API-04),
    unrelated to and untouched by this task's criteria, which concern only the presence or
    absence of the removed row within a listing that did load.
- edge_case: The operator returning to the removed identity's own address later, by Back or
    by typing it directly, after the landing has already completed.
  why: The task's own ADVISORY note bounds criterion 4 to the transition that follows the
    HTTP 204 answer, explicitly excluding the operator's own later, independent navigation
    -- this is the task's stated scope, not a gap this proof leaves open.
- edge_case: Rapid repeated clicks on the removal confirmation issuing more than one DELETE.
  why: Guarding against a second submission is the sibling capability-removal-control task's
    own concern (the trigger's disabled state while a removal is pending); this task's criteria
    concern only where a single answered removal takes the operator.
- edge_case: The capabilities listing becoming fully empty because the removed capability
    was the only one registered.
  why: Rendering an empty listing is the listing screen's own pre-existing empty-state behavior
    (API-04); criterion 3 requires only the absence of the removed row, already exercised
    against a listing that still holds a surviving row, and the emptiness case is a different
    obligation this task's criteria do not state.
untested:
- 'rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing: this node''s
  own fact spans a successful concept removal, a successful capability removal, and a successful
  connector-configuration removal alike. This task''s criteria, and the tests above, decide
  only the capability clause; the concept and connector-configuration clauses are left entirely
  undecided here, so no test in this proof demonstrates the node''s fact whole -- as the task''s
  own REMAINDER note already states, those two clauses belong to the sibling landing tasks
  under their own epics.'
- 'constraints/a-successful-capability-removal-answers-with-no-content: this node''s own fact
  is the registry''s remove-capability HTTP route itself answering with HTTP 204 and no body,
  the same for both branches its own statement describes -- a route-level fact this frontend
  task only consumes as the trigger it reacts to. No test in this proof exercises the actual
  route (every DELETE response here is a stand-in the test itself constructs), so the node''s
  fact is undecided by this proof, as the task''s own REMAINDER note already names the task
  that owes it.'
- 'constraints/the-capability-identity-read-refuses-an-unregistered-identity: this node''s
  own fact is the registry''s read-capability-by-identity route itself answering an unregistered
  identity with HTTP 404 naming CapabilityIdentityNotFoundError -- a route-level fact this
  frontend task only consumes as the refusal criterion 4 requires never be shown. No test
  in this proof exercises the actual route (the 404 answer used in the criterion-4 and underdetermined
  tests above is a stand-in this proof constructs to prove the refusal is never reached, not
  a test of the route itself), so the node''s fact is undecided by this proof, as the task''s
  own REMAINDER note already names the task that owes it.'
run: run/delete-gaps-ui-remaining-six-suite-4
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
Proof for landing on the capabilities listing after a successful capability removal.

## Notes
None.
