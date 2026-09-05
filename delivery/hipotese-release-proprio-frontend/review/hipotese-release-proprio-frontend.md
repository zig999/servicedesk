---
title: hipotese-release-proprio-frontend, whole-change review
summary: What four passes found over the 18 files the initiative's 6 tasks wrote or modified, exposing the hypothesis-revision's own release lifecycle in the frontend.
reviewed:
- src/hooks/use-hypothesis-revision-release.ts
- src/hooks/use-hypothesis-revisions.spec.ts
- src/hooks/use-hypothesis-revisions.ts
- src/hooks/use-manifest-pinned-revision-states.ts
- src/hooks/use-manifest-row-revisions.spec.ts
- src/routes/case-version-editor-ready-view.tsx
- src/routes/case-version-editor-screen-release-checklist.spec.ts
- src/routes/case-version-editor-screen-release-draft-hypothesis-violations.spec.ts
- src/routes/case-version-editor-screen-view-released-manifest-state.spec.ts
- src/routes/hypothesis-revision-history-own-state.spec.ts
- src/routes/hypothesis-revision-history-release-action.spec.ts
- src/routes/hypothesis-revision-history.tsx
- src/routes/version-manifest-screen-draft-revision-placement.spec.ts
- src/routes/version-manifest-screen-pinned-revision-state.spec.ts
- src/routes/version-manifest-screen.tsx
- src/services/error-ui-state.spec.ts
- src/services/error-ui-state.ts
- src/services/release-checklist.ts
tasks:
- task/hypothesis-revision-own-state-ui/show-each-revisions-own-state
- task/hypothesis-revision-own-state-ui/name-the-not-draft-release-refusal
- task/hypothesis-revision-own-state-ui/release-a-revision-from-the-listing
- task/case-version-release-gate-ui/show-each-manifest-entrys-pinned-revision-state
- task/case-version-release-gate-ui/name-the-draft-hypotheses-in-the-release-refusal
- task/case-version-release-gate-ui/keep-placement-free-of-a-revisions-own-state
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed cleanly, so there was no failure to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
reconciliation: siegard-reconcile/hipotese-release-proprio-frontend.md
coverage:
- criterion: The typed page shape the revisions listing hook answers carries a per-revision own-state field whose value is draft or released and nothing else.
  state: covered
  tests:
  - file: src/hooks/use-hypothesis-revisions.spec.ts
    name: reads a draft revision's own state through unchanged
  - file: src/hooks/use-hypothesis-revisions.spec.ts
    name: reads a released revision's own state through unchanged
  - file: src/hooks/use-hypothesis-revisions.spec.ts
    name: carries each revision's own state independently of its position in the answered page
  - file: src/hooks/use-hypothesis-revisions.spec.ts
    name: refuses a third value as a revision's own state, at compile time
- criterion: Every row the revision-history screen renders states the own state of the revision on that row.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-history-own-state.spec.ts
    name: renders Draft on a row whose revision answered draft and Released on a row whose revision answered released, in the same listing
  - file: src/routes/hypothesis-revision-history-own-state.spec.ts
    name: paints a draft revision's own-state indicator bg-warning and a released revision's bg-success
- criterion: A revision the listing answers as draft renders as draft and a revision it answers as released renders as released.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-history-own-state.spec.ts
    name: renders Draft on a row whose revision answered draft and Released on a row whose revision answered released, in the same listing
- criterion: A row states its revision's own state and the case's current-pin indication as two separate facts, so a row can read released and not-current at the same time.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-history-own-state.spec.ts
    name: shows a not-current revision as released, so a row reads released and frozen at the same time
  - file: src/routes/hypothesis-revision-history-own-state.spec.ts
    name: shows the current revision as draft, so a row reads draft and current at the same time
- criterion: The revision numbers, criteria and collects each row already showed are unchanged, and the rows stay ordered highest revision first.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-history.spec.ts
    name: lists every revision the endpoint returns, each showing its own revision number, criterion and collects, as a closed, non-editable block
  - file: src/routes/hypothesis-revision-history-own-state.spec.ts
    name: keeps the rows ordered by revision number highest-first, regardless of the state column added
  - file: src/routes/hypothesis-revision-history-release-action.spec.ts
    name: composes the release control beside the existing Revise link in the same actions cell, adding no new column
- criterion: The hypotheses tab's per-hypothesis revision count still reads the listing's own total after the shape widens.
  state: covered
  tests:
  - file: src/routes/case-hypotheses-tab.spec.ts
    name: shows each hypothesis's Revisions count as the endpoint's own total, never the length of the page it returned
  - file: src/routes/case-hypotheses-tab.spec.ts
    name: shows an em dash for a hypothesis's own Revisions count when that hypothesis's own revisions fail to load, without blocking the rest of the row
