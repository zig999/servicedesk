---
target: frontend
title: Case-not-valid surface presentation, second review
summary: What four passes found over the fix for the first review's three conformance findings against
  domain/knowledge/case-summary, on task/case-not-valid-surface-presentation/isolate-invalid-case-from-listing.
reviewed:
- src/hooks/use-cases-list.ts
- src/routes/cases-list-screen.tsx
- src/hooks/use-cases-list-invalid-case-isolation.spec.ts
- src/routes/cases-list-screen-invalid-case-isolation.spec.ts
- src/hooks/use-cases-list.spec.ts
tasks:
- task/case-not-valid-surface-presentation/isolate-invalid-case-from-listing
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed cleanly (run/case-not-valid-surface-presentation-corrective-2); there
    was no failure to diagnose
coverage:
- criterion: A listing of every case, read while one case's current version fails a validator rule of
    validation-runs-at-every-read at that reading, still presents every other case's own summary, exactly
    as it would be presented were every validator rule to hold for that one case's current version.
  state: covered
  tests:
  - file: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
    name: resolves every other case's own summary unaffected and the failing case's own entry to only
      its slug and the not-valid marker when one case's current version fails validation
  - file: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
    name: resolves the listing successfully with an isolated not-valid entry for each of two cases whose
      current versions fail validation at the same reading, rather than reverting to a whole-listing failure
  - file: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
    name: resolves a case whose highest version is a draft to a summary carrying the current draft's own
      state alongside title, when_to_use and released_version read from the case's own highest released
      version below it
  - file: src/hooks/use-cases-list.spec.ts
    name: resolves to one entry per case, each carrying the highest-numbered version's own state and authored_at
  - file: src/routes/cases-list-screen-invalid-case-isolation.spec.ts
    name: renders every other case's own row unaffected and a row carrying the failing case's slug and
      the not-valid statement with no summary values, when one case's current version fails validation
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
  where: line 17, the module-level type declaration `export type CaseVersionState = "draft" | "released";`
  evidence: export type CaseVersionState = "draft" | "released";
  cost: The case-version lifecycle's two states are the specification's own enumeration (domain/knowledge/case-version-state),
    and this file re-declares them as a literal union under its own authority rather than importing the
    one that already exists in the codebase (frontend/app/src/hooks/use-case-versions.ts exports the identical
    type, consumed by case-simulation-header.tsx and use-case-simulation-version.ts). A third place now
    carries the same vocabulary; if the enumeration is ever extended, there is no single site a maintainer
    is led back to, and the two independent declarations can silently diverge from each other and from
    the node.
  correction: Remove the local declaration and import CaseVersionState from the one existing canonical
    declaration, so the state-machine's states are enumerated in exactly one place in source.
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
reconciliation: siegard-reconcile/case-not-valid-surface-presentation-corrective-2.md
---

## What it is
What four passes found over the fix for the first review's three conformance findings against domain/knowledge/case-summary, on task/case-not-valid-surface-presentation/isolate-invalid-case-from-listing.

## Notes
All three of the first review's findings against domain/knowledge/case-summary are gone: every conformance delegation over use-cases-list.ts and both hook-level spec files came back clean on that node this time. One new, smaller finding surfaced instead: use-cases-list.ts re-declares the CaseVersionState union locally rather than importing the one already exported by use-case-versions.ts -- a duplication finding, not a fact the specification lacks.
Both certifications (the listing node and case-summary) came back `partial`, not `covered`: the offered tests never render the cases-list screen while exercising the not-valid/draft-with-released-below paths together, never test a version between the current and the released one, and never test a case with zero versions or a case holding only drafts. Both nodes stay decided by reading, same as after the first review.
The standard pass ran (`deliver.py --standard ... --reading --for` over the five reviewed files) and again found zero rules decided by reading for this file set; every applicable rule is tool-decided and ran clean in the captured suite.
