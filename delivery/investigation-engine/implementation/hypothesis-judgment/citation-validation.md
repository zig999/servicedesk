---
title: Citation structural validation
summary: A pure, synchronous check, isCitationValid, acceptedCitations and their helpers, that accepts a proposed citation only when its concept belongs to the judged hypothesis's own collects and its field exists in the output schema of the capability that produced the cited evidence, refusing every other citation without ever throwing.
task: sha256:c92d0161860188e4b5eabfb5a2c25b8624dc6db16723fba8a8d5c67227170f4e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/hypothesis-judgment-citation-validation-build
files:
- path: src/investigation/citation-validation.ts
  effect: Declares CapabilityOutputSchemas, capabilityOutputSchemaKey, HypothesisCitationContext, isCitationValid, ValidateCitationsOptions and acceptedCitations, plus private helpers (citesACollectedConcept, citesADeclaredField, declaredFieldsOf, parseJsonOrUndefined, isPlainObject) that together check one proposed citation, or a proposed set of them, against a hypothesis's own collects and its evidence's capabilities' output schemas, reading a JSON-Schema-shaped output_schema structurally and answering no declared fields, never throwing, for anything unparseable, fieldless, or missing evidence/schema entirely.
criteria:
- criterion: A citation naming a concept outside the judged hypothesis's collects is refused.
  met: true
  how: citesACollectedConcept(collects, citation) answers collects.includes(citation.concept); isCitationValid AND-combines it with rule 2, so a citation whose concept is absent from collects is false regardless of its field, and is excluded by acceptedCitations's filter.
- criterion: A citation naming a field absent from the output schema of the capability that produced the cited evidence is refused.
  met: true
  how: citesADeclaredField finds the Evidence entry sharing the citation's concept, builds capabilityOutputSchemaKey(capability_name, capability_version) from it, and checks citation.field against declaredFieldsOf(outputSchemas[key]), the parsed schema's top-level properties keys. A field not among them (or a concept with no matching evidence, no schema entry, or an unparseable/fieldless schema) answers false, refusing the citation without throwing.
- criterion: A citation naming a concept in the hypothesis's collects and a field present in that capability's output schema is accepted.
  met: true
  how: when citesACollectedConcept and citesADeclaredField both answer true, isCitationValid answers true and acceptedCitations keeps the citation in its returned array, in proposed order.
nodes:
- node: domain/investigation/citation
  encoded_at:
  - src/investigation/citation-validation.ts
  how: the node's own Responsibility, point at exactly one place in the evidence that grounds a verdict, machine-checkable by construction, is exactly what isCitationValid performs over Citation's two declared attributes, concept and field, checking each against the data the node's own Description names (the hypothesis's collects, the producing capability's output schema).
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  encoded_at:
  - src/investigation/citation-validation.ts
  how: citesACollectedConcept(collects, citation) is exactly the rule's statement, every concept an evaluation cites belongs to the collects of the hypothesis it judges, checked as a plain array membership test with no side effect and no exception path.
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  encoded_at:
  - src/investigation/citation-validation.ts
  how: citesADeclaredField locates the cited evidence, derives its producing capability's identity, and checks the citation's field against that capability's own output schema's declared fields via declaredFieldsOf, every field a citation names exists in the output schema of the capability that produced that evidence, with an absent, malformed or fieldless schema (or missing evidence) uniformly answering no fields declared rather than raising a fault, per this task's own recorded inference.
inferences:
- inferred: output_schema is read as a JSON-encoded JSON Schema object, and a field exists in it means the field name is a key of that object's top-level properties.
  from: decision-log.md's own entry for domain/integration/capability.md's output_schema field states only that a schema is carried as its serialized declaration and what reads it is the citation check, leaving the concrete format undecided; every existing fixture uses an opaque placeholder never parsed by any delivered code. JSON Schema is the literal, conventional meaning of output schema for a data contract, and its properties object is the standard place field names are declared, so this is the most direct structural reading available rather than an invented format.
- inferred: an output_schema that is not parseable as JSON, or that parses but holds no top-level properties object, is treated as declaring no fields at all, so any citation naming a field against it is refused, and declaredFieldsOf never throws.
  from: 'the task''s own explicit instruction that a malformed schema should be treated as declaring no fields rather than throwing, since a malformed schema is exactly the kind of infrastructure/data-quality fact this pure check should never crash over. Generalized to the sibling case of a concept whose evidence carries no matching output-schema entry at all (or whose evidence is altogether absent), for the same reason: neither is a fault this pure check has any representation for, and both are, structurally, no fields to cite.'
