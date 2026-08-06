---
title: "The published case as one constructed value"
summary: "The Case type and its constructor, with the hypothesis's full shape and the two missing glossary identity aliases, so every part a case declares is constructed as one frozen value and reads back exactly as declared."
task: sha256:821bc77d3c21e8ed092d0d36a0c8f2c6999ac2e6f47bc2eb637cdc108e264e1c
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/glossary/subject-type.ts
    effect: "declares SubjectTypeName, the name a case binds its declared subject type by, carrying whatever name it is given without enumerating or checking the vocabulary"
  - path: src/glossary/concept.ts
    effect: "declares ConceptName, the name a hypothesis binds a collected concept by, carrying whatever name it is given without encoding the concept's accepts, ttl or fields"
  - path: src/knowledge/hypothesis.ts
    effect: "now declares the full read-only Hypothesis shape — name, collects as concept names, confirmsWhen as the prose criterion, and the embedded resolution — beside the unchanged HypothesisName alias it already exported"
  - path: src/knowledge/case.ts
    effect: "declares the read-only Case shape holding slug, title, whenToUse, subjectType, hypotheses in declared order, both fallback resolutions, optional curatorNotes, version and contentHash, and createCase(), which freezes the value and copies every embedded part — each hypothesis with its collects list and resolution, and each fallback from its own argument — so every declared part reads back unchanged and unshared, refusing nothing and deriving nothing"
criteria:
  - criterion: "A case reads back the slug it was declared with."
    met: true
    how: "createCase() copies parts.slug into the frozen value as the readonly slug field, unchanged"
  - criterion: "A case reads back the title it was declared with."
    met: true
    how: "createCase() copies parts.title into the frozen value as the readonly title field, unchanged"
  - criterion: "A case reads back the when-to-use guidance it was declared with."
    met: true
    how: "createCase() copies parts.whenToUse into the frozen value as the readonly whenToUse field, unchanged"
  - criterion: "A case reads back the version it was declared with."
    met: true
    how: "createCase() copies parts.version into the frozen value as the readonly version field, unchanged; nothing derives or checks it, per the task's waiver of the version-derivation gap"
  - criterion: "A case reads back the content hash it was declared with."
    met: true
    how: "createCase() copies parts.contentHash into the frozen value as the readonly contentHash field; the module computes nothing, since the computation belongs to the publication act per the binding's note"
  - criterion: "A case declared with curator notes reads them back, and a case declared without them reads back none."
    met: true
    how: "curatorNotes is the optional field of Case and createCase() passes parts.curatorNotes through unchanged, so declared notes read back verbatim and an absent value stays the absent value with no sentinel"
  - criterion: "A case reads back the subject type it declares."
    met: true
    how: "subjectType is a SubjectTypeName bound by identity, and createCase() copies the declared name into the frozen value unchanged"
  - criterion: "A case constructed with its hypotheses in a given order lists them back in that same order."
    met: true
    how: "createCase() builds hypotheses with parts.hypotheses.map(copyHypothesis), which preserves array order, and freezes the resulting array so it cannot be reordered afterwards"
  - criterion: "A hypothesis reads back the name that identifies it within its case."
    met: true
    how: "copyHypothesis() copies hypothesis.name, a HypothesisName, into the frozen hypothesis unchanged"
  - criterion: "A hypothesis reads back the criterion it was declared with."
    met: true
    how: "confirmsWhen is carried as the declared prose string and copyHypothesis() copies it unchanged"
  - criterion: "A hypothesis reads back the concepts it collects."
    met: true
    how: "collects is a readonly list of ConceptName and copyHypothesis() copies it into a new frozen array, so the declared names read back in their declared order and are not shared with the caller's array"
  - criterion: "A hypothesis reads back the resolution that follows when it holds."
    met: true
    how: "copyHypothesis() embeds copyResolution(hypothesis.resolution), a frozen copy of the declared resolution with its outcome and its copied referral"
  - criterion: "A case reads back the resolution it declares as its no-data fallback."
    met: true
    how: "createCase() sets noDataFallback to copyResolution(parts.noDataFallback), copied from its own argument rather than wired to any other slot"
  - criterion: "A case reads back the resolution it declares as its hypotheses-exhausted fallback."
    met: true
    how: "createCase() sets hypothesesExhaustedFallback to copyResolution(parts.hypothesesExhaustedFallback), its own copy from its own argument, so each fallback reads back independently of the other"
  - criterion: "A resolution reads back both the outcome and the referral it was declared with."
    met: true
    how: "the Resolution shape reused from src/knowledge/resolution.ts carries both fields readonly, and copyResolution() in case.ts copies the outcome name and the referral whole into a frozen value"
  - criterion: "A referral reads back both the action and the recipient it was declared with."
    met: true
    how: "the Referral shape reused from src/knowledge/referral.ts carries both names readonly, and copyReferral() in case.ts copies both into a frozen value"
