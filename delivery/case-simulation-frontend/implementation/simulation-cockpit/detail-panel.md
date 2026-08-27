---
title: Case-simulation Detail panel
summary: A fixture/props-driven Detail region (verdict, citations, criterion, Evidence/Prompt/JSON tabs,
  judgment metadata) for the simulation cockpit's selected hypothesis, built as five new files under frontend/app/src/routes,
  wired to nothing yet.
task: sha256:53c7bafca1aa7707a6a0a72ece36e8398efeeb8872cfdb4d50144210688e3297
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-detail-panel-build-3
files:
- path: src/routes/case-simulation-detail-types.ts
  effect: Declares every type this region reads — SimulationVerdict, SimulationEvidenceResult, SimulationCitation,
    SimulationUsage, SimulationCapabilityReference, SimulationEvidenceItem, SimulationJudgmentCall (a
    discriminated union folding usage/elapsedMs/prompt/model/promptVersion together, present exactly when
    a judgment call happened), SimulationEvaluation, SimulationHypothesisRevisionSummary, and the exported
    CaseSimulationDetailPanelProps — narrowed to exactly what this region's criteria read, nothing wired
    to a hook or a query.
- path: src/routes/case-simulation-status-dot.tsx
  effect: A small exported component, CaseSimulationStatusDot, rendering the app's established dot-plus-label
    status idiom (a color class on a dot, always shown with its word) for a caller outside any StatusTable
    row.
- path: src/routes/case-simulation-detail-evidence-tab.tsx
  effect: Renders the Evidence tab's body — one entry per concept the selected hypothesis revision collects,
    each showing its result (as a colored dot+label), its capability name/version/connector, its elapsed_ms,
    its result_detail when present, and its observation pretty-printed inside a native <details>/<summary>
    collapsible block — followed by the Judgment summary line (model, prompt version, token usage, elapsed
    time) when a call happened.
- path: src/routes/case-simulation-detail-prompt-tab.tsx
  effect: Renders the Prompt tab's body — the evaluation's own prompt in a monospace <pre> when a judgment
    call happened, or the sentence "Judgment was never called for this hypothesis." when it did not.
- path: src/routes/case-simulation-detail-panel.tsx
  effect: The exported CaseSimulationDetailPanel component — the hypothesis name, its verdict as a status
    dot, its citations, the hypothesis revision's criterion text, and a @tui/ui/tabs Tabs block (Evidence
    default, Prompt, JSON) composing the two tab components above plus an inline raw-response <pre> for
    the JSON tab.
criteria:
- criterion: The panel shows the selected hypothesis's verdict and every citation (concept and field)
    it carries.
  met: true
  how: CaseSimulationDetailPanel renders evaluation.verdict through CaseSimulationStatusDot (VERDICT_CELL
    mapping) and maps evaluation.citations to a `${citation.concept}.${citation.field}` list item per
    citation, or an explicit "No citations." when the array is empty.
- criterion: The panel shows the hypothesis revision's own criterion text, per domain/knowledge/hypothesis-revision.
  met: true
  how: CaseSimulationDetailPanel renders hypothesisRevision.criterion (SimulationHypothesisRevisionSummary.criterion)
    directly, unconditionally, beneath the citations block.
- criterion: The Evidence tab shows, per collected concept, its result, the capability reference that
    produced it, its elapsed_ms, its observation in a collapsible JSON block, and its result_detail when
    present.
  met: true
  how: CaseSimulationDetailEvidenceTab selects, for each concept in hypothesisRevision.collects, the matching
    evidence item, and renders its result (dot+label via EVIDENCE_RESULT_CELL), `${capability.name} ${capability.version}
    → ${capability.connector}`, `${elapsedMs} ms`, resultDetail when defined, and observation inside a
    native <details>/<summary> block whose <pre> holds prettyPrintObservation(observation) — JSON.parse/JSON.stringify(...,null,2),
    falling back to the raw string where it does not parse.