- inferred: a citation whose concept has no matching entry in the supplied evidence array is refused (rule 2's defensive branch), rather than treated as an automatic pass-through or a thrown error.
  from: rule 2's own text, the capability that produced the cited evidence, presupposes that evidence exists to name a producing capability from; domain/investigation/citation's Responsibility, point at exactly one place in the evidence that grounds a verdict, makes the same presupposition. Where no such evidence entry exists, there is no capability and no schema to check the field against, so this collapses into the same no fields declared defensive path as a malformed schema, by the same non-throwing convention.
- inferred: the input shape is HypothesisCitationContext = { collects, evidence, outputSchemas }, with outputSchemas a plain record keyed by capabilityOutputSchemaKey(capability_name, capability_version), never a map keyed by concept alone, and never a map from concept to the full Capability type.
  from: the task's own menu of options narrowed toward a capability-identity key rather than a concept key, because rule 2's own text binds the field check to the capability that produced the cited evidence specifically, its own name-and-version identity, exactly the capability_name/capability_version pair Evidence already carries for this stated reason, not to whichever capability a live, later registry read would currently answer for that concept. A concept-keyed map would leave Evidence's capability_name/capability_version fields entirely unread by this check. The '::' composite-key join mirrors idempotency-key.ts's own established convention for a multi-field lookup key in this codebase. collects is taken as the plain array rather than the Hypothesis or Case type, and outputSchemas' values are plain strings rather than the Capability type, per this task's own ADVISORY note that this check takes a hypothesis's collects and a capability's output schema as already-available plain data and models neither.
- inferred: the batch entry point (acceptedCitations) and the per-citation predicate (isCitationValid) each take at most two positional parameters, bundling collects/evidence/outputSchemas into one HypothesisCitationContext object (and, for the batch call, citations alongside them in one ValidateCitationsOptions) rather than passing each as a separate argument.
  from: the project's standard's max-params rule, enforced by eslint's max-params:3 rule in src/eslint.config.js; and the established convention already in this same directory, collectEvidence(options) in src/investigation/evidence-collection-stage.ts, which bundles its own several inputs into one options object the same way.
deferred:
- what: assembling an Evaluation, deciding a verdict, or constructing an EvaluationReason from a citation's acceptance or refusal.
  why: belongs to task/hypothesis-judgment/judgment-stage, per the task's own REMAINDER notes on rules/investigation/a-decided-evaluation-cites-evidence and rules/investigation/an-inconclusive-evaluation-declares-its-reason; this task answers only whether one proposed citation, or a set of them, is structurally valid.
- what: retrying a judgment call, or falling back to inconclusive with reason judgment-failure, when a foreign or unbacked citation is found.
  why: scenarios/investigation/a-foreign-citation-is-refused's retry-or-fallback clauses are orchestration; this task's own ADVISORY note assigns them to task/hypothesis-judgment/judgment-stage, and acceptedCitations only reports which citations survive, deciding nothing about what happens next.
- what: the prose-versus-mechanical judgment reasoning a real evaluator adapter performs when it decides what to cite.
  why: rules/investigation/judgment-does-not-infer binds the judgment call's own reasoning, not the structural well-formedness of a citation already proposed, per the task's own REMAINDER note; belongs to task/hypothesis-judgment/hypothesis-evaluator-port and its future production adapter.
- what: any pool, deadline slot, or per-hypothesis isolation over many judgment calls.
  why: rules/investigation/no-stage-aborts-on-its-deadline's judgment clause and constraints/hypotheses-are-judged-in-isolated-parallel-calls both govern orchestration this task's own REMAINDER/ADVISORY notes assign to task/hypothesis-judgment/judgment-stage; nothing here runs under a pool or a deadline.
- what: enforcing one-evaluation-per-required-hypothesis, or assembling an investigation's whole set of evaluations.
  why: belongs to task/investigation-lifecycle/investigation-factory, per the task's own REMAINDER note; this task never assembles an investigation.
- what: resolving a capability's output_schema from a live capability-registry read, or wiring this module into any factory or production consumer.
  why: this check's own inputs are already-resolved plain data by design (constraints/the-domain-depends-on-no-infrastructure, and the task's own instruction that this module imports no ICapabilityQuery and makes no async call); which task builds and calls that resolution, and where CapabilityOutputSchemas gets populated from, is task/hypothesis-judgment/judgment-stage's to decide, no consumer of this module exists anywhere in the tree yet.
---

## What it is

The check that makes a citation's validity machine-checkable rather than a promise. It reads the judged hypothesis's own collects and the cited capability's output schema, never anything else.

## Notes

The UNDERDETERMINED note on import-freedom is resolved by construction: the module imports only citation.js and evidence.js, no port, framework, driver or provider client. The genuinely unstated output_schema format is decided as an inference (JSON Schema, field existence via top-level `properties` keys), recorded above with a defensive, never-throwing fallback for anything malformed or absent.
