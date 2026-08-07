---
title: The buildable project under backend
summary: The manifest, the compiler configuration and the lint configuration the project's registry presupposes and the target tree does not hold.
rationale: This task answers to no base node, because no base node holds a manifest, a compiler configuration or a lint configuration — how this project is built is not what the business decided. The decomposition cut the three artifacts as one task rather than three because they are one decision about how this project is built, and the same criteria falsify all of them.
sources:
  - intake/scope.md
  - intake/backend-node-service.yaml
objective: The `backend` tree is a Node/TypeScript project that `npm ci` installs and whose `typecheck`, `lint`, `secret-scan` and `test` steps each run and report a result.
criteria:
  - "`npm ci` completes against the manifest with no unresolved dependency."
  - '`package.json` declares `"type": "module"`.'
  - "`package.json` declares a `test` script that runs the suite under vitest."
  - "`package.json` declares a `typecheck` script, so `npm run typecheck` runs the compiler rather than failing as an unknown script."
  - "`package.json` declares a `lint` script, so `npm run lint` runs eslint rather than failing as an unknown script."
  - "`package.json` declares a `secret-scan` script, so `npm run secret-scan` runs secretlint rather than failing as an unknown script."
  - "`package.json` declares each of the fourteen packages the registry authorizes."
  - "`package.json` declares no direct dependency the registry does not authorize."
  - "`package.json` carries a `secretlint` field naming a rule set, so the `secret-scan` step runs with rules rather than with none configured."
  - "`tsconfig.json` turns `strict` on."
  - "`tsconfig.json` states a module resolution mode, so a relative import between two files under `src/` resolves under the `typecheck` step."
  - "`eslint.config.js` configures the TypeScript parser, so `npm run lint` parses a `.ts` file carrying a type annotation instead of failing on it."
  - "`eslint.config.js` declares at least one rule over the `.ts` files under `src/`, so `npm run lint` exits having decided a rule rather than having decided none."
produces:
  - package.json
  - tsconfig.json
  - eslint.config.js
---
## What it is

The three artifacts the project's registry names as presupposed and the survey found absent from `backend/`.
The manifest carries the scripts every declared step is run as, the authorized dependencies, and the field the secret scan reads its rule set from.
The compiler configuration carries the strictness and the module resolution mode.
The lint configuration carries the parser and the rules the lint step decides.

## Notes

This task takes no dependency edge from any other task in this plan, and no other task takes one from it.
It binds nothing, and that is not an omission — no base node holds any of these three artifacts.
From the binding — all eight candidates were read fresh, and not one states a condition over a manifest, a compiler configuration or a lint configuration, so the binding is empty rather than decorative.
From the binding — the facts this task rests on are stated in the project's own registry rather than in the base, so none is recorded as a question, because `/analyse-domain` is the wrong producer for a standard's presupposition and the base is forbidden to hold one.
From the binding — criteria eleven and thirteen state their demonstrations over files under `src/` that this task does not create, so against an empty `src/` an implementation can state a resolution mode that resolves nothing and declare a rule that matches no file and have both read as met.
From the binding — the base refuses nothing there, so that seam is the caller's to settle and not a contradiction with any candidate.
From the binding — the coverage of `epic/case-shape` falls entirely to this task's siblings, because this task binds none of the eight nodes that epic claims.
