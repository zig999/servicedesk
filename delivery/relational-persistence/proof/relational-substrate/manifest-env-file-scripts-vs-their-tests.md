---
title: The two stale manifest-script assertions now match package.json's actual text
summary: migrate.spec.ts and seed.spec.ts each assert their script's full current --env-file text exactly,
  byte for byte, closing the reconciliation the manifest-side implementation record left open.
implementation: sha256:4daf82723f3a649b720cd05e70621b5f6cd3f10f0093140d57c142891b2ecd5d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-substrate-manifest-env-file-scripts-vs-their-tests-suite-2
tests:
- file: src/__tests__/unit/migrate.spec.ts
  name: the manifest declares a "migrate" script that runs the built migrate.js from dist/, mirroring
    "start"'s own precedent
  proves: Criterion 2's migrate half -- the test's own assertion on the migrate script matches package.json's
    actual current text exactly, as the whole script string.
  fails_when: package.json's migrate script is anything other than the literal 'node --env-file=.env dist/migrate.js'
    -- reverted to the pre-edit text, edited to a different flag, or the manifest key renamed or removed.
- file: src/__tests__/unit/seed.spec.ts
  name: the manifest declares a "seed" script that runs the built seed.js from dist/, mirroring "migrate"'s
    own precedent
  proves: Criterion 2's seed half -- the test's own assertion on the seed script matches package.json's
    actual current text exactly, as the whole script string.
  fails_when: package.json's seed script is anything other than the literal 'node --env-file=.env dist/seed.js'
    -- reverted to the pre-edit text, edited to a different flag, or the manifest key renamed or removed.
not_applicable:
- edge_case: absent/empty input, a range boundary, a duplicate, forbidden-state operations, a slow/failing
    dependency, concurrent operations
  why: none apply -- this task's only falsifiable surface is two exact-string comparisons against a static
    manifest field, with no runtime branch, no collection, no state transition and no concurrency to exercise.
- edge_case: criterion 3 (npm test exits 0, run with DATABASE_URL and the rest of config/env.ts's requirements
    present) as a unit-test assertion
  why: this is not a behavior a unit test in this suite asserts -- it is the outcome of running the whole
    suite, which the delivery's run step (bin/run.py, recorded under run/) observes and records, not something
    a spec file itself can assert about its own exit code. This proof record's own `run` field, pointing
    at a passed run of the full registry including `test`, is what answers criterion 3.
---

## What it is

The proof that the two pre-existing, unrelated test failures blocking task/case-authoring/seed-fixtures-resolve-against-a-real-build's own suite are gone, by updating exactly the two literals that had gone stale.
Criterion 3 is answered by this record's own run field rather than by a new unit test, since a suite's own exit code is not a fact a spec file inside that suite can assert about itself.

## Notes

None.
