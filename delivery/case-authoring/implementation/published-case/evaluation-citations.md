---
title: "A decided evaluation's citations"
summary: "The Citation shape and the standalone check that a confirmed or refuted evaluation cites at least one concept and field, each by name, naming only a concept its hypothesis collects and a field that concept declares."
task: sha256:20ab1d276e7892d8eea1fa61ceb9c106df6484c517bcbd7baa6f2e9e201aec13
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/investigation/citation.ts
    effect: "declares the Citation value — a concept bound by identity (name) and a field named as a string, both by name and never by any separate identifier construct — embedded and carrying no constructor of its own, matching the tree's convention for other embedded glossary/knowledge shapes (Resolution, Referral, Concept, ObservationField)"
  - path: src/investigation/evaluation.ts
    effect: "adds the optional citations: readonly Citation[] attribute to the Evaluation type and copies it one level deeper on construction (a module-private copyCitation/copyCitations pair, following the tree's per-nesting-level copy-on-construct convention), so a confirmed or refuted evaluation constructed with citations reads them back unchanged even if the array or one of its citations is mutated afterwards; a construction giving no citations omits the key entirely rather than setting it to the absent value, which is what keeps the already-delivered evaluation-record proof's key-enumeration assertion holding. createEvaluation's own verdict/reason refusal logic is untouched"
  - path: src/investigation/a-decided-evaluation-cites-evidence.ts
    effect: "new standalone check, isRefusedForItsCitations(evaluation, hypothesis, glossary), answering whether the given evaluation is refused by rule/investigation/a-decided-evaluation-cites-evidence and the citation-scoped Rules of definition/investigation/citation alone: an inconclusive evaluation is never refused by it; a confirmed or refuted evaluation carrying no citation is; one carrying citations is refused if any citation names a concept the given hypothesis does not collect or a field the concept, read through the shared published-glossary lookup, does not declare"
criteria:
  - criterion: "An evaluation that confirms its hypothesis reads back at least one citation."
    met: true
    how: "Evaluation.citations (src/investigation/evaluation.ts) accepts a list of Citation regardless of verdict, and createEvaluation's copyCitations copies the whole list into the frozen value, so a confirmed evaluation constructed with one or more citations reads them back unchanged"
  - criterion: "An evaluation that refutes its hypothesis reads back at least one citation."
    met: true
    how: "the same citations slot and copy logic in src/investigation/evaluation.ts is verdict-agnostic, so a refuted evaluation constructed with citations reads them back the same way a confirmed one does"
  - criterion: "An evaluation that confirms or refutes and carries no citation is refused."
    met: true
    how: "isRefusedForItsCitations (src/investigation/a-decided-evaluation-cites-evidence.ts) answers true for a confirmed or refuted evaluation whose citations list is absent or empty, before looking at any individual citation"
  - criterion: "An evaluation whose verdict is inconclusive is not refused for carrying no citation."
    met: true
    how: "isRefusedForItsCitations checks evaluationDecided() first and returns false immediately whenever the verdict is inconclusive, regardless of what the citations list holds, including none"
  - criterion: "A citation reads back the concept and the field it cites, each by name."
    met: true
    how: "Citation (src/investigation/citation.ts) declares concept as ConceptName (the same name-typed alias definition/glossary/concept's identity uses) and field as a string; createEvaluation's copyCitation copies both verbatim, so what is read back is exactly the name given for each"
  - criterion: "A citation carrying an identifier for the concept or the field it cites is refused."
    met: true
    how: "per the binding's own note, the refused identifier is any reference that is not the declared name; Citation's shape carries only concept and field as names and declares no separate identifier field to accept one through, and citesACollectedConcept/citesADeclaredField in a-decided-evaluation-cites-evidence.ts compare by exact name equality against the hypothesis's collects list and the concept's declared observationFields — a value that is not the exact name fails one of those two comparisons and is refused by the same mechanism criteria 7 and 8 use, with no separate identifier-detecting branch written"
  - criterion: "An evaluation citing a concept its hypothesis does not collect is refused."
    met: true
    how: "citesACollectedConcept tests hypothesis.collects.includes(citation.concept); citationIsRefused answers true when this fails, and isRefusedForItsCitations refuses the evaluation if any citation fails it"
  - criterion: "An evaluation citing a field the cited concept does not declare is refused."
    met: true
    how: "citesADeclaredField looks the concept up via the shared publishedConcept(glossary, citation.concept) and tests concept.observationFields.some(field => field.name === citation.field); failing it refuses the evaluation the same way as the concept check"
  - criterion: "An evaluation whose every citation names a collected concept and a field that concept declares is not refused by this rule."
    met: true
    how: "isRefusedForItsCitations returns false exactly when no citation fails citationIsRefused; its own doc comment states explicitly that a false answer is a fact about this rule alone, never acceptance of the evaluation by any other rule"
