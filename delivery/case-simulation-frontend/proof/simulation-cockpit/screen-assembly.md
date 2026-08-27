---
implementation: sha256:2b647d8eb502e79f99114386979b459a39bb17affc53cd9df3a498053d2b057c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-screen-assembly-suite-2
title: Screen assembly proof
summary: Proves the composed case-simulation cockpit's cross-region gating, shared subject, per-hypothesis
  evaluation merging, case-result population, dispatch-error exclusivity and return-from-editing staleness
  mechanism, at both the hook and the fully-rendered-view level, and rewrites the superseded placeholder-wiring
  proof.
tests:
- file: src/hooks/use-case-simulation-cockpit-gating.spec.ts
  name: keeps the header's own and every row's own simulate gate disabled while the shared subject is
    not ready
  proves: 'criterion 1: disabled while the subject-derivation hook reports the subject is not ready'
  fails_when: canSimulateCase or disableSimulateHypothesis reports a ready state despite subjectState.isReady
    being false
- file: src/hooks/use-case-simulation-cockpit-gating.spec.ts
  name: enables both the header's own and every row's own simulate gate together, the instant the shared
    subject becomes ready
  proves: 'criterion 1: enabled once the subject is ready'
  fails_when: either gate stays disabled once subjectState.isReady turns true, or the two flip independently
- file: src/hooks/use-case-simulation-cockpit-gating.spec.ts
  name: disables both gates while a case-level dispatch is in flight, and re-enables both once it settles
  proves: 'criterion 2: disabled while any simulation dispatch is already in flight'
  fails_when: the gates stay enabled during an in-flight case-level dispatch, or fail to re-enable once
    it settles
- file: src/hooks/use-case-simulation-cockpit-gating.spec.ts
  name: disables both gates while a hypothesis-level dispatch is in flight, and re-enables both once it
    settles
  proves: criterion 2, the symmetric case for a single-hypothesis dispatch
  fails_when: the gates stay enabled during an in-flight hypothesis-level dispatch, or fail to re-enable
    once it settles
- file: src/hooks/use-case-simulation-cockpit-gating.spec.ts
  name: refuses a hypothesis-level dispatch made while a case-level dispatch is already in flight, issuing
    no request for it
  proves: 'criterion 2: only one dispatch may be in flight at a time, across the two different kinds'
  fails_when: a hypothesis-level dispatch issued while a case-level one is pending still reaches the network
- file: src/hooks/use-case-simulation-cockpit-gating.spec.ts
  name: refuses a case-level dispatch made while a hypothesis-level dispatch is already in flight, issuing
    no request for it
  proves: criterion 2, the mirror direction of the cross-kind mutual exclusion
  fails_when: a case-level dispatch issued while a hypothesis-level one is pending still reaches the network
- file: src/hooks/use-case-simulation-cockpit-gating.spec.ts
  name: dispatches a full-case run and a single-hypothesis run against the identical subject value this
    cockpit's own Subject region holds
  proves: 'criterion 3: both runs dispatch against the same subject the Subject region currently holds'
  fails_when: the two dispatched subject payloads differ from each other or from subjectState.subject
- file: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
  name: shows no detail for a selection made before any run has produced an evaluation
  proves: the recorded inference that a hypothesis with no evaluation yet has no Detail data (detail undefined)
  fails_when: detail is defined despite no evaluation existing for the selected hypothesis
- file: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
  name: opens the Detail region for a hypothesis's evaluation from a completed full-case run
  proves: criterion 4, the full-case-run half
  fails_when: detail is undefined, or names the wrong hypothesis/verdict, after a full-case run
- file: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
  name: opens the Detail region for a hypothesis's evaluation from a single-hypothesis run, exactly as
    it would from a full-case run
  proves: criterion 4, the single-hypothesis-run half
  fails_when: detail stays undefined or shows stale data for a hypothesis-only run, or its evidence is
    non-empty
- file: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
  name: shows a hypothesis's most recent evaluation whichever kind of run produced it last, leaving every
    other hypothesis's own evaluation untouched
  proves: 'criterion 4: the latest evaluation wins regardless of which kind of run produced it'
  fails_when: a later hypothesis-only run fails to overwrite the earlier case-level one for that hypothesis,
    or clobbers a different hypothesis's own evaluation
