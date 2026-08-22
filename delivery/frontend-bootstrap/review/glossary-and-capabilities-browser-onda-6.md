---
title: Review of glossary-and-capabilities-browser onda 6 (3 delivered tasks)
summary: 'Four-pass review of the 3 delivered tasks -- widen-glossary-vocabulary-union, capabilities-browser-screen
  and glossary-browser-screen: coverage over their 18 criteria, specification conformance, standard conformance,
  and the failures pass (which did not run -- the captured run passed cleanly).'
tasks:
- task/glossary-and-capabilities-browser/widen-glossary-vocabulary-union
- task/glossary-and-capabilities-browser/capabilities-browser-screen
- task/glossary-and-capabilities-browser/glossary-browser-screen
reviewed:
- src/hooks/use-glossary-vocabulary.ts
- src/hooks/use-glossary-vocabulary.spec.ts
- src/hooks/use-capabilities.ts
- src/hooks/use-glossary-concepts.ts
- src/hooks/use-glossary-concepts.spec.ts
- src/routes/capabilities-browser-screen.tsx
- src/routes/capabilities-browser-screen.spec.ts
- src/routes/capabilities-browser-screen-detail.spec.ts
- src/routes/capabilities-browser-screen.test-support.ts
- src/routes/glossary-browser-screen.tsx
- src/routes/glossary-browser-screen.spec.ts
- src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
- src/routes/glossary-browser-screen.test-support.ts
- src/routes/route-tree.tsx
- src/routes/route-tree.spec.ts
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/glossary-and-capabilities-browser-onda-6-full-suite) passed all 8 steps
    with 291/291 tests passing; there was no failure to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: GlossaryVocabulary's type declaration includes "subject-attribute" as a fifth member, alongside
    the existing "outcome", "action", "recipient" and "subject-type".
  state: uncovered
  why: this is a compile-time fact about a TypeScript union, and vitest strips types before running; nothing
    in the test set would fail if "subject-attribute" were removed from the union, since the runtime call
    would still succeed with the string passed positionally. The type-level guarantee is enforced only
    by the project's tsc --noEmit step, which is not part of this test file set.
- criterion: Calling useGlossaryVocabularyOptions("subject-attribute") issues a GET request to /v1/glossary/subject-attribute
    and returns that page's data as Select options, using the same {value, label} mapping the hook already
    applies to its other four vocabularies.
  state: covered
  tests:
  - file: src/hooks/use-glossary-vocabulary.spec.ts
    name: issues a GET to /v1/glossary/subject-attribute and maps the page's terms to {value, label} options,
      called with the literal typed with no cast
- criterion: Every existing call site of useGlossaryVocabularyOptions ("outcome", "action", "recipient",
    "subject-type") still compiles and behaves unchanged.
  state: partial
  tests:
  - file: src/hooks/use-glossary-vocabulary.spec.ts
    name: still issues a GET to /v1/glossary/$vocabulary and maps its own terms to {value, label} options,
      unaffected by the fifth vocabulary's addition
  why: the "behaves unchanged" half is exercised for the four existing vocabulary strings only by calling
    the hook directly with each literal inside this spec file -- none of the six real call sites this
    task's own rationale names is itself exercised. The "still compiles" half is a build-time fact no
    vitest test can exercise.
- criterion: Visiting /capabilities renders one row per capability GET /v1/capabilities returns, each
    row showing that capability's own name, nature, connector, concept and timeout.
  state: covered
  tests:
  - file: src/routes/capabilities-browser-screen.spec.ts
    name: renders one row per capability GET /v1/capabilities returns, each showing its own name, nature,
      connector, concept and timeout
  - file: src/routes/route-tree.spec.ts
    name: renders the /capabilities route through CapabilitiesBrowserScreen (task/glossary-and-capabilities-browser/capabilities-browser-screen)
- criterion: Before any row is selected, the screen renders no capability's detail panel.
  state: covered
  tests:
  - file: src/routes/capabilities-browser-screen-detail.spec.ts
    name: renders no capability's detail panel before any row is selected
- criterion: Clicking a capability's row renders a detail panel showing that same row's own version, input_schema
    and output_schema exactly as GET /v1/capabilities already returned them.
  state: covered
  tests:
  - file: src/routes/capabilities-browser-screen-detail.spec.ts
    name: renders a detail panel showing the clicked row's own version, input_schema and output_schema
      exactly as GET /v1/capabilities returned them
- criterion: Clicking a different row swaps the detail panel to that row's own version, input_schema and
    output_schema.
  state: covered
  tests:
  - file: src/routes/capabilities-browser-screen-detail.spec.ts
    name: swaps the detail panel to the newly clicked row's own version, input_schema and output_schema
  - file: src/routes/capabilities-browser-screen-detail.spec.ts
    name: disambiguates two capabilities sharing the same name by their own version, so selecting one
      never shows the other's own detail
