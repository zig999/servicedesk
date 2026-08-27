---
implementation: sha256:05301c91d2f537b42a4fef3d64ed10b34c901d47d11f1e4a2c7515e1c5a284b6
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-hypotheses-table-suite-4
title: Hypotheses table proof
summary: Tests for task/simulation-cockpit/hypotheses-table's six criteria and its five behavioral inferences,
  all against CaseSimulationHypothesesTable and its row-shaping helpers.
tests:
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: renders exactly one row per manifest entry, ordered by position, whether or not each has run this
    session, regardless of the caller's own array order
  proves: Every hypothesis the version's manifest declares renders as exactly one row, in the manifest's
    own precedence order, whether or not that hypothesis has run this session.
  fails_when: the table renders a different row count than manifest entries, collapses or drops a not-yet-run
    row, or renders rows in the caller's own (here deliberately shuffled) array order instead of position
    order
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: shows the number of concepts collected per row, independent of whether that row has an evaluation
  proves: Each row shows the number of concepts that hypothesis's own revision collects, per domain/knowledge/hypothesis-revision.
  fails_when: the Collects column shows anything other than each row's own collects.length, for a row
    with an evaluation or without one
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: shows the reason alongside the verdict for a row whose last run resolved inconclusive
  proves: A row whose last run resolved inconclusive always shows its reason alongside the verdict.
  fails_when: an inconclusive row with a reason stops rendering "Inconclusive · no data" together
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: shows no verdict at all for a row that has not run this session
  proves: a row that has not run this session shows no verdict
  fails_when: a not-yet-run row's verdict cell shows anything but the plain placeholder, or any verdict
    word appears for it
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: shows the plain verdict word alone, with no reason suffix, for an inconclusive row that carries
    no reason
  proves: A row whose last run resolved inconclusive always shows its reason alongside the verdict (the
    case where no reason exists)
  fails_when: a reasonless inconclusive row shows a reason suffix, or shows anything other than the bare
    verdict word
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: never shows a reason for a row whose verdict resolved confirmed, even where a reason value is
    present
  proves: the reason is shown only alongside an inconclusive verdict, never a confirmed one
  fails_when: a confirmed row's reason field leaks into the rendered verdict cell
- file: src/routes/case-simulation-hypotheses-table-row.spec.ts
  name: returns the plain placeholder when the row has not run this session
  proves: a row that has not run this session shows no verdict (unit level, over verdictCell)
  fails_when: verdictCell(undefined) stops returning the plain "—" placeholder
- file: src/routes/case-simulation-hypotheses-table-row.spec.ts
  name: combines the verdict label with its reason label when the verdict resolved inconclusive with a
    reason
  proves: A row whose last run resolved inconclusive always shows its reason alongside the verdict (unit
    level)
  fails_when: verdictCell stops combining the verdict label and the reason label for an inconclusive+reason
    evaluation
- file: src/routes/case-simulation-hypotheses-table-row.spec.ts
  name: returns the plain verdict word, with no reason suffix, when the verdict resolved inconclusive
    but carries no reason
  proves: the reason suffix is present only when a reason exists (unit level)
  fails_when: verdictCell attaches a suffix when no reason is present
- file: src/routes/case-simulation-hypotheses-table-row.spec.ts
  name: never attaches a reason to a confirmed verdict, even where a reason value happens to be present
  proves: the reason is scoped to the inconclusive verdict only (unit level)
  fails_when: verdictCell attaches a reason suffix to a confirmed verdict
