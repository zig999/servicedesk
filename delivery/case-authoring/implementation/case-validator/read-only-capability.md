---
title: "Every collected concept has a read-only capability"
summary: "The publication check that refuses a case under edit when any concept it collects has no registered read-only capability declaring an output schema and a timeout, deciding purely from records handed to it."
task: sha256:c9d9f9aeb8694e0b43facfa87fcf07f7fbf8b7792d14410b38f5b6fb49f09923
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/integration/capability.ts
    effect: "declares the Capability shape (definition/integration/capability) — name, version, the concept it answers bound by identity, its nature typed as the one-member enum 'read-only', its timeout and its embedded output schema — with no constructor, in a new src/integration/ directory that extends the context-named source layout to the integration context for the first time"
  - path: src/knowledge/every-collected-concept-has-a-read-only-capability.ts
    effect: "exports createEveryCollectedConceptHasAReadOnlyCapabilityCheck(capabilities), a factory that closes over a given list of Capability records and returns a PublicationCheck. Over a draft case it walks every hypothesis's collects list and refuses once per collected concept for which no given capability's own declared concept compares equal to it under exact character comparison while also declaring nature read-only, an output schema and a timeout — never calling anything, only reading what it was handed"
criteria:
  - criterion: "A case collecting a concept that no capability answers is refused by this check."
    met: true
    how: "isAnsweredByARegisteredReadOnlyCapability returns false when no given capability's concept matches the collected concept's name at all, so the outer loop pushes a refusal naming the rule, the hypothesis and the concept as the offended term"
  - criterion: "A case collecting a concept whose answering capability is not read-only is refused by this check."
    met: true
    how: "the same predicate requires capability.nature === 'read-only' as one of its four conjuncts; a capability naming the concept but declaring a different nature fails that conjunct, the predicate returns false, and the concept is refused the same way an unanswered one is"
  - criterion: "A case whose every collected concept is answered by a read-only capability is not refused by this check."
    met: true
    how: "where, for every collected concept, some given capability names it, declares nature read-only, and declares both an output schema and a timeout, the predicate returns true for every concept and the loop pushes no refusal; the check answers a frozen empty list"
  - criterion: "Deciding this check over a case invokes no capability."
    met: true
    how: "the factory only ever reads the capabilities array it was constructed with — property access and array iteration, no call, no fetch, no derivation from the case's subject. The module's doc comment states this explicitly as the reason the capabilities are a factory parameter rather than something the check goes and gets"
nodes:
  - node: aggregate/knowledge/cases
    how: "honored rather than encoded: the check is written as one PublicationCheck meant to run as part of the whole case's contract checks at publication, taking the whole draft case as its only case-shaped input, never a hypothesis in isolation"
  - node: definition/knowledge/case
    how: "not reached directly — the check runs over the case under edit, before a case exists. Its shape governs only through draft-case.ts, which mirrors it. The task's waived gap, attributes.version.derivation, is untouched: this check reads what a case collects and refuses before publication assigns a version"
  - node: definition/knowledge/draft-case
    encoded_at:
      - src/knowledge/every-collected-concept-has-a-read-only-capability.ts
    how: "encoded as the check's parameter type: the function reads exactly draftCase.hypotheses and, through each hypothesis, its collects list, and walks an empty hypotheses list without throwing, the same safety draft-case.ts documents as deliberate"
  - node: definition/knowledge/hypothesis
    encoded_at:
      - src/knowledge/every-collected-concept-has-a-read-only-capability.ts
    how: "encoded by walking hypothesis.collects (concept names bound by identity) and naming hypothesis.name as the refusal's position — nothing else of the hypothesis is read"
  - node: definition/glossary/concept
    how: "only the identity (the name) is read, as the string carried in a hypothesis's collects list; this check never looks the concept up in the glossary and reads none of its own declared facts — those are the sibling checks' concern per the task's REMAINDER note. The task's waived gap, attributes.ttl.unit, is untouched: this check never reads a ttl"
  - node: definition/integration/capability
    encoded_at:
      - src/integration/capability.ts
      - src/knowledge/every-collected-concept-has-a-read-only-capability.ts
    how: "capability.ts declares the shape in full — name, version, concept, nature, timeout, outputSchema — matching the node's attributes exactly, including the timeout's unit gap (never interpreted, only carried, per the task's waived gap on attributes.timeout.unit). The check module reads capability.concept, .nature, and the presence of .timeout and .outputSchema; it constructs nothing and calls nothing"
  - node: rule/knowledge/every-collected-concept-has-a-read-only-capability
    encoded_at:
      - src/knowledge/every-collected-concept-has-a-read-only-capability.ts
    how: "the check's refusal condition is exactly the rule's stated sentence: a capability answers a concept only where it is registered (named among the given capabilities), read-only, and declares both an output schema and a timeout — all four conjuncts of isAnsweredByARegisteredReadOnlyCapability, not only the read-only one the criteria alone would have tolerated"