- file: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
  name: never appends to the Case result region's own run history for a completed single-hypothesis run
  proves: 'criterion 5: a single-hypothesis run does not populate the Case result region'
  fails_when: caseResultRuns gains an entry after a hypothesis-only run
- file: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
  name: appends exactly one run to the Case result region's own run history for a completed full-case
    run
  proves: 'criterion 5: a full-case run populates the Case result region'
  fails_when: caseResultRuns stays empty, or gains more or fewer than one entry, after a full-case run
- file: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
  name: surfaces a case-level dispatch failure as dispatchError
  proves: criterion 7, the operation-failure half, case-level
  fails_when: dispatchError stays null after a case-level operation failure
- file: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
  name: surfaces a hypothesis-level dispatch failure as dispatchError
  proves: criterion 7, the operation-failure half, hypothesis-level
  fails_when: dispatchError stays null after a hypothesis-level operation failure
- file: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
  name: keeps dispatchError null for a completed run that resolved an inconclusive verdict, since that
    is a returned evaluation rather than an operation failure
  proves: 'criterion 7: never for a returned verdict'
  fails_when: dispatchError becomes non-null merely because every evaluation resolved inconclusive
- file: src/hooks/use-case-simulation-cockpit-staleness.spec.ts
  name: invalidates no query on this cockpit's first mount for a slug/version this tab has not visited
    before
  proves: criterion 6, the non-return half
  fails_when: invalidateQueries is called on a genuinely first mount
- file: src/hooks/use-case-simulation-cockpit-staleness.spec.ts
  name: invalidates exactly the version's own case-version query, keyed the same way use-case-simulation-version.ts
    reads it
  proves: 'criterion 6: returning invalidates the version''s own query'
  fails_when: no invalidation happens on a return mount, or it targets a different query key than ["case-version",
    slug, version]
- file: src/hooks/use-case-simulation-cockpit-staleness.spec.ts
  name: starts a return mount's own Case result run history empty, even though the earlier mount had already
    recorded a completed run
  proves: the disclosed limitation named in this task's own criterion 6 entry -- what the staleness mechanism
    actually does today, not a future fix
  fails_when: a return mount's own caseResultRuns carries the prior mount's run (state persisting across
    mounts, contradicting the disclosed limitation), or is non-empty for any other reason
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: carries citations and no reason through for a decided (confirmed/refuted) evaluation, tagged with
    its own case source
  proves: domain/investigation/evaluation and domain/investigation/verdict as fromCaseEvaluation encodes
    them
  fails_when: the source tag is wrong, citations are dropped, or a reason appears on a decided evaluation
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: carries the reason through for an inconclusive evaluation, and keeps the raw response reachable
    verbatim
  proves: domain/investigation/evaluation-reason as fromCaseEvaluation encodes it, and the Detail region's
    own JSON-tab source
  fails_when: the reason is lost, or raw is not the exact object the evaluation was read from
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: tags the normalized evaluation with the hypothesis source, distinguishing it from a case-level
    one
  proves: the source discrimination fromHypothesisEvaluation underpins for criterion 4
  fails_when: the source tag is wrong or citations are dropped
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: normalizes an inconclusive hypothesis-level evaluation to an empty citations array, since that
    branch carries no citations field at all
  proves: fromHypothesisEvaluation's own normalization of a structurally narrower response into the canonical
    CockpitEvaluation shape
  fails_when: citations is undefined instead of an empty array, or the reason is lost
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: keeps only the hypothesis, verdict, reason and usage a row reads, dropping citations, elapsed_ms
    and prompt
  proves: toRowEvaluation's own narrowing, which case-simulation-hypotheses-table.tsx's own row reads
    through
  fails_when: an extra field leaks through, or a kept field is dropped or wrong
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: returns an empty list when the version carries no manifest
  proves: toManifestRows's own defined behavior for an absent manifest
  fails_when: it throws instead of returning an empty array
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: attaches no evaluation to a manifest entry this session has not produced one for yet
  proves: toManifestRows, the mechanism criterion 4 and hypotheses-table's own criterion 1 both rely on
  fails_when: a stale or wrong evaluation attaches to a hypothesis that has not run this session
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: attaches the currently-held evaluation to the manifest entry it names, by hypothesis name
  proves: toManifestRows's own by-name matching
  fails_when: the wrong row receives the evaluation, or collects is mismatched
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: reads outcome, referral and determining_hypothesis straight off the run's own assessment
  proves: toRunSummary's own transform, which the Hypotheses region's summary line reads
  fails_when: any field diverges from the source assessment
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: reads the run's own measured stage durations unchanged, including a writing figure when one exists
  proves: toDurations's own transform
  fails_when: any duration field is wrong, or the writing figure is dropped
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: carries the run's own outcome, referral, determining hypothesis, customer-facing text and register,
    plus one verdict entry per judged hypothesis
  proves: criterion 5's own core transform, toNewCaseResultRun
  fails_when: any field diverges from the source run, or the per-hypothesis verdict list is wrong or incomplete
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: 'answers { called: false } regardless of anything about the evaluation, since neither dispatch
    hook ever returns a model or a prompt version'
  proves: 'the recorded inference that the Detail region''s judgmentCall is always { called: false }'
  fails_when: called becomes true, or a model/promptVersion field appears, for any evaluation
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: carries the judgmentCall this task's own inference always supplies, even for a decided verdict
    whose evaluation carries usage/elapsed_ms/prompt implying a call happened
  proves: toDetailEvaluation's own composition of the same recorded inference
  fails_when: judgmentCall.called is true, or hypothesis/verdict/citations are mismapped
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: carries every field through, renaming the run's own origin to the Detail region's own capability.connector
  proves: toDetailEvidence's own transform, feeding the Detail region's Evidence tab
  fails_when: any field is mismapped, especially origin failing to become capability.connector
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: finds the named hypothesis's own revision summary in the manifest
  proves: toHypothesisRevisionSummary's own by-name lookup, which the Detail region's criterion text depends
    on
  fails_when: the wrong criterion/collects pair is returned
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: returns undefined for a hypothesis name the manifest does not carry
  proves: toHypothesisRevisionSummary's own defined behavior for an unmatched name
  fails_when: it throws, or fabricates an entry
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: returns undefined when the version carries no manifest at all
  proves: toHypothesisRevisionSummary's own defined behavior for an absent manifest
  fails_when: it throws
