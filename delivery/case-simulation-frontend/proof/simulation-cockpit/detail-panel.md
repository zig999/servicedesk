---
implementation: sha256:63e2c08e80d37fba00fb2ebded5ca38c4fcb2e465be98f85625342dcffe5dd1e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-detail-panel-suite-6
title: Proof for the case-simulation Detail panel
summary: Tests proving all seven criteria, every disclosed inference, and the edge cases the Detail region's
  fixture/props-driven behavior raises, across the panel, its two tabs, and the shared status-dot idiom.
tests:
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: CaseSimulationDetailPanel -- the selected hypothesis's own verdict and citations (criterion 1)
    > shows the hypothesis's own verdict word
  proves: The panel shows the selected hypothesis's verdict and every citation (concept and field) it
    carries.
  fails_when: evaluation.verdict stops rendering as visible text through CaseSimulationStatusDot
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: CaseSimulationDetailPanel -- the selected hypothesis's own verdict and citations (criterion 1)
    > shows every citation the evaluation carries, each as its own concept.field entry
  proves: The panel shows the selected hypothesis's verdict and every citation (concept and field) it
    carries.
  fails_when: the citations list stops rendering one concept.field item per citation, or renders fewer
    than every citation
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: CaseSimulationDetailPanel -- the selected hypothesis's own verdict and citations (criterion 1)
    > shows "No citations." when the evaluation carries none
  proves: the empty-citations case of criterion 1 is shown explicitly rather than left blank
  fails_when: an empty citations array renders nothing, or a different message
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: CaseSimulationDetailPanel -- the verdict's own color (inference) > colors a confirmed verdict
    bg-success
  proves: 'the implementation''s inference ''Verdict colors: confirmed -> bg-success, refuted -> bg-destructive,
    inconclusive -> bg-warning'''
  fails_when: a confirmed verdict's dot no longer carries the bg-success class
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: CaseSimulationDetailPanel -- the verdict's own color (inference) > colors a refuted verdict bg-destructive
  proves: 'the implementation''s inference ''Verdict colors: confirmed -> bg-success, refuted -> bg-destructive,
    inconclusive -> bg-warning'''
  fails_when: a refuted verdict's dot no longer carries the bg-destructive class
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: CaseSimulationDetailPanel -- the verdict's own color (inference) > colors an inconclusive verdict
    bg-warning
  proves: 'the implementation''s inference ''Verdict colors: confirmed -> bg-success, refuted -> bg-destructive,
    inconclusive -> bg-warning'''
  fails_when: an inconclusive verdict's dot no longer carries the bg-warning class
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: CaseSimulationDetailPanel -- the hypothesis revision's own criterion text (criterion 2) > shows
    the hypothesis revision's own criterion text
  proves: The panel shows the hypothesis revision's own criterion text, per domain/knowledge/hypothesis-revision.
  fails_when: hypothesisRevision.criterion stops rendering, or renders a different value
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: CaseSimulationDetailPanel -- default tab and composition > shows the Evidence tab's own content
    by default, with no click
  proves: the Evidence tab is the default-shown tab (this task's own objective and criterion 3's framing)
  fails_when: Evidence tab content is not visible on initial render without a click
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: CaseSimulationDetailPanel -- the judgment summary line sits in the Evidence tab (inference) >
    shows the judgment summary line on the default (Evidence) tab, but not once the Prompt tab is selected
  proves: the implementation's inference that the Judgment summary line (criterion 6) renders inside the
    Evidence tab rather than the always-visible header
  fails_when: the summary line is absent from the Evidence tab, or still shows once the Prompt tab is
    selected
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: CaseSimulationDetailPanel -- composes the Prompt tab with this hypothesis's own judgment call
    (criterion 4) > shows this evaluation's own prompt once the Prompt tab is selected
  proves: The Prompt tab shows the evaluation's own prompt exactly as materialized ... for an evaluation
    a judgment call happened for, proven at the panel's own composition (not just the standalone tab component)
  fails_when: the panel stops passing evaluation.judgmentCall through to CaseSimulationDetailPromptTab,
    so the Prompt tab shows nothing or the wrong prompt once selected
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: CaseSimulationDetailPanel -- the raw response, verbatim (criterion 5) > shows the raw response
    for this hypothesis, exactly and unsummarized, on the JSON tab
  proves: The JSON tab shows the raw response for that hypothesis, verbatim and unsummarized.
  fails_when: the JSON tab reshapes, summarizes, or fails to render rawResponse exactly as JSON.stringify(rawResponse,
    null, 2)
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: CaseSimulationDetailPanel -- the Detail region's own layout (inference) > renders the Detail region
    as a plain, semantic section labeled by the hypothesis's own name, not a TUI Card/Panel/Sheet wrapper
  proves: the implementation's inference that the Detail region's own layout containers are plain <section>/<div>
    elements ... not TUI's Card/Panel/Sheet catalog components
  fails_when: the labeled region role/name ("Detail — {hypothesis}") stops being reachable, e.g. the wrapper
    element or its aria-label is changed
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- per collected concept (criterion 3) > shows the result, the
    capability reference and the elapsed time for a collected concept with matching evidence
  proves: The Evidence tab shows, per collected concept, its result, the capability reference that produced
    it, its elapsed_ms ...
  fails_when: the result label, the "${name} ${version} → ${connector}" capability text, or the "${elapsedMs}
    ms" text stops rendering for a matched concept
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- per collected concept (criterion 3) > shows result_detail when
    the evidence item carries one
  proves: '... and its result_detail when present.'
  fails_when: result_detail text stops rendering for an item that carries it
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- per collected concept (criterion 3) > shows no result_detail
    text when the evidence item carries none
  proves: the "when present" qualifier of criterion 3's result_detail clause
  fails_when: result_detail text renders despite the field being undefined on the item
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- per collected concept (criterion 3) > shows the observation
    pretty-printed inside a collapsible 'Observation' block
  proves: '... its observation in a collapsible JSON block ...'
  fails_when: the observation stops being pretty-printed/indented, or the "Observation" disclosure disappears
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- per collected concept (criterion 3) > falls back to the raw
    observation string, verbatim, when it does not parse as JSON
  proves: the implementation's inference that observation is parsed and re-serialized indented, falling
    back to the raw string where it does not parse
  fails_when: a non-JSON observation string is dropped, altered, or throws instead of rendering verbatim
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- per collected concept (criterion 3) > shows every collected
    concept with matching evidence, one entry each
  proves: criterion 3's "per collected concept" plurality — every matched concept gets its own entry
  fails_when: fewer entries than matched concepts render, or two concepts collapse into one
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- per collected concept (criterion 3) > omits a collected concept
    with no matching evidence entry, rather than rendering an error or placeholder row (inference)
  proves: the implementation's inference that a concept in hypothesisRevision.collects with no matching
    evidence entry is silently omitted rather than rendered as an error or placeholder row
  fails_when: a placeholder or error row renders for an unmatched concept, or the component throws
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- per collected concept (criterion 3) > shows an explicit empty
    message when no collected concept has matching evidence
  proves: the empty-evidence edge case of criterion 3 is stated explicitly rather than left blank
  fails_when: no message renders (a blank tab body) when nothing matches
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- per collected concept (criterion 3) > shows only the evidence
    for concepts this hypothesis collects, never an evidence item for a concept it does not
  proves: the selection this task's own types module documents — the Evidence tab reads only what hypothesisRevision.collects
    names, even when the evidence array carries more
  fails_when: an evidence item for a concept outside collects leaks into the rendered list
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- the collapsible observation block is a native disclosure (inference)
    > renders the observation inside a native <details>/<summary> element, not a bespoke wrapper
  proves: the implementation's inference that the collapsible JSON block is a native <details>/<summary>
    element rather than a TUI catalog primitive
  fails_when: the collapsible block stops being a native <details>/<summary> pair (e.g. replaced by a
    div-based accordion)
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- the result's own color (inference) > colors an ok result bg-success
  proves: the implementation's evidence-result color inference (ok -> bg-success ...)
  fails_when: an ok result's dot no longer carries bg-success
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- the result's own color (inference) > colors a timeout result
    bg-warning
  proves: the implementation's evidence-result color inference (timeout -> bg-warning)
  fails_when: a timeout result's dot no longer carries bg-warning
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- the result's own color (inference) > colors a denied result
    bg-destructive
  proves: the implementation's evidence-result color inference (denied -> bg-destructive)
  fails_when: a denied result's dot no longer carries bg-destructive
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- the result's own color (inference) > colors an unavailable
    result bg-muted-foreground
  proves: the implementation's evidence-result color inference (unavailable -> bg-muted-foreground)
  fails_when: an unavailable result's dot no longer carries bg-muted-foreground
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- the judgment summary line (criterion 6) > shows the judgment's
    model, prompt version, token usage and elapsed time when a call happened
  proves: The panel shows the judgment's model, prompt version, token usage and elapsed time when a judgment
    call happened.
  fails_when: any of model, promptVersion, inputTokens/outputTokens, or elapsedMs stops rendering, or
    the whole line disappears when a call happened
- file: src/routes/case-simulation-detail-evidence-tab.spec.ts
  name: CaseSimulationDetailEvidenceTab -- the judgment summary line (criterion 6) > shows no judgment
    summary line when no call happened
  proves: criterion 6's converse — no summary line when judgmentCall.called is false
  fails_when: a "Judgment ..." line renders despite no call having happened
- file: src/routes/case-simulation-detail-prompt-tab.spec.ts
  name: CaseSimulationDetailPromptTab -- the evaluation's own prompt (criterion 4) > renders the evaluation's
    own prompt exactly as materialized, inside a monospace <pre>, when a judgment call happened
  proves: The Prompt tab shows the evaluation's own prompt exactly as materialized, in a monospace <pre>,
    for an evaluation a judgment call happened for
  fails_when: the prompt is altered, not shown verbatim, or not rendered as a <pre> carrying a font-mono
    class
- file: src/routes/case-simulation-detail-prompt-tab.spec.ts
  name: CaseSimulationDetailPromptTab -- the evaluation's own prompt (criterion 4) > states "Judgment
    was never called for this hypothesis." and shows no prompt, for reason no-data
  proves: for an evaluation with reason no-data, the tab shows no prompt and states instead that judgment
    was never called
  fails_when: the stated sentence stops appearing when judgmentCall.called is false, or a prompt renders
    despite no call having happened
- file: src/routes/case-simulation-status-dot.spec.ts
  name: CaseSimulationStatusDot -- the dot-plus-label idiom > renders the given label as visible text
  proves: the shared status-dot component always renders its label — the foundation every verdict/result
    color test in the other two files composes
  fails_when: the label prop stops being rendered as visible text
- file: src/routes/case-simulation-status-dot.spec.ts
  name: CaseSimulationStatusDot -- the dot-plus-label idiom > renders the given color as a class on a
    decorative, aria-hidden dot alongside the label
  proves: the color-plus-label pairing (never color alone) and the dot's decorative, aria-hidden marking,
    in isolation from either caller
  fails_when: the color class stops applying to the dot, or the dot loses its aria-hidden="true" marking
- file: src/routes/case-simulation-status-dot.spec.ts
  name: CaseSimulationStatusDot -- the dot-plus-label idiom > swaps the rendered color class when a different
    color prop is given, rather than accumulating both
  proves: the component is a pure function of its color/label props, with no stale color surviving a re-render
    — the assumption every verdict/result color test in the other two files depends on
  fails_when: a previous render's color class persists in the DOM after a new color prop is supplied
not_applicable:
- edge_case: two operations against one subject at once (concurrency)
  why: this task's own scope (per its Notes and the implementation record's own deferred entry) is a pure,
    synchronous, props-driven rendering region with no fetch, mutation, or shared mutable state — there
    is no concurrent operation for a test to raise
- edge_case: a dependency that fails or answers slowly
  why: this delivery is explicitly fixture/props-driven and wires no hook, query or mutation (deferred
    to task/simulation-cockpit/use-simulate-case and use-simulate-hypothesis); a dependency failure or
    slow answer belongs to those tasks, not to this component's own render logic
- edge_case: a duplicate concept within hypothesisRevision.collects
  why: rules/investigation/one-evidence-per-collected-concept (outside this task's own implements) is
    what rules this shape out at the domain level; asserting behavior over a state the domain guarantees
    cannot occur would test a state this task is not responsible for handling
- edge_case: a boundary at each end of a stated numeric range (elapsed_ms, token counts)
  why: no criterion or bound node states a minimum or maximum for either value — both are shown exactly
    as given, so there is no boundary for a test to exercise
- edge_case: an absent/missing required prop
  why: every prop this region's three components read (per case-simulation-detail-types.ts) is required
    except resultDetail, whose absent case is already covered by "shows no result_detail text when the
    evidence item carries none"; no other prop is optional
untested:
- Criterion 7 ("The panel is composed only into this operator-facing cockpit route, never into any customer-facing
  surface") has no test in this proof. It is a structural fact about which files import CaseSimulationDetailPanel
  — this delivery adds no such import anywhere, and frontend/app is this project's entire operator-facing
  tree, per the implementation record's own how for this criterion — not a fact this component's own render
  output can express or a render-level test can observe. Whether that absence continues to hold once task/simulation-cockpit/screen-assembly
  wires this component in is a fact about that future task's own wiring, unprovable here.
---

## What it is

Thirty-two tests across four spec files, proving the Detail region's seven criteria and every disclosed inference: the selected hypothesis's verdict and citations, the hypothesis revision's criterion text, the Evidence tab as the default tab, the Prompt tab's verbatim prompt, the JSON tab's verbatim raw response, per-concept evidence rendering (result, capability reference, elapsed time, optional result_detail, collapsible observation), the judgment summary line's presence exactly when a call happened, and the shared status-dot idiom's color/label pairing.

## Notes

The suite's first three attempts (run/simulation-cockpit-detail-panel-suite-2 through -4) failed: two rounds of eslint-plugin-testing-library violations in case-simulation-status-dot.spec.ts (no-container, then prefer-presence-queries), each fixed by a fresh test-author correcting only the offending query without changing any assertion; then the whole suite's own test step failed on 92 pre-existing, unrelated tests across 18 files, all crashing identically with "Cannot read properties of null (reading 'useRef')" inside Radix-based Dialog components. A failure-diagnostician subagent traced this to a duplicate React installation between frontend/app and the vendored frontend/tui submodule — a pre-existing environment defect (cause: setup), confirmed to involve none of this task's own files. Per the human's decision, this was fixed at the project level (frontend/app's own new postinstall script, dedupe-tui-react.mjs, symlinking the submodule's react/react-dom to this app's own copies) rather than worked around here. run/simulation-cockpit-detail-panel-suite-6 is the resulting clean run, on the tree with that fix merged in.