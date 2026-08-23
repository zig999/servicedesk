---
title: Retry control on every remaining load-error state (EDG-02)
summary: Adds a Retry Button, wired to that screen's own already-exposed refetch, to Cases List's load-error
  state, Case Detail's VersionsPanel load-error state, and the Capabilities Browser's load-error state
  -- closing three standing EDG-02 findings.
task: sha256:43f0292be41496d100a333399033eb42ac2db836cf161e621e59570a45652f84
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/ux-consistency-sweep-full-suite
files:
- path: src/routes/cases-list-screen.tsx
  effect: CasesListScreen's own isError branch now renders its existing message inside a <section>, alongside
    a Button whose onClick calls casesQuery.refetch() (void-wrapped) -- re-issuing the same GET /v1/cases
    request the screen's initial load already issued.
- path: src/routes/case-detail-screen.tsx
  effect: 'VersionsPanel now destructures refetch alongside data/isLoading/isError from useCaseVersions(slug),
    and its own isError-or-no-data branch renders its existing message alongside a Button whose onClick
    calls refetch() (void-wrapped, matching this file''s own CaseHypothesesTab convention) -- re-issuing
    the same GET /v1/cases/{slug}/versions request. CaseHypothesesTab itself is untouched: it already
    implemented this pattern correctly.'
- path: src/routes/capabilities-browser-screen.tsx
  effect: CapabilitiesBrowserScreen now destructures refetch alongside capabilities/isLoading/isError
    from useCapabilities() (already exported, pre-wrapped). Its own isError branch renders its existing
    message alongside a Button whose onClick is refetch passed directly -- the same convention glossary-browser-screen.tsx's
    own panels already use -- re-issuing the same GET /v1/capabilities request.
criteria:
- criterion: Cases List's own load-error state renders a control that, when activated, re-issues the same
    GET /v1/cases request the screen's own initial load issued.
  met: true
  how: The isError branch's Button calls casesQuery.refetch(), which re-runs the same fetchCasesWithSummaries
    queryFn the ["cases-list"] query was created with.
- criterion: Case Detail's Versions tab load-error state renders a control that, when activated, re-issues
    the same GET /v1/cases/{slug}/versions request that tab's own initial load issued.
  met: true
  how: VersionsPanel's isError-or-no-data branch's Button calls refetch(), the same refetch useCaseVersions(slug)
    exposes off its own useQuery, whose queryFn is exactly apiFetch(`/v1/cases/${slug}/versions`).
- criterion: The Capabilities Browser's load-error state renders a control that, when activated, re-issues
    the same GET /v1/capabilities request the screen's own initial load issued.
  met: true
  how: CapabilitiesBrowserScreen's isError branch's Button calls the refetch useCapabilities() exposes,
    which wraps the same useQuery's own refetch over the ["capabilities"] query whose queryFn is apiFetch("/v1/capabilities").
- criterion: None of the three retry controls issues any request other than re-running that same screen's
    own already-established read.
  met: true
  how: Each Button's onClick calls only that screen's own pre-existing refetch (or the hook's own pre-existing
    refetch wrapper) -- no new queryFn, no new endpoint, and no other side effect was added at any of
    the three sites.
inferences:
- inferred: Each retry Button sits inside a <section> wrapping the existing failure message, rather than
    being appended as a sibling of a bare <p>.
  from: The established pattern this task's own Notes name as its reference (CaseHypothesesTab's own isError
    branch, case-version-editor-screen.tsx's and version-manifest-screen.tsx's own load-error branches,
    and glossary-browser-screen.tsx's ConceptsPanel/VocabularyPanel) -- every existing correct example
    in this codebase wraps the message and the Retry Button in one <section>.
- inferred: Cases List's and Case Detail's VersionsPanel's Button onClick handlers wrap their screen-level
    refetch call as () => void refetch(), while the Capabilities Browser's passes refetch directly with
    no wrapper.
  from: The exact wiring convention already split in this codebase by whether the refetch a call site
    holds is a raw useQuery result's own refetch (returns a Promise, wrapped) or a hook's own refetch
    that already wraps its internal query.refetch() in a void-returning function (passed unwrapped) --
    each site matches its own kind's existing precedent.
preserved:
- Cases List's own loading state, empty-cases state, search box and StatusTable rendering for a successful
  load are unchanged.
- Case Detail's VersionsPanel own loading state, "New draft" link, and StatusTable rendering for a successful
  load are unchanged; CaseHypothesesTab's own already-correct retry handling in the same file is untouched.
- The Capabilities Browser's own loading state, empty-capabilities state, StatusTable rendering and row-selection
  detail panel are unchanged.
- All three screens' own existing failure-message wording is unchanged -- this task adds a control beside
  each message, it does not reword any of them.
- The QueryCache-level onError toast (services/query-client.ts) that already fires on each of these three
  reads is untouched and continues to fire independently of the new Retry controls.
---

## What it is
The correction named by three standing, never-fixed EDG-02 findings: cases-list-and-detail-onda-2.md, manifest-hypothesis-authoring-onda-4.md, glossary-and-capabilities-browser-onda-6.md.
Each of the three screens already exposes a refetch from its own read hook; this task wires each one to a visible control rather than inventing a new data-fetching mechanism.

## Notes
Case Detail's own Hypotheses tab (CaseHypothesesTab, same file) already implements this exact pattern correctly and is this task's own reference for the Versions tab's fix.