- file: src/routes/case-simulation-hypotheses-table-disable-select.spec.ts
  name: disables every row's own Simulate button when disableSimulate is true
  proves: the divergence extending case-simulation-hypotheses-table.tsx with disableSimulate, which criteria
    1-2 need
  fails_when: a row's own Simulate button stays enabled despite disableSimulate being true
- file: src/routes/case-simulation-hypotheses-table-disable-select.spec.ts
  name: defaults to an enabled Simulate button when disableSimulate is not supplied, preserving hypotheses-table's
    own already-proven default
  proves: the divergence's own stated backward-compatible default
  fails_when: a row's own Simulate button is disabled by default with the prop omitted
- file: src/routes/case-simulation-hypotheses-table-disable-select.spec.ts
  name: never calls the caller's own onSimulateHypothesis for a click on a disabled row's own Simulate
    button
  proves: the observable consequence of criteria 1-2's gate, at the row level
  fails_when: onSimulateHypothesis fires despite the button being disabled
- file: src/routes/case-simulation-hypotheses-table-disable-select.spec.ts
  name: leaves a disabled row's own Edit link unaffected, since editing stays available regardless of
    dispatch state
  proves: the divergence's own documented scope (only Simulate is gated, never Edit)
  fails_when: the Edit link's own href is missing or changed under disableSimulate
- file: src/routes/case-simulation-hypotheses-table-disable-select.spec.ts
  name: calls onSelectHypothesis with the clicked row's own hypothesis name, resolved by the row's manifest
    position
  proves: criterion 4's own wiring mechanism, handleRowSelected resolving a clicked row by position rather
    than an unchecked cast
  fails_when: onSelectHypothesis is never called, or is called with the wrong row's own hypothesis name
- file: src/routes/case-simulation-hypotheses-table-disable-select.spec.ts
  name: renders no clickable row at all when onSelectHypothesis is absent, matching hypotheses-table's
    own established inert-by-default behavior
  proves: the divergence's own stated backward-compatible default for onSelectHypothesis
  fails_when: rows become clickable (role="button") despite no onSelectHypothesis being supplied
