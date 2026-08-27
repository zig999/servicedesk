---
implementation: sha256:7daf76932ab3322c2f68be4672f7c80e13e03d7c817e6297e74458aa54c9bc02
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-case-result-panel-suite-3
title: Case result panel proof
summary: Forty-five tests across five spec files proving the Case result region's five criteria and every
  disclosed inference, split by source file (types, hook, Compare view) and by concern within the panel
  itself (its own outcome/text/stale rendering versus its Compare-selection wiring).
tests:
- file: src/routes/case-simulation-case-result-types.spec.ts
  name: toggleCompareSelection -- this task's own inferred selection mechanism > adds a run's id to an
    empty selection
  proves: the disclosed inference that Compare selection is a checkbox-driven mechanism gating a two-run
    comparison
  fails_when: toggleCompareSelection stops adding an id to an empty selection
- file: src/routes/case-simulation-case-result-types.spec.ts
  name: toggleCompareSelection -- this task's own inferred selection mechanism > adds a second run's id
    alongside the first, rather than replacing it
  proves: the same inference -- a second pick is held alongside the first rather than replacing it
  fails_when: toggleCompareSelection replaces the first id instead of adding a second
- file: src/routes/case-simulation-case-result-types.spec.ts
  name: toggleCompareSelection -- this task's own inferred selection mechanism > removes a run's id already
    selected, rather than adding a duplicate
  proves: the same inference -- picking an already-selected id toggles it off
  fails_when: toggleCompareSelection adds a duplicate entry instead of removing the existing one
- file: src/routes/case-simulation-case-result-types.spec.ts
  name: toggleCompareSelection -- this task's own inferred selection mechanism > drops the oldest of two
    already-selected ids and adds the third one picked, instead of growing past two
  proves: the disclosed inference that a third pick drops the oldest of two already-held selections
  fails_when: toggleCompareSelection grows the selection past two ids, or drops the wrong one
- file: src/routes/case-simulation-case-result-types.spec.ts
  name: resolveCompareRuns -- criterion 4's own two-run resolution > resolves the two selected runs in
    this history's own chronological (array) order, never the order the two were selected
  proves: the disclosed inference that the Compare view's two columns follow this history's own order,
    never the order the two runs were picked
  fails_when: resolveCompareRuns returns the two runs in selection order instead of history order
- file: src/routes/case-simulation-case-result-types.spec.ts
  name: resolveCompareRuns -- criterion 4's own two-run resolution > returns undefined when only one selected
    id matches a run currently in history
  proves: Compare resolves only once exactly two selected runs are still present in history
  fails_when: resolveCompareRuns returns a result for fewer than two matching ids
- file: src/routes/case-simulation-case-result-types.spec.ts
  name: resolveCompareRuns -- criterion 4's own two-run resolution > returns undefined when no id is selected
    at all
  proves: the same fact, empty-selection case
  fails_when: resolveCompareRuns returns a result for an empty selection
- file: src/routes/case-simulation-case-result-types.spec.ts
  name: verdictForHypothesis > returns the verdict entry for a hypothesis the run judged
  proves: the per-hypothesis lookup the Compare view's own rows are built from (criterion 4)
  fails_when: verdictForHypothesis stops returning the matching entry for a hypothesis the run judged
- file: src/routes/case-simulation-case-result-types.spec.ts
  name: verdictForHypothesis > returns undefined for a hypothesis the run never judged
  proves: the same lookup's negative case, which the Compare view's placeholder side depends on
  fails_when: verdictForHypothesis returns a value for a hypothesis the run never judged
- file: src/routes/case-simulation-case-result-types.spec.ts
  name: hypothesisNamesAcross -- criterion 4's own 'hypothesis by hypothesis' union > returns every hypothesis
    either run judged, without duplicating one both runs judged
  proves: A "Compare" action shows two runs from the in-memory history side by side, hypothesis by hypothesis
    (criterion 4) -- the row set is the union of both runs' own hypotheses, deduplicated
  fails_when: hypothesisNamesAcross drops a hypothesis only one run judged, or lists a jointly-judged
    hypothesis twice
- file: src/routes/case-simulation-case-result-types.spec.ts
  name: hypothesisNamesAcross -- criterion 4's own 'hypothesis by hypothesis' union > returns no hypothesis
    name when neither run judged any
  proves: the same union's empty case
  fails_when: hypothesisNamesAcross returns a non-empty result for two runs holding no hypotheses
