Corrective increment — one wrong behavior observed in code already delivered, answering to no task's criteria.

Route: /plan-work's corrective path (no survey, no decomposition). Target: backend (src). Initiative: relational-persistence (live work root).

Scope, as the human stated it:

The `npm run seed` script (`src/src/seed.ts`) crashes with ENOENT against a real build: it
resolves its fixtures directory via `fileURLToPath(new URL('./fixtures', import.meta.url))`,
relative to the compiled file — i.e. it looks under `dist/fixtures/...`. But the project's build
(`tsc -p tsconfig.build.json`) only compiles `.ts` files; it never copies `src/fixtures/**` into
`dist/`. Running `npm run build && npm run seed` from a clean tree always fails with
`ENOENT: no such file or directory, open '.../dist/fixtures/glossary/outcome.json'` before any
glossary, capability or case data is ever seeded — the seed step never actually completes against
a real build. The fix must make `npm run seed` complete successfully starting from a clean
`npm run build`, without relying on `dist/` having been populated by hand outside the build.

Observed failure, verbatim:

```
Error: ENOENT: no such file or directory, open '/home/siegfriedneto/projects/siegardtest/src/dist/fixtures/glossary/outcome.json'
    at async open (node:internal/fs/promises:639:25)
    at async readFile (node:internal/fs/promises:1249:14)
    at async fixtureTerms (file:///home/siegfriedneto/projects/siegardtest/src/dist/seed.js:47:17)
    at async seedOutcomes (file:///home/siegfriedneto/projects/siegardtest/src/dist/seed.js:58:29)
    at async file:///home/siegfriedneto/projects/siegardtest/src/dist/seed.js:175:9
```

This corrects `src/src/seed.ts`, the source that answers task/case-authoring/curated-data-seeded
(already delivered) — the epic that task sits under is `case-authoring`, and this corrective task
is placed beside it as a new task under that same epic.
