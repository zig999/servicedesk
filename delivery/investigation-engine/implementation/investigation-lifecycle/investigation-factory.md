---
title: The immutable investigation factory
summary: Adds buildInvestigation(), the one place that validates evidence/evaluation totality against the pinned case and assembles the whole, immutable Investigation from already-completed stage outputs, plus the canonical Subject, Cost and Durations value types and the typed totality-refusal error it throws.
task: sha256:0603d06821c1f541a9bd7749ebec0ace36523f44736c796deead7c79e2783913
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/investigation-lifecycle-investigation-factory-build
files:
- path: src/investigation/subject.ts
  effect: declares the canonical Subject value type (type, id) for domain/investigation/subject
- path: src/investigation/cost.ts
  effect: declares the Cost value type (calls, input_tokens, output_tokens) for domain/investigation/cost
- path: src/investigation/durations.ts
  effect: declares the Durations value type (collection, judgment, writing, total) for domain/investigation/durations
- path: src/investigation/investigation.ts
  effect: declares PinnedCase (slug, version, hash) and the whole Investigation aggregate type, composing Subject, PinnedCase, Evidence[], Evaluation[], Assessment, Cost and Durations
- path: src/errors/investigation-not-buildable.error.ts
  effect: declares InvestigationNotBuildableError, a typed Error carrying {slug, violations} in its context, thrown once naming every totality violation together