nodes:
  - node: aggregate/knowledge/cases
    encoded_at:
      - src/knowledge/case.ts
    how: "the case and its hypotheses are one consistency boundary here — one Case value constructed in one createCase() call with every hypothesis, resolution and referral embedded and frozen together; the whole-case contract checks at publication are the validator epic's, not this module's"
  - node: definition/knowledge/case
    encoded_at:
      - src/knowledge/case.ts
    how: "the Case type carries the node's ten attributes with its identity triple slug, version and contentHash as declared values; the resolving behaviour the node also states is deliberately not encoded here, per the binding's note assigning it to the outcome-resolution task"
  - node: definition/knowledge/hypothesis
    encoded_at:
      - src/knowledge/hypothesis.ts
    how: "the Hypothesis type carries name, collects as concept names bound by identity, confirmsWhen as the prose criterion, and the embedded resolution; the minimum of one concept and the name uniqueness are stated in the doc comment as the publication act's checks and enforced nowhere here, per the binding's note assigning those refusals to the validator epic"
  - node: definition/knowledge/resolution
    encoded_at:
      - src/knowledge/resolution.ts
    how: "reused unchanged as the inventory's must_not_duplicate names it; case.ts embeds it in each hypothesis and in both fallback slots and copies it on construction, and its rule that a resolution is declared by the case and never produced during an investigation is honored — copyResolution() copies a declared value and fabricates none"
  - node: definition/knowledge/referral
    encoded_at:
      - src/knowledge/referral.ts
    how: "reused unchanged; the pair of action and recipient names is what copyReferral() in case.ts copies whole, so a declared referral reads back both parts"
  - node: definition/glossary/subject-type
    encoded_at:
      - src/glossary/subject-type.ts
    how: "the by-identity binding is encoded as SubjectTypeName, an alias carrying the declared name; the vocabulary's values are neither enumerated nor checked, matching the task's waiver of the open values gap"
  - node: definition/glossary/concept
    encoded_at:
      - src/glossary/concept.ts
    how: "the by-identity binding is encoded as ConceptName, an alias carrying the declared name; the concept's accepts, ttl and observation fields are not encoded because a hypothesis binds concepts by identity and no criterion of this task reads more than the names"
  - node: definition/glossary/outcome
    encoded_at:
      - src/glossary/outcome.ts
    how: "reused unchanged; a resolution binds its outcome by OutcomeName and reads it back as declared, and the two non-conclusion values the node enumerates are written nowhere in source, since read-back consumes no vocabulary member per the task's waiver"
  - node: definition/glossary/action
    encoded_at:
      - src/glossary/action.ts
    how: "reused unchanged; a referral binds its action by ActionName and reads it back as declared, with the open vocabulary neither enumerated nor checked per the task's waiver"
  - node: definition/glossary/recipient
    encoded_at:
      - src/glossary/recipient.ts
    how: "reused unchanged; a referral binds its recipient by RecipientName and reads it back as declared, with the open vocabulary neither enumerated nor checked per the task's waiver"
  - node: rule/knowledge/hypotheses-are-ordered-by-precedence
    encoded_at:
      - src/knowledge/case.ts
    how: "the declared order is treated as load-bearing — createCase() preserves it through an order-preserving map and freezes the list so it cannot be reordered; whether that order is the precedence the specialists affirm is human review per the rule's own body and the task's REMAINDER note"
  - node: rule/knowledge/the-body-does-not-change-what-is-collected
    how: "honored without encoding a fact of its own — curatorNotes is carried inert, nothing in case.ts reads or parses it, and what a case collects is reachable only through the structured hypotheses' collects lists; the rule's demonstration is the collection-plan task's per the binding's note"
  - node: rule/knowledge/the-content-hash-covers-the-whole-file
    how: "honored without encoding the computation — contentHash is a declared value carried and read back unchanged, and case.ts computes no hash, because the computation belongs to the publication act outside this plan per the binding's note; the doc comment states the invariant with the rule's identifier so a reader does not supply the computation here"
