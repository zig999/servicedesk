---
target: frontend
title: Proof for wire-case-creation-to-a-real-screen-and-route
summary: Adds dedicated tests for the four criteria and the three finitely-decidable rule nodes this task implements, and repairs the pre-existing cases-list-screen and route-tree specs whose own assertions the corrected, always-enabled header control and the new /cases/new route otherwise made false.
implementation: sha256:60f00a4b42a2db2b6ccc442179ec69e6aa0753a2c65b1fa545c9df4d5c250097
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-creation-screen-corrective-wire-case-creation-to-a-real-screen-and-route-suite-6
tests:
- file: src/routes/cases-list-screen-create-case-control.spec.ts
  name: offers an always-enabled Create case control that navigates to /cases/new, whichever reading the case listing is currently in -- outstanding, failed, answering no case, or answering at least one
  proves: Criterion 1 (the control is no longer permanently disabled and navigates to a case-creation screen). Its coverage of all four readings also settles the substantive concern underdetermined entry 1 raises about criterion 1's own text, without inventing an implementation for that entry.
  fails_when: the Create case control is absent, disabled, or fails to navigate to /cases/new during any one of the four readings (pending, failed, empty, populated) the cases list can be in.
  demonstrates: rules/knowledge/a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading
- file: src/routes/route-tree.spec.ts
  name: renders the /cases/new route through CaseCreationScreen (task/case-creation-screen-corrective/wire-case-creation-to-a-real-screen-and-route, criterion 2), distinct from the /cases/$slug route's own component
  proves: Criterion 2 (a /cases/new route exists in the frontend route tree and renders the case-creation screen).
  fails_when: the /cases/new route is missing from the route tree, or is registered with a component other than CaseCreationScreen.
- file: src/routes/case-creation-screen-submission.spec.ts
  name: creates the case via POST /v1/cases carrying the curator's own typed slug verbatim, and lands on /cases/{slug}/versions/{version} using the version the response names, without ever reading that slug beforehand
  proves: Criterion 3 (submitting with the required information creates a new case and takes the user to it, without needing an existing slug beforehand). The exact-destination assertion also settles the substantive concern underdetermined entry 2 raises about criterion 3's own text (the version read from the response rather than derived, and no other destination reached), without inventing an implementation for that entry.
  fails_when: the POST body does not carry the typed slug verbatim, a request reads that slug's own case before the POST is issued, or the final navigation target is anything other than /cases/{slug}/versions/{version} built from the slug and version the create-draft response itself names.
  demonstrates: rules/knowledge/a-successful-case-version-creation-lands-on-the-created-versions-own-surface
- file: src/routes/case-creation-screen-required-content.spec.ts
  name: withholds the submit action while any single piece of create-draft's required content is absent, naming exactly the field left blank, refuses to create a case while it is clicked disabled, and enables the act once all seven are filled -- never gated by the optional consolidation register left untouched (underdetermined entry 3)
  proves: Criterion 4 (the screen never offers submission while required content is absent, states which field is still missing, and creates no case). The final, all-required-but-register-untouched case also settles the substantive concern underdetermined entry 3 raises -- that consolidation_register never gates the act -- without inventing an implementation for that entry.
  fails_when: any of the seven required fields (slug, title, when_to_use, subject, fallback.outcome, fallback.referral.action, fallback.referral.recipient) fails to block submission and name itself in the still-needed statement when left blank alone, a case is created while a required field is absent, or the submit control stays disabled solely because the optional consolidation register was left unset once every required field holds content.
  demonstrates: rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent
untested:
- 'contracts/knowledge/case-query: this task adds no new list-cases or read-case call site (the landing destination reuses the already-delivered CaseVersionEditorScreen''s own read-case, unmodified); the node''s whole fact is a description of a five-operation API surface spanning the backend contract, and no finite frontend test decides that whole surface -- only a reading does.'
- 'domain/knowledge/case: the node''s whole fact includes the next_version counter''s own behavior (always greater than every version the case has ever held, including a discarded one), which is backend state this frontend never reads or computes; only the slug-typed-verbatim slice is frontend-observable, and that slice alone is not the node''s whole fact, so no test here claims to demonstrate it.'
- 'domain/knowledge/case-version: the node''s whole fact covers the version''s full lifecycle -- manifest composition, collection-plan, resolve-outcome, release immutability -- far beyond the handful of attributes (title, when_to_use, subject, fallback, consolidation_register) this creation screen''s fields exercise; no finite test in this task''s scope decides that whole fact.'
- 'contracts/knowledge/case-lifecycle: the node publishes eight operations (create-draft, revise-hypothesis, release-hypothesis, place-hypothesis, remove-hypothesis, update-draft, release, discard); this task exercises only create-draft, so no test here decides the whole published contract.'
- 'rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug: this task''s own REMAINDER note already hands the rule''s write-side clauses (numbering the first version 1, leaving next_version at 2, and originating an existing case''s next draft when the slug is already held) to the create-draft write-side task; those are backend facts no frontend test can observe, so no test here claims the whole policy, only the curator-typed-slug slice criterion 3''s own test already carries.'
- 'Underdetermined entry 1 (criterion 1 does not name the three readings the rule''s conditionality clause requires): the entry observes a gap in the criterion''s own text and names no accidental implementation to test against, so no dedicated test was written for it and none was invented; the rule''s own full clause is independently covered, whole, by cases-list-screen-create-case-control.spec.ts.'
- 'Underdetermined entry 2 (criterion 3 does not carry the rule''s three refused destinations or the version-from-response clause): the entry observes a gap in the criterion''s own text and names no accidental implementation, so no dedicated test was written for it; the rule''s own destination clause is independently covered, whole, by case-creation-screen-submission.spec.ts.'
- 'Underdetermined entry 3 (criterion 4 does not carry the rule''s consolidation_register carve-out): the entry observes a gap in the criterion''s own text and names no accidental implementation, so no dedicated test was written for it; the rule''s own carve-out is independently covered, whole, by case-creation-screen-required-content.spec.ts.'
- The screen's own handling of a case-already-has-draft refusal (the typed slug already names a case with an open draft) is the implementation's own inference about behavior (inference 5 of the implementation record), not stated by any criterion or node of this task; no test pins it.
not_applicable:
- edge_case: two rapid clicks on the case-creation screen's submit control (a concurrent double-submission of create-draft)
  why: no criterion or node of this task states a concurrency requirement over create-draft's submission; the guard against it (isDispatchingRef) is an implementation choice, not an obligation this proof owes evidence to.
- edge_case: the case-creation screen's own loading and load-error phases while the outcome, action and recipient glossary vocabularies are being fetched
  why: no criterion or node of this task governs the vocabulary-loading UX; it is an inferred arrangement (inference 3 of the implementation record) mirroring an already-delivered, already-tested pattern (capability-create-screen.tsx), not a new obligation of this task.
- edge_case: a numeric range boundary on any field's length or count
  why: no criterion or node of this task states a range; the only boundary any obligation here reaches is presence versus absence of a field's content, which every test above already exercises at that exact boundary.
---
## What it is

Tests for the four criteria of wire-case-creation-to-a-real-screen-and-route, plus repairs to
the pre-existing cases-list-screen and route-tree specs whose own assertions the corrected,
always-enabled header control and the new /cases/new route made false.

## Notes

Repaired src/routes/cases-list-screen.spec.ts's own pre-existing test asserting a disabled, titled "Create case" button in the empty-state block, and the button-count assertions in that file, cases-list-screen-retry.spec.ts and cases-list-screen-aria-live.spec.ts, to match the corrected, always-enabled header control this task's own criteria require -- the placeholder behavior these pre-existing assertions encoded is exactly what this task corrects, and the implementation record's own `deferred` section named this as the proof step's to settle.
Suite attempts before this record's own run: -suite (build) passed on the first try. -suite-2 was killed by the OS for low system memory before the test step ran (setup, no diagnosis possible -- no log was produced for that step). -suite-3 failed with cause test on src/routes/case-creation-screen-required-content.spec.ts -- a loop rendering the screen once per REQUIRED_FIELD_CASES entry inside one it() with no cleanup() between mounts, so a second render's "Title" label collided with the first's; fixed by adding cleanup() (disclosed eslint-disable-next-line for testing-library/no-manual-cleanup, citing PRH-03) at the end of each iteration. -suite-4 failed with cause test on the same file -- the fixed loop's 8 sequential mount/fill/assert/cleanup cycles completed in 5188ms, past vitest's default 5000ms per-test timeout; fixed by raising that one it()'s own timeout. -suite-5 failed typecheck (not the suite/test role, so no diagnostician was spawned) because `{ timeout: 15000 }` is not a valid third argument to vitest's `it()` in this project's type declarations; fixed by passing the plain number 15000. -suite-6, recorded above, passed clean.
