---
title: The immutable investigation factory, proved
summary: Fifteen tests over buildInvestigation()'s totality refusals (both directions, both rules), its replay pinning, its plain-value shape, its defensive copies, and the six files it and its sibling types add reaching no infrastructure.
implementation: sha256:41272304a0547add8efefb95d114815e23bdbe61781b322fa7bbba883b39d6f3
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/investigation-lifecycle-investigation-factory-suite
tests:
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses to build when a collection-plan concept has no matching evidence
  proves: Criterion 1 (missing-evidence sub-case), also exercises the inference that buildInvestigation() takes the whole Case and derives the plan from it via collectionPlan(theCase).
  fails_when: buildInvestigation() builds the investigation instead of refusing, or the thrown error's violations do not name the concept with zero matching evidence.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses to build when an evidence entry names a concept the collection plan does not hold
  proves: Criterion 1, the extraneous-evidence sub-case.
  fails_when: an evidence entry naming a concept outside the case's collection plan is silently accepted, or the refusal's violations omit or misname it.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses to build when a collection-plan concept has more than one matching evidence entry
  proves: Criterion 1, together with the implementation's own inference that a concept with more than one matching evidence entry is refused as its own violation category.
  fails_when: two evidence entries naming the same in-plan concept are accepted without refusal, or the reported violation does not name that concept and its count.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses to build when a required hypothesis has no matching evaluation
  proves: Criterion 2 (missing-evaluation sub-case).
  fails_when: buildInvestigation() builds the investigation instead of refusing, or the thrown error's violations do not name the hypothesis with zero matching evaluations.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses to build when an evaluation names a hypothesis the case does not require
  proves: Criterion 2, the extraneous-evaluation sub-case.
  fails_when: an evaluation naming a hypothesis the case does not require is silently accepted, or the refusal's violations omit or misname it.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses to build when a required hypothesis has more than one matching evaluation
  proves: Criterion 2, together with the implementation's own inference that a required hypothesis with more than one matching evaluation is refused as its own violation category.
  fails_when: two evaluations naming the same required hypothesis are accepted without refusal, or the reported violation does not name that hypothesis and its count.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: refuses once, naming every violation from both the evidence and the evaluation totality checks together
  proves: the edge case that a build violating both totality rules at once refuses with every violation from both named together in the one thrown error, not just the first found.
  fails_when: the build stops after the evidence check and never runs the evaluation check (or vice versa), or the two checks throw two separate errors instead of joining into the one InvestigationNotBuildableError.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: pins the case by exactly slug, version and hash, never the whole case
  proves: Criterion 3, the pinned_case half, together with the implementation's two inferences on field shape and naming.
  fails_when: pinned_case carries any attribute of the case beyond slug/version/hash, or is flattened, or is spelled differently, or its values depart from the given case's own.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: copies model, prompt_version and evidence straight from the given options, unchanged
  proves: Criterion 3, the model, prompt_version and evidence pins.
  fails_when: model or prompt_version is not carried through unchanged from the given options, or the built evidence's own content departs from what was given.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: answers a plain data object carrying no method, so nothing on the value itself could mutate it after construction
  proves: Criterion 4, the plain-value, no-method half.
  fails_when: buildInvestigation() answers a class instance rather than a plain object literal, or any own property of the built value is a function.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: does not throw when the evidence covers the collection plan and the evaluations cover the required hypotheses exactly once each
  proves: the edge case that a successful build with correct evidence and evaluations does not throw.
  fails_when: buildInvestigation() throws for an evidence/evaluations pair that exactly covers the collection plan and the required hypotheses once each.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: copies the given evidence array rather than holding onto it, so mutating the original array afterwards leaves the built value unchanged
  proves: the edge case that the built investigation's evidence array is a defensive copy.
  fails_when: buildInvestigation() holds the given evidence array by reference rather than copying it.
- file: src/__tests__/unit/investigation/investigation-factory.spec.ts
  name: copies the given evaluations array rather than holding onto it, so mutating the original array afterwards leaves the built value unchanged
  proves: the edge case that the built investigation's evaluations array is a defensive copy.
  fails_when: buildInvestigation() holds the given evaluations array by reference rather than copying it.