inferences:
  - inferred: "this check enforces the rule's full statement — requiring a matching capability to also declare an output schema and a timeout, not merely to exist and be read-only — even though no criterion by itself reaches the declaring clauses"
    from: "the task's first UNDERDETERMINED note, which states directly that a check accepting a read-only capability without reading that it declares an output schema and a timeout is what the rule's own statement refuses, and directs reading the rule's full statement rather than the criteria alone"
  - inferred: "a collected concept's name is matched against a capability's declared concept by exact character comparison (===), with no case folding or normalisation of any kind"
    from: "the task's second UNDERDETERMINED note, the base's identity convention that a capability's concept is bound by the concept's name, and rule/glossary/a-lookup-matches-a-published-name-exactly together with its encoding in src/glossary/lookup.ts, which the note reads as evidence the whole system compares names one way"
  - inferred: "presence of a capability's outputSchema and timeout fields is read with the `in` operator against the actual record handed to the check, never inferred from the Capability type's own required fields"
    from: "the convention established in src/knowledge/every-collected-concept-declares-a-ttl.ts, which states the same reasoning explicitly: a type's required field is a promise about a well-formed registration, and holding an actual registration to that promise is the check's job, not the type's"
  - inferred: "the Capability shape lives in a new src/integration/ directory rather than inline in the check module, and models no separate identity type for the name+version pair the base declares as the capability's identity"
    from: "the inventory's convention that source directories are named for the base's contexts and hold one file per base node (three directories observed, now extended to a fourth as the integration context is touched for the first time); the identity type is omitted because nothing in the tree yet binds a capability by that identity, so inventing one would be building past what this task needs"
  - inferred: "the check takes the registered capabilities as a plain readonly Capability[] rather than a named wrapper type, unlike the PublishedGlossary the glossary-consuming sibling checks take"
    from: "PublishedGlossary bundles five distinct lookups several checks share; a capability list is consumed by this one check alone within this task's scope, so a wrapper type would add a name for a shape nothing else needs — the same reasoning that keeps src/glossary/observation-field.ts a bare shape"
deferred:
  - what: "whether a collected concept is one the glossary publishes, declares a ttl for, declares fields for, or accepts the case's subject type"
    why: "the task's REMAINDER note assigns these to the sibling validation checks (terms-exist-in-the-glossary, every-collected-concept-declares-a-ttl, concept-accepts-the-declared-subject-type, and the citation check of the answering epic); this check reads only the capability-answering clause"
  - what: "how this check's refusal is assembled with others, ordered, or deduplicated across the run"
    why: "the task's final Notes entry assigns the every-refusal rule, the refusal construct and the two-positions rule to validation-run's own binding; this check only had to be writable as a PublicationCheck under them, which it is"
  - what: "whether two capabilities could ever answer the same concept, or how a fallback between them would be chosen"
    why: "outside this task's objective and criteria; the capability definition node states this never arises today, and the check's .some() match is correct whether one or several capabilities happen to name the same concept"
---

## What it is

The check that holds the contract between curated knowledge and integration at the moment a case is validated — a refusal decided from what is recorded about a capability, never from calling one.

## Notes

The last criterion is what the base's statement that the contract is checked when publishing and not when running amounts to as an observable property of this check.
The standard was read in full and no rule reaching these files was departed from, though its typecheck rule remains unrunnable while the tree has no toolchain.
