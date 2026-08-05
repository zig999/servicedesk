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
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "Criterion 4 is a round-trip over a required attribute of the published value \u2014 the case is constructed with a version and reads it back. What sets the version is publication's fact, and nothing on this task's path computes or interprets it."
  - gap: definition/knowledge/case#attributes.content_hash.derivation
    why: "Criterion 5 is the same round-trip: the case is constructed with a content hash and reads it back. What the hash is computed over is needed by whatever publishes and by whatever compares two published cases, neither of which this task builds."
  - gap: definition/knowledge/case#attributes.no_hypothesis_confirmed.selection
    why: "Criterion 13 reads back the single fallback resolution the case declares. Which of the two non-conclusion outcomes it carries is a value this task neither selects nor validates; it bears on resolving an investigation, not on constructing and reading back the declaration."
  - gap: definition/glossary/subject-type#attributes.name.values
    why: "Criterion 7 reads back the subject type a case declares, referenced by identity; the membership of the closed vocabulary is needed by whatever validates a declaration against it, which is not on this path."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "Criterion 11 reads back the concepts a hypothesis collects, by name; nothing here reads, compares or expires against a ttl."
  - gap: definition/glossary/outcome#attributes.name.values.[]
    why: "Criteria 12 and 14 read back the outcome a resolution was declared with; the base states outcomes are contributed and registered, so the unlisted members are needed by the membership check rather than by this read-back."
  - gap: definition/glossary/action#attributes.name.values
    why: "Criterion 15 reads back the action a referral was declared with, by identity; the named members bear on the membership check this task does not perform."
  - gap: definition/glossary/recipient#attributes.name.values
    why: "Criterion 15 reads back the recipient a referral was declared with, by identity; as with the action, the members bear on the membership check."
  - gap: rule/knowledge/hypotheses-are-ordered-by-precedence#examples
    why: "Criterion 8 preserves and reads back the order the case was constructed with; which cause dominates which is a specialist affirmation the node itself says no validator can check."
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
From the binding — version and content hash are assigned by publication, both outside the candidates, so criteria 4 and 5 are read-back of values this task receives and never computes; the executor must not derive either.
From the binding — the case's own resolving behaviour reaches no criterion of this task, and the investigation-side candidates stay unbound here; they need their own task or an uncovered entry.
From the binding — criterion 6 only round-trips the curator notes, so no criterion demonstrates that the prose changes nothing collected, and the rule's second clause is an authoring constraint on the case under edit, which this epic leaves uncovered.
From the binding — no criterion covers refusing a case constructed with no hypothesis, and the rule stating that minimum is outside the candidates.
