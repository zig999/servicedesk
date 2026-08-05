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
  - definition/glossary/subject-type
  - definition/glossary/concept
  - definition/glossary/outcome
  - definition/glossary/action
  - definition/glossary/recipient
  - rule/knowledge/hypotheses-are-ordered-by-precedence
  - rule/knowledge/the-body-does-not-change-what-is-collected
base: sha256:3d7bf173f490f874dc387c6acbeaad9dd61bc643027fe81035bded739b3586af
unresolved:
  - gap: definition/glossary/outcome#attributes.name.values.[]
waived:
  - gap: definition/glossary/subject-type#attributes.name.values
    why: "The case carries its subject type by name and the attribute's form is a string; criterion 7 reads that name back and never tests membership in the vocabulary, so which names the vocabulary registers is not exercised here."
  - gap: definition/glossary/action#attributes.name.values
    why: "A referral carries its action by name and the attribute's form is a string; criterion 15 reads the name back and does not check the action exists, so the unlisted vocabulary does not bear on construction."
  - gap: definition/glossary/recipient#attributes.name.values
    why: "A referral carries its recipient by name and the attribute's form is a string; criterion 15 reads the name back and does not check the recipient exists, so the unlisted vocabulary does not bear on construction."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "A hypothesis collects concepts by identity \u2014 the name alone \u2014 so a constructed case never carries a concept's ttl, and criterion 11 reads back only the names collected."
  - gap: rule/knowledge/hypotheses-are-ordered-by-precedence#examples
    why: "Criterion 8 preserves the order the case was constructed with and never decides which order is right; the node itself states no validator can check the precedence, so an example order would not change what this task builds."
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
BLOCKING, from the binding — the case declares hypotheses with a minimum of one and a hypothesis declares collects with a minimum of one, and no criterion reaches either, so a case constructed with no hypothesis or a hypothesis collecting nothing satisfies every criterion as written; the rules stating both sit outside this epic's claim.
BLOCKING, from the binding — the case is a value object identified by slug, version and content hash together, and while criteria 4 and 5 read those fields back individually, nothing states that two cases agreeing on the triple are the same case, so the equality the base decided reaches no criterion.
From the binding — the clause that the declared order is the precedence the specialists affirm reaches no criterion, and the node itself states no validator can check it.
From the binding — the curator prose rule is answered here only by the notes being carried as inert prose that nothing in the constructed case consults.
