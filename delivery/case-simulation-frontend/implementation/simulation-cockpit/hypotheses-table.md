---
title: Hypotheses table (case simulation cockpit)
summary: A presentational, props-driven React component rendering the case-simulation screen's Hypotheses
  region — the precedence-ordered StatusTable, its per-row simulate/edit actions, and the determining/outcome/referral
  summary and last-run durations lines beneath it.
task: sha256:377bc1d5fcc2e3fd72a4126b0834cc1587febf6a4e05ef26cc1cd2579455be30
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-hypotheses-table-build-3
files:
- path: src/routes/case-simulation-hypotheses-table.tsx
  effect: Exports CaseSimulationHypothesesTable, a presentational component that renders one StatusTable
    row per manifest entry (sorted by position), a per-row Simulate button calling the onSimulateHypothesis
    callback prop and an Edit Link to the existing manifest-hypothesis route with ?back=simulate, and
    — beneath the table — a determining/outcome/referral summary line and a last-run stage-durations line,
    each shown only when its corresponding prop is supplied. Implements no fetch, mutation or navigation-driving
    logic of its own.
- path: src/routes/case-simulation-hypotheses-table-row.ts
  effect: New pure module holding the row-shaped domain types (SimulationManifestRow, SimulationHypothesisEvaluation,
    SimulationVerdict, SimulationEvaluationReason, SimulationUsage, SimulationReferral, SimulationRunSummary,
    SimulationDurations) and the cell-shaping helpers (hypothesisLabel, verdictCell, costCell, plus the
    VERDICT_CELL/REASON_LABEL lookup tables) the component above composes — split out of the .tsx file
    so its own JSX stays under this project's max-component-lines rule and so the cell computations sit
    outside JSX render logic.
criteria:
- criterion: Every hypothesis the version's manifest declares renders as exactly one row, in the manifest's
    own precedence order, whether or not that hypothesis has run this session.
  met: true
  how: 'CaseSimulationHypothesesTable takes rows: readonly SimulationManifestRow[] (one entry per manifest
    position) and renders every one of them through StatusTable regardless of whether row.evaluation is
    present; orderedRows = [...rows].sort((a, b) => a.position - b.position) guarantees the manifest''s
    own precedence order even if the caller supplies rows out of order.'
- criterion: Each row shows the number of concepts that hypothesis's own revision collects, per domain/knowledge/hypothesis-revision.
  met: true
  how: 'Every row carries collects: readonly string[] (the revision''s own collected-concept identifiers);
    toTableRow renders row.collects.length in the "Collects" column unconditionally, independent of whether
    the row has an evaluation.'