- file: src/routes/case-simulation-case-result-types.spec.ts
  name: VERDICT_CELL -- the color/label pairing the Compare view renders each verdict through > maps a
    confirmed verdict to bg-success, labeled 'confirmed'
  proves: the exact color/label pair the Compare view (criterion 4) renders a confirmed verdict through
  fails_when: 'VERDICT_CELL.confirmed stops being exactly { color: "bg-success", label: "confirmed" }'
- file: src/routes/case-simulation-case-result-types.spec.ts
  name: VERDICT_CELL -- the color/label pairing the Compare view renders each verdict through > maps a
    refuted verdict to bg-destructive, labeled 'refuted'
  proves: the same mapping, refuted case
  fails_when: 'VERDICT_CELL.refuted stops being exactly { color: "bg-destructive", label: "refuted" }'
- file: src/routes/case-simulation-case-result-types.spec.ts
  name: VERDICT_CELL -- the color/label pairing the Compare view renders each verdict through > maps an
    inconclusive verdict to bg-warning, labeled 'inconclusive'
  proves: the same mapping, inconclusive case
  fails_when: 'VERDICT_CELL.inconclusive stops being exactly { color: "bg-warning", label: "inconclusive"
    }'
- file: src/hooks/use-case-simulation-history.spec.ts
  name: useCaseSimulationHistory -- appending this session's own run history (criterion 3) > starts with
    an empty run history before any full-case run has completed
  proves: The region renders nothing until at least one full-case run has completed this session (the
    hook's own initial state this rests on)
  fails_when: useCaseSimulationHistory returns a non-empty runs array before recordRun is ever called
- file: src/hooks/use-case-simulation-history.spec.ts
  name: useCaseSimulationHistory -- appending this session's own run history (criterion 3) > appends a
    newly-completed run to the end of the history, in the order runs complete
  proves: Every full-case run this session is kept in an in-memory list (criterion 3)
  fails_when: recordRun stops appending, or the history's own order no longer matches the order runs completed
- file: src/hooks/use-case-simulation-history.spec.ts
  name: useCaseSimulationHistory -- appending this session's own run history (criterion 3) > assigns each
    recorded run its own id, timestamp and not-stale flag, distinct from the previous run's, rather than
    reading them from the caller
  proves: the disclosed inference that id, ranAt and stale are assigned by useCaseSimulationHistory itself
    rather than supplied by the caller
  fails_when: a recorded run is missing its own id or a parseable ranAt, starts stale, or shares its id
    with the previously recorded run
- file: src/hooks/use-case-simulation-history.spec.ts
  name: useCaseSimulationHistory -- appending this session's own run history (criterion 3) > records two
    runs completed back-to-back within the same update, losing neither
  proves: the append behavior holds even for two operations against this one hook's state made without
    an intervening render (a batching edge case)
  fails_when: the second of two recordRun calls made in the same update overwrites or drops the first
- file: src/hooks/use-case-simulation-history.spec.ts
  name: useCaseSimulationHistory -- marking the last run stale (criterion 5) > flips the current last
    run's own stale flag to true in place, without appending a new run
  proves: The last run is marked "stale" once told the version has changed underneath it, without requiring
    a new run to clear the marking itself (criterion 5)
  fails_when: markLastRunStale appends a new run instead of flipping the existing last run's own flag,
    or fails to set it true
- file: src/hooks/use-case-simulation-history.spec.ts
  name: useCaseSimulationHistory -- marking the last run stale (criterion 5) > is a no-op when no run
    has completed yet, neither throwing nor creating a run
  proves: the edge case of calling the stale marker before any run exists
  fails_when: markLastRunStale throws, or creates a run, when called with an empty history
- file: src/hooks/use-case-simulation-history.spec.ts
  name: useCaseSimulationHistory -- marking the last run stale (criterion 5) > marks only the last of
    several runs stale, and leaves that marking untouched once a further run completes
  proves: criterion 5's own "the last run" scoping, and that marking a run stale is not undone by a later,
    unrelated run completing
  fails_when: an earlier run is marked instead of the last one, or a later recordRun call clears a previous
    run's own stale marking
- file: src/hooks/use-case-simulation-history.spec.ts
  name: useCaseSimulationHistory -- marking the last run stale (criterion 5) > calling markLastRunStale
    twice in a row leaves the last run stale, rather than toggling it back off
  proves: markLastRunStale is a one-way flip, not a toggle
  fails_when: a second call to markLastRunStale clears the flag it just set
- file: src/hooks/use-case-simulation-history.spec.ts
  name: useCaseSimulationHistory -- kept only in memory (criterion 3, rules/investigation/a-simulation-writes-no-investigation)
    > issues no network request when recording a run or marking it stale
  proves: never sent to any endpoint (criterion 3 / rules/investigation/a-simulation-writes-no-investigation)
  fails_when: recording a run or marking it stale calls fetch even once
- file: src/hooks/use-case-simulation-history.spec.ts
  name: useCaseSimulationHistory -- kept only in memory (criterion 3, rules/investigation/a-simulation-writes-no-investigation)
    > never writes to localStorage or sessionStorage when recording a run or marking it stale
  proves: never persisted (criterion 3 / rules/investigation/a-simulation-writes-no-investigation)
  fails_when: recording a run or marking it stale calls Storage.prototype.setItem even once
- file: src/hooks/use-case-simulation-history.spec.ts
  name: useCaseSimulationHistory -- kept only in memory (criterion 3, rules/investigation/a-simulation-writes-no-investigation)
    > keeps no history across separate mounts of the hook, so nothing this session recorded survives outside
    this component's own memory
  proves: never entering any cache (criterion 3) -- the strongest observable proxy available, since the
    hook imports no cache client of its own to intercept
  fails_when: a freshly mounted instance of the hook starts with a non-empty runs array after an earlier,
    unmounted instance recorded one
- file: src/routes/case-simulation-case-result-compare.spec.ts
  name: CaseSimulationCaseResultCompare -- side-by-side verdicts (criterion 4) > shows both runs' own
    verdict for a hypothesis both of them judged
  proves: A "Compare" action shows two runs from the in-memory history side by side, hypothesis by hypothesis
    (criterion 4)
  fails_when: either run's own verdict for a jointly-judged hypothesis stops rendering, or the two sides
    are swapped
- file: src/routes/case-simulation-case-result-compare.spec.ts
  name: CaseSimulationCaseResultCompare -- side-by-side verdicts (criterion 4) > shows a plain placeholder
    on the second run's own side for a hypothesis only the first run judged
  proves: criterion 4's own "hypothesis by hypothesis" -- a hypothesis only one run judged still gets
    its own row, with the other side placeheld rather than dropped
  fails_when: the row is dropped entirely, or the second side shows anything other than the placeholder
- file: src/routes/case-simulation-case-result-compare.spec.ts
  name: CaseSimulationCaseResultCompare -- side-by-side verdicts (criterion 4) > shows a plain placeholder
    on the first run's own side for a hypothesis only the second run judged
  proves: the same fact, mirrored -- the first side is placeheld when only the second run judged that
    hypothesis
  fails_when: the row is dropped entirely, or the first side shows anything other than the placeholder
- file: src/routes/case-simulation-case-result-compare.spec.ts
  name: CaseSimulationCaseResultCompare -- side-by-side verdicts (criterion 4) > shows one row per hypothesis
    either run judged, deduplicating a hypothesis both of them judged
  proves: criterion 4's own plurality and dedup -- exactly one row per distinct hypothesis judged by either
    run
  fails_when: a jointly-judged hypothesis renders as two rows, or the total row count no longer equals
    the distinct hypothesis count
- file: src/routes/case-simulation-case-result-compare.spec.ts
  name: CaseSimulationCaseResultCompare -- side-by-side verdicts (criterion 4) > shows an explicit empty
    message, rather than an empty list, when neither run judged any hypothesis
  proves: the empty-comparison edge case is handled explicitly rather than left blank
  fails_when: no message renders (a blank body) when neither run judged anything, or a data row renders
    despite there being none
- file: src/routes/case-simulation-case-result-compare.spec.ts
  name: CaseSimulationCaseResultCompare -- side-by-side verdicts (criterion 4) > never shows a reason
    alongside a hypothesis's verdict, even when the underlying data happens to carry one
  proves: the disclosed inference that domain/investigation/evaluation-reason is not carried on the Compare
    view's per-hypothesis row
  fails_when: a reason string reaches the rendered Compare row even though the type it is drawn from carries
    no such field
- file: src/routes/case-simulation-case-result-panel.spec.ts
  name: CaseSimulationCaseResultPanel -- rendering only once a run has completed (criterion 1) > renders
    nothing when no full-case run has completed this session
  proves: The region renders nothing until at least one full-case run has completed this session (criterion
    1)
  fails_when: the panel renders any markup at all with an empty runs array
- file: src/routes/case-simulation-case-result-panel.spec.ts
  name: CaseSimulationCaseResultPanel -- rendering only once a run has completed (criterion 1) > shows
    the outcome, the referral and the determining hypothesis of the last run once one has completed
  proves: criterion 1's own positive case -- the outcome, referral and determining hypothesis of the last
    run
  fails_when: the outcome, the referral's action/recipient, or the determining hypothesis stops appearing
    on that line
- file: src/routes/case-simulation-case-result-panel.spec.ts
  name: CaseSimulationCaseResultPanel -- rendering only once a run has completed (criterion 1) > shows
    the literal word "Fallback" for the determining hypothesis when nothing confirmed and the fallback
    answered
  proves: the disclosed inference that an absent determiningHypothesis renders as the literal word "Fallback"
  fails_when: an absent determiningHypothesis renders as blank, undefined, or any word other than "Fallback"
- file: src/routes/case-simulation-case-result-panel.spec.ts
  name: CaseSimulationCaseResultPanel -- rendering only once a run has completed (criterion 1) > shows
    the most recently completed run's own outcome, not an earlier one, when several runs exist
  proves: criterion 1 is answered by the last run specifically, not an earlier one, once several exist
  fails_when: the panel shows an earlier run's own outcome instead of the most recent one
- file: src/routes/case-simulation-case-result-panel.spec.ts
  name: CaseSimulationCaseResultPanel -- the customer-facing text box (criterion 2) > shows exactly the
    last run's own customer-facing text, labeled by the register actually used
  proves: The customer-facing text box shows exactly assessment.text, labeled with assessment.register
    (criterion 2)
  fails_when: the text box stops showing the run's own text verbatim, or the label stops naming the register
    actually used
- file: src/routes/case-simulation-case-result-panel.spec.ts
  name: CaseSimulationCaseResultPanel -- the customer-facing text box (criterion 2) > shows no other field
    of the record inside the customer-facing text box
  proves: criterion 2's own "shows no other field of the record next to it"
  fails_when: the outcome, referral, determining hypothesis, or any other field leaks into the text box's
    own contents
- file: src/routes/case-simulation-case-result-panel.spec.ts
  name: CaseSimulationCaseResultPanel -- the "stale" marker (criterion 5) > shows a "Stale" status alongside
    the outcome line when the last run is marked stale
  proves: The last run is marked "stale" (criterion 5) -- the rendering half
  fails_when: no "Stale" status renders for a run whose own stale flag is true
- file: src/routes/case-simulation-case-result-panel.spec.ts
  name: CaseSimulationCaseResultPanel -- the "stale" marker (criterion 5) > shows no "Stale" status when
    the last run is not marked stale
  proves: the same fact's negative case
  fails_when: a "Stale" status renders for a run whose own stale flag is false
- file: src/routes/case-simulation-case-result-panel-compare.spec.ts
  name: CaseSimulationCaseResultPanel -- gating the "Compare" button on exactly two selected runs (criterion
    4) > keeps the Compare button disabled until exactly two runs are checked
  proves: the disclosed selection-mechanism inference -- a "Compare" button gated on exactly two checked
    runs
  fails_when: the button is enabled with zero or one run checked, or stays disabled once exactly two are
    checked
- file: src/routes/case-simulation-case-result-panel-compare.spec.ts
  name: CaseSimulationCaseResultPanel -- gating the "Compare" button on exactly two selected runs (criterion
    4) > unchecking a checked run's own checkbox drops it back out of the selection, keeping the Compare
    button disabled until two are checked again
  proves: the panel's own wiring of toggleCompareSelection's toggle-off branch, end to end
  fails_when: unchecking a run's own checkbox fails to uncheck it, or the Compare button stays enabled
    with fewer than two checked
- file: src/routes/case-simulation-case-result-panel-compare.spec.ts
  name: CaseSimulationCaseResultPanel -- gating the "Compare" button on exactly two selected runs (criterion
    4) > drops the oldest of two already-checked runs when a third is checked, rather than growing past
    two
  proves: the disclosed inference that checking a third run drops the oldest of two already checked, wired
    end to end through the panel's own checkboxes
  fails_when: three checkboxes end up checked at once, or the wrong one is dropped
- file: src/routes/case-simulation-case-result-panel-compare.spec.ts
  name: CaseSimulationCaseResultPanel -- showing the Compare view (criterion 4) > shows no Compare view
    before the button has been clicked, even once two runs are checked
  proves: the Compare view appears only once the action is taken, not merely once two runs are checked
  fails_when: the Compare view renders before the "Compare" button is clicked
- file: src/routes/case-simulation-case-result-panel-compare.spec.ts
  name: CaseSimulationCaseResultPanel -- showing the Compare view (criterion 4) > renders the Compare
    view for exactly the two checked runs once Compare is clicked
  proves: A "Compare" action shows two runs from the in-memory history side by side, hypothesis by hypothesis
    (criterion 4), wired end to end from the panel's own checkboxes and button
  fails_when: clicking Compare with two runs checked fails to render the Compare view, or renders it for
    different runs than the two checked
- file: src/routes/case-simulation-case-result-panel-compare.spec.ts
  name: CaseSimulationCaseResultPanel -- showing the Compare view (criterion 4) > keeps the Compare view's
    two columns in this session's own chronological order, never the order the two runs were checked
  proves: the disclosed inference that the Compare view's columns follow history order rather than selection
    order, proven end to end through the panel's own wiring rather than only at resolveCompareRuns's own
    unit level
  fails_when: checking the more recent run first swaps which column shows its own verdict
not_applicable:
- edge_case: two full-case runs being dispatched or recorded at once (concurrency)
  why: recordRun and markLastRunStale are synchronous state setters over this one hook's own in-memory
    state; dispatching a full-case run at all belongs to task/simulation-cockpit/use-simulate-case, already
    delivered and outside this task's own reach -- there is no asynchronous operation in these four files
    for a test to race
- edge_case: a network or backend dependency failing or answering slowly
  why: 'none of the four files this task delivers issues a request of its own (this task''s own record:
    "fixture/props-driven ... wired to nothing yet"); a dependency failure belongs to use-simulate-case
    or screen-assembly, neither delivered by this task'