- file: src/routes/case-simulation-ready-view.spec.ts
  name: passes the loaded record's own when_to_use and the version's own state through to the header
  proves: the header-composition fact this file's own previous suite already established, re-proven under
    the composed tree's own required QueryClientProvider
  fails_when: the header stops showing when_to_use or the version's own state
- file: src/routes/case-simulation-ready-view.spec.ts
  name: never renders the loaded record's own title anywhere in the composed cockpit
  proves: this file's own previously-recorded inference, widened from "the header" to the whole composed
    tree now that four more regions render
  fails_when: the record's own title text appears anywhere in the rendered cockpit
- file: src/routes/case-simulation-ready-view.spec.ts
  name: keeps the header's own Simulate case action and every row's own Simulate action disabled while
    the shared subject is not ready
  proves: criterion 1, end to end -- supersedes this file's own previous 'always disabled, no gate exists'
    test
  fails_when: the header's or any row's own Simulate control is enabled while the shared subject is not
    ready
- file: src/routes/case-simulation-ready-view.spec.ts
  name: enables the header's own Simulate case action and every row's own Simulate action together, the
    instant the shared subject becomes ready
  proves: criterion 1, the cross-region wiring this task's own instruction called out explicitly
  fails_when: the header and the rows do not become enabled together once the shared subject is ready
- file: src/routes/case-simulation-ready-view.spec.ts
  name: renders the Detail region's own placeholder message before any hypothesis is selected
  proves: the recorded inference, at the rendered-view level
  fails_when: the placeholder is absent, or the Detail region renders prematurely
- file: src/routes/case-simulation-ready-view.spec.ts
  name: renders no Case result region before any full-case run has completed this session
  proves: criterion 5, the absence half, end to end
  fails_when: the "Case result" heading appears before any run has completed
- file: src/routes/case-simulation-ready-view-dispatch.spec.ts
  name: disables the header's own action and every row's own action while a case-level dispatch is in
    flight, re-enabling both once it settles
  proves: criterion 2, end to end
  fails_when: the header's or a row's own control stays enabled during an in-flight dispatch, or fails
    to re-enable once it settles
- file: src/routes/case-simulation-ready-view-dispatch.spec.ts
  name: issues no second request when the header's own Simulate case action is clicked again while one
    is still in flight
  proves: 'criterion 2: only one dispatch may be in flight at a time, observable from the rendered control'
  fails_when: a second network call to /v1/simulate is issued from a second click while the first is still
    pending
- file: src/routes/case-simulation-ready-view-dispatch.spec.ts
  name: dispatches the row's own Simulate action carrying exactly the account-id value just typed into
    the Subject region
  proves: criterion 3, end to end
  fails_when: the dispatched subject diverges from the value the Subject region's own input currently
    shows
- file: src/routes/case-simulation-ready-view-dispatch.spec.ts
  name: shows no Case result region after a completed single-hypothesis run
  proves: criterion 5, the negative half, end to end
  fails_when: the "Case result" heading appears after a hypothesis-only run
- file: src/routes/case-simulation-ready-view-dispatch.spec.ts
  name: shows the Case result region after a completed full-case run
  proves: criterion 5, the positive half, end to end
  fails_when: the "Case result" heading is absent after a full-case run completes
- file: src/routes/case-simulation-ready-view-dispatch.spec.ts
  name: shows the dispatch-error banner after a case-level operation failure
  proves: criterion 7, the operation-failure half, end to end
  fails_when: no role="alert" banner appears after a failed dispatch
- file: src/routes/case-simulation-ready-view-dispatch.spec.ts
  name: shows no error banner after a completed full-case run that resolved every hypothesis inconclusive
  proves: 'criterion 7: never for a returned verdict, end to end'
  fails_when: a role="alert" banner appears despite no operation failure having occurred
- file: src/routes/case-simulation-ready-view-selection.spec.ts
  name: opens the Detail region for a hypothesis's evaluation from a completed full-case run
  proves: criterion 4, the full-case-run half, end to end
  fails_when: the Detail region's own heading, verdict or criterion text is absent or wrong after selecting
    a hypothesis with a case-run evaluation