- criterion: Selecting a row issues no network request beyond the one GET /v1/capabilities call the table's
    own listing already made.
  state: covered
  tests:
  - file: src/routes/capabilities-browser-screen-detail.spec.ts
    name: issues no network request beyond the one GET /v1/capabilities call the table's own listing already
      made
- criterion: No control on the screen creates, edits or deletes a capability, or changes a capability's
    nature.
  state: covered
  tests:
  - file: src/routes/capabilities-browser-screen.spec.ts
    name: renders no control that creates, edits or deletes a capability, or changes a capability's nature
  why: 'covered, with one excess worth routing: this test also asserts a total button count of exactly
    two, tighter than the criterion states -- it would also fail if a future, non-mutating button-based
    control were legitimately added beside the two row-selection buttons.'
- criterion: Visiting /glossary renders six tabs labeled Concepts, Subject types, Subject attributes,
    Outcomes, Actions and Recipients.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen.spec.ts
    name: renders six tabs labeled Concepts, Subject types, Subject attributes, Outcomes, Actions and
      Recipients, with Concepts selected by default
  - file: src/routes/route-tree.spec.ts
    name: renders the /glossary route through GlossaryBrowserScreen (task/glossary-and-capabilities-browser/glossary-browser-screen)
  why: 'covered, with one excess worth routing: the paired test also asserts each tab''s aria-selected
    state, a default-selection fact the criterion never states.'
- criterion: The Concepts tab renders one row per concept GET /v1/glossary/concepts returns, each showing
    that concept's own name, accepts and ttl.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen.spec.ts
    name: renders one row per concept GET /v1/glossary/concepts returns, each showing its own name, accepts
      and ttl
- criterion: The Subject types tab renders one row per term GET /v1/glossary/subject-type returns, by
    name.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
    name: renders one row per term GET /v1/glossary/subject-type returns, by name, in the Subject types
      tab
- criterion: The Subject attributes tab renders one row per term GET /v1/glossary/subject-attribute returns,
    by name.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
    name: renders one row per term GET /v1/glossary/subject-attribute returns, by name, in the Subject
      attributes tab
- criterion: The Outcomes tab renders one row per term GET /v1/glossary/outcome returns, by name.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
    name: renders one row per term GET /v1/glossary/outcome returns, by name, in the Outcomes tab
  - file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
    name: renders the newly active tab's own data in place of the previously active tab's, and issues
      no request for the other four vocabulary paths
- criterion: The Actions tab renders one row per term GET /v1/glossary/action returns, by name.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
    name: renders one row per term GET /v1/glossary/action returns, by name, in the Actions tab
- criterion: The Recipients tab renders one row per term GET /v1/glossary/recipient returns, by name.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-vocabulary-tabs.spec.ts
    name: renders one row per term GET /v1/glossary/recipient returns, by name, in the Recipients tab
- criterion: No tab renders a control that creates, edits or deletes a glossary term or concept.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen.spec.ts
    name: renders no control that creates, edits or deletes a term or concept, in the $tabLabel tab
- criterion: No tab renders a pagination control.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen.spec.ts
    name: renders no pagination control in the $tabLabel tab
findings:
- pass: standard
  file: src/routes/capabilities-browser-screen.tsx
  where: the isError branch of CapabilitiesBrowserScreen
  cites: EDG-02
  evidence: "if (isError) {\n  return <p>Capabilities could not be loaded.</p>;\n}"
  cost: the hook's own refetch is exposed by useCapabilities() but never called here, so a user who hits
    this screen's own failure state has no way to try again short of reloading the whole app -- the sibling
    glossary screen's own ConceptsPanel and VocabularyPanel both wire the same refetch into a Retry button,
    so this is the one load-failure state in the delivery that leaves the user stuck rather than offered
    a way out.
  correction: destructure refetch from useCapabilities() and render a Retry control in this branch, mirroring
    ConceptsPanel's own Button/onClick={refetch} pattern in glossary-browser-screen.tsx.
- pass: standard
  file: src/routes/capabilities-browser-screen.tsx
  where: the same isError branch
  cites: API-02
  evidence: return <p>Capabilities could not be loaded.</p>;
  cost: the failure message is a literal string chosen at this one call site rather than read from a shared,
    named mapping; the same screen family already needs six near-identical strings for the sibling glossary
    screen, so the next reader who needs the same generic-failure wording for a new screen has nowhere
    to find this one and re-types it, slightly differently, again.
  correction: route this and the other generic load-failure strings this delivery introduces through one
    named mapping (e.g. an error-ui-state style function), rather than writing the JSX string directly
    at each call site.