- criterion: A row whose last run resolved inconclusive always shows its reason alongside the verdict;
    a row that has not run this session shows no verdict.
  met: true
  how: verdictCell (case-simulation-hypotheses-table-row.ts) returns the plain placeholder "—" when row.evaluation
    is absent (no verdict shown at all), and when evaluation.verdict === "inconclusive" and a reason is
    present, returns a single cell combining the verdict label and the reason label (e.g. "Inconclusive
    · no data").
- criterion: A row's edit action links to /cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName?back=simulate
    for that hypothesis.
  met: true
  how: 'RowActions renders a TanStack Router Link to="/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName"
    params={{ slug, version: String(version), hypothesisName: row.hypothesisName }} search={EDIT_LINK_SEARCH}
    where EDIT_LINK_SEARCH = { back: "simulate" }, producing exactly that URL for every row.'
- criterion: The summary line beneath the table shows the determining hypothesis, the resolved outcome
    and the referral from the last full-case run, and is absent when no full-case run has completed this
    session.
  met: true
  how: 'SummaryLine renders "Determining: <determiningHypothesis ?? \"Fallback\"> · Outcome <outcome>
    · Referral <action> / <recipient>" from the optional summary: SimulationRunSummary prop; CaseSimulationHypothesesTable
    only renders <SummaryLine> when summary is truthy, so the whole line is absent when the caller supplies
    none (no completed full-case run this session).'
- criterion: A row's simulate action is exposed as a callback the region itself does not implement the
    dispatch of.
  met: true
  how: 'The component''s only required behavior prop is onSimulateHypothesis: (hypothesisName: string)
    => void; RowActions'' Simulate Button calls it directly (onClick={() => onSimulateHypothesis(row.hypothesisName)})
    with no fetch, mutation hook or other dispatch mechanism anywhere in either file.'
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/routes/case-simulation-hypotheses-table.tsx
  - src/routes/case-simulation-hypotheses-table-row.ts
  how: The component's prop shapes model what this contract's two operations would return for the Hypotheses
    region — a per-hypothesis evaluation (simulate-hypothesis's own narrower read) and, for a full-case
    run, the resolved outcome/referral plus durations (simulate-case's own record). Dispatching either
    operation is not implemented here — onSimulateHypothesis is a callback the region never calls a network
    layer through, per criterion 6 and this task's own rationale; the two mutation hooks are separate,
    not-yet-delivered tasks in this epic.
- node: domain/knowledge/case-version
  encoded_at:
  - src/routes/case-simulation-hypotheses-table.tsx
  how: The table renders the version's own manifest, in precedence order (case-version's own "compose,
    through its manifest, the hypothesis revisions this version of the case uses, in precedence order"
    responsibility), addressed by its own version number for routing. The summary line's "Fallback" label
    (used when determiningHypothesis is absent) names case-version's own fallback concept. Every other
    case-version attribute (title, when_to_use, subject, state, released_at) belongs to the Header region,
    a separate task this delivery does not reach.
- node: domain/knowledge/manifest-entry
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
  - src/routes/case-simulation-hypotheses-table.tsx
  how: SimulationManifestRow.position is manifest-entry's own position attribute, read and rendered unconditionally
    per row and used to sort the table into precedence order.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
  how: SimulationManifestRow.collects models the referenced revision's own collects attribute (as opaque
    concept identifiers, since domain/glossary/concept is outside this task's implements); its length
    is what criterion 2's own concepts-collected count renders.
- node: domain/investigation/evaluation
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
  how: SimulationHypothesisEvaluation carries this node's own hypothesis, verdict, reason and usage fields
    — the subset this region's row needs. citations, elapsed_ms and prompt are deliberately not carried
    here; they belong to the per-hypothesis Detail region, a separate task.
- node: domain/investigation/verdict
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
  how: SimulationVerdict models the enumeration's three values exactly; VERDICT_CELL maps each to a {color,label}
    StatusTable cell (color is this task's own inference, recorded below).
- node: domain/investigation/evaluation-reason
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
  how: SimulationEvaluationReason models the enumeration's three values exactly; REASON_LABEL supplies
    each a readable word, shown alongside the verdict only when the verdict is inconclusive (criterion
    3).
- node: domain/investigation/usage
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
  how: SimulationUsage carries input_tokens/output_tokens unmodified; costCell sums them into the row's
    own token-cost cell, present only when evaluation.usage is present (a call actually happened).
- node: domain/investigation/assessment
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
  - src/routes/case-simulation-hypotheses-table.tsx
  how: SimulationRunSummary carries this node's own outcome, referral and determining_hypothesis, exactly
    as resolve-outcome supplies them (never decided by this component). The node's own text, register,
    usage, elapsed_ms and prompt attributes are deliberately not modeled here — they belong to the customer-facing
    text box in the Case Result region, a separate, not-yet-delivered task.
- node: domain/knowledge/resolution
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
  how: SimulationRunSummary types outcome and referral as always co-required, never one without the other
    — resolution's own "pair one outcome with one referral" responsibility, mirrored structurally rather
    than through a nested resolution field, since assessment's own attributes (which this summary follows)
    are themselves flat rather than nesting a resolution object.
- node: domain/knowledge/referral
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
  how: SimulationReferral carries this node's own action and recipient attributes unmodified; SummaryLine
    renders both together as "Referral <action> / <recipient>".
- node: domain/investigation/durations
  encoded_at:
  - src/routes/case-simulation-hypotheses-table-row.ts
  - src/routes/case-simulation-hypotheses-table.tsx
  how: SimulationDurations carries collection/judgment/writing/total exactly, writingMs optional per the
    node's own conditional-presence rule; DurationsLine renders the last run's measured values with no
    budget comparison, per this task's own Notes (the 7s/5s/4s figures live only in rules scoped to diagnose,
    outside this task's implements and this epic's covers).
- node: rules/investigation/a-simulation-writes-no-investigation
  how: 'Honored by construction rather than by an explicit check — this component issues no request of
    its own (criterion 6: the simulate action is a callback the region never dispatches), so it cannot
    write an investigation regardless of what a future caller does with that callback.'
- node: rules/investigation/the-customer-sees-only-the-text
  how: Honored rather than encoded — this region is the curator's own view (contracts/investigation/case-simulation's
    own description names it as such), so verdicts, reasons and token costs are shown here deliberately.
    This rule constrains a different, customer-facing surface; no code in this delivery renders one.
- node: scenarios/investigation/a-draft-case-version-is-simulated
  encoded_at:
  - src/routes/case-simulation-hypotheses-table.tsx
  how: 'This component renders the shape of this scenario''s own response for the Hypotheses region —
    every evaluation with its verdict (per row) and the durations (DurationsLine) — when a caller supplies
    them. The request itself ("a simulation of the case is requested"), the per-evidence-item detail,
    and the "no investigation is written" guarantee are outside a presentational component''s own reach:
    the first belongs to the not-yet-delivered mutation hooks, the second to the Detail region, and the
    third is a backend guarantee no UI code encodes.'
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  encoded_at:
  - src/routes/case-simulation-hypotheses-table.tsx
  how: The row-level onSimulateHypothesis callback is this scenario's own entry point (naming one hypothesis).
    A row's own optional evaluation matches "exactly one evaluation returns" per named hypothesis. The
    summary line's own gating — present only when a summary prop from a full-case run is supplied — keeps
    a single-hypothesis run from ever implying a resolved outcome, matching "no outcome and no assessment
    are resolved".
inferences:
- inferred: Verdict colors (confirmed -> bg-success, refuted -> bg-destructive, inconclusive -> bg-warning)
    for the StatusTable cell.
  from: No node this task implements (domain/investigation/verdict included) names a color for any value;
    this mirrors case-detail-screen.tsx's own STATE_CELL precedent for domain/knowledge/case-version-state,
    reusing the same already-read TUI semantic tokens (bg-success, bg-warning already used there; bg-destructive
    already used as text-destructive throughout this codebase's own error states).
- inferred: The summary line renders the literal word "Fallback" for determiningHypothesis when it is
    absent.
  from: domain/knowledge/case-version's own description names "fallback" directly ("The fallback is a
    disguised default hypothesis, explicit on purpose") and domain/investigation/assessment states determining_hypothesis
    is absent exactly when the fallback answered; criterion 5 requires the summary line to render whenever
    a full-case run has completed, fallback or not.
- inferred: Rows are sorted by position ascending inside the component rather than trusting the caller's
    own array order.
  from: Criterion 1's own "in the manifest's own precedence order" wording, and domain/knowledge/manifest-entry's
    own position attribute as the fact that encodes precedence.
- inferred: hypothesisName is carried on every row and used to build the edit Link's route param and the
    simulate callback's own argument, for every row (including one with no evaluation) — but is never
    read as the row's own displayed Hypothesis-column text.
  from: This task's own Notes (the "name" attribute lives on domain/knowledge/hypothesis, outside this
    task's implements, so a row's visible label is sourced only from domain/investigation/evaluation's
    own hypothesis field when present) combined with criterion 4's own literal $hypothesisName route-param
    requirement against the already-delivered manifestHypothesisRoute (route-tree.tsx), which needs some
    identifier per row regardless of that row's evaluation state.
- inferred: Token cost renders as a plain integer sum (input_tokens + output_tokens), not a compacted/locale-formatted
    string.
  from: 'The objective''s own bare "token cost" wording states no format; the reference''s own "1.2k"
    compacting is form only (intake/layout/simulation-screen.md''s own stated scope: "decides form, never
    fact"), which this delivery does not need to reproduce to satisfy any stated criterion.'
- inferred: A last-run stage-durations line (DurationsLine) is built even though no numbered criterion
    tests it.
  from: This task's own Notes explicitly describe what such a display should show ("The bar shows the
    last run's measured durations without a budget comparison") and domain/investigation/durations is
    named in this task's own implements.
deferred:
- what: manifestHypothesisRoute (route-tree.tsx) declares no validateSearch for the back query key EDIT_LINK_SEARCH
    attaches, so nothing yet reads back back out on arrival at that route.
  why: Extending that route's own search schema is route-tree.tsx's own task's remit (the epic's own "route/entry"
    component), outside this task's file scope (the Hypotheses region only); the constant this delivery
    declares is structurally assignable to that route's own unvalidated search type today and does not
    need to change if a schema is added later.
- what: The Header, Detail and Case Result regions of the simulation cockpit (intake/layout/simulation-screen.md),
    the route/entry point, and the two mutation hooks (use-simulate-case/use-simulate-hypothesis) that
    would supply this component's own props in a running screen.
  why: Each is a separate, not-yet-delivered task of this same epic (simulation-cockpit); this task's
    own scope is the Hypotheses region component alone.
- what: domain/investigation/assessment's own text, register, usage, elapsed_ms and prompt attributes
    are not rendered anywhere in this delivery.
  why: They back the customer-facing text box and its own call metadata, which belong to the Case Result
    region, a separate task.
- what: domain/investigation/evaluation's own citations, elapsed_ms and prompt attributes are not carried
    by SimulationHypothesisEvaluation.
  why: They belong to the per-hypothesis Evidence/Prompt/JSON detail the Detail region renders, a separate
    task.
---

## What it is

The center-right "Hypotheses" region of the case-simulation cockpit's layout (`intake/layout/simulation-screen.md`, read only for form): a presentational component rendering the version's manifest as a precedence-ordered StatusTable — position, hypothesis, concepts collected, verdict, token cost, and Simulate/Edit actions — with a determining/outcome/referral summary line and a last-run durations line beneath it. It takes every fact as a prop and exposes the simulate action as a callback it never dispatches itself, so it composes with the not-yet-delivered mutation hooks (`use-simulate-case`, `use-simulate-hypothesis`) without depending on either.

## Notes

Two environment gaps in this worktree, unrelated to this task's own source, were fixed before the build could run at all: the `frontend/tui` git submodule was uninitialized (`git submodule update --init --recursive`, materializing the commit the parent repository already pins — no code change), and the submodule's own `frontend/tui/frontend` npm dependencies (declared in its own `package.json`/`package-lock.json`, authorized by nobody this delivery needed to ask since they are that project's own, already-committed lockfile) had never been installed in this worktree (`npm ci` run inside `frontend/tui/frontend`). The first build attempt (`run/simulation-cockpit-hypotheses-table-build`) failed on the submodule being empty; the second (`-build-2`) failed on the `@tui/ui/*` source files' own imports (`react`, `@radix-ui/*`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`) being unresolvable with no `node_modules` under the submodule; the third (`-build-3`) passed clean. No line of either fix touches this delivery's own two files, and the ten pre-existing `TS7006` implicit-any errors visible in the first two logs (in files this task never touched) were never reached again once the submodule import chain resolved — they were downstream noise from the same missing-`node_modules` failure, not separate defects.
