---
target: frontend
title: Isolate one case's invalid current version from the cases listing
summary: Proof that a listing carrying a case whose current version fails validation still renders every
  other case's own summary unaffected and a distinct not-valid entry for the failing case, at both the
  data layer (useCasesList) and the rendered screen, including where more than one case fails at the same
  reading.
implementation: sha256:d948e42ea620c49d8747d9ea9fe5bbdd84dcffb75d08611afa93474b312acbc7
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-not-valid-surface-presentation-isolate-invalid-case-from-listing-suite-2
tests:
- file: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
  name: resolves a case whose highest version is a draft to a summary carrying the current draft's own
    state alongside title, when_to_use and released_version read from the case's own highest released version
    below it
  proves: The review's first finding against domain/knowledge/case-summary -- CaseSummary never carried
    title, when_to_use or released_version -- and specifically the harder derivation case the certification
    pass's remainder named untested, where the case's current (highest-numbered) version is a draft and
    the highest released version sits below it.
  fails_when: the resolved summary's title, whenToUse or releasedVersion differ from the case's own highest
    released version (version 2 here) rather than from its current draft (version 3), or currentState/lastUpdated
    stop reflecting the current draft.
  demonstrates: domain/knowledge/case-summary
- file: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
  name: resolves every other case's own summary unaffected and the failing case's own entry to only its
    slug and the not-valid marker when one case's current version fails validation
  proves: 'Criterion 1 ("A listing of every case, read while one case''s current version fails a validator
    rule of validation-runs-at-every-read at that reading, still presents every other case''s own summary,
    exactly as it would be presented were every validator rule to hold for that one case''s current version.")
    and Criterion 2 ("That same listing still presents an entry for the case whose current version fails
    validation, carrying that case''s own slug and the explicit statement that its current version does
    not read back as a case, and none of that case''s summary..."), together with the task''s first UNDERDETERMINED
    note: this implementation withholds not only the six named summary fields but every other attribute
    of the failing version and every fact derived from one, so the example implementation the note flags
    (one that still shows the failing version''s own version number or subject beside the statement) does
    not hold here.'
  fails_when: 'case-alpha''s resolved entry differs at all from the summary it would resolve to were case-broken
    absent or valid, or case-broken''s resolved entry carries any property beyond { slug, notValid: true
    } -- a partial summary field, or another attribute of its own failing version such as its version
    number, surfacing beside the not-valid marker.'
  demonstrates: rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone
- file: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
  name: resolves the listing successfully with an isolated not-valid entry for each of two cases whose
    current versions fail validation at the same reading, rather than reverting to a whole-listing failure
  proves: The task's second UNDERDETERMINED note's implementation -- one that isolates exactly one failing
    case correctly but falls back to a whole-listing failure once two or more cases' current versions
    fail at the same reading -- does not hold here; the listing still answers an entry for cases c1..cn,
    per c_i, independent of how many other c_j also fail at that reading.
  fails_when: the query's isError becomes true, or fewer than three entries resolve, or either failing
    case's entry is dropped or altered, once two cases' current versions fail validation in the same reading.
- file: src/routes/cases-list-screen-invalid-case-isolation.spec.ts
  name: renders every other case's own row unaffected and a row carrying the failing case's slug and the
    not-valid statement with no summary values, when one case's current version fails validation
  proves: 'Criterion 1 and Criterion 2 as observed on the rendered screen: the passing case''s row still
    shows its own state, version count and last-updated exactly as it would alone, and the failing case''s
    row shows its slug and the explicit not-valid statement with its version-count and last-updated cells
    empty rather than any summary value.'
  fails_when: case-alpha's rendered row stops matching its own state, version-count or last-updated text
    once case-broken's version fails validation, or case-broken's row fails to show its slug and the exact
    not-valid statement text, or its version-count or last-updated cell renders anything other than empty.
- file: src/hooks/use-cases-list.spec.ts
  name: resolves to one entry per case, each carrying the highest-numbered version's own state and authored_at
  proves: The pre-existing valid-entry shape, widened by this revision to also assert title, whenToUse
    and releasedVersion for a released case -- kept in step with CaseSummary's now-wider shape rather
    than left asserting the narrower shape the fix no longer produces.
  fails_when: the resolved entry's summary omits, or misstates, versionCount, currentState, lastUpdated,
    title, whenToUse or releasedVersion for a released case holding a single version.
not_applicable:
- edge_case: A listing carrying zero cases
  why: Unaffected by this task's change (no case can fail validation in an empty listing) and already
    covered by cases-list-screen.spec.ts's own empty-state test; this task adds no new obligation over
    that case.
- edge_case: The top-level GET /v1/cases request itself failing (network error, non-2xx)
  why: Untouched by this task -- fetchCasesWithSummaries still lets that rejection propagate, and useCasesList's
    whole-query failure and the screen's "Cases could not be loaded." + Retry state are already covered
    by cases-list-screen-retry.spec.ts. No criterion or node this task implements changes that path.
- edge_case: Every case in the listing failing validation (none passing)
  why: No obligation reached by this task treats "how many pass" as a boundary -- toRow and fetchCaseListEntry
    compute each entry from that case's own outcome alone, with no branch conditioned on how many other
    entries are notValid or valid. The two-failing-of-three test above already establishes the isolation
    scales past one failing case without a code path that could regress specifically at "zero passing";
    a further all-failing case exercises no distinct branch and would be redundant.
- edge_case: Two concurrent reads of the listing, or a write against a case while the listing is being
    read
  why: The listing is read-only and this task adds no write operation; no criterion or node it implements
    states a concurrency rule for this reading.
- edge_case: A dependency (the version-detail read) answering slowly rather than failing
  why: Already governed by the pre-existing loading state (casesQuery.isPending), which this task's change
    does not alter; no criterion here states a distinct timing behavior for a slow per-case read.
untested:
- 'A case whose every version is a draft, never released: domain/knowledge/case-summary states title,
  when_to_use and released_version are absent rather than invented where no released version exists.
  releasedInfo()''s `released === undefined` branch (no released version found in the full version list)
  encodes this, but no test drives it -- every fixture above holds at least one released version. Passes:
  an implementation that, on finding no released version, invents a value from the current draft instead
  of returning {}.'
- domain/knowledge/case's fact includes next_version and the create-draft operation, neither of which
  use-cases-list.ts or cases-list-screen.tsx touches -- these files read and render only a case's slug.
  No test in this proof decides the node's fact whole; the tests above exercise only that slug identifies
  and addresses each entry, including the not-valid one, which is a fragment of the node's fact rather
  than the whole of it.
- A per-case fetch failing for a reason other than CaseVersionNotValidError (a network error, a 500, an
  unmapped error code) still rejects useCasesList's whole query, reverting to the existing whole-listing
  failure state. This is the implementation record's own recorded deferral, consistent with the node this
  task implements governing only a validator-rule failure at that reading; no criterion or node reached
  by this task states what a per-case read failure of another kind should do, so no test here decides
  it either way.
divergences:
- cites: TST-01
  file: src/hooks/use-cases-list.spec.ts
  departure: this proof edited a pre-existing test file (use-cases-list.spec.ts) that this task's own
    tests never listed before, widening its first test's expected summary to include title, whenToUse
    and releasedVersion.
  why: the first review of this task found CaseSummary missing title, when_to_use and released_version;
    the implementation's fix widens every valid entry's shape, and the pre-existing test's fixture (a
    released case) would otherwise assert the narrower shape the fix no longer produces -- leaving it
    unedited would have broken the suite, not preserved a prior guarantee.
---

## What it is
Proof that a listing carrying a case whose current version fails validation still renders every other case's own summary unaffected and a distinct not-valid entry for the failing case, at both the data layer (useCasesList) and the rendered screen, including where more than one case fails at the same reading.

## Notes
Re-delivered after the first review found three conformance findings against domain/knowledge/case-summary; the two hook-level tests' expected summaries now include title, whenToUse and releasedVersion for their released fixtures (case-alpha, case-good), a new test covers the harder derivation case (current version a draft, released version below it), and the run pin moved to run/case-not-valid-surface-presentation-isolate-invalid-case-from-listing-suite-2.