- path: src/investigation/investigation-factory.ts
  effect: declares BuildInvestigationOptions and the exported buildInvestigation(options), which refuses on any totality violation (via evidenceTotalityViolations/evaluationTotalityViolations built on case-resolution's collectionPlan/requiresEvaluationOf) before assembling the whole, immutable Investigation value, pinning the case by slug/version/hash and copying every other attribute from options unchanged
criteria:
- criterion: The factory refuses to build an investigation whose evidence does not cover the case's collection plan exactly once per concept.
  met: true
  how: buildInvestigation() calls refuseTotalityViolations() before constructing anything; evidenceTotalityViolations() computes collectionPlan(theCase) and a per-concept count of the given evidence, and reports a plan concept with zero matching evidence, a plan concept with more than one, and an evidence entry naming a concept outside the plan. Any of these throws InvestigationNotBuildableError naming every one found, and none of these checks construct any part of the Investigation first.
- criterion: The factory refuses to build an investigation whose evaluations do not cover the case's required hypotheses exactly once each.
  met: true
  how: The same refuseTotalityViolations() call also runs evaluationTotalityViolations(), which computes requiresEvaluationOf(theCase) and a per-hypothesis count of the given evaluations, reporting a required hypothesis with no matching evaluation, one with more than one, and an evaluation naming a hypothesis the case does not require, joined into the same one InvestigationNotBuildableError as the evidence violations.
- criterion: The built investigation pins the case by slug, version and hash, the model, the prompt version and the evidence.
  met: true
  how: Once totality passes, buildInvestigation() sets pinned_case via pinnedCaseOf(theCase), exactly {slug, version, hash} read off the given Case, never the whole case, and sets model, prompt_version and evidence (defensively array-copied) straight from the given options, unchanged.
- criterion: The built investigation is a plain immutable value with no method that mutates it after construction.
  met: true
  how: Investigation is a plain TypeScript object type with every field, including every array field, declared readonly, no class, no method, matching Evidence/Evaluation/Assessment's own established shape exactly. buildInvestigation() returns one literal object built once; nothing in this tree offers a second way to obtain or alter one.
- criterion: The factory module imports no framework, driver or provider client.
  met: true
  how: investigation-factory.ts imports only case-resolution.js, case.js (type-only), investigation-not-buildable.error.js and this context's own sibling type modules, no framework, driver or provider client anywhere in its import list, and it is pure and synchronous throughout.
nodes:
- node: domain/investigation/investigation
  encoded_at:
  - src/investigation/investigation.ts
  - src/investigation/investigation-factory.ts
  how: 'investigation.ts declares every attribute the node lists plus the pinned-case relationship, materialized as pinned_case: PinnedCase; investigation-factory.ts is the one place that builds a valid instance and the one place that refuses an invalid one, per the node''s own Description.'
- node: domain/investigation/subject
  encoded_at:
  - src/investigation/subject.ts
  how: subject.ts declares the canonical Subject type (type, id) this node names, reused as the Investigation aggregate's own subject field.
- node: domain/investigation/cost
  encoded_at:
  - src/investigation/cost.ts
  how: cost.ts declares the Cost type (calls, input_tokens, output_tokens) this node names; the factory takes a fully-formed Cost as an already-given input and states nothing about how it was accumulated.
- node: domain/investigation/durations
  encoded_at:
  - src/investigation/durations.ts
  how: durations.ts declares the Durations type (collection, judgment, writing, total) this node names; the factory takes a fully-formed Durations as an already-given input.
- node: rules/investigation/one-evidence-per-collected-concept
  encoded_at:
  - src/investigation/investigation-factory.ts
  how: evidenceTotalityViolations() checks the given evidence against collectionPlan(theCase) and refuses via InvestigationNotBuildableError on any concept with zero or more than one matching evidence entry, or any evidence entry naming a concept outside the plan.
- node: rules/investigation/one-evaluation-per-required-hypothesis
  encoded_at:
  - src/investigation/investigation-factory.ts
  how: evaluationTotalityViolations() checks the given evaluations against requiresEvaluationOf(theCase) the same way, refusing on a hypothesis with zero or more than one matching evaluation, or an evaluation naming a hypothesis not required.
- node: rules/investigation/replay-is-pinned
  encoded_at:
  - src/investigation/investigation.ts
  - src/investigation/investigation-factory.ts
  how: investigation.ts's Investigation type declares pinned_case, model, prompt_version and evidence as the fields the rule names; buildInvestigation() sets pinned_case from the given case's own slug/version/hash via pinnedCaseOf(), and copies model, prompt_version and evidence straight from the given inputs.
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
  - src/investigation/subject.ts
  - src/investigation/cost.ts
  - src/investigation/durations.ts
  - src/errors/investigation-not-buildable.error.ts
  how: Every file this task added imports only sibling domain modules, no framework, no driver, no provider client, and every exported function is pure and synchronous.
inferences:
- inferred: 'The pinned-case relationship materializes as a single nested field, pinned_case: { slug, version, hash }, on the Investigation type, rather than three flat fields prefixed by the relationship''s role.'
  from: No node states the concrete field shape; evidence.ts's own capability_name/capability_version pair was the offered precedent, but that pair is flat specifically because a capability may never be resolved, and both fields default to the empty string for that absence. The pinned-case relationship carries no such absence, an Investigation is only ever built from a case that is already fully known, so there is no sentinel-value reason to flatten. Nesting groups the three pins as one relationship value, an already-established shape in this tree (Resolution nests Referral; Assessment nests Referral), and reuses Case's own field names verbatim.
- inferred: pinned_case is spelled snake_case rather than camelCase.
  from: This field is not itself a spec-declared attribute name; every sibling domain-attribute field that mirrors a spec attribute name in this tree already uses snake_case rather than the standard's own general camelCase rule, evidence.ts's capability_name/capability_version is the closest precedent for a field that materializes a relationship rather than a literal spec attribute.
- inferred: 'buildInvestigation() takes the pinned case whole (case: Case) rather than pre-extracted slug/version/hash, so it can call collectionPlan(theCase) and requiresEvaluationOf(theCase) itself.'
  from: The task's own instruction to validate totality against collectionPlan(theCase)/requiresEvaluationOf(theCase) requires the whole Case; the existing options-object convention for a Case-consuming stage was reused verbatim rather than redecided.
- inferred: A concept/hypothesis with more than one matching evidence/evaluation entry is also refused, as its own violation category.
  from: Criteria 1 and 2 state exactly once per concept and exactly once each, and the two rules both state exactly one. A duplicate entry for an in-plan concept or a required hypothesis violates the rule's own literal exactly one, so this was added as a third, symmetric category on each side.
deferred:
- what: src/investigation/observation-source.port.ts declares its own inline Subject type, structurally identical to the canonical one this task adds, rather than importing the canonical type.
  why: That file was delivered by an earlier, already-completed task whose own comment explicitly names this as a stand-in until a later task gives it a canonical home. Editing that already-delivered port would touch a file and a task outside this task's own objective, which is the factory; the duplication is real and worth unifying, but that unification belongs to whichever task next touches observation-source.port.ts.
---

## What it is

The one place that can build a valid Investigation, and the one place that refuses an invalid one. It answers a plain, already-complete value; no intermediate or partial investigation exists anywhere.

## Notes

None.
