---
target: frontend
title: Review of the shared ButtonFooter delivery
summary: What four passes found over the two files task/shared-action-footer/button-footer-component wrote, with the standard's one departure, the coverage the tests do not reach, and two failures the captured run reported from files outside this change.
reviewed:
- src/shared/components/button-footer.tsx
- src/shared/components/button-footer.spec.ts
tasks:
- task/shared-action-footer/button-footer-component
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/button-footer-standardization
failures_counted: 2
reconciliation: siegard-reconcile/button-footer-standardization.md
coverage:
- criterion: ButtonFooter renders every button passed to it as children, in the order it received them, in a row aligned to the end.
  state: partial
  tests:
  - file: src/shared/components/button-footer.spec.ts
    name: renders each given child in the order it received them
  - file: src/shared/components/button-footer.spec.ts
    name: renders without throwing and produces no buttons when given no children
  why: 'The rendering and the order are exercised: the first test passes three buttons and asserts their text in sequence, so it fails if a child is dropped or reordered. The row aligned to the end goes unexercised. No test reads the footer element at all, so a footer that stacked its buttons vertically or aligned them to the start would pass every test in this file.'
- criterion: The footer stays visible at the bottom of the AppShell's scrollable region while its screen's content is scrolled.
  state: uncovered
  why: Nothing renders content that overflows, scrolls anything, or observes where the footer is after a scroll. The suite runs under jsdom, which lays nothing out and reports no scroll position, so a footer that scrolled away with the content would pass. Both halves go unexercised, the staying visible and the during a scroll.
- criterion: Content scrolled to its end stays fully readable above the footer rather than covered by it.
  state: uncovered
  why: No test renders content long enough to scroll, scrolls it to its end, or compares the last content with the footer's occupied area. Under jsdom no element has a box, so covered by it cannot be distinguished from above it by anything in this suite. A footer overlapping the final line of content would pass every test in the file.
- criterion: The footer sits inside the AppShell's existing `<main>` scroll region and frontend/app/src/shared/components/app-shell.tsx is left unmodified by this task.
  state: partial
  tests:
  - file: src/shared/components/button-footer.spec.ts
    name: stays inside the region it is given while the shell's disclosure stays outside it and present
  why: 'What is exercised is that ButtonFooter does not escape the element enclosing it, since the button is found through a query scoped to that element, and that would fail if the footer relocated itself to the document body. The criterion''s own terms go unexercised: the scroll region the test queries is one the test builds itself, not AppShell''s, and nothing in the set imports or renders app-shell.tsx, so a footer placed outside the shell''s real main would still pass. That app-shell.tsx is left unmodified is a fact about the change set rather than runtime behaviour, and no test observes it.'
- criterion: A screen rendering the footer still shows the shell's own statement that this build enforces no authentication, visibly and not merely rendered.
  state: uncovered
  why: 'One test appears to address this and cannot fail for it. The disclosure text is a literal the test declares and renders itself into a div it constructed, so the query asserts the test''s own fixture rather than anything ButtonFooter or AppShell does: remove the shell''s real statement from app-shell.tsx and that test still passes. It is also presence in the DOM rather than visibility, so a statement hidden behind a footer, clipped by an overflow, or styled away would pass. Named here so a reader who finds that test in the file does not read it as coverage.'
findings:
- pass: standard
  file: src/shared/components/button-footer.tsx
  cites: ARC-01
  where: the single div ButtonFooter returns, its root element
  evidence: 'button-footer.tsx: `<div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-4 border-t border-border bg-surface py-4">`. frontend/tui/frontend/src/shared/components/ui/status-bar/status-bar.tsx: `<div ... className={cn("flex w-full items-center justify-between gap-4 border-t border-border bg-surface px-4 py-1 text-xs text-muted-foreground", className)}>` with `<div className="flex flex-1 items-center justify-end gap-2">{right}</div>`, and status-bar.types.ts declaring `role?: "status" | "contentinfo" | "none"`, where contentinfo is documented as labelling the bar a page-level footer landmark.'
  cost: Two bars with the same border and surface silhouette now exist in the tree, one owned by the TUI catalogue and one hand-rolled here, and a reader has no way to tell which is the canonical footer bar; a later fix to the catalogue's footer styling, its spacing, its token or its border, applies to StatusBar and silently misses this one.
  correction: Compose StatusBar with its right slot holding children and its role set to contentinfo, overriding only the sticky positioning through the className prop StatusBar already merges, instead of a bespoke div.