- file: src/routes/case-simulation-hypotheses-table-row.spec.ts
  name: never attaches a reason to a refuted verdict, even where a reason value happens to be present
  proves: the reason is scoped to the inconclusive verdict only (unit level, refuted case)
  fails_when: verdictCell attaches a reason suffix to a refuted verdict
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: addresses a row's own Edit link to that hypothesis's manifest-hypothesis route with ?back=simulate
  proves: A row's edit action links to /cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName?back=simulate
    for that hypothesis.
  fails_when: the Edit link's path or the back=simulate query stops matching that URL for a row with an
    evaluation
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: addresses a row with no evaluation this session's own Edit link the same way, using its routing
    identity rather than any evaluation-derived name
  proves: the not-yet-run case, and the inference that hypothesisName is always carried and used for routing
    regardless of evaluation state
  fails_when: a not-yet-run row's Edit link stops resolving, or resolves against anything but that row's
    own hypothesisName
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: shows the determining hypothesis, outcome and referral from the last full-case run's own summary
  proves: The summary line beneath the table shows the determining hypothesis, the resolved outcome and
    the referral from the last full-case run.
  fails_when: the summary line stops showing the determining hypothesis, outcome or referral text supplied
    by the summary prop
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: shows the literal word "Fallback" for the determining hypothesis when nothing confirmed and the
    fallback answered
  proves: the inference the implementation recorded (the summary line renders the literal word 'Fallback'
    for determiningHypothesis when it is absent)
  fails_when: an absent determiningHypothesis renders as blank, undefined, or any word other than "Fallback"
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: shows no summary line when no full-case run has completed this session
  proves: is absent when no full-case run has completed this session
  fails_when: the summary line renders even though no summary prop was supplied
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: calls the caller's own onSimulateHypothesis with the clicked row's own hypothesis name
  proves: A row's simulate action is exposed as a callback the region itself does not implement the dispatch
    of.
  fails_when: clicking Simulate stops calling onSimulateHypothesis, or calls it with the wrong hypothesis
    name
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: passes the clicked row's own hypothesis name, not another row's, when several rows are shown
  proves: the simulate callback is scoped per row, never global
  fails_when: clicking one row's Simulate button reports another row's hypothesis name
- file: src/routes/case-simulation-hypotheses-table-row.spec.ts
  name: returns the evaluation's own hypothesis text when this session produced one
  proves: the disclosed inference that a row's displayed Hypothesis-column text is sourced from evaluation.hypothesis,
    never hypothesisName
  fails_when: hypothesisLabel stops returning the evaluation's own hypothesis text
- file: src/routes/case-simulation-hypotheses-table-row.spec.ts
  name: returns the blank placeholder, never the row's own routing-only hypothesisName, when no evaluation
    is present
  proves: the same inference, negative case — hypothesisName is never leaked into the displayed label
  fails_when: hypothesisLabel returns hypothesisName or anything but the placeholder for a row with no
    evaluation
- file: src/routes/case-simulation-hypotheses-table-row.spec.ts
  name: colors a confirmed verdict bg-success
  proves: 'the inference the implementation recorded (Verdict colors: confirmed -> bg-success, refuted
    -> bg-destructive, inconclusive -> bg-warning)'
  fails_when: verdictCell's color for a confirmed verdict stops being "bg-success"
- file: src/routes/case-simulation-hypotheses-table-row.spec.ts
  name: colors a refuted verdict bg-destructive
  proves: the same inference, refuted case
  fails_when: verdictCell's color for a refuted verdict stops being "bg-destructive"
- file: src/routes/case-simulation-hypotheses-table-row.spec.ts
  name: colors an inconclusive verdict bg-warning, whether or not a reason is attached
  proves: the same inference, inconclusive case
  fails_when: verdictCell's color for an inconclusive verdict stops being "bg-warning"
- file: src/routes/case-simulation-hypotheses-table-row.spec.ts
  name: returns the plain placeholder when the row has not run this session
  proves: the inference the implementation recorded (token cost renders as a plain integer sum, not a
    compacted/locale-formatted string) — the not-run case
  fails_when: costCell(undefined) stops returning "—"
- file: src/routes/case-simulation-hypotheses-table-row.spec.ts
  name: returns the plain placeholder when an evaluation is present but no call actually happened
  proves: the same inference — costCell is gated on evaluation.usage being present, not just evaluation
  fails_when: costCell returns anything but "—" for an evaluation with no usage
