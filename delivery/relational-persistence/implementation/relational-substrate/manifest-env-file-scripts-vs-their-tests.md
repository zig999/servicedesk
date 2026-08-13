---
title: Manifest env-file scripts verified against criterion 1
summary: Confirms src/package.json's migrate and seed scripts already read exactly node --env-file=.env
  dist/migrate.js and node --env-file=.env dist/seed.js, so no manifest change was needed; the two spec
  files' stale assertions and npm test's exit code remain for the proof step.
task: sha256:cf59c1d83031f9670a8cd8730c8d25944b4454aaf34f5a9403d0ce7b6d92c917
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-substrate-manifest-env-file-scripts-vs-their-tests-build
files:
- path: package.json
  effect: Unchanged. Verified its "migrate" and "seed" scripts already read exactly node --env-file=.env
    dist/migrate.js and node --env-file=.env dist/seed.js -- the human-confirmed, wanted text from the
    earlier out-of-band edit -- so criterion 1 is satisfied as-is and no write was made.
criteria:
- criterion: package.json's `migrate` script is exactly `node --env-file=.env dist/migrate.js`, and its
    `seed` script is exactly `node --env-file=.env dist/seed.js`.
  met: true
  how: 'Read src/package.json directly: its "scripts" object already declares "migrate": "node --env-file=.env
    dist/migrate.js" and "seed": "node --env-file=.env dist/seed.js", matching the criterion''s text exactly
    with no reformatting needed. No source change was required or made.'
- criterion: src/__tests__/unit/migrate.spec.ts's own assertion on the `migrate` script, and src/__tests__/unit/seed.spec.ts's
    own assertion on the `seed` script, each match package.json's actual current text exactly, asserting
    the whole script string rather than a substring or a pattern.
  met: false
  how: Not answered by this implementation record. Both spec files still assert the pre-edit literal ('node
    dist/migrate.js' and 'node dist/seed.js'), which no longer matches package.json's actual --env-file=.env
    text; updating those two assertions to match is the proof step's own work -- no source file answers
    this criterion.
- criterion: '`npm test`, run with `DATABASE_URL` and the rest of what `config/env.ts` requires present
    in the process environment, exits 0.'
  met: false
  how: Not answered by this implementation record -- the suite currently fails on the two stale assertions
    above until the proof step updates them. Nothing in package.json or elsewhere in source needed changing
    to let the suite pass once those two spec files are corrected; the manifest side of the reconciliation
    is already complete.
preserved:
- package.json's migrate and seed scripts keep loading .env via node --env-file=.env, exactly as the human
  decided to keep them, rather than being reverted to the pre-`--env-file` literal the two stale specs
  still assert.
---

## What it is

The manifest half of the reconciliation between the earlier out-of-band --env-file edit and the two unit tests written before it: package.json already reads the wanted text, verified rather than rewritten.
The two criteria this record leaves unmet are exactly the ones the proof step answers, not a gap in this task's own scope.

## Notes

ADVISORY, from the specification -- this task carries no implements: the execution-contract-binder found that none of the 32 candidates inside epic/relational-substrate's covers governs a manifest's script text or a test's assertion literal, which is the project's own tooling convention rather than a domain fact.
Criteria 2 and 3 are recorded unmet here deliberately, per the delivery-node contract's own reading of an unmet criterion as an ordinary, ongoing answer rather than a failure: they are answered by the proof record and its suite run, not by any source file.