inferences:
  - inferred: "the base's snake_case attribute names are carried as camelCase fields in code — whenToUse, subjectType, noDataFallback, hypothesesExhaustedFallback, curatorNotes, contentHash, confirmsWhen"
    from: "rule CON-01 of the project standard names camelCase for variables, and the tree's one existing constructed value already camelCases a bound attribute as determiningHypothesis in src/investigation/assessment.ts"
  - inferred: "a case declared without curator notes represents them as the absent value, with no sentinel and no wrapper"
    from: "the assessment's optional determiningHypothesis in src/investigation/assessment.ts, which the inventory records as representing absence exactly this way"
  - inferred: "createCase() is a free create-function taking the case's own type and returning a frozen value with a module-private copy helper per level of nesting"
    from: "the inventory's constructor convention, seen at src/investigation/assessment.ts and recorded as the tree's one occurrence — followed as the only precedent rather than departed from"
  - inferred: "a by-identity binding is carried as a named alias of string holding the term's name — SubjectTypeName and ConceptName, the first modules for either term"
    from: "the inventory's convention that four such aliases already exist, and each bound glossary node declaring name as its identity"
  - inferred: "createCase() checks nothing and refuses nothing at runtime — a zero-hypothesis case, an empty collects list or a shared name is constructed as given"
    from: "the task's UNDERDETERMINED notes assigning every structural refusal to the validator epic, and the tree's one constructor at src/investigation/assessment.ts likewise refusing nothing"
divergences:
  - cites: MNT-03
    file: src/knowledge/case.ts
    departure: "copyReferral() and copyResolution() restate the copy-on-construct logic that already exists module-private in src/investigation/assessment.ts rather than calling it."
    why: "the existing helpers are unexportable as they stand, and the two ways to share them — exporting from assessment.ts, or adding builders to resolution.ts against its stated no-constructor claim that the outcome-resolution task also leans on — both reach past this task's objective; the inventory foresaw exactly this in its copy-helper risk, and the unification is deferred below"
preserved:
  - "HypothesisName stays exported from src/knowledge/hypothesis.ts with its meaning and doc unchanged, because src/investigation/assessment.ts imports it"
  - "the Resolution and Referral shapes in src/knowledge/resolution.ts and src/knowledge/referral.ts are untouched, because the assessment module and its spec depend on them"
  - "src/investigation/assessment.ts and src/__tests__/unit/investigation/assessment.spec.ts are untouched, so the delivered assessment behaviour — freezing, copy-on-construct, optional determining hypothesis — keeps working as recorded"
  - "the three existing glossary aliases are untouched, so every existing import of OutcomeName, ActionName and RecipientName resolves as before"
deferred:
  - what: "the copy-on-construct helpers now exist twice, module-private in src/investigation/assessment.ts and in src/knowledge/case.ts."
    why: "hoisting them into the modules that own the shapes means editing assessment.ts or resolution.ts's stated claim that it offers no way to build one, and both edits reach outside this task's construction-and-read-back objective; the inventory already records the hand-written-per-level copy risk for the tasks it names"
  - what: "the repository still holds no package manifest, compiler configuration or dependency lock, so nothing written here has been compiled or type-checked and STK-01's tool cannot run."
    why: "choosing a toolchain is a project decision no bound node and no criterion of this task states, and the inventory records the absence as the tree's standing condition"
---

## What it is

The published case as one frozen constructed value in src/knowledge/case.ts — identity and publication metadata beside subject type, hypotheses in declared order and the two written-out fallbacks — with the hypothesis's full shape added to src/knowledge/hypothesis.ts and the first identity aliases for subject type and concept under src/glossary/, every embedded part copied on construction so it reads back exactly as declared.

## Notes

Construction refuses nothing and derives nothing — the structural minima, name uniqueness, glossary membership, hash computation and resolving behaviour the bound nodes also state are deliberately absent here, per the binding's notes assigning each to the validator epic, the publication act or the outcome-resolution task.
The copy-on-construct helpers now exist twice, a departure disclosed against MNT-03 and deferred, because both ways to share them reach past this task's objective.
The snake_case-to-camelCase carriage of attribute names is an inference from CON-01 and the tree's one precedent, recorded so the mapping is a decision a reviewer can reject.
