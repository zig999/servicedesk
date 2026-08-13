---
title: The manifest's env-loading scripts and their own tests agree
summary: package.json's migrate and seed scripts load .env themselves via node --env-file, a wanted capability the human decided to keep; the two unit tests asserting their old literal text are updated to match, without weakening either assertion.
rationale: The execution-contract-binder read all 32 candidates inside epic/relational-substrate's covers fresh against this objective and found none governs it — how a manifest script loads its own process environment, and what a unit test asserts about that manifest's literal text, is the project's own tooling convention, never a domain fact; the binder confirmed in particular that constraints/the-database-is-externally-provisioned is satisfied either way, since `node --env-file=.env` only changes how the OS-level environment config/env.ts already reads is itself populated before the process starts, introducing no second source of the URL.
sources:
  - intake/manifest-env-file-scripts-vs-their-tests.md
objective: "package.json's `migrate` and `seed` scripts keep loading `.env` via `node --env-file=.env`, and the two existing unit tests that assert those scripts' exact text agree with what the manifest actually declares, so `npm test` exits 0 without anyone reverting the manifest or weakening a test."
criteria:
  - "package.json's `migrate` script is exactly `node --env-file=.env dist/migrate.js`, and its `seed` script is exactly `node --env-file=.env dist/seed.js`."
  - "src/__tests__/unit/migrate.spec.ts's own assertion on the `migrate` script, and src/__tests__/unit/seed.spec.ts's own assertion on the `seed` script, each match package.json's actual current text exactly, asserting the whole script string rather than a substring or a pattern."
  - "`npm test`, run with `DATABASE_URL` and the rest of what `config/env.ts` requires present in the process environment, exits 0."
---

## What it is

The reconciliation between an out-of-band edit to package.json's `migrate` and `seed` scripts (made before this plan's own work, to load `.env` natively rather than requiring the invoking shell to export every variable `config/env.ts` requires) and the two unit tests that predate that edit and still assert the old literal text.
The manifest is not reverted: the human decided to keep the `--env-file` capability, so the two tests are updated to state the manifest's actual, current, wanted text.

## Notes

ADVISORY, from the specification — none of the 32 candidates inside epic/relational-substrate's covers governs this task: the binder found no domain fact, rule or constraint that states anything about a manifest's script text, `.env`-loading mechanics, or a unit test's assertion, and confirmed specifically that constraints/the-database-is-externally-provisioned is satisfied either way, since `--env-file=.env` changes only how the OS-level environment `config/env.ts` already reads is populated before the process starts, never introducing a second source of the URL.
