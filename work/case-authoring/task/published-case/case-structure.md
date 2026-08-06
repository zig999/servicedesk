---
title: "The published case as one constructed thing"
summary: "The case with its identity and publication metadata, its declared subject type, its hypotheses in the order it declares them, and the resolutions and referrals it declares, constructed as one thing and readable back exactly as declared."
rationale: "The scope named three behaviours over a published case but no representation for the case itself, and all of them read the same structure, so the structure is cut out as one task rather than written inside whichever behaviour needed it; the criteria reach every part the case declares rather than the objective narrowing, because splitting one construct's readback in two would give two tasks the same interface to change; an earlier criterion about two hypotheses sharing a name was withdrawn by the decomposer, because a case is published whole or not at all and asserting that such a case reads back would assert a published case the base refuses to publish."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A published case is constructed from what it declares and every declared part reads back unchanged \u2014 its slug, title, when-to-use guidance, version, content hash and curator notes, its declared subject type, its hypotheses in precedence order, the resolution each hypothesis leads to, and the resolution when none confirms."
criteria:
  - "A case reads back the slug it was declared with."
  - "A case reads back the title it was declared with."
  - "A case reads back the when-to-use guidance it was declared with."
  - "A case reads back the version it was declared with."
  - "A case reads back the content hash it was declared with."
  - "A case declared with curator notes reads them back, and a case declared without them reads back none."
  - "A case reads back the subject type it declares."
  - "A case constructed with its hypotheses in a given order lists them back in that same order."
  - "A hypothesis reads back the name that identifies it within its case."
  - "A hypothesis reads back the criterion it was declared with."
  - "A hypothesis reads back the concepts it collects."
  - "A hypothesis reads back the resolution that follows when it holds."
  - "A case reads back the resolution it declares for the situation in which no hypothesis confirms."
  - "A resolution reads back both the outcome and the referral it was declared with."
  - "A referral reads back both the action and the recipient it was declared with."
nodes:
  - aggregate/knowledge/cases
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/knowledge/resolution
  - definition/knowledge/referral
  - definition/glossary/concept
  - definition/glossary/subject-type
  - definition/glossary/outcome
  - definition/glossary/action
  - definition/glossary/recipient
  - rule/knowledge/hypotheses-are-ordered-by-precedence
  - rule/knowledge/the-body-does-not-change-what-is-collected
  - rule/knowledge/the-content-hash-covers-the-whole-file
base: sha256:992232efc4c5444049969a8ae991757bdc82865a72e1ba1deb144660cfb7251f
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "Criterion 4 carries back the version the case was declared with; nothing on this task's path produces a version, so what sets it bears on publishing a case rather than on constructing one from declared parts."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "A hypothesis names the concepts it collects by identity, so this task constructs no concept and no criterion reads a ttl."
  - gap: definition/glossary/subject-type#attributes.name.values
    why: "Criterion 7 carries the declared subject type back by identity and checks no vocabulary membership; which types exist is checked at publication by a rule this task does not bind."
  - gap: definition/glossary/outcome#attributes.name.values.[]
    why: "Criterion 16 reads back a declared outcome reference; the outcomes beyond the two of non-conclusion are contributed when a confirmable hypothesis is authored, and this task registers none."
  - gap: definition/glossary/action#attributes.name.values
    why: "Criterion 17 carries the declared action back by identity; no criterion checks an action against the vocabulary."
  - gap: definition/glossary/recipient#attributes.name.values
    why: "Criterion 17 carries the declared recipient back by identity; no criterion checks a recipient against the vocabulary."
  - gap: rule/knowledge/hypotheses-are-ordered-by-precedence#examples
    why: "Criterion 8 demonstrates that a declared order is preserved; the rule's body states no validator can check which precedence is correct."
---

## What it is
The published case as a constructed value in the target source, holding exactly what the case declares and nothing derived.
The case's identity and publication metadata alongside its investigative content, since the node declares both and neither is derived from the other.
The hypothesis as the case's part, carrying its name, its criterion, what it collects and what follows when it holds.
The resolution and the referral as the case declares them, each readable back from the case that declared them.

## Notes

The order in which hypotheses are listed is load-bearing here rather than incidental, because the base states that the listed order is the order in which their causes dominate one another.
This task states nothing about a case whose hypotheses share a name, because the uniqueness of the name is decided where publication is validated and the published value this task builds is one that already holds.
No criterion here states what the structure is written in or where it sits, because no language, toolchain or module layout has been chosen for this project.
BLOCKING, from the binding — the content-hash rule requires the hash to be computed over the whole file, and criterion 5 only reads back a hash the case was declared with, so the computation clause reaches no criterion on the very construct this task builds; the act that would compute it is publication, outside this epic's claim.
BLOCKING, from the binding — the case declares a minimum of one hypothesis and a hypothesis a minimum of one collected concept, and criterion 15 refuses a case missing a fallback while no criterion refuses either empty list on the same construction path.
From the binding — the case's own resolution behaviour reaches no criterion, and the fallback-selection rule is left unbound for the same reason: choosing between the two declared fallbacks reads evidence results at investigation time, not at construction.
From the binding — no criterion validates that a declared subject type, outcome, action or recipient exists in the glossary; that check sits outside this epic's claim.
From the binding — the field node is left unbound, because a hypothesis names concepts by identity and no criterion reaches a concept's declared fields.
From the binding — the curator prose rule is bound for the notes attribute, but both its clauses reach no criterion, since nothing here collects.