- criterion: The Prompt tab shows the evaluation's own prompt exactly as materialized, in a monospace
    <pre>, for an evaluation a judgment call happened for; for an evaluation with reason no-data, the
    tab shows no prompt and states instead that judgment was never called.
  met: true
  how: 'CaseSimulationDetailPromptTab branches on judgmentCall.called: false renders the "Judgment was
    never called for this hypothesis." sentence; true renders judgmentCall.prompt verbatim in a font-mono
    <pre>. judgmentCall.called is exactly the negation of reason===''no-data'', per domain/investigation/evaluation''s
    own stated equivalence.'
- criterion: The JSON tab shows the raw response for that hypothesis, verbatim and unsummarized.
  met: true
  how: CaseSimulationDetailPanel's own JSON TabsContent renders JSON.stringify(rawResponse, null, 2) inside
    a font-mono <pre> — rawResponse is a plain `unknown` prop, never parsed, reshaped or narrowed before
    display, the same raw-<pre> convention connector-test-panel-result.tsx already uses for transport
    data.
- criterion: The panel shows the judgment's model, prompt version, token usage and elapsed time when a
    judgment call happened.
  met: true
  how: CaseSimulationDetailEvidenceTab renders, only when judgmentCall.called is true, "Judgment {model}
    · prompt {promptVersion} · {usage.inputTokens} in / {usage.outputTokens} out · {elapsedMs} ms" beneath
    the evidence list.
- criterion: The panel is composed only into this operator-facing cockpit route, never into any customer-facing
    surface, consistent with rules/investigation/the-customer-sees-only-the-text reserving this operational
    detail to the operation.
  met: true
  how: 'Satisfied by construction and by scope: this delivery adds no import of CaseSimulationDetailPanel
    anywhere (per this task''s own instruction, wiring is task/simulation-cockpit/screen-assembly''s job),
    and frontend/app (case-authoring-console) is this project''s operator/curator console in its entirety
    — no customer-facing surface exists in this tree for the component to reach.'
nodes:
- node: domain/investigation/investigation
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: 'This task builds no Investigation entity (rules/investigation/a-simulation-writes-no-investigation,
    outside this task''s own implements, holds that a simulation never writes one). What is encoded is
    the shape: Investigation''s own `model` and `prompt_version` attributes are carried once per simulation
    run rather than per evaluation, so SimulationJudgmentCall''s `called: true` branch folds them alongside
    usage/elapsedMs/prompt, and CaseSimulationDetailEvidenceTab renders both in its Judgment summary line.'
- node: domain/investigation/evidence
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: SimulationEvidenceItem carries concept, result, resultDetail, elapsedMs, observation and its capability
    reference; CaseSimulationDetailEvidenceTab renders every one of them per collected concept, per criterion
    3.