- file: src/routes/case-simulation-hypotheses-table-row.spec.ts
  name: returns the input-plus-output token sum as a plain integer string, never comma-grouped or compacted
  proves: the same inference — the exact format (plain sum, no thousands separator, no compaction)
  fails_when: costCell returns anything but "1240" for input_tokens 1200 and output_tokens 40 — including
    "1,240" or a compacted form
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: shows the input-plus-output token sum for a row whose call has run this session
  proves: the same inference, wired end-to-end through the rendered "Cost (tok)" column
  fails_when: the rendered cost cell for a row with usage stops showing the plain integer sum
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: shows the plain placeholder in the cost column for a row that has not run this session
  proves: the same inference, negative case at the rendered table
  fails_when: a not-yet-run row's cost cell shows anything but the placeholder
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: shows the last run's own measured collection, judgment, writing and total durations when supplied
  proves: the inference the implementation recorded (a last-run stage-durations line (DurationsLine) is
    built even though no numbered criterion tests it)
  fails_when: the durations line stops showing the exact measured collection/judgment/writing/total figures
    supplied
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: omits the writing figure when the last run carried none, as a single-hypothesis run never reaches
    writing
  proves: the same inference — writingMs's own conditional presence
  fails_when: the durations line shows a writing figure when none was supplied, or shows nothing when
    durations are absent-only-of-writing
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: shows no durations line when no run's durations were supplied
  proves: the same inference, absence case
  fails_when: the durations line renders even though no lastRunDurations prop was supplied
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: renders an explicit empty state, rather than an empty table, for a version whose manifest holds
    no hypothesis
  proves: the edge case of an empty manifest is handled explicitly (API-04), and by extension that criterion
    1's "always all of them" holds vacuously true rather than crashing
  fails_when: an empty rows array renders an empty table instead of the explicit empty-state text, or
    renders nothing at all
not_applicable:
- edge_case: a manifest holding two entries at the same position
  why: no bound node (domain/knowledge/manifest-entry or its own producing rule) states positions may
    collide, and the component's own contract takes position as this fact's own carrier rather than validating
    it; a test asserting sort behavior over an input the domain model does not produce would assert a
    guarantee about Array.prototype.sort's own stability rather than about this task's behavior
- edge_case: a network or backend dependency failing or answering slowly
  why: this component issues no request of its own (criterion 6 and this task's own rationale) — it is
    fixture-driven and props-only, so there is no dependency here to fail or delay
- edge_case: two simulate operations against one subject fired at once
  why: onSimulateHypothesis is a callback the region never dispatches itself; concurrency in what the
    callback's caller does with two clicks is that caller's own behavior, in a separate, not-yet-delivered
    task (the mutation hooks), not this component's
- edge_case: a slug or hypothesis name containing characters that need URL-encoding in the Edit link
  why: no criterion or bound node states an encoding rule, and the Link's href is produced entirely by
    TanStack Router's own param serialization, which this component does not implement or override; a
    test over it would test the router, not this task's own source
- edge_case: an empty string, or unusually large, position/collects/usage value
  why: no bound node states a range or non-emptiness constraint over these fields beyond what is already
    exercised (collects.length of 0 is already covered as one of the three rows in the primary criterion-1/2
    tests)
untested:
- rules/investigation/a-simulation-writes-no-investigation and rules/investigation/the-customer-sees-only-the-text
  are both recorded in the implementation as honored by construction (no request issued, no customer-facing
  surface rendered) rather than encoded as a checkable fact — nothing here or in the source gives a test
  something to assert against, so neither is proven by any test in these files; the honesty of that construction
  is what the conformance pass, not this proof, is positioned to judge.
- the summary line's and durations line's exact spacing/punctuation choices (the middle dot, the slash)
  are pinned by exact-string assertions in the tests that cover them, but no bound node states that punctuation
  is the specification's own choice rather than this task's presentation; a future change to that punctuation
  would fail these tests without necessarily being a regression in anything the specification decided.
---

## What it is

Thirty tests across two spec files, proving the Hypotheses table's six criteria — one row per manifest entry in position order, collects count, verdict/reason display gated on whether the hypothesis has run, the Edit link's routing identity, the last full-case run's summary line, and the per-row Simulate callback — plus every disclosed inference: the hypothesis label sourced from the evaluation rather than the routing name, verdict/result color mapping, the plain-integer token-cost format, and the conditional stage-durations line.

## Notes

None.
