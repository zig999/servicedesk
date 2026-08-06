---
title: "The published-glossary lookup"
summary: "The one reading of the published glossary the validator's checks consume: an exact-comparison answer per term and kind, and the yielding of a published concept as the glossary records it."
task: sha256:02bd94e51a17cbdeac40a0d0113d6a73eeaafea98ac390ae029e803ac6d74fde
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/glossary/lookup.ts
    effect: "answers, for a term and the kind it is looked up as, whether the given glossary publishes that term under that kind — by exact character comparison over that kind's published names only — and yields the glossary's own concept record, uncopied, when the term is a published concept; declares the PublishedGlossary shape the lookup is handed, with no way to build one and no term of its own"
  - path: src/glossary/concept.ts
    effect: "still exports the ConceptName identity alias unchanged, and now also exports Concept, the published concept as the glossary records it — name, accepted subject types, ttl carried uninterpreted, and its embedded observation fields — which is what the lookup yields"
  - path: src/glossary/observation-field.ts
    effect: "declares ObservationField, one named part of what a concept's answer carries, embedded in the concept record and enumerating no field of any concept's own"
criteria:
  - criterion: "A term the glossary publishes as a concept is answered as published when looked up as a concept."
    met: true
    how: "isPublished() with kind concept reads the given glossary's concepts, and answers published exactly where some concept's name compares strictly equal to the term"
  - criterion: "A term the glossary publishes no entry for is answered as not published under any kind."
    met: true
    how: "every kind's answer is read from that kind's published list in the given glossary and from nowhere else, so a term absent from all five lists answers not published for every GlossaryKind, and publishedConcept() answers it as the absent value"
  - criterion: "A term the glossary publishes as an outcome is answered as not published when looked up as an action."
    met: true
    how: "publishedNames() switches on the kind and reads only that kind's list — glossary.actions for action — so a name sitting in glossary.outcomes never answers a lookup as another kind"
  - criterion: "A term the glossary publishes as a concept is yielded as the glossary records it when looked up as a concept."
    met: true
    how: "publishedConcept() returns the glossary's own Concept record — the same reference, including its declared observationFields — never a copy, so a check reads the concept's declared facts rather than a copy of them"
  - criterion: "The lookup answers from the glossary it was given and holds no term of its own."
    met: true
    how: "PublishedGlossary is a parameter of both functions and the module declares no way to build one; no string in the three files is a member of any vocabulary — the only literals are the five kind names, which spell the base's node slugs, not glossary content"
nodes:
  - node: rule/glossary/a-lookup-matches-a-published-name-exactly
    encoded_at:
      - src/glossary/lookup.ts
    how: "the rule's expression is the module's whole behaviour: published iff some published entry of the looked-up kind has a name comparing strictly equal to the term, with no case folding, trimming or normalisation anywhere, so the rule's own ONU-Offline example answers not published against a published onu-offline"
  - node: definition/glossary/concept
    encoded_at:
      - src/glossary/concept.ts
      - src/glossary/lookup.ts
    how: "the Concept type carries the node's four attributes — name as identity, accepts, ttl, embedded observationFields — and publishedConcept() yields that record as the glossary holds it; the declared minimums are documented rather than enforced because this task only reads and refuses nothing, and the node's own registration rules belong to the sibling checks"
  - node: definition/glossary/observation-field
    encoded_at:
      - src/glossary/observation-field.ts
    how: "the node's one attribute, name, is the type's one field, embedded in Concept per the concept node's binding; the node's citation rule reaches no criterion here per the task's note, and the module says checking it is the citation check's, never this shape's"
  - node: definition/glossary/subject-type
    encoded_at:
      - src/glossary/lookup.ts
    how: "published subject types are the glossary's subjectTypes list, typed by the existing SubjectTypeName alias from src/glossary/subject-type.ts, looked up under the same exact comparison; the vocabulary itself stays the given glossary's content, unenumerated in source"
  - node: definition/glossary/outcome
    encoded_at:
      - src/glossary/lookup.ts
    how: "published outcomes are the glossary's outcomes list, typed by the existing OutcomeName alias, compared exactly; the two non-conclusion entries the node states are glossary content this plan does not populate, per the task's note, so neither name appears in source"
  - node: definition/glossary/action
    encoded_at:
      - src/glossary/lookup.ts
    how: "published actions are the glossary's actions list, typed by the existing ActionName alias, compared exactly and only when looked up as action, which is what criterion 3 exercises against the outcome kind"
  - node: definition/glossary/recipient
    encoded_at:
      - src/glossary/lookup.ts
    how: "published recipients are the glossary's recipients list, typed by the existing RecipientName alias, compared exactly; the node's exists-in-the-glossary rule belongs to the sibling checks that consume this lookup's answer"
