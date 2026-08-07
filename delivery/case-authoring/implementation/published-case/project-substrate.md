---
title: The manifest and the compiler configuration the standard registry presupposes
summary: "The two artifacts the registry names in its `presupposes` block, written at the target source root — a manifest declaring ESM, the four steps the registry runs as scripts and the eleven dependencies it authorized when this was written, and a compiler configuration turning strict on, fixing Node's own resolution mode and compiling `src`."
task: "sha256:49ba58122d5529e8ddf89e0965aa69c66a91d225adc9a9d90a1093303cb6c84c"
standard:
  at: "standards/backend-node-service-2.yaml"
  pin: "sha256:10f0b19da6370ebc0078f49b4179f282fbe6f691edec122afdd51d68998a6755"
run: "run/published-case-project-substrate-install"
installed:
  - fastify
  - "@modelcontextprotocol/sdk"
  - pg
  - jose
  - zod
  - pino
  - "@anthropic-ai/sdk"
  - vitest
  - typescript
  - eslint
  - secretlint
files:
  - path: package.json
    effect: "makes the target source root an ESM npm package: it declares `\"type\": \"module\"`, gives the registry's typecheck, lint, secret-scan and test steps a script apiece to run as, and declares the eleven direct dependencies the registry authorized — the seven the service runs on as `dependencies`, the four the checks and the suite are as `devDependencies`. The captured install resolved all eleven and wrote a lockfile."
  - path: tsconfig.json
    effect: "configures the compiler the `typecheck` script runs: strict on, `NodeNext` module and module resolution so a relative import resolves exactly as Node resolves it under `\"type\": \"module\"`, no emit, and `src` as the only directory compiled."
criteria:
  - criterion: "`package.json` sits at the target source root and declares `\"type\": \"module\"`."
    met: true
    how: "the file is written at the repository root, the target source root the invocation named, and its fourth key is `\"type\": \"module\"`."
  - criterion: "`package.json` declares each of the eleven packages the registry authorizes — fastify, @modelcontextprotocol/sdk, pg, jose, zod, pino, @anthropic-ai/sdk, vitest, typescript, eslint and secretlint — as a direct dependency."
    met: true
    how: "all eleven are declared directly and the captured install resolved every one: fastify 5.11.2, @modelcontextprotocol/sdk 1.30.0, pg 8.22.0, jose 6.2.8, zod 4.4.3, pino 9.14.0 and @anthropic-ai/sdk 0.115.0 under `dependencies`; eslint 9.39.5, secretlint 13.0.4, typescript 5.9.3 and vitest 3.2.7 under `devDependencies`. Both blocks are direct dependencies of this manifest, and `npm install` installs both."
  - criterion: "`package.json` declares no direct dependency the registry does not authorize."
    met: true
    how: "the two blocks hold eleven entries between them and no twelfth: no `@types/*` package, no eslint parser or plugin, no secretlint rule preset, no test or build helper. Every name is one the pinned registry's `dependencies` list carries. Three of the absences this criterion forced are recorded under `deferred`."
  - criterion: "`package.json` declares a `test` script that runs the suite under vitest."
    met: true
    how: "`\"test\": \"vitest run\"` — vitest's single-pass invocation, which is what `npm test`, the registry's suite step, needs in order to terminate rather than watch."
  - criterion: "`package.json` declares a `typecheck` script that runs the TypeScript compiler."
    met: true
    how: "`\"typecheck\": \"tsc\"`, which runs the compiler over the `tsconfig.json` beside it; that configuration is where this project states it does not emit, so the fact lives in one file rather than being repeated on the command line."
  - criterion: "`package.json` declares a `lint` script that runs eslint."
    met: true
    how: "`\"lint\": \"eslint src\"`, scoped to the directory every rule's `applies_to` sits under. What that step can decide is recorded under `deferred`."
  - criterion: "`package.json` declares a `secret-scan` script that runs secretlint."
    met: true
    how: "`\"secret-scan\": \"secretlint \\\"src/**/*\\\"\"`, scoped to the same directory, since SEC-02 and SEC-03 — the two rules that step decides — both scope `under: src`. What it has to decide by is recorded under `deferred`."
  - criterion: "`tsconfig.json` sits at the target source root and turns the compiler's strict setting on."
    met: true
    how: "the file is written at the repository root beside the manifest, and `compilerOptions.strict` is `true` — the single setting STK-01 and TYP-01 both read from it."
  - criterion: "`tsconfig.json` states a module resolution mode, so whether an extensionless relative import resolves is decided by the file rather than by a default."
    met: true
    how: "`\"moduleResolution\": \"NodeNext\"` is stated explicitly, paired with `\"module\": \"NodeNext\"`. Under that mode the compiler resolves a relative import exactly as Node does for a `\"type\": \"module\"` package: an extensionless relative specifier does not resolve, and the compiler says so at build time instead of the process failing at its first import."
  - criterion: "`tsconfig.json` takes `src` as the directory it compiles, which is the directory every rule of the registry names in its `applies_to`."
    met: true
    how: "`\"include\": [\"src\"]` is the whole of what the configuration compiles, so nothing outside that tree is type-checked and everything inside it is. On the clause: the pinned registry's rules name eight scopes — `src`, `src/factories`, `src/types`, `src/config`, `src/errors`, `src/clients`, `src/migrations` and `src/__tests__` — rather than one, and every one of them sits under `src`, so the criterion's falsifiable half is what the file answers."
  - criterion: "`npm install`, the command the registry declares as its install step, completes over the written manifest."
    met: true
    how: "witnessed by the captured run `run/published-case-project-substrate-install`, whose install step exited 0 over this manifest, and by the lockfile it wrote, which resolves every one of the eleven ranges."
