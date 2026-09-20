---
target: frontend
title: Isolate one case's invalid current version from the cases listing
summary: The cases-list query now answers a distinct not-valid entry for a case whose current version
  fails validation instead of rejecting the whole listing, and the screen renders that entry with the
  case's slug and the specification's own explicit statement, leaving every other case's row unaffected.
task: sha256:1ff9e379c0e2453da4825bc4129bbbb4c5a09a107dd82dbd4ec790a38fc8b859
files:
- path: src/hooks/use-cases-list.ts
  effect: 'CaseListEntry is now a two-member union -- { slug, summary } for a case whose current version
    reads back, and { slug, notValid: true } for one whose highest-numbered version does not. fetchCaseListEntry
    (renamed from fetchCaseSummary) wraps only the read of the case''s highest-numbered version in a try/catch
    that reuses errorStateKind(error) to recognize a CaseVersionNotValidError and return the not-valid
    entry instead of the summary; any other error still propagates. fetchCasesWithSummaries runs fetchCaseListEntry
    per case inside Promise.all, so one case''s rejection no longer aborts the others. Exports isCaseListEntryNotValid,
    a type guard narrowing to the not-valid member. CaseSummary now also carries title, whenToUse and releasedVersion:
    releasedInfo() derives them from the case''s own highest-numbered *released* version -- reusing the
    already-fetched detail when the current highest version is itself released, otherwise fetching the
    full version list once (now known-sized from versionCount) to find the highest released version below
    the current draft and fetching that version''s own detail -- present only where such a released version
    exists, per domain/knowledge/case-summary.'
- path: src/routes/cases-list-screen.tsx
  effect: toRow checks isCaseListEntryNotValid first and, for that entry, returns a row carrying only
    id and slug plus a state cell holding the explicit statement "This case's current version does not
    read back as a case." -- the same wording case-detail-screen.tsx already carries for its own not-valid
    phase. versionCount and lastUpdated are left unset on that row so they render empty rather than a
    summary value or the zero-version placeholder. Every other row's construction is unchanged.
criteria:
- criterion: A listing of every case, read while one case's current version fails a validator rule of
    validation-runs-at-every-read at that reading, still presents every other case's own summary, exactly
    as it would be presented were every validator rule to hold for that one case's current version.
  met: true
  how: fetchCasesWithSummaries runs one fetchCaseListEntry promise per case; only the failing case's own
    promise resolves to the not-valid entry, and every other promise still resolves to { slug, summary
    } exactly as it would have had the failing case's version read back cleanly.
- criterion: That same listing still presents an entry for the case whose current version fails validation,
    carrying that case's own slug and the explicit statement that its current version does not read back
    as a case, and none of that case's summary (no current_state, version_count, last_updated, title,
    when_to_use, or released_version).
  met: true
  how: 'The not-valid branch of fetchCaseListEntry returns only { slug, notValid: true } -- no summary
    field at all. toRow''s not-valid branch renders that entry''s row with the slug and the explicit statement
    in the state cell, and no versionCount or lastUpdated key at all.'
nodes:
- node: rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone
  encoded_at:
  - src/hooks/use-cases-list.ts
  - src/routes/cases-list-screen.tsx
  how: use-cases-list.ts answers an entry per case unconditionally, isolating each case's own fetch failure,
    and states the not-valid statement in place of the summary for exactly the case whose highest-numbered
    version fails validation, leaving every other case's summary untouched; cases-list-screen.tsx renders
    that entry with the case's own slug and the statement, showing none of the withheld summary fields.