nodes:
  - node: rule/investigation/a-decided-evaluation-cites-evidence
    encoded_at:
      - src/investigation/a-decided-evaluation-cites-evidence.ts
    how: "isRefusedForItsCitations implements the statement whole — a confirmed or refuted verdict must cite at least one concept and field, and every field cited must be one the concept declares — reading the concept's declared fields through the existing published-glossary lookup rather than any capability schema, per the binding's own note on where the field check's authority sits"
  - node: definition/investigation/evaluation
    encoded_at:
      - src/investigation/evaluation.ts
    how: "the citations attribute the base declares (list of citation, embedded, optional) is now declared on the Evaluation type and copied on construction; the obligation the node's body states is deliberately not enforced inside createEvaluation, and the type's own doc comment says why and points to the check module that does"
  - node: definition/investigation/citation
    encoded_at:
      - src/investigation/citation.ts
      - src/investigation/a-decided-evaluation-cites-evidence.ts
    how: "citation.ts declares the two required attributes (concept by identity, field as a string) exactly as the node states them; a-decided-evaluation-cites-evidence.ts encodes the node's own two further Rules — a cited concept must be one the hypothesis collects, a cited field must be one the cited concept declares"
  - node: definition/knowledge/hypothesis
    how: "honored rather than encoded here: the check reads the already-declared collects list (src/knowledge/hypothesis.ts, untouched) to decide whether a citation names a collected concept; this task binds the node only for that list, per the binding's own REMAINDER note, and touches none of the hypothesis node's authoring or publication clauses"
  - node: definition/glossary/concept
    how: "honored via reuse: the check reads a concept's declared observationFields through the existing publishedConcept lookup (src/glossary/lookup.ts) and src/glossary/concept.ts's Concept type, neither of which this task modifies; the waived gap on the ttl unit is never reached because this check reads no ttl at all"
  - node: definition/glossary/observation-field
    how: "honored via reuse: the check compares a citation's field against each declared ObservationField's own name (src/glossary/observation-field.ts, untouched), which is the whole of what the node states a citation is checked against"