- criterion: Given an API error whose code is HypothesisRevisionNotDraftAtReleaseError, the error-to-UI-state resolution answers a kind exclusive to this error code — resolved by no other code the table lists — and distinguishable from the kind any unrecognized code falls back to.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves HypothesisRevisionNotDraftAtReleaseError to the hypothesis-revision-not-draft-at-release state
  - file: src/services/error-ui-state.spec.ts
    name: resolves HypothesisRevisionNotDraftAtReleaseError to a kind no other listed code resolves to, distinct from the generic fallback
- criterion: That kind is declared as a member of the module's UI error-state kind union.
  state: partial
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves HypothesisRevisionNotDraftAtReleaseError to the hypothesis-revision-not-draft-at-release state
  why: Nothing in the set asserts membership in the declared kind union at the type level. The only assertion is on the runtime string the resolution answers, which would still hold if the union were widened to string or the kind cast at the return; no @ts-expect-error-style type assertion covers this criterion, unlike the closed-union check for the revision-state union.
- criterion: Every other error code the table already lists resolves to the same kind it resolved to before.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseNotFoundError to the case-not-found state
  - file: src/services/error-ui-state.spec.ts
    name: gives each of the ten mapped classes a kind distinct from every other one
- criterion: An error code the table does not list still resolves to the generic kind.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves a code the table does not name to the generic-error state rather than throwing
- criterion: A row whose revision's own state is draft offers a release control.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-history-release-action.spec.ts
    name: offers a release control on the row of a revision whose own state is draft
- criterion: A row whose revision's own state is released offers no release control.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-history-release-action.spec.ts
    name: offers no release control on the row of a revision whose own state is released
- criterion: Confirming the control issues one POST to /v1/cases/:slug/hypotheses/:name/revisions/:revision/release for the row's own revision number.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-history-release-action.spec.ts
    name: issues exactly one POST to the release endpoint for the row's own revision number when the control is confirmed
- criterion: That request names no case version, carries no manifest entry and sends no credential.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-history-release-action.spec.ts
    name: sends the release request with no body, no headers and no other case version or manifest data
- criterion: After the request succeeds, the released revision's row states released without the screen being reloaded.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-history-release-action.spec.ts
    name: shows the released revision's row as released, without re-reading the listing, after the release succeeds
- criterion: A revision no case version's manifest holds an entry for is offered the release control on the same terms as a manifested one.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-history-release-action.spec.ts
    name: offers the release control to an unmanifested draft revision on the same terms as one the manifest pins
- criterion: After a release succeeds, every case version's own state reads exactly what it read before the release.
  state: partial
  tests:
  - file: src/routes/hypothesis-revision-history-release-action.spec.ts
    name: leaves every case version's own state unread and unrefetched after a release succeeds
  why: What the test asserts is that the versions listing and the manifest endpoint are each requested once and not again — a claim about traffic, not about a state value read before and compared after. The one fixture in the set holds a single, already-released version, so a draft version's own state reading unchanged after a revision release is unexercised.
- criterion: A release refused with HypothesisRevisionNotDraftAtReleaseError leaves the listing re-read from the server rather than showing the row as it stood before the attempt.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-history-release-action.spec.ts
    name: re-reads the listing from the server, rather than leaving the pre-attempt row, when the release is refused because the revision is no longer draft
- criterion: What the curator is told after that refusal reports the refusal's own condition and message and no further value about the revision.
  state: covered
  tests:
  - file: src/routes/hypothesis-revision-history-release-action.spec.ts
    name: tells the curator exactly the refusal's own condition and message, and nothing else, after that refusal
- criterion: Every manifest entry any screen presenting a case version's manifest renders — the version-manifest screen and the case version editor's ready-view manifest table alike — states its pinned hypothesis-revision's own state, draft or released.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
    name: states released for a row whose pinned revision is released in its hypothesis's revisions listing
  - file: src/routes/case-version-editor-screen-view-released-manifest-state.spec.ts
    name: states each entry's own pinned-revision state, released or draft, read from that hypothesis's own revisions listing
- criterion: That statement is shown whatever the case version's own state is, draft or released.
  state: partial
  tests:
  - file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
    name: still states the pinned revision's own state when the case version itself is released
  why: 'The released half is exercised on both screens. The draft half is not exercised on the case version editor''s ready-view: that table is only ever mounted for a released version in this suite, so the manifest table''s statement over a draft version is unproven there.'
- criterion: That statement is shown without the curator having to open the entry's revision selector.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
    name: keeps the state statement visible while the row's Select stands closed, without needing it opened
- criterion: An entry pinning a revision in released state states released and an entry pinning one in draft state states draft.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
    name: states released for a row whose pinned revision is released in its hypothesis's revisions listing
  - file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
    name: states draft for a row whose pinned revision is draft in its hypothesis's revisions listing