- node: domain/knowledge/case-summary
  encoded_at:
  - src/hooks/use-cases-list.ts
  how: CaseSummary now carries versionCount, optional currentState and lastUpdated (derived from the
    case's own highest-numbered version) alongside optional title, whenToUse and releasedVersion (derived
    from the case's own highest-numbered *released* version, absent where none exists), per the node's
    own Responsibility; the not-valid entry carries no CaseSummary at all rather than a partially-filled
    one.
- node: domain/knowledge/case
  encoded_at:
  - src/hooks/use-cases-list.ts
  - src/routes/cases-list-screen.tsx
  how: The slug stays the one fact the not-valid entry carries about its case, consistent with the case's
    identity rather than any version -- both CaseListEntry variants carry slug, and the not-valid row
    is still addressed and keyed by it.
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-not-valid-surface-presentation-isolate-invalid-case-from-listing-suite-2
inferences:
- inferred: No inventory convention was available (plan-work's corrective route ran no survey or decomposition),
    so conventions were drawn directly from sibling implementations already in the tree.
  from: case-detail-screen.tsx, use-case-current-version-validity.ts and error-ui-state.ts
- inferred: Reused the exact wording "This case's current version does not read back as a case." rather
    than composing new copy.
  from: the implemented node's own Description, which says the listing owes the reader the same state
    case-detail-screen.tsx already states
- inferred: Modeled CaseListEntry as a union discriminated by the presence of `summary` versus `notValid`
    rather than by an explicit `kind` literal.
  from: keeping the valid-entry shape identical to what use-cases-list.spec.ts's two pre-existing tests
    already assert by strict toEqual
- inferred: The isolation isolates any number of simultaneously-failing cases, not only exactly one.
  from: catching the error inside each case's own promise is the natural way to isolate a per-case fetch;
    the task's own UNDERDETERMINED note only flags a narrower behavior as not required, never forbidden
- inferred: Placed the explicit statement inside the existing state column cell as a plain string, leaving
    versionCount/lastUpdated absent (empty cells) rather than reusing the zero-version dash placeholder.
  from: the implemented node requiring the not-valid outcome to read as distinct from the zero-version
    outcome, which reusing that same dash would have blurred
- inferred: title and when_to_use are read off the same `/v1/cases/{slug}/versions/{version}` response
    fetchCaseListEntry already reads for authored_at; no second field-shaped endpoint was needed for them.
  from: domain/knowledge/case-version declares title and when_to_use as required attributes of every version,
    so the existing per-version detail read already carries them
preserved:
- The not-valid branch and per-case isolation behavior from the first delivery are unchanged; only the
  valid-entry branch's CaseSummary grew the three fields the first review found missing.
- The top-level GET /v1/cases failure still rejects useCasesList's whole query and drives the screen's
  existing "Cases could not be loaded." + Retry state.
- Slug-based search/filtering (filterEntriesBySlug) is untouched and applies identically to both entry
  kinds, since both carry `slug`.
deferred:
- what: A per-case fetch failing for a reason other than CaseVersionNotValidError (a network error, a
    500, an unmapped error) still rejects the whole listing query, reverting to today's whole-listing
    failure.
  why: The implemented node governs only a validator-rule failure at that reading; widening isolation
    to other read failures is a fact no node here states.
- what: The statement's exact visual treatment beyond fitting StatusTable's existing state column (styling,
    iconography, a dedicated banner).
  why: The implemented node leaves which control carries the statement, and where it sits, to the interface.
---

## What it is
The cases-list query now answers a distinct not-valid entry for a case whose current version fails validation instead of rejecting the whole listing, and the screen renders that entry with the case's slug and the specification's own explicit statement, leaving every other case's row unaffected.

## Notes
The build run initially failed on typecheck for reasons unrelated to this task's own files: the `frontend/tui` git submodule was not initialized in this worktree, and once initialized, its own package (`ui-kit`) had no installed dependencies either. Both were environment gaps of the worktree, not of this delivery's source; `git submodule update --init --recursive frontend/tui` and `npm ci` inside `frontend/tui/frontend` resolved them, after which the build passed clean on the third attempt (`build-3`; `build` and `build-2` are the two failed environment-setup attempts, kept on disk under `run/`).
A per-case fetch failing for a reason other than CaseVersionNotValidError (a network error, a 500, an unmapped error) still rejects the whole listing query, reverting to today's whole-listing failure -- the implemented node governs only a validator-rule failure at that reading, and widening isolation to other read failures is a fact no node here states.
Re-delivered after this task's first review (delivery/case-not-valid-surface-presentation-corrective/review/case-not-valid-surface-presentation-corrective.md) found three conformance findings against domain/knowledge/case-summary: CaseSummary never carried title, when_to_use or released_version for a released case. This revision adds releasedInfo() to use-cases-list.ts, deriving the three from the case's own highest-numbered released version (reusing the already-fetched detail when the current highest version is itself released; otherwise fetching the full, now-known-sized version list once to find the highest released version below a current draft, then that version's own detail). The suite was captured again as run/case-not-valid-surface-presentation-isolate-invalid-case-from-listing-suite-2, replacing the first delivery's `run` pointer.