- file: src/routes/case-simulation-ready-view-selection.spec.ts
  name: opens the Detail region for a hypothesis's evaluation from a single-hypothesis run, exactly as
    it would from a full-case run
  proves: criterion 4, the single-hypothesis-run half, end to end
  fails_when: the Detail region fails to show the hypothesis-only evaluation after that row is selected
- file: src/routes/case-simulation-ready-view-selection.spec.ts
  name: keeps showing the placeholder message for a selected hypothesis that has not produced an evaluation
    this session, even though it was clicked
  proves: the recorded inference, end to end, distinguishing "nothing selected" from "selected but no
    result yet"
  fails_when: the Detail region renders (its own heading appears) despite no evaluation existing for the
    clicked hypothesis
not_applicable:
- edge_case: An empty manifest (zero hypotheses)
  why: case-simulation-hypotheses-table.tsx's own empty-manifest state is untouched by this task and already
    proven by that component's own preserved spec suite; this task adds no new fact over that case.
- edge_case: The capability/connector-configuration registries failing to load or answering slowly
  why: That degradation belongs to useSimulationSubject/CaseSimulationSubjectPanel, already proven in
    use-simulation-subject.spec.ts and case-simulation-subject-panel.spec.ts; this task changes nothing
    about it, only composes the already-tested hook.
- edge_case: Duplicate hypothesis names within one manifest
  why: The manifest's own uniqueness is a fact of a different, already-delivered task (case-version authoring);
    this task's own criteria state nothing about it.
- edge_case: A boundary at each end of a numeric range
  why: No criterion of this task states a numeric range; nothing here is bounded that way.
untested:
- criterion 6's own 'reloads the hypotheses table' consequence is proven only as far as the correct query
  key (['case-version', slug, version]) being invalidated on a return mount (use-case-simulation-cockpit-staleness.spec.ts).
  The further consequence -- that invalidating this query actually causes CaseSimulationScreen's own useCaseSimulationVersion
  read to refetch and re-render the header, Subject region and Hypotheses table with fresh data -- lives
  one level above these four files (case-simulation-screen.tsx / the case-simulation-route task), which
  this proof does not reach and case-simulation-screen.spec.ts, a sibling task's own proof, would be the
  place to exercise it.
- A genuine full-route navigation away from and back to this cockpit (the router swapping this whole subtree
  out via its Outlet, then back in) is not directly exercised. use-case-simulation-cockpit-staleness.spec.ts
  approximates it by unmounting and remounting the same hook instance, which is the closest approximation
  available without driving case-simulation-screen.tsx's own routing from this proof; the implementation
  record's own disclosed limitation already states this is exactly the gap and what the mechanism does
  regardless.
- The view-level proof exercises the cross-kind mutual-exclusion of criterion 2 (case dispatch blocking
  a hypothesis dispatch and vice versa) only through the hook (use-case-simulation-cockpit-gating.spec.ts,
  both directions); at the fully-rendered view level only the case-level dispatch disabling both controls
  is directly exercised (case-simulation-ready-view-dispatch.spec.ts). The hook is the actual site of
  the gating logic and its own proof is symmetric; the view-level test demonstrates the wiring holds for
  at least one direction rather than duplicating both.
---

## What it is

Fifty-four tests across nine spec files (plus two shared .test-support.ts fixture/mount helpers), proving the composed cockpit's cross-region gating (subject-readiness and dispatch-in-flight, spanning the header and every hypotheses-table row together), the single shared subject both dispatch kinds use, per-hypothesis evaluation merging regardless of which kind of run produced it last, case-result population gated on run kind, dispatch-error exclusivity from returned verdicts, and the return-from-editing staleness mechanism (including its disclosed limitation) -- at both the orchestrating-hook level and the fully-rendered-view level, and rewrites the three pre-existing case-simulation-ready-view.spec.ts tests that described the now-replaced placeholder wiring.

## Notes

The suite's first run failed lint: two `@typescript-eslint/consistent-type-assertions` violations (fixed with typed narrowing helpers, following use-simulate-case.test-support.ts's own established convention) and three `testing-library/render-result-naming-convention` violations on `renderHook()`'s own return-object naming (fixed the same way as the same violation earlier in this epic -- destructuring `result`/`unmount` rather than naming the whole return). run/simulation-cockpit-screen-assembly-suite-2 is the resulting clean run.