- pass: standard
  file: src/routes/capabilities-browser-screen.tsx
  where: the conditional render of CapabilityDetailPanel, and the CapabilityDetailPanel function itself
  cites: ACC-07
  evidence: "{selectedCapability !== undefined && (\n  <CapabilityDetailPanel capability={selectedCapability}\
    \ />\n)}"
  cost: clicking a row mounts a whole new panel of content below the table with no aria-live region and
    no call moving focus into it; what actually renders is an accessible landmark, not an announced live
    update, and this is disclosed as this codebase's first click-row/detail-panel-below composition, so
    no established, previously-reviewed convention covers it -- a screen-reader user who clicks a row
    gets no indication that anything appeared at all.
  correction: either wrap the detail panel's mount point in an aria-live region, or move focus to the
    panel (e.g. its heading) once it renders.
- pass: standard
  file: src/routes/glossary-browser-screen.tsx
  where: ConceptsPanel's isError branch
  cites: API-02
  evidence: <p>Unable to load the glossary&apos;s concepts.</p>
  cost: this literal is one of seven near-identical, independently hand-written failure strings this delivery
    introduces across the two new screens, none read from a shared, named mapping -- exactly the drift
    API-02 exists to prevent, since a wording fixed in one of the seven and forgotten in the others is
    the one a user actually reads next.
  correction: read this and the loadErrorMessage strings passed into each VocabularyPanel instantiation
    below from one named, shared mapping rather than writing each one inline where it is caught.
- pass: standard
  file: src/routes/glossary-browser-screen.tsx
  where: VocabularyPanel's own rows assembly
  cites: API-01
  evidence: "const rows: StatusTableRow[] = options.map((option) => ({\n  id: option.value,\n  name: option.label,\n\
    }));"
  cost: StatusTable's rows prop does not map directly from what useGlossaryVocabularyOptions returns,
    yet the transform is assembled with an anonymous inline arrow function rather than a named adapter
    -- unlike toRow (capabilities-browser-screen.tsx) and toConceptRow (this same file), which shape the
    same kind of StatusTable row through an exported, named function. The inconsistency inside one file
    is exactly what a second caller reinventing the same shape looks like.
  correction: extract this transform into a named function (e.g. toVocabularyRow), the same pattern toRow
    and toConceptRow already establish in this codebase.
---

## What it is
Reviews the 3 tasks Onda 6 delivered: widen-glossary-vocabulary-union (GlossaryVocabulary's fifth member), capabilities-browser-screen (table + client-side row-selection detail panel) and glossary-browser-screen (six read-only tabs).
Coverage: 16 of 18 criteria fully covered, 1 uncovered (a pure TypeScript-union-membership fact vitest's type-stripping can never verify -- tsc --noEmit is the actual enforcement, outside this test file set) and 1 partial (the four pre-existing vocabularies' "unchanged" behavior is exercised by calling the hook directly, never through any of the six real named call sites). Two covering tests assert something tighter than their own criterion (an exact button count; a default-tab aria-selected state) -- not wrong, but worth a reader's attention as excess.
Conformance: no findings -- the three specific risks checked directly (capability nature's copy, a concept's ttl unit, the capability name::version composite key) all stay within what their own nodes declare.
Standard: 5 findings -- capabilities-browser-screen.tsx's load-failure state has no Retry control (EDG-02), unlike its sibling glossary screen; two API-02 findings for hand-written, unshared failure-message strings (one in each new screen); one ACC-07 finding for the row-selection detail panel mounting with no live-region announcement or focus move (this codebase's first click-row/detail-panel composition, so no prior convention covers it); one API-01 finding for an inline anonymous row-transform in glossary-browser-screen.tsx where two sibling functions in the same file already establish a named-adapter convention.
Failures: did not run -- the captured run (run/glossary-and-capabilities-browser-onda-6-full-suite) passed all 8 steps, 291/291 tests.

## Notes
The trace (trace.py --check frontend/app) reports 7 code-drift findings over 121 bindings, 0 orphaned, 0 moved. None are caused by this delivery: /reconcile already ran (siegard-reconcile/glossary-and-capabilities-browser-onda-6-drift.md) over the one file this onda's own union-widening left stale relative to Onda 3's earlier bind (src/hooks/use-glossary-vocabulary.ts, 7 nodes, all conforming, all rebound). One finding (constraints/no-route-enforces-authentication on src/shared/components/app-shell.tsx) is the same pre-existing, already-disclosed drift from Ondas 3 and 4, untouched by any task this onda delivered. The remaining 6 findings (src/src/... paths no longer existing) predate this delivery and belong to the backend target's own history, outside this file set.
No suppression receipt: siegard.json declares no edits_freely targets, so every drift class is listed rather than counted.
The registry's own standard.json pass-name split (rules a reading decides vs. rules a tool decides) held all 33 tool-decided rules to the captured run's own 5 tool steps (typecheck, lint, style, a11y, secret-scan); all 5 passed.
All four passes ran as subagents in clean contexts, per the skill's own delegation discipline; none ran inline.
This closes the plan's own six-onda scope stated in .claude/plans/precious-skipping-summit.md: all six ondas (0 build-substrate through 6 glossary-and-capabilities-browser) are now delivered and reviewed.