- criterion: The pinned revision number, and every other field the entry already showed, are unchanged.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
    name: keeps the Select's own value as the bare pinned revision number, unaffected by the state statement beside it
  - file: src/routes/case-version-editor-screen-view-released-manifest-state.spec.ts
    name: leaves the position, hypothesis, revision and criterion cells exactly as before, alongside the new state cell
- criterion: A release refused with CaseVersionNotReleasableError renders one entry per violation the refusal reported.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-draft-hypothesis-violations.spec.ts
    name: renders one entry per still-draft hypothesis the refusal named, none dropped or collapsed, in place of the checklist
- criterion: No entry is rendered that the refusal did not report.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-draft-hypothesis-violations.spec.ts
    name: renders one entry per still-draft hypothesis the refusal named, none dropped or collapsed, in place of the checklist
- criterion: Where the refusal names several hypotheses, every named hypothesis is rendered; none is dropped or collapsed into another.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-draft-hypothesis-violations.spec.ts
    name: renders two list entries, not one, when the same still-draft hypothesis reaches the refusal twice with an identical violation string
- criterion: Where the same refusal reports a violation of another release rule alongside the hypothesis ones, every violation of that one refusal is rendered in the same list.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-draft-hypothesis-violations.spec.ts
    name: renders a manifested-hypothesis violation together with a violation of another release rule in the same list
- criterion: After the refusal, the case version still reads as a draft and its release control is still offered, so a second attempt needs no reload.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-draft-hypothesis-violations.spec.ts
    name: leaves the case version reading as a draft with Release still offered after the refusal, so a second attempt succeeds with no reload in between
- criterion: The refusal's violations are shown in place of the pre-attempt checklist, not merged into it.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-draft-hypothesis-violations.spec.ts
    name: renders one entry per still-draft hypothesis the refusal named, none dropped or collapsed, in place of the checklist
- criterion: No pre-attempt checklist item states anything about a manifested revision's own state.
  state: partial
  tests:
  - file: src/routes/case-version-editor-screen-release-control.spec.ts
    name: opens an in-place Dialog (no navigation) listing exactly the three checklist items, every one satisfied by already-loaded data
  why: A checklist item extended to mention a manifested revision's own state (e.g. appended to an existing item's text) would still satisfy every assertion in the set, since the item texts are matched by unanchored regexes and only the item count (three) is pinned. Nothing asserts the absence of revision-state wording from the checklist text itself.
- criterion: A release refused with CaseVersionNotReleasableError reporting no violation at all shows the curator an explicit statement that no specific rule was found violated, never an unexplained, empty refusal.
  state: covered
  tests:
  - file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
    name: renders an empty violations view rather than the checklist when the response's own violations array is empty
- criterion: A manifest row's revision selector offers every revision the listing answers, including those whose own state is draft.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-draft-revision-placement.spec.ts
    name: offers a revision whose own state is draft as a selectable option, exactly like a released one
- criterion: Choosing a revision whose own state is draft issues the place request rather than being stopped before it.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-draft-revision-placement.spec.ts
    name: issues the place request for the chosen draft revision, with no client-side refusal shown before the server answers
- criterion: A manifest entry pinning a revision in draft state offers the same removal and repin controls as one pinning a revision in released state — a difference in the entry's own disclosed state is never read as a difference in what the curator may do with the entry.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-draft-revision-placement.spec.ts
    name: leaves the Select and Remove controls enabled on a row pinning a draft revision, exactly as on a row pinning a released one
- criterion: Removing a manifest entry is offered on the same terms whatever the referenced revision's own state is.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-draft-revision-placement.spec.ts
    name: issues the DELETE and removes the entry on the same terms as any other entry, once confirmed
- criterion: The passing case here is only that this frontend does not itself refuse the placement; whether the request is accepted is the server's answer and is not asserted by this task.
  state: covered
  tests:
  - file: src/routes/version-manifest-screen-draft-revision-placement.spec.ts
    name: issues the place request for the chosen draft revision, with no client-side refusal shown before the server answers
findings:
- pass: conformance
  file: src/services/release-checklist.ts
  where: buildReleaseChecklist, the returned checklist item 'Manifest holds at least one hypothesis'
  evidence: "label: `Manifest holds at least one hypothesis (${manifestEntries.length})`,\n satisfied: manifestEntries.length > 0,"
  cost: The invariant that a case version's manifest must hold at least one entry is expressed a second time here, independently of the node that states it (rules/knowledge/a-case-has-at-least-one-hypothesis). If the invariant is ever restated differently at that node, nothing ties this literal re-derivation back to it for either side to notice the drift.