- node: domain/investigation/evaluation
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-detail-panel.tsx
  - src/routes/case-simulation-detail-evidence-tab.tsx
  - src/routes/case-simulation-detail-prompt-tab.tsx
  how: SimulationEvaluation carries hypothesis, verdict, citations and judgmentCall (the node's own usage/elapsed_ms/prompt,
    modeled as a discriminated union per the node's own 'present exactly when a call happened' description).
    `reason` is deliberately left off — no criterion of this task shows it; see the deferred entry below.
- node: domain/investigation/citation
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-detail-panel.tsx
  how: SimulationCitation carries concept and field exactly; CaseSimulationDetailPanel renders one list
    item per citation as `concept.field`.
- node: domain/investigation/verdict
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-detail-panel.tsx
  how: SimulationVerdict is the node's own three-value union; VERDICT_CELL maps each to a color+label
    rendered through CaseSimulationStatusDot.
- node: domain/investigation/evidence-result
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: SimulationEvidenceResult is the node's own four-value union; EVIDENCE_RESULT_CELL maps each to
    a color+label rendered per evidence item.
- node: domain/investigation/evaluation-reason
  how: Not carried as its own field. This task's only criterion touching it (criterion 4) needs solely
    the no-data/otherwise distinction, which domain/investigation/evaluation's own text states is exactly
    what SimulationJudgmentCall.called already tracks (usage/elapsed_ms/prompt 'present exactly when a
    call happened, absent when reason no-data'). The other two values (judgment-failure, deadline-exceeded)
    are not shown by any criterion of this task — deferred below, to task/simulation-cockpit/hypotheses-table's
    own row.
- node: domain/investigation/usage
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: SimulationUsage carries inputTokens/outputTokens exactly, folded into SimulationJudgmentCall's
    called branch and rendered in the Judgment summary line.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-detail-panel.tsx
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: 'SimulationHypothesisRevisionSummary narrows the node to criterion and collects — the two fields
    this region''s own criteria 2 and 3 read. `revision` and `resolution` are left off: no criterion of
    this task shows either.'
- node: rules/investigation/the-customer-sees-only-the-text
  how: This task's own Notes scope it to the rule's second clause (operator-only visibility of verdicts
    and evidence), which criterion 7 answers structurally — see that criterion's own 'how'. The rule's
    first clause (customer-facing text exposure) is out of scope for this task per its own Notes and is
    listed under deferred below, unchanged from that disclosure.
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-detail-panel.tsx
  how: This region is the UI for exactly the operator-facing detail this contract's own description calls
    out — evidence per concept, evaluation per hypothesis with its citations, the detail rules/investigation/the-customer-sees-only-the-text
    keeps from the customer, faced to the curator instead. It reads that shape through props rather than
    through simulate-case/simulate-hypothesis directly, since this task builds no dispatch of either operation
    (that is task/simulation-cockpit/use-simulate-case and use-simulate-hypothesis's own job).
inferences:
- inferred: 'Evidence-result colors: ok -> bg-success, timeout -> bg-warning, denied -> bg-destructive,
    unavailable -> bg-muted-foreground.'
  from: No specification node names a color for any evidence-result value. Follows this app's own established
    status-cell color convention (case-detail-screen.tsx's and hypothesis-revision-history.tsx's own draft/released
    and current/frozen mappings), extending it to `denied` -> bg-destructive by the same semantic token
    this app's Button variant="destructive" and text-destructive error text already key off.
- inferred: 'Verdict colors: confirmed -> bg-success, refuted -> bg-destructive, inconclusive -> bg-warning.'
  from: Same convention as the evidence-result color mapping above; no specification node names a color
    for verdict either.
- inferred: The 'collapsible JSON block' criterion 3 asks for is rendered with a native <details>/<summary>
    element rather than a TUI catalog primitive.
  from: frontend/tui is a git submodule (.gitmodules) that was not checked out at the time this source
    was written — its own directory was empty, so its catalog could not be read to confirm whether it
    offers a disclosure/accordion/collapsible primitive. The inventory names only eight confirmed-unused
    catalog components (stat-panel, progress, card, panel, sheet, skeleton, empty, alert), none a collapsible.
    Rather than guess at an unverified import (@tui/ui/collapsible or similar) that could fail the build,
    this task uses the browser-native, accessible <details>/<summary> pair, which needs no import. (The
    submodule was subsequently checked out and its own dependency tree installed as this delivery's own
    environment setup — see this record's own Notes — confirming no collapsible/disclosure primitive exists
    under frontend/tui/frontend/src/shared/components/ui/, so this choice stands.)
- inferred: domain/investigation/evidence's `observation` string is parsed as JSON and re-serialized indented
    for display, falling back to the raw string where it does not parse.
  from: connector-test-panel-result.tsx's own established convention of formatting raw transport data
    as JSON.stringify(value, null, 2) inside a font-mono <pre>, extended with a parse step because evidence.observation's
    own domain type is a plain string rather than an already-structured value.
- inferred: A concept in hypothesisRevision.collects with no matching entry in the evidence array is silently
    omitted from the Evidence tab rather than rendered as an error or placeholder row.
  from: No criterion of this task states what to show for that case, and the domain's own guarantee (rules/investigation/one-evidence-per-collected-concept,
    outside this task's implements) is that every collected concept has exactly one evidence entry — this
    is a defensive branch for malformed input, not a modeled state.
- inferred: The Judgment summary line (criterion 6) renders inside the Evidence tab, beneath the evidence
    list, rather than in the always-visible header alongside verdict/citations/criterion.
  from: layout/simulation-screen.md's own 'Detail' region places the 'Judgment ...' line there, within
    the Evidence tab's own drawn content. No criterion of this task ties it to a specific tab (a reference
    decides form, never fact), so this placement is drawn from the reference rather than stated by any
    criterion.
- inferred: The Detail region's own layout containers are plain <section>/<div> elements with Tailwind
    utility classes, not TUI's Card/Panel/Sheet catalog components.
  from: Every existing detail/tab sub-view in this app (case-detail-screen.tsx's own VersionsPanel, hypothesis-revision-history.tsx)
    follows this same bare-semantic-HTML convention for layout chrome, reserving TUI primitives for interactive
    or data controls (Tabs, Table) this app already composes and has verified.
divergences:
- cites: ARC-01
  file: src/routes/case-simulation-detail-evidence-tab.tsx
  departure: The collapsible observation block is a native <details>/<summary> element rather than a composed
    TUI catalog primitive.
  why: 'At the time this source was written, frontend/tui was a git submodule not yet checked out in this
    worktree (confirmed via .gitmodules and an empty frontend/tui directory), so its catalog could not
    be read to confirm whether an equivalent (a disclosure, accordion or collapsible component) exists
    — ARC-01 permits a bespoke element only where the catalog holds no equivalent, and that absence could
    not be verified at the time rather than being confirmed. A native, importless, accessible element
    was used instead of risking an unverified @tui/ui/* import that could fail the build. This delivery
    subsequently checked out the submodule (a worktree environment gap, disclosed in this record''s own
    Notes) and confirmed directly: no disclosure/accordion/collapsible primitive exists under frontend/tui/frontend/src/shared/components/ui/,
    so the departure stands on its merits as well as on the original uncertainty.'
deferred:
- what: Composing CaseSimulationDetailPanel into the simulate route, and populating its props from a selected
    hypothesis row.
  why: task/simulation-cockpit/screen-assembly owns cross-region wiring, gating and the whole cockpit's
    composition; task/simulation-cockpit/hypotheses-table owns row selection. This task's own instructions
    ask for a fixture/props-driven component, independent of the not-yet-delivered use-simulate-case/use-simulate-hypothesis
    hooks and the route.
- what: rules/investigation/the-customer-sees-only-the-text's first clause (what an assessment exposes
    to the end customer is its text alone).
  why: 'Already disclosed in this task''s own Notes as out of scope: it belongs to whichever customer-facing
    surface renders assessment.text, and no task in either case-simulation plan builds one, since neither
    operation is customer-facing.'
- what: domain/investigation/evaluation-reason's judgment-failure and deadline-exceeded values, and domain/investigation/evaluation's
    own `reason` field generally.
  why: No criterion of this task shows an evaluation's reason; task/simulation-cockpit/hypotheses-table's
    own row is where a verdict's reason is shown, per that task's own criterion 3.
---

## What it is

The Detail region of the simulation cockpit's layout (`intake/layout/simulation-screen.md`), built as five new files under `frontend/app/src/routes/`: a types module, a small status-dot component, an Evidence tab, a Prompt tab, and the panel itself composing them into a three-tab (Evidence/Prompt/JSON) view over a selected hypothesis's verdict, citations, criterion, evidence and judgment metadata.
It is fixture/props-driven per this task's own instruction — no import of it exists anywhere yet, and it depends on nothing from the not-yet-delivered mutation hooks or route; task/simulation-cockpit/screen-assembly composes it in.

## Notes

This worktree's environment held two gaps unrelated to this task's own source, both fixed before the build could run at all: the `frontend/tui` git submodule was not checked out (`git submodule update --init --recursive`), and its own nested npm package at `frontend/tui/frontend` (a separate `package.json`/`package-lock.json`, distinct from this target's own `frontend/app`) had never been installed (`npm ci` run there). Confirmed before fixing either: removing this task's five new files entirely left the identical typecheck failure set against the unmodified rest of the tree, so both gaps predate and are independent of this delivery's own files — environment setup, not source this or any task owns. `vite.config.ts`'s own comments document this dependency shape (TUI resolves its third-party imports through its own separately-installed `node_modules`) explicitly.
The divergence disclosed above (native `<details>`/`<summary>` instead of a TUI catalog primitive) was decided while the submodule was still uninitialized and could not be read; after checking it out for this delivery's own build to run, its catalog was confirmed to hold no disclosure/accordion/collapsible component, so the departure's reasoning stands on the now-confirmed absence as well as on the original uncertainty.
