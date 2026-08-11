---
title: Declare the Anthropic SDK and Fastify as project dependencies
summary: package.json gains @anthropic-ai/sdk and fastify, the two packages this plan's LLM adapters and HTTP surface need and the standard already authorizes.
rationale: >-
  The scope names both packages as needed by different fronts (the LLM adapters and the HTTP
  layer) but does not itself cut a task; I bundled both into one manifest edit rather than two,
  since the framework's own distributed-delivery rule requires any manifest-editing task to be
  delivered alone regardless of how many dependencies it adds, and splitting would only serialize
  two such windows for no benefit. I placed it under this epic because its own adapter is the
  first to need @anthropic-ai/sdk; every other task needing either package expresses that as a
  depends_on edge rather than bundling the edit into its own delivery. This task implements no
  specification node — its whole deliverable is package.json, and none of its four criteria
  invoke a port, assemble a prompt, produce an evaluation, or read a domain module's imports; it
  is the manifest-declaration half of this epic, not the adapter-writing half, the same shape the
  delivered `work/case-authoring-mvp/task/published-language/build-substrate.md` task already
  carries.
objective: package.json declares @anthropic-ai/sdk and fastify as dependencies, matching the standard's own authorization, and the project still builds and its existing suite still passes.
criteria:
  - package.json's dependencies list @anthropic-ai/sdk, matching STK-11's authorization to call the model only through it.
  - package.json's dependencies list fastify, matching STK-03's authorization as the only HTTP framework this standard permits.
  - The two additions are the only new dependencies; no database driver or ORM package is introduced (constraints/the-mvp-persists-to-no-database).
  - npm install succeeds and the existing typecheck, lint and test steps still pass with both declared.
sources:
  - intake/scope.md
---

## What it is

The manifest gains the two packages the standard already names but the project does not yet declare.
Nothing else in the project changes to accommodate this edit.

## Notes

domain/investigation/hypothesis-evaluator, constraints/judgment-runs-behind-a-port, constraints/the-judgment-prompt-is-closed, rules/investigation/judgment-does-not-infer, rules/investigation/a-decided-evaluation-cites-evidence and rules/investigation/an-inconclusive-evaluation-declares-its-reason each condition the hypothesis-evaluator port's behavior, the production adapter's prompt assembly, or the evaluation it returns — this task invokes no port, assembles no prompt and returns no evaluation, so no criterion here demonstrates any of them. They bind the sibling task that writes the Anthropic-backed adapter, not this manifest edit.
constraints/the-domain-depends-on-no-infrastructure conditions an audit over domain-module imports — source this task never writes; it binds the future tasks that actually import these two packages.
Criterion 3 names constraints/the-mvp-persists-to-no-database in its own text; that node sits outside this epic's covers and is not claimed here. The criterion stays demonstrable without the binding ("no database driver or ORM package is introduced" is checkable directly against the dependency list); the fact it points at belongs to whichever epic actually claims MVP-persistence scope.
Decision, beyond the covers — stand: constraints/the-mvp-persists-to-no-database is already claimed and implemented by epic/diagnose-composition-root's own task/diagnose-composition-root/wire-diagnose-runner; this task's own criterion checks the same fact locally (no database dependency added) without needing to hold the node itself.
