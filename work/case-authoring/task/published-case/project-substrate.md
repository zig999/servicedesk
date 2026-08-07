---
title: The manifest and the compiler configuration the standard presupposes
summary: The two artifacts the project's standard registry presupposes and the target source root does not hold — `package.json` and `tsconfig.json` — written with the declarations the registry says its rules read from them.
rationale: "This task binds no base node, and that is what it should do: it answers to no base node because no node of the base holds a manifest or a compiler configuration and none should — the base is what the business decided, and how this project is built is not. The decomposition cut it as one task rather than two because the manifest and the compiler configuration are one decision about how this project is built and neither is falsifiable without the other — the `typecheck` script the manifest declares runs the compiler the configuration configures, and the strictness the configuration turns on is decided by a compiler the manifest installs — so split in two neither half would be independently demonstrable. It sits under this epic because a task's identity is its path and every task sits under exactly one epic, because no epic could honestly be cut for it when an epic must claim at least one base node and there is none to claim, and because this is the epic whose tasks put the case's own constructs into the target source root that the compiler configuration scopes itself to; no base node makes that choice, so the decomposition did."
sources:
  - intake/escopo-substrato.md
objective: The target source root holds the `package.json` and `tsconfig.json` the standard registry presupposes, each carrying what the registry states its rules read from it, so that the install step completes and the registry's four check steps have a script and a compiler configuration to run as.
criteria:
  - "`package.json` sits at the target source root and declares `\"type\": \"module\"`."
  - "`package.json` declares each of the eleven packages the registry authorizes — fastify, @modelcontextprotocol/sdk, pg, jose, zod, pino, @anthropic-ai/sdk, vitest, typescript, eslint and secretlint — as a direct dependency."
  - "`package.json` declares no direct dependency the registry does not authorize."
  - "`package.json` declares a `test` script that runs the suite under vitest."
  - "`package.json` declares a `typecheck` script that runs the TypeScript compiler."
  - "`package.json` declares a `lint` script that runs eslint."
  - "`package.json` declares a `secret-scan` script that runs secretlint."
  - "`tsconfig.json` sits at the target source root and turns the compiler's strict setting on."
  - "`tsconfig.json` states a module resolution mode, so whether an extensionless relative import resolves is decided by the file rather than by a default."
  - "`tsconfig.json` takes `src` as the directory it compiles, which is the directory every rule of the registry names in its `applies_to`."
  - "`npm install`, the command the registry declares as its install step, completes over the written manifest."
produces:
  - package.json
  - tsconfig.json
---

## What it is

The manifest and the compiler configuration the registry at `standards/backend-node-service.yaml` names in its `presupposes` block, written at the target source root, which holds neither.
The manifest carries the module type one rule depends on, the four scripts the registry's steps are run as, and the eleven direct dependencies it authorizes.
The compiler configuration carries the strict setting two rules require and the module resolution mode that decides whether an extensionless relative import resolves at all.
Together they are what makes the registry applicable to source: while they are absent, thirty-four of its rules and two of its rules respectively apply to nothing.

## Notes

The registry's `presupposes` block names two paths and only two, so `produces` names those two and nothing else.
A lockfile is what the install step records rather than an artifact the registry presupposes, so it is not named in `produces`.
A tool's own configuration file is likewise not among the two the registry presupposes, and this task names none.
The criterion over the compiled directory reads the `under: src` scope every rule's `applies_to` states, which the inventory records as what a source root chosen elsewhere would put the whole registry out of reach of.
This task declares no dependency on another task of this plan, and no other task declares one on it.
An edge from every task of the plan to this one would be a fact somebody keeps true by hand, and the refusal `/implement-task` already performs over an absent presupposition is what makes it unnecessary.
From the binding — no candidate governs this task, and the binding is empty: all twenty-six read as the diagnostic-cases domain, and not one states anything about a package manifest, a compiler configuration, a dependency, a script, a module resolution mode or a source-root layout.
From the binding — every fact the eleven criteria turn on is read from `standards/backend-node-service.yaml`, which is this project's arrangement of its own source and by the contract's own line not what the business decided.
From the binding — criterion 1 traces to that registry's `presupposes` entry for `package.json`, criteria 2 and 3 to its `dependencies` allowlist, criteria 4 through 7 to its `commands`, criteria 8 through 10 to its `presupposes` entry for `tsconfig.json`, and criterion 11 to its `install` step.
From the binding — binding a domain node here to avoid an empty list would hand the executor a node that answers no criterion and would drag its gap triage onto a task that writes two files.
From the binding — criterion 9 requires a module resolution mode without naming which, inheriting the registry's own silence, so a `tsconfig.json` declaring `"moduleResolution": "classic"` or `"node10"` satisfies criteria 8, 9 and 10 exactly as written yet resolves extensionless relative imports in a way that does not run under the `"type": "module"` criterion 1 requires.
From the binding — that is the wrong implementation that passes, and it is classed advisory only because this task binds no base node and the base therefore refuses nothing.
From the binding — criterion 10's justification clause overstates: the registry's rules name eight distinct scopes, `src`, `src/factories`, `src/types`, `src/config`, `src/errors`, `src/clients`, `src/migrations` and `src/__tests__`, all of which sit under `src`, so the falsifiable half of the criterion stands as written while the clause explaining it does not.
From the binding — twenty-three of the registry's rules are decided by the `lint` and `secret-scan` steps, and neither eslint nor secretlint has any rule configuration in this tree to decide them by, so criteria 6 and 7 are met by a script invoking a tool configured to check nothing.
From the binding — no task in this plan produces an eslint or a secretlint configuration, and whether one belongs here in `produces` or in a separate cut is the caller's to decide.
From the binding — the registry's `dependencies` description leans on a committed lockfile and `npm install` under criterion 11 writes one, yet neither `produces` nor any criterion names it, so nothing holds the delivery to committing it.
From the binding — this task binds none of its epic's covered nodes and contributes nothing to the coverage reconciliation, so every one of the twenty-six candidates must still be bound by one of the epic's other tasks or declared in the epic's `uncovered`.