- edge_case: a hypothesis judged more than once within one run's own hypotheses array (a duplicate entry)
  why: no bound node states a uniqueness rule over CaseResultRunHypothesisVerdict entries, and the value
    is produced upstream by use-simulate-case's own response shaping; asserting behavior over a shape
    this task's own inputs are not responsible for producing would test an assumption outside this task's
    reach, mirroring case-simulation-hypotheses-table's own identical dismissal for a duplicate manifest
    position
- edge_case: an empty string or an unusually long value for outcome, referral action/recipient, or text
  why: no bound node states a range or non-emptiness constraint over any of these fields; every field
    this task renders is shown verbatim regardless of length or content
- edge_case: the run history transitioning from populated back to empty within one mounted panel instance
  why: no criterion or bound node describes this transition, and the one caller this task's own record
    names (screen-assembly) only ever appends to or marks the existing history -- it never removes a recorded
    run
untested:
- formatRunTime's own exact, locale-formatted output (the "HH:MM" text in the history list and the Compare
  header) is not pinned by any test, since it is documented in the source itself as "form only ... never
  a fact any node states"; asserting an exact string here would tie the suite to the test runner's own
  locale and timezone rather than to anything the specification decided.
- Criterion 3's "never entering any cache" clause is proven only by the strongest available proxy -- that
  a freshly mounted instance of the hook starts empty after an earlier instance recorded a run and was
  unmounted -- rather than by intercepting a cache client directly, since use-case-simulation-history.ts
  imports no query-cache client of its own for a test to observe.