- pass: conformance
  file: src/routes/hypothesis-revision-history.tsx
  where: the rows construction, lines 124-126
  evidence: ".slice()\n  .sort((a, b) => b.revision - a.revision)"
  cost: The descending-by-revision-number order that rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first assigns to the listing itself is re-derived here as a second, independent sort over whatever page the hook returns; a change to (or a bug in) the listing's own ordering would be masked here rather than surfaced.
- pass: conformance
  file: src/hooks/use-manifest-pinned-revision-states.ts
  where: the manifest.forEach block that computes each entry's state, lines 21-29
  evidence: "const pinned = result.data?.data.find(\n  (item) => item.revision === entry.hypothesis_revision.revision,\n);\nif (pinned !== undefined) {\n  states.set(entry.position, pinned.state);\n}"
  cost: hypothesisRevisionsQueryOptions is called with no offset or limit, so the search only reaches the default first page of that hypothesis's revisions. When the pinned revision is an older one off that page, the map carries no state for that entry at all — a silent, page-dependent gap in what rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state requires unconditionally.
- pass: conformance
  file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
  where: lines 117-136, describe/it block "the state statement when the pin is absent from the answered page (this task's own inference)"
  evidence: 'expect(within(findRow("H1")).queryByText("Draft")).toBeNull();

    expect(within(findRow("H1")).queryByText("Released")).toBeNull();'
  cost: The test fixes, as the behavior the suite keeps green, that a manifest entry shows no state statement at all whenever the pinned revision is off the fetched page — the test's own title admits this is "this task's own inference" rather than a specification fact, and the specification is silent on what an entry states in this case.
- pass: standard
  file: src/routes/hypothesis-revision-history.tsx
  where: lines 109-120, the branch guarding the revision list render
  cites: API-04
  evidence: "const revisions = revisionsQuery.data?.data ?? [];\n\nif (revisionsQuery.isError || revisions.length === 0 || currentPin.phase === \"load-error\") {\n  return (\n    <section>\n      <p>Unable to load this hypothesis's revision history.</p>\n      <Button type=\"button\" onClick={retryLoad}>\n        Retry\n      </Button>\n    </section>\n  );\n}"
  cost: A hypothesis whose revisions listing answers successfully but with zero items renders the identical failure banner and Retry button as a genuinely failed request; a curator looking at a hypothesis with no revisions yet is told the load failed.
  correction: Split revisions.length === 0 into its own explicit empty-state branch, separate from the isError/load-error failure branch.
- pass: standard
  file: src/routes/hypothesis-revision-history.tsx
  where: lines 124-158, the rows construction inside HypothesisRevisionHistory
  cites: API-01
  evidence: "status: isCurrent\n  ? { color: \"bg-success\", label: \"current\" }\n  : { color: \"bg-muted-foreground\", label: \"frozen\" },"
  cost: The sibling screens feeding the same shared StatusTable factor this same kind of transform into a standalone named function before render (toManifestRow, toStatusRow); here the equivalent transform is assembled ad hoc inside the .map() callback, so a later change has to be hunted down in this one inline spot instead of a shared adapter.
  correction: Extract the row-building callback into a named function (e.g. toHistoryRow(revision, currentPin)), mirroring toManifestRow/toStatusRow in the sibling screens.
---
## What it is

Four passes over the 18 files this initiative's 6 tasks wrote or modified: coverage (37 criteria, 33 covered, 4 partial, 0 uncovered), conformance (18 delegations, 4 findings, 1 unstated fact left open for a later /analyse), standard (25 reading-decided rules in scope, 2 findings), and failures (did not run — the captured whole-change suite passed clean).
The unstated fact — what a presented manifest entry states about its pinned revision's state when that revision falls off the default page a hypothesis's revisions listing answers — recurs across three of the four conformance findings and is the deepest issue this review surfaced: the current implementation silently drops the state disclosure in that case, contradicting the node's own unconditional wording, while a fourth file's test fixes that same silent drop as "this task's own inference" rather than a decided fact.

## Notes

Two files (version-manifest-screen.tsx, error-ui-state.ts) and one file with empty-evidence entries (case-version-editor-screen-view-released-manifest-state.spec.ts) needed a fresh conformance delegation after their first attempt returned an unusable answer (an incomplete `read` list, or blank evidence strings); per the framework's own discipline, those first returns were discarded whole rather than patched, and the corrected delegations' answers are what this record and its reconciliation reflect.
One task's proof (hypothesis-revision-own-state-ui/show-each-revisions-own-state) needed a corrective re-delivery before this review began: its originally-committed proof record claimed two test files that were never actually written to disk; this was caught by independent verification (diffing the delivery commit and grepping the captured suite log), not trusted on the delegation's word, and was fixed in a prior commit before this review's own capture run.