inferences:
  - inferred: "the citation-count obligation and both cross-referencing checks (concept collected, field declared) are enforced entirely by the new standalone function, and createEvaluation's own construction logic gains only the citations field and its copy-on-construct handling, no new refusal"
    from: "the evaluation-record task's own deferred note, which frames the whole obligation as cut out of the evaluation record and joined to it only by a dependency; the cross-referencing half structurally needs the hypothesis and the glossary, which createEvaluation's existing signature (parts: Evaluation) never receives, so keeping the whole rule in one new module avoids splitting its enforcement across two files that would otherwise have to agree independently on what 'decided' means"
  - inferred: "a construction giving no citations omits the citations key from the frozen evaluation entirely, rather than setting it to the absent value the way reason and determiningHypothesis are set elsewhere in the tree"
    from: "the already-delivered proof at src/__tests__/unit/investigation/evaluation.spec.ts asserts that Object.keys(evaluation) filtered of 'verdict' and 'reason' equals exactly ['hypothesis']; always setting a 'citations' key would add a key that assertion does not expect, so citations is included only when given — identical in every other respect (property access, JSON.stringify) to the always-set convention, differing only under Object.keys/'in'"
  - inferred: "a citation naming a concept the given glossary does not publish is not refused by this rule — citesADeclaredField answers true (passes) for such a citation's field check"
    from: "the precedent explicitly documented by src/knowledge/every-collected-concept-declares-a-ttl.ts and src/knowledge/concept-accepts-the-declared-subject-type.ts, both of which skip an unpublished concept because the refusal for an absent term belongs to the terms-exist-in-the-glossary check; no bound node states what this rule alone should do when the concept it would check is not published, so the existing convention is extended rather than a new one invented"
  - inferred: "isRefusedForItsCitations trusts that the given hypothesis parameter is the one the evaluation names, performing no check that hypothesis.name equals evaluation.hypothesis"
    from: "an evaluation binds its hypothesis by identity/name alone and holds no reference to the hypothesis object itself; the binding's REMAINDER notes place the judging act that would supply the matching hypothesis outside this task, so asserting the match here would invent a responsibility no criterion or bound node assigns to this check"
preserved:
  - "src/__tests__/unit/investigation/evaluation.spec.ts's existing assertions about createEvaluation's verdict and reason refusals, and its key-enumeration assertion for a construction naming a second hypothesis, all of which read the same object shape as before whenever no citations are given"
  - "every existing consumer of the Evaluation and HypothesisName types (src/knowledge/required-evaluations.ts, src/investigation/assessment.ts's sibling modules) keeps compiling, since Evaluation gained only a new optional field and no existing field changed shape or meaning"
  - "src/glossary/lookup.ts's publishedConcept/isPublished, src/glossary/concept.ts's Concept, src/glossary/observation-field.ts's ObservationField and src/knowledge/hypothesis.ts's Hypothesis are all read, never modified, so their own delivered proofs keep holding"
deferred:
  - what: "the judging act of the diagnose process that would actually call isRefusedForItsCitations when an evaluation is decided, and persist or surface its answer"
    why: "the binding's own REMAINDER notes place the judging act outside this task's criteria, which govern only what a decided evaluation cites and whether this one rule refuses it"
  - what: "the hypothesis and concept nodes' authoring and publication clauses — one falsifiable claim per criterion, unique hypothesis names, glossary existence, subject-type acceptance, the unpublishable-without-a-capability clause"
    why: "the binding's own REMAINDER notes route these to the case-validator epic's own checks; this task binds hypothesis only for its collects list and concept only for its declared fields"
  - what: "the evaluation node's inconclusive-reason clause and the one-evaluation-per-hypothesis / what-cannot-be-deduced-is-inconclusive clauses"
    why: "already the concern of task/published-case/evaluation-record and the tasks binding one-evaluation-per-hypothesis and the diagnose process's judging act, per the binding's REMAINDER notes; this task does not reopen them"
---

## What it is

The citation as the record of what a verdict rested on, held by the evaluation that decided — the obligation that a decided verdict is never unsupported, and the absence of that obligation where the verdict is inconclusive, the naming of what is cited by the concept and the field and never by an identifier, and the tie from a citation back to what its hypothesis collects and to the fields that concept declares.

## Notes

The obligation is asymmetric by the base's own division, so the criterion about an inconclusive verdict asserts only that this obligation does not refuse it.
Criterion 9 asserts non-refusal by this rule alone, never acceptance of the evaluation, which other rules may still refuse.
Nothing here decides what a fact was, or calls anything to obtain one; the citation is recorded, not produced.
The standard was read in full and no rule reaching these files was departed from, though its typecheck rule remains unrunnable while the tree has no toolchain.