- The actual wiring this task's own implementation record defers -- recordRun being called on a completed
  full-case dispatch, and markLastRunStale being called from a hash/updated_at comparison on return from
  an editing screen -- belongs to task/simulation-cockpit/screen-assembly, not yet delivered; nothing
  in these four files calls either function from outside a test, so that composition is unproven here
  by construction.
---

## What it is

Forty-five tests across five spec files, proving the Case result region's five criteria -- rendering only once a run has completed, the customer-facing text box labeled by the register actually used, the in-memory-only run history (never persisted, never cached, never sent anywhere), the side-by-side Compare action gated on exactly two selected runs and shown hypothesis by hypothesis, and the passive stale marker -- plus every disclosed inference (the checkbox-driven drop-oldest selection mechanism, the Fallback label, chronological rather than selection order in the Compare view, and the assigned id/timestamp/stale bookkeeping).

## Notes

The suite's first two runs (run/simulation-cockpit-case-result-panel-suite and -suite-2) failed lint: 13 testing-library/no-node-access and no-container violations across four spec files (fixed by replacing raw DOM traversal with Testing Library queries, following this delivery's own established pattern from earlier tasks in this epic), then a render-result-naming-convention violation where renderHook()'s whole return object -- not just its destructured result property -- was named firstResult/secondResult; a fresh test-author destructured result (and unmount, where needed) out of each call instead, matching use-simulation-subject.spec.ts's own established convention. run/simulation-cockpit-case-result-panel-suite-3 is the resulting clean run.