- pass: failures
  cause: test
  file: src/hooks/use-capability-detail.spec.ts
  where: the test that resolves the ready phase from its own direct GET rather than from a capabilities list query the caller's cache already held, at line 36
  evidence: 'test.log: `AssertionError: expected '''' to be ''{"type":"object"}'' // Object.is equality` at src/hooks/use-capability-detail.spec.ts:36:58. The run''s own summary reads `Test Files 2 failed | 167 passed (169)` and `Tests 2 failed | 1179 passed (1181)`.'
  cost: The one behaviour that test exists to prove, that the hook's own GET is isolated from a stale capabilities-list cache entry, is unverified this run. The file is outside this change entirely, so nothing about this delivery is proven or disproven by it, and a reader who meets a red suite here learns nothing about ButtonFooter.
  correction: Rerun that spec in isolation and, if it fails there too, trace why the ready state's input schema resolves to an empty string after the wait reports the ready phase. The identical tree recorded at run/shared-action-footer-button-footer-component-suite-3 passed this same step, which points at the test's own determinism rather than at this task's changed files.
- pass: failures
  cause: test
  file: src/routes/case-version-editor-screen-save.spec.ts
  where: the test that sends the entire form content as one PATCH when Save is clicked, at the PATCH call count assertion inside its wait block
  evidence: 'test.log lines 6686-6687: `AssertionError: expected +0 to be 1 // Object.is equality`, at the assertion holding the recorded PATCH count to one.'
  cost: The claim that clicking Save changes issues exactly one PATCH carrying the full form body is unverified this run, since the recorded call count never reached one within the wait window. The file is outside this change entirely, so nothing about this delivery is proven or disproven by it.
  correction: Rerun that spec in isolation and, if it fails there too, trace why the click does not produce a recorded PATCH before the wait times out. The identical tree recorded at run/shared-action-footer-button-footer-component-suite-3 passed this same step, which points at the test's own timing rather than at this task's changed files.
---

## What it is
Four passes over the two files the ButtonFooter delivery wrote, and what each of them can and cannot say.
The conformance pass read both files against the one node the task implements and found neither holding nor contradicting it, which is what a layout component and its test should look like.
The standard pass found one departure, that the component rebuilds a bar the design catalogue already ships.
The coverage pass found three of the five criteria with no test that could fail for them, and a fourth whose test asserts its own fixture rather than anything the code does.
The failures pass counted two, both in files this delivery never touched.

## Notes
This review's own suite run failed where the delivery's own run over the identical tree passed, and that comparison is what the diagnosis rests on rather than a specification node: the node this task implements speaks to neither failing behaviour and could settle code against test for neither.
The coverage pass and the conformance pass reached the same fact about the disclosure test from different mandates, one asking whether the tests prove the criteria and the other whether the source states only what the specification holds, and neither was shown what the proof record claimed.
The coverage entries for the two scroll criteria were returned by the auditing pass under a state name this contract does not hold, because the slice it was handed was typed from prose rather than printed; the substance it returned, that nothing exercises either criterion, is recorded here as uncovered, and the correction is the caller's form error rather than the pass's judgment.
The trace over this target reports 127 drift findings over 212 bindings, 0 orphaned, 4 moved and 123 code over 30 files, almost all under the backend target rather than this change, and a further 239 code findings over 43 files under frontend/app suppressed because the project declares that target freely edited.
That suppression means the rules a reading decides went unread over those 43 files, since nothing scheduled that reading and the project's own suite answered only the rules a tool decides.
None of the drift is a finding of this review and none of it settles anything about this change.