inferences:
  - inferred: "`NodeNext` as the module and module-resolution mode, rather than `classic`, `node10` or `bundler`."
    from: "the manifest's own `\"type\": \"module\"`, which criterion 1 requires and STK-02 depends on, plus the registry's dependency list, which authorizes no bundler and no runtime loader — so the only thing that will ever resolve this project's imports is Node itself. The registry names no mode; a mode that resolved extensionless relative imports would type-check files Node then refuses to load. The task's `## Notes` carried the binding's warning that `classic` or `node10` satisfies criteria 8 through 10 exactly as written and is the wrong implementation that passes."
  - inferred: "`\"target\": \"ES2022\"`, and no `lib` of its own."
    from: "nothing on disk states a language level or a Node version — the manifest declares no `engines` because nothing states one either. The compiler's default target predates the syntax and the library types this stack needs, so a value had to be chosen; ES2022 is the level Node has supported wholly since its 18 line, which is the floor the authorized packages themselves already require."
  - inferred: "the split of the eleven into seven `dependencies` and four `devDependencies`."
    from: "what the registry says each package is for: the seven runtime ones are named by stack rules about what source does at run time, while typescript, eslint, secretlint and vitest are named as the tools its four check steps are. The registry states no split of its own, and `npm install` installs both blocks, so the criterion about direct dependencies holds either way."
  - inferred: "the version range on each of the eleven packages, and the ceilings put back on two of them after the install."
    from: "nothing states a version and nothing should: a dependency's version is not a fact the base holds. Written blind, nine carried a caret on the major line and two — `@anthropic-ai/sdk`, which is pre-1.0 where a caret pins the minor, and `secretlint`, whose major cadence could not be read from an empty tree — carried a floor and no ceiling rather than a guess that would fail to resolve. The install settled both at 0.115.0 and 13.0.4, and both are now capped at the major that resolved."
  - inferred: "`\"noEmit\": true` in the compiler configuration, and `\"typecheck\": \"tsc\"` rather than `tsc --noEmit` in the manifest."
    from: "the registry declares five commands and none of them builds — the only compiler invocation it names is the `typecheck` step — so this project emits nothing today, and inventing an `outDir` would declare a build nobody asked for. Stating it in the configuration keeps one home for the fact, so a bare `tsc` cannot scatter `.js` beside sources."
  - inferred: "`\"esModuleInterop\": true` and `\"skipLibCheck\": true`."
    from: "`pg`, which STK-05 makes the only way to the database, publishes CommonJS, and under `NodeNext` a default import of it type-checks only with interop on. `skipLibCheck` follows from criterion 3: no `@types/*` package may be declared here, so a full check of third-party declarations would fail the typecheck step over files this project is forbidden to correct."
  - inferred: "the package identity — `\"name\": \"backend-node-service\"`, `\"version\": \"0.0.0\"` and `\"private\": true`."
    from: "no artifact names this package, and nothing declares a publish step or a registry to publish to, so `private` states what is true and makes the version inert; the name is the one this project already gives the service in the `standard:` field of the registry these two files were written from."
  - inferred: "the scope of the `lint` and `secret-scan` scripts, `src` in both."
    from: "every rule those two steps decide states `under: src` in its `applies_to`, so scoping the scripts to `src` runs each tool over exactly the files the rules it decides reach — and keeps a secret scan out of `knowledge/`, `work/` and `delivery/`, which hold no source."
