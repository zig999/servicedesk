---
target: frontend
title: Case-not-valid surface presentation, first review
summary: What four passes found over the delivery of task/case-not-valid-surface-presentation/isolate-invalid-case-from-listing,
  which isolates one case's invalid current version from the rest of the /cases listing.
reviewed:
- src/hooks/use-cases-list.ts
- src/routes/cases-list-screen.tsx
- src/hooks/use-cases-list-invalid-case-isolation.spec.ts
- src/routes/cases-list-screen-invalid-case-isolation.spec.ts
tasks:
- task/case-not-valid-surface-presentation/isolate-invalid-case-from-listing
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured suite run passed cleanly (run/case-not-valid-surface-presentation-isolate-invalid-case-from-listing-suite);
    there was no failure to diagnose
coverage:
- criterion: A listing of every case, read while one case's current version fails a validator rule of
    validation-runs-at-every-read at that reading, still presents every other case's own summary, exactly
    as it would be presented were every validator rule to hold for that one case's current version.
  state: partial
  tests:
  - file: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
    name: resolves every other case's own summary unaffected and the failing case's own entry to only
      its slug and the not-valid marker when one case's current version fails validation
  - file: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
    name: resolves the listing successfully with an isolated not-valid entry for each of two cases whose
      current versions fail validation at the same reading, rather than reverting to a whole-listing failure
  - file: src/routes/cases-list-screen-invalid-case-isolation.spec.ts
    name: renders every other case's own row unaffected and a row carrying the failing case's slug and
      the not-valid statement with no summary values, when one case's current version fails validation
  why: 'The unaffected case''s summary is exercised only over version_count, current_state and last_updated:
    every fixture for the valid case (case-alpha, case-good) supplies just a slug, a single version entry
    and an authored_at, so nothing in the set gives an unaffected case a title, a when_to_use or a released_version
    -- three of the six summary items criterion 2 enumerates. Those three could stop being presented for
    every other case while one case fails validation and both files would still pass. Separately, the
    "exactly as it would be presented were every validator rule to hold" equivalence is exercised only
    against hard-coded expected values; no reading in which that one case''s current version validates
    is rendered in either file, so the two presentations are never compared as the criterion states the
    comparison.'
- criterion: That same listing still presents an entry for the case whose current version fails validation,
    carrying that case's own slug and the explicit statement that its current version does not read back
    as a case, and none of that case's summary (no current_state, version_count, last_updated, title,
    when_to_use, or released_version).
  state: covered
  tests:
  - file: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
    name: resolves every other case's own summary unaffected and the failing case's own entry to only
      its slug and the not-valid marker when one case's current version fails validation
  - file: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
    name: resolves the listing successfully with an isolated not-valid entry for each of two cases whose
      current versions fail validation at the same reading, rather than reverting to a whole-listing failure
  - file: src/routes/cases-list-screen-invalid-case-isolation.spec.ts
    name: renders every other case's own row unaffected and a row carrying the failing case's slug and
      the not-valid statement with no summary values, when one case's current version fails validation
findings:
- pass: conformance
  file: src/hooks/use-cases-list.ts
  where: the `CaseSummary` type (lines 28-32) and the object `fetchCaseListEntry` returns for a valid
    entry (lines 70-77)
  evidence: "export type CaseSummary = {\n  readonly versionCount: number;\n  readonly currentState?:\
    \ CaseVersionState;\n  readonly lastUpdated?: string;\n};\n...\nreturn {\n  slug,\n  summary: {\n\
    \    versionCount,\n    currentState: highest.state,\n    lastUpdated: detail.authored_at,\n  },\n\
    };"
  cost: 'A consumer of `useCasesList` can never receive a case''s title, when_to_use or released_version
    for a released case: the type has no field for any of the three and fetchCaseListEntry only ever fetches
    the case''s highest-numbered version, never its highest released one. domain/knowledge/case-summary''s
    own fact -- title, when_to_use and released_version derived from a case''s most recently released
    version -- is structurally unreachable from the hook the listing screen consumes.'
  correction: Add title, when_to_use and released_version to CaseSummary, derived from the case's highest-numbered
    version whose own state is released (a separate lookup from the current-state-deriving highest version),
    present only where such a released version exists, per rules/knowledge/a-case-summary-is-derived-from-its-existing-versions.
- pass: conformance
  file: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
  where: the case-alpha version-detail mock and its expected summary in the first test, lines 61-62 and
    78-82
  evidence: "\"/v1/cases/case-alpha/versions/1\": () =>\n  jsonResponse({ authored_at: \"2024-01-01T00:00:00.000Z\"\
    \ }),\n...\n{\n  slug: \"case-alpha\",\n  summary: { versionCount: 1, currentState: \"released\",\
    \ lastUpdated: \"2024-01-01T00:00:00.000Z\" },\n},"
  cost: 'case-alpha''s current version is stated as released (`state: "released"` in the versions list),
    so a reader treating this test as the contract for a released case''s summary is told title, when_to_use
    and released_version are never part of it; an implementation change that stops deriving those three
    fields for a released case would pass this test undetected.'
  correction: Mock the version-detail response with title, when_to_use and released_version data and include
    them in the expected summary for case-alpha, since its current version is released.
- pass: conformance
  file: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
  where: the case-good version-detail mock and its expected summary in the second test, lines 107-108
    and 133-137
  evidence: "\"/v1/cases/case-good/versions/1\": () =>\n  jsonResponse({ authored_at: \"2024-02-02T00:00:00.000Z\"\
    \ }),\n...\n{\n  slug: \"case-good\",\n  summary: { versionCount: 1, currentState: \"released\", lastUpdated:\
    \ \"2024-02-02T00:00:00.000Z\" },\n},"
  cost: 'Same gap as case-alpha, repeated in the second test: case-good''s current version is released
    yet the expected summary carries no title, when_to_use or released_version, so the test again pins
    a shape the specification does not allow for a released case.'
  correction: Mock the version-detail response with title, when_to_use and released_version data and include
    them in the expected summary for case-good, since its current version is released.
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
reconciliation: siegard-reconcile/case-not-valid-surface-presentation-corrective.md
---

## What it is
What four passes found over the delivery of task/case-not-valid-surface-presentation/isolate-invalid-case-from-listing, which isolates one case's invalid current version from the rest of the /cases listing.

## Notes
The standard pass ran (`deliver.py --standard ... --reading --for` over the four reviewed files) and found zero rules of standards/frontend-typescript.yaml decided by reading for this file set -- every rule reaching these files is decided by a tool (typecheck, lint, style, a11y, secret-scan), each of which ran clean in the captured suite run.
The certification offered for rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone came back `partial`, not `covered`: the offered tests never render the cases-list screen itself (only the data hook), and never vary which version among several a case holds is the one that fails validation. The node stays decided by reading; the fold left it uncertified rather than closing it.
This is a pre-existing gap in domain/knowledge/case-summary's implementation, not one this task introduced: use-cases-list.ts's CaseSummary type carried only versionCount, currentState and lastUpdated before this delivery too. This task's new test file inherited and re-asserted that same incomplete shape for its own fixtures, which is what the conformance pass caught.
