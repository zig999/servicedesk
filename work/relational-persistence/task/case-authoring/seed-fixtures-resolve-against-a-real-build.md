---
title: Seed reads its fixtures from a build that actually produced them
summary: The seed step, the source answering task/case-authoring/curated-data-seeded, stops assuming dist/ holds a copy of src/fixtures/ that no build step actually creates.
rationale: The execution-contract-binder read all twelve candidates inside epic/case-authoring's covers fresh against this objective and found none governs it — where a compiled script resolves its own fixture files is the project's own source arrangement, never a domain fact, so this task carries no implements.
sources:
  - intake/seed-fixtures-missing-from-build.md
depends_on:
  - task/case-authoring/curated-data-seeded
objective: "`npm run seed`, run against a real `npm run build` with no `dist/fixtures` directory pre-existing by any other means, completes without an ENOENT and still stores exactly what task/case-authoring/curated-data-seeded's own criteria require."
criteria:
  - From a clean checkout with no dist/ directory at all, npm run build followed by npm run seed exits 0.
  - The seed step reads every fixture it needs — the five glossary vocabularies, the concept and capability registrations, and the curated case at case/intermittent-connection-outage/1.json — because the project's own build step placed them where the compiled seed script looks, not because dist/ was populated by any other means.
  - Running npm run seed a second time against a database that already holds the curated case still exits 0, unchanged from the idempotency alreadySeeded already provides.
---

## What it is

The fix to task/case-authoring/curated-data-seeded's own delivered seed.ts, so that a real `npm run build` followed by `npm run seed` completes instead of failing with ENOENT on the first fixture it tries to read.
The seed script keeps resolving no fixture path from an environment variable, exactly as its own module comment already states; this task changes only where `dist/` actually gets its fixtures from, never introduces a new configuration source.

## Notes

ADVISORY, from the specification — none of the twelve candidates inside epic/case-authoring's covers (contracts/system/case-authoring, contracts/knowledge/author-case-version, contracts/knowledge/vocabulary-terms, contracts/knowledge/capability-check, rules/knowledge/validation-runs-at-every-read, rules/knowledge/case-terms-exist-in-the-glossary, rules/knowledge/a-concept-accepts-the-declared-subject-type, rules/knowledge/a-collected-concept-declares-a-ttl, rules/knowledge/every-collected-concept-has-a-read-only-capability, rules/knowledge/the-contract-check-reads-the-current-registration, rules/glossary/the-non-conclusion-outcomes-precede-the-first-case, scenarios/knowledge/a-subject-mismatch-refuses-the-case) governs this task: its objective and criteria concern the seed script's fixture-path resolution against a real build output, not what gets seeded, in what order, or what any validator rule checks.
task/case-authoring/curated-data-seeded already answers what gets seeded and in what order; this task changes none of that, it only makes the existing reads succeed against fixtures a real build actually produced.
An admitted construct — resolving fixtures against the source tree rather than the compiled output, or a build step copying src/fixtures/** into dist/ — satisfies every criterion without contradicting or exceeding the specification, so this is demonstrable rather than blocking, and the specification's silence here is not a refusal of any particular mechanism, so nothing underdetermined is being let through either.