- file: src/__tests__/unit/investigation/investigation-factory-modules.spec.ts
  name: subject.ts, cost.ts, durations.ts, investigation.ts, investigation-factory.ts and investigation-not-buildable.error.ts import no framework, driver or provider client
  proves: Criterion 5, together with constraints/the-domain-depends-on-no-infrastructure over every file this task delivered.
  fails_when: any of the six files gains a static, re-export or dynamic import of a framework, driver or provider client from the denylist.
- file: src/__tests__/unit/investigation/investigation-factory-modules.spec.ts
  name: subject.ts, cost.ts, durations.ts, investigation.ts, investigation-factory.ts and investigation-not-buildable.error.ts import nothing from the standard library, so infrastructure cannot be reached from any of them directly
  proves: constraints/the-domain-depends-on-no-infrastructure over every file this task delivered.
  fails_when: any of the six files gains an import of a Node standard-library module.
not_applicable:
- edge_case: a case with an empty collection plan or zero required hypotheses
  why: rules/knowledge/a-case-has-at-least-one-hypothesis and rules/knowledge/a-hypothesis-collects-at-least-one-concept guarantee both are always non-empty by the time a case reaches this factory; producing a Case violating them reaches outside this task's own boundary.
- edge_case: two operations against one subject at once
  why: buildInvestigation() is a pure, synchronous function of its own arguments with no shared mutable state across calls.
- edge_case: a dependency that fails or answers slowly
  why: criterion 5 and the module audit establish that the factory calls nothing but pure, synchronous functions over the given Case, there is no dependency here that could fail or run slowly.
- edge_case: an operation attempted against state that forbids it
  why: buildInvestigation() holds no persisted or mutable state of its own; one call either satisfies totality or is refused before anything is constructed.
- edge_case: absent, malformed or type-violating input (e.g. evidence that is not an array, a case missing a required attribute)
  why: BuildInvestigationOptions is a statically typed interface enforced by the compiler at every call site in this codebase; no runtime boundary parses external input inside this factory.
untested:
- criterion 4's immutable half. TypeScript's readonly declarations are a compile-time fact enforced by the project's own strict typecheck step (tool-decided); vitest transpiles without type-checking, so a test that can only ever pass under its own runner would not be a test of the fact it claims to prove, so none is written here.
- that buildInvestigation() copies id, requester, ticket_ref, narrative, subject, cost, durations and assessment onto the built value unchanged. No stated criterion names these individually, criterion 3 names only the four replay pins, so their pass-through beyond what the type system already forces is not asserted by a dedicated test here.
- both import-audit tests read only static and dynamic import specifiers matched from source text by a regular expression; a module reached through a computed specifier, a global, or a helper defined outside these six files would evade them.
- the forbidden-package denylist is a finite list of known packages; a framework, driver or provider client not on that list would pass the audit undetected.
divergences:
- cites: TST-04
  file: src/__tests__/unit/investigation/investigation-factory-modules.spec.ts
  departure: the audit file mirrors the src/investigation directory, plus one file under src/errors, rather than a single unit, it sweeps six files across two directories at once.
  why: an import audit has no one unit to mirror; the file follows the layout precedent draft-assessment-text-modules.spec.ts and case-document-modules.spec.ts already established for the same task-scoped audit pattern in this tree.
- cites: MNT-03
  file: src/__tests__/unit/investigation/investigation-factory-modules.spec.ts
  departure: the import-specifier regex, the forbidden-package list, isStandardLibrary/isForbiddenPackage/offendersAmong and the reading loop are copied from draft-assessment-text-modules.spec.ts and case-document-modules.spec.ts rather than called from a shared module.
  why: importing a spec file from another spec file registers its tests twice under vitest, and extracting a shared helper module would rewrite two prior tasks' proofs, which is not this proof's to touch, the duplication is disclosed so the lists are reconciled deliberately when any of the three files changes.
---

## What it is

Unit tests proving the investigation factory's five criteria across both totality rules, the replay pins, plain-value shape and defensive copying, plus the import-purity sweep over every file this task delivered.

## Notes

None.