deferred:
  - what: "the `lint` step cannot decide the twenty rules the pinned registry assigns it, and cannot pass over typed source at all: ESLint's only parser is espree, which cannot parse TypeScript, while every rule that step decides scopes `under: src, suffix: .ts`. It also refuses to start without an `eslint.config.*` file."
    why: "the fix is a TypeScript parser for ESLint, which the pinned registry does not authorize, and the eleven it authorizes are the whole of what a delivery may add. A registry's dependency list is where a human's approval of a package lives, so this is settled by editing the registry, not by an implementer finding a reason. It was settled that way after this source was written, and the registry now carries `typescript-eslint` — which this record does not pin, because it is not what this source was written against."
  - what: "the `secret-scan` step would decide nothing if it ran: secretlint ships the runner and no rules, so SEC-02 and SEC-03 would report clean over a file holding a credential."
    why: "the only configuration writable within the authorized eleven is an empty ruleset, which is a green step that checks nothing. Worth recording for whoever settles it: the configuration needs no new artifact — `@secretlint/config-loader` reads a `secretlint` field from `package.json`, which this task already produces — once a rule package is authorized."
  - what: "`@types/node` is not among the eleven packages the pinned registry authorizes, so the `typecheck` step will not resolve Node's own globals once source reads the environment, which STK-08's `seen_at` at `src/config/env.ts` says it does."
    why: "declaring it would breach criterion 3. The way out is the registry admitting it, which is not this task's to edit."
  - what: "no eslint configuration, no secretlint configuration and no vitest configuration exist in this tree."
    why: "the task's `produces` names two paths and no criterion asks for a tool configuration; criteria 4 through 7 ask only that scripts exist that run the tools. Writing one here would widen a task that writes two files into one that authors this project's lint, secret-scan and test policy."
  - what: "the install wrote `package-lock.json` and `node_modules/` at the repository root, and neither `produces` nor any criterion names either."
    why: "the registry's `dependencies` description leans on a committed lockfile, but nothing in this task holds the delivery to committing one, and what enters git is not an implementer's decision."
  - what: "`src/` does not exist, so nothing this delivery wrote falls in the scope of any rule the registry declares."
    why: "this task writes the substrate the registry presupposes; the source under `src/` is what the plan's other tasks write. Creating a placeholder there to give a check step something to run over would be source no task planned, standing in for work not yet done."
---

## What it is

The manifest and the compiler configuration the registry names in its `presupposes` block, written at the target source root, which held neither.
The manifest carries the module type one rule depends on, the four scripts the registry's steps are run as, and the eleven direct dependencies it authorized when this was written.
The compiler configuration carries the strict setting two rules require and the module resolution mode that decides whether an extensionless relative import resolves at all.
Together they are what makes the registry applicable to source: while they were absent, thirty-four of its rules and two of its rules respectively applied to nothing, and `deliver.py --standard … --against .` now reports both as standing.

## Notes

This record is a substrate record and must not be read as a project that builds.
The run it points at captured the install step alone, which is the whole of what this delivery owes: a step decides a rule over a file, this delivery wrote no file any rule's scope reaches, and a check run over an empty `src` would decide nothing whether it exited green or red.
What holds this substrate up is the first delivery that writes source over it, whose build is full — typecheck, lint and secret-scan included.
The install is not that accident: it says the manifest is well formed and the dependencies it names resolve, which is the whole of what can be decided about a substrate before there is source.
No proof record sits beside this one, and none should: there is no source for a test to reach, and every entry of a proof written here would be a test that cannot be said to fail for a stated reason.
This task binds no base node, so this record answers for none — the base holds no node for a manifest or a compiler configuration and should not, which the task's own `rationale` says.
An earlier run at `run/published-case-project-substrate-build` captured four steps and failed at the second with TS18003 over an empty `src`; it keeps its name and its log, and it is what the exemption above was reasoned from.
The standard this record pins is the copy taken before the registry was amended, and it authorizes eleven packages rather than the fourteen the project's registry now carries — the pin says which text this source was written against, and the three packages added afterwards are recorded under `deferred` rather than declared in the manifest.
`NodeNext` was chosen over `node10` and `classic` because the binding's note in the task warned that either satisfies criteria 8 through 10 exactly as written while resolving extensionless relative imports in a way that does not run under the `"type": "module"` criterion 1 requires.
