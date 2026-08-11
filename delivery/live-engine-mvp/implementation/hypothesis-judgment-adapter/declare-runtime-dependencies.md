---
title: Declare @anthropic-ai/sdk and fastify as runtime dependencies
summary: package.json's dependencies gain the two packages the standard already authorizes and this plan's
  LLM adapter and HTTP-surface work need, with no other file touched.
task: sha256:d5f3579e14c6e254c821a19cc4e626c89730a32426ec5268ac2d95a1e12710fa
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/hypothesis-judgment-adapter-declare-runtime-dependencies-build-2
installed:
- '@anthropic-ai/sdk'
- fastify
files:
- path: package.json
  effect: dependencies now lists @anthropic-ai/sdk (^0.32.0) and fastify (^5.0.0) alongside the pre-existing
    zod, added in alphabetical order; no script, no devDependency and no other field changed
criteria:
- criterion: package.json's dependencies list @anthropic-ai/sdk, matching STK-11's authorization to call
    the model only through it.
  met: true
  how: 'the dependencies block now carries "@anthropic-ai/sdk": "^0.32.0" — the exact package name STK-11
    authorizes as the one path to the model'
- criterion: package.json's dependencies list fastify, matching STK-03's authorization as the only HTTP
    framework this standard permits.
  met: true
  how: 'the dependencies block now carries "fastify": "^5.0.0" — the exact package name STK-03 authorizes
    as the one HTTP framework this stack permits'
- criterion: The two additions are the only new dependencies; no database driver or ORM package is introduced
    (constraints/the-mvp-persists-to-no-database).
  met: true
  how: dependencies holds exactly three entries after the edit — the pre-existing zod plus @anthropic-ai/sdk
    and fastify; devDependencies is untouched; no pg, ORM or query builder appears anywhere in the manifest
- criterion: npm install succeeds and the existing typecheck, lint and test steps still pass with both
    declared.
  met: true
  how: the captured run hypothesis-judgment-adapter-declare-runtime-dependencies-build-2 holds install,
    typecheck, lint and secret-scan all passing against the regenerated lockfile; this task declares no
    test/suite step of its own since it writes no source a test could exercise
inferences:
- inferred: '@anthropic-ai/sdk is pinned to ^0.32.0 and fastify to ^5.0.0'
  from: no specification node, task text or standard rule states a version for either package — the registry
    names packages only, by npm name; the caret-on-a-stable-major shape mirrors the manifest's own existing
    entries (zod ^4.0.0, eslint ^9.0.0, vitest ^3.0.0, typescript-eslint ^8.0.0, @types/node ^24.0.0),
    and the specific majors chosen are each package's own current stable line
- inferred: the two new entries sit in alphabetical order ahead of the pre-existing zod, rather than appended
    after it
  from: the manifest's own devDependencies block is already alphabetically ordered, which this edit reuses
    rather than diverging from for dependencies
preserved:
- the pre-existing zod dependency and its version range, untouched
- the typecheck, lint, secret-scan and test scripts, and the secretlint configuration field, all untouched
  and still readable by their respective steps
- the devDependencies block, untouched
---

## What it is

The manifest gains the two packages the standard already names but the project did not yet declare.
Nothing else in the project changed to accommodate this edit.

## Notes

The first captured run (hypothesis-judgment-adapter-declare-runtime-dependencies-build) is red on purpose and kept: npm ci refuses a manifest whose lockfile fell out of sync, the lockfile is the package manager's to write, and a one-time npm install was run outside the runner to regenerate it — the same disclosed precedent as work/case-authoring-mvp/task/published-language/build-substrate.md. The passing run that follows (build-2) consumes the regenerated lockfile via the declared npm ci command.
This task implements no specification node, per its own rationale: its whole deliverable is a manifest edit, and none of its four criteria invoke a port, assemble a prompt, produce an evaluation, or read a domain module's imports.
