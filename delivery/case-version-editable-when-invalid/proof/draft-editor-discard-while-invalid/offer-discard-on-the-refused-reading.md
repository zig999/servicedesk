---
target: frontend
title: Offer discard on the refused reading -- proof
summary: Route-level tests mount the not-valid reading through the real screen/hook/service stack and
  prove the shared Discard control's gating, its slug-confirmation barrier, its DELETE issuance, and its
  silence on a 204 answer.
implementation: sha256:6986b23a73e7328413245ee5a4d21fbf000d918db8fe759373e9be81f594b5db
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/draft-editor-discard-while-invalid-offer-discard-on-the-refused-reading-full-3
tests:
- file: src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
  name: CaseVersionEditorScreen -- the not-valid reading offers the Discard draft control only while the
    version's own state is draft, never once it reads released > renders the Discard draft control for
    a not-valid draft whose manifest holds no entry, and renders none once that same version's own state
    reads released
  proves: Criterion 1 (the not-valid reading of a draft whose manifest holds no entry offers the discard
    control) and criterion 2 (the not-valid reading of a released version offers no discard control)
  fails_when: the Discard draft control fails to render for a not-valid draft, or still renders once that
    same version's own state reads released
  demonstrates: rules/knowledge/only-a-draft-case-version-may-be-discarded
- file: src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
  name: CaseVersionEditorScreen -- the not-valid reading's Discard offer turns on the version's own state
    alone, not on the manifest's own emptiness > still renders the Discard draft control when the declared-attributes
    record answers a manifest holding an entry, refuting an editor that shows the control only when the
    draft's manifest is empty
  proves: UNDERDETERMINED, from the specification -- every criterion is fixed to a draft whose manifest
    holds no entry; nothing shows the offer on a not-valid reading caused by a different failing rule
  fails_when: an editor that shows the discard control only when the draft's manifest is empty, hiding
    it for any other not-valid reason
- file: src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
  name: CaseVersionEditorScreen -- asking for the discard without confirming it on the not-valid reading
    > issues no DELETE when the confirm control is clicked before anything is typed
  proves: Criterion 3 -- on that reading of a draft, asking for the discard without confirming it issues
    no discard
  fails_when: a DELETE is issued against the version before the confirmation field ever holds the case's
    own slug
- file: src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
  name: CaseVersionEditorScreen -- confirming the discard on the not-valid reading only where the typed
    text reproduces the case's own slug exactly > issues no DELETE for a typed value other than the exact
    slug, then issues exactly one DELETE against this version once the slug is typed exactly
  proves: Criterion 4 (confirming with text other than the case's own slug issues no discard) and criterion
    5 (confirming reproducing the case's own slug issues a discard of that version)
  fails_when: a DELETE is issued for a typed value that is not the exact slug, or no DELETE is issued
    once the exact slug is typed and confirmed
  demonstrates: rules/knowledge/a-draft-case-versions-discard-reproduces-the-cases-own-slug
- file: src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
  name: CaseVersionEditorScreen -- a 204 answer to Discard on the not-valid reading > shows no discard-failure
    statement once a 204 answer settles
  proves: Criterion 6 -- a discard answered HTTP 204 on that reading shows no discard-failure statement
  fails_when: a discard-failure alert renders once the DELETE resolves with a 204 answer
not_applicable:
- edge_case: A discard attempted against a version that has transitioned from draft to released between
    mount and the confirm click (a stale-UI race)
  why: no criterion or node this task implements states this scenario; the server-side refusal for discarding
    a non-draft version is only-a-draft-case-version-may-be-discarded's own backend enforcement, out of
    this frontend-only task's scope
- edge_case: A second confirm click fired while an earlier DELETE against the same not-valid reading is
    still pending (a double-submit)
  why: the confirm control's pending-disable guard is a property of the single discardMutation instance
    the ready and not-valid phases now share; the pre-existing ready-phase discard suite already proves
    that guard against the very same shared mutation object
- edge_case: An error response (409/404) to the not-valid reading's Discard confirm
  why: this task's own criteria state only the negative -- that a 204 answer shows no failure statement;
    how a discard failure renders is stated and proven by the ready-phase task's own suite, over the same
    shared discard-confirmation service and shared DiscardDraftDialog component this task reuses unchanged
untested:
- rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case
  -- its fact spans an unenumerated set of validator-rule failures; only the manifest-empty representative
  is exercised here, matching the task's own UNDERDETERMINED entry. No finite test can exhaust an open
  validator-rule space, so this node's fact stays a reading.
- rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act -- this node
  states both release's and discard's further-act condition together; this task implements discard's own
  clause alone, and the task's own REMAINDER note routes the release clauses to whatever task implements
  the editor's release offer.
- scenarios/knowledge/a-case-with-no-hypothesis-is-still-discardable -- its then-clauses (the draft version
  and its own manifest entries are removed; the version number is never reused) are server-side outcomes
  routed to the backend epic's own proof; only the scenario's "the discard is accepted" clause is exercised
  here.
- constraints/a-successful-case-version-discard-answers-with-no-content -- a server-side response-shape
  constraint; no frontend test can decide what the server itself answers on an accepted discard.
- domain/knowledge/case-version -- an aggregate-root identity spanning many attributes and operations
  well beyond discard; this task's files touch only the discard operation's client-side counterpart.
- The not-valid reading's Discard trigger button is disabled via a disabled prop bound to state.isBlocked,
  per the implementation record's own inference; no criterion or node here states this behavior, so it
  stays unproven by this proof.
---

## What it is

Route-level tests over the not-valid reading's Discard control, proving the task's 6 criteria; the pre-existing ready-phase discard suite is confirmed unaffected by the DiscardDraftDialog extraction (same full command set, unchanged pass).

## Notes

None.