inferences:
  - inferred: "the PublishedGlossary shape the lookup is handed is five read-only lists, one per glossary definition — concepts as whole records, the other four kinds as published names"
    from: "the exact-lookup rule constrains exactly those five definitions, each definition's identity is its name, and criterion 4 requires the concept alone to be yielded as a record"
  - inferred: "the GlossaryKind values are spelled as the base's node slugs — concept, subject-type, outcome, action, recipient"
    from: "the base's path-is-identity convention, where the slug is the one spelling of each kind the whole repository already agrees on"
  - inferred: "a term that is not a published concept reads back from publishedConcept() as the absent value, with no sentinel and no wrapper"
    from: "the precedent at src/investigation/assessment.ts, where an absent determining hypothesis reads back as the absent value, recorded in the inventory as the tree's representation of absence"
  - inferred: "the concept's declared minimums — at least one accepted subject type, at least one observation field — are documented on the Concept type rather than enforced by it"
    from: "the precedent at src/knowledge/draft-case.ts, which admits the case a check refuses, and the task's own note that this task only reads the glossary and refuses nothing"
preserved:
  - "ConceptName stays exported from src/glossary/concept.ts as a string alias, so src/knowledge/hypothesis.ts's import and every collects list keep working unchanged"
  - "the SubjectTypeName, OutcomeName, ActionName and RecipientName aliases are untouched, so src/knowledge/draft-case.ts, referral.ts and resolution.ts keep compiling against them"
  - "validate() and PublicationCheck in src/knowledge/validation.ts are untouched, so the delivered validation run and its spec keep holding"
  - "nothing anywhere in src/ enumerates a member of the concept, subject-type, outcome, action or recipient vocabularies, which stays true after this change"
deferred:
  - what: "the five sibling publication checks that consume this lookup's answers — term existence, subject-type acceptance, ttl, declared fields, the capability clause"
    why: "the task's rationale cuts the reading out so the checks can consume it; each check is its own task of this epic, and writing one here would put an interface and its consumers back in one task"
  - what: "the repository still holds no package manifest, compiler configuration or lock, so the new modules — like the tree around them — have never been type-checked and STK-01 cannot run"
    why: "establishing the toolchain is no criterion of this task and reaches every file in the tree; the inventory records the absence and the risk that a chosen resolution mode may rewrite every import line"
---

## What it is

The exact-comparison reading of the published glossary — an answer per term and kind from src/glossary/lookup.ts, the full concept record in src/glossary/concept.ts, and the embedded observation field in src/glossary/observation-field.ts — that the validator's checks consume instead of reading the glossary themselves.

## Notes

The lookup takes the glossary as a parameter and yields a published concept by reference rather than by copy, so the glossary's content stays outside the source and a check reads a concept's declared facts where the glossary holds them.
The standard was read in full and no rule reaching these files was departed from, though its typecheck rule STK-01 remains unrunnable while the tree has no toolchain.
The GlossaryKind spellings are the base's node slugs, an inference recorded so the choice is a decision a reviewer can reject.
