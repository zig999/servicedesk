---
title: Review of hypothesis-revision-release-port-test-corrective
summary: 'Four passes over the one file task/hypothesis-revision-release-port-test-corrective/narrow-the-overly-strict-import-assertion delivered: coverage of its three criteria, per-file specification conformance folded into siegard-reconcile/hypothesis-revision-release-port-test-corrective.md, the backend standard''s reading rules, and the whole-suite run, which passed clean.'
reviewed:
- src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
tasks:
- task/hypothesis-revision-release-port-test-corrective/narrow-the-overly-strict-import-assertion
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed whole (152 files, 1883 tests); there was no failure to diagnose
coverage:
- criterion: The test's assertion checks the port's source for the absence of framework, driver and provider-client import specifiers (mirroring hypothesis-revision-release-state.port.spec.ts's own FORBIDDEN_DRIVERS_AND_FRAMEWORKS / PROVIDER_CLIENT_PACKAGE pattern), never a bare "no import at all" check.
  state: uncovered
  tests:
  - file: src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
    name: imports no database driver, HTTP server or web framework, so a caller depending on this port alone pulls in neither
  - file: src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
    name: imports no LLM provider client, so a caller depending on this port alone pulls in neither
  why: 'These two tests are the artifact the criterion describes, not proof of it. The criterion is a property of the assertion''s shape — that it filters specifiers against FORBIDDEN_DRIVERS_AND_FRAMEWORKS and PROVIDER_CLIENT_PACKAGE rather than demanding an empty import list — and nothing in the set asserts over that shape. Reading the file shows the narrowed filters are present, but if the assertion regressed to a bare expect(importSpecifiersOf(source)).toEqual([]) both tests would still pass, because src/case/hypothesis-revision-release.port.ts is a bare interface declaration that imports nothing. The thing that distinguishes the narrowed rule from the bare one is unexercised in both directions: no test feeds importSpecifiersOf or namesOneOf a benign specifier (a ''node:'' builtin, a relative sibling module) and asserts it is not an offender, and no test feeds them a forbidden specifier and asserts it is, so the classification the criterion is about never runs over an input that separates
    the two rules.'
- criterion: The test's own title and any prose describing what it proves name the actual rule (no framework/driver/client import), never "no import at all".
  state: uncovered
  tests:
  - file: src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
    name: imports no database driver, HTTP server or web framework, so a caller depending on this port alone pulls in neither
  - file: src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
    name: imports no LLM provider client, so a caller depending on this port alone pulls in neither
  why: 'A test title is not an assertion and nothing in the set reads one. Both titles are named here because a reader opening the file will otherwise take them for the proof: they are the text the criterion governs, and no test would fail if either were reworded back to "no import at all". The criterion is settled by reading the file rather than by running it, and the file carries no other prose — no comments, no describe block — so what a reading covers is these two titles and nothing further.'
- criterion: Running this file's own full test suite continues to pass with every existing assertion unchanged in substance (the port itself still imports nothing today, so the narrowed assertion still passes).
  state: partial
  tests:
  - file: src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
    name: imports no database driver, HTTP server or web framework, so a caller depending on this port alone pulls in neither
  - file: src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
    name: imports no LLM provider client, so a caller depending on this port alone pulls in neither
  why: 'The "continues to pass" half is exercised: these two tests are this file''s whole suite, each reads the port''s real source off disk and asserts over a derived value rather than a literal, so each can fail — adding pg or @anthropic-ai/sdk to src/case/hypothesis-revision-release.port.ts would turn one red. The "with every existing assertion unchanged in substance" half is unexercised: that is a claim about this file against its own prior version, and nothing in the set compares the two or fails if an assertion were substantively weakened. A rewrite that kept the suite green while dropping an assertion, collapsing the two tests into one, or emptying FORBIDDEN_DRIVERS_AND_FRAMEWORKS would satisfy every test present. Neither test''s outcome is recorded here — whether the suite in fact passes is a run''s answer, and no run is in this set.'
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
reconciliation: siegard-reconcile/hypothesis-revision-release-port-test-corrective.md
findings:
- pass: standard
  file: src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
  where: lines 5-27 (FORBIDDEN_DRIVERS_AND_FRAMEWORKS, PROVIDER_CLIENT_PACKAGE, IMPORT_SPECIFIER_PATTERN, importSpecifiersOf, namesOneOf, portSource)
  evidence: "const FORBIDDEN_DRIVERS_AND_FRAMEWORKS = [\n  'fastify', 'express', 'koa', '@hapi/hapi', '@nestjs/common', '@nestjs/core',\n  'pg', 'pg-native', 'postgres', 'mysql', 'mysql2', 'sqlite3', 'better-sqlite3',\n  'mongodb', 'mongoose', 'redis', 'ioredis', 'typeorm', 'sequelize', 'knex',\n  'prisma', '@prisma/client', 'drizzle-orm',\n];\n\nconst PROVIDER_CLIENT_PACKAGE = '@anthropic-ai/sdk';\n\nconst IMPORT_SPECIFIER_PATTERN = /(?:from|import)\\s*\\(?\\s*['\"]([^'\"]+)['\"]/g;\n\nfunction importSpecifiersOf(source: string): string[] { ... }\nfunction namesOneOf(specifier: string, packages: readonly string[]): boolean { ... }\n"
  cost: This exact block — the forbidden-package list, the LLM-provider constant, the import-specifier regex and both helper functions — is retyped verbatim in at least three sibling files (src/__tests__/unit/case/hypothesis-revision-own-state.port.spec.ts and src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts carry the identical block, differing only in the path portSource resolves). Adding a package to the forbidden list, or fixing a bug in namesOneOf's prefix matching, has to be repeated in every copy by hand, and a reader has no way to know whether a given copy was updated when the others were.
  correction: Extract the forbidden-package list, the constants, the regex and the two helper functions into one shared test-support module the port specs import from, rather than each spec restating them.
  cites: MNT-03
---

## What it is
The review record of the one task the hypothesis-revision-release-port-test-corrective initiative delivered, computed over its one file.

## Notes
The captured run (run/hypothesis-revision-release-port-test-corrective-2) passed whole — 152 files, 1883 tests — so the failures pass did not run; there was no failure to diagnose. This capture used --pool=forks --poolOptions.forks.singleFork=true, a deliberate memory-reduction departure from the registry's own npm test command, to avoid the harness's repeated memory-guard kills under the default pool; a plain npm test capture over the same tree passed just as clean minutes before (see review/case-version-lifecycle-schema-title-corrective.md's notes for the one case where this departure produced a spurious cross-test failure).
Two of the three findings (the MNT-03 duplication across sibling *.port.spec.ts files, and the conformance pass's own looked_past note about the provider-client check's narrowness) concern code this task did not introduce — the duplicated helper block already existed identically in the sibling files before this task narrowed one copy's assertion.
