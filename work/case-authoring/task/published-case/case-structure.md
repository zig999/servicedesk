---
title: "The published case as one constructed thing"
summary: "The case with its identity and publication metadata, its declared subject type, its hypotheses in the order it declares them, and the resolutions and referrals it declares — one per hypothesis and the two fallbacks for none confirming — constructed as one thing and readable back exactly as declared."
rationale: "The scope named three behaviours over a published case but no representation for the case itself, and all of them read the same structure, so the structure is cut out as one task rather than written inside whichever behaviour needed it; the criteria reach every part the case declares rather than the objective narrowing, because splitting one construct's readback in two would give two tasks the same interface to change; an earlier criterion about two hypotheses sharing a name was withdrawn by the decomposer, because a case is published whole or not at all and asserting that such a case reads back would assert a published case the base refuses to publish; the two fallbacks read back under one criterion each rather than one shared criterion, because each is its own declared attribute and a construction wiring both slots to one resolution would pass a joint readback while failing either taken alone."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
  - intake/escopo-recorte-seis-decisoes.md
  - intake/escopo-retomada-revinculacao.md
objective: "A published case is constructed from what it declares and every declared part reads back unchanged — its slug, title, when-to-use guidance, version, content hash and curator notes, its declared subject type, its hypotheses in precedence order, the resolution each hypothesis leads to, and the two fallback resolutions it declares for none of them confirming."
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
  - "A case reads back the resolution it declares as its no-data fallback."
  - "A case reads back the resolution it declares as its hypotheses-exhausted fallback."
  - "A resolution reads back both the outcome and the referral it was declared with."
  - "A referral reads back both the action and the recipient it was declared with."
nodes:
  - node: aggregate/knowledge/cases
    digest: sha256:cb2f4e40c9d78a66b2b0001e1ba2ed7f45e5bd5f833e89fed97e0ef5dec113c8
  - node: definition/knowledge/case
    digest: sha256:af4dd5b0b02ad4bb87ea9c39ee864a88115d87f2ede68504fa81e858d24ae48c
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/knowledge/resolution
    digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
  - node: definition/knowledge/referral
    digest: sha256:7d74b30fc7b7813597b165588a4f8f5b7652235ebac9e320fa49a573f7eb9261
  - node: definition/glossary/subject-type
    digest: sha256:a2b480065c98dc6b15f228f1e05fb84e2729cd075f9c14579970db5efe45bb89
  - node: definition/glossary/concept
    digest: sha256:078ee8a3f41d7cbe9cfc248e92b98a3460df2c3249b2a945466a40ad02cca3b7
  - node: definition/glossary/outcome
    digest: sha256:40fad9d974f611796cc3974eeb6b311ac0ef6c6de39c5615f3eba4681eedaf2d
  - node: definition/glossary/action
    digest: sha256:f77670004b9b0aa3d01b7010e239c57c98609cb837b6f7fb64a11d51b85b43cb
  - node: definition/glossary/recipient
    digest: sha256:a5bc8e2e81ed13dfdf8b8ceabffab526153b6380b623c1cec46bc50d5e3e1654
  - node: rule/knowledge/hypotheses-are-ordered-by-precedence
    digest: sha256:c5c1b66cff9265e8aa17c2be46f42bd4377e73801e215d95379cae6d60458fcb
  - node: rule/knowledge/the-body-does-not-change-what-is-collected
    digest: sha256:484135503755b64ba08db05907a618f768d07c641ae04e73486ce9bb668d1586
  - node: rule/knowledge/the-content-hash-covers-the-whole-file
    digest: sha256:4874d358e10ea040974b075a80a5ef12ff4e9c77dae165ac048df88aa5ae7728
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "Every criterion reads the version back as a declared value; what sets it — git reference, curator-raised number, or a publication count — is a fact about the act that produces the value, and no criterion here derives or checks it."
  - gap: definition/glossary/subject-type#attributes.name.values
    why: "Read-back is indifferent to which subject type name a case declares; the vocabulary's actual values bear on validating a case against the glossary, which no criterion of this task performs."
  - gap: definition/glossary/outcome#attributes.name.values.[]
    why: "The two non-conclusion outcomes are enumerated already, and any hypothesis-contributed outcome reads back as the name its resolution declares; the open remainder of the vocabulary bears on registration, not on read-back fidelity."
  - gap: definition/glossary/action#attributes.name.values
    why: "A referral reads back whatever action name it was declared with; the first case's actual actions bear on glossary registration, not on whether a declared action reads back unchanged."
  - gap: definition/glossary/recipient#attributes.name.values
    why: "The real operational queue names bear on glossary registration; this task only demonstrates that a declared recipient reads back unchanged, whichever name it is."
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "No criterion of this task reads a ttl; staleness governs collection during an investigation, and this task reads back only the names of the concepts a hypothesis collects."
  - gap: rule/knowledge/hypotheses-are-ordered-by-precedence#examples
    why: "The task preserves whichever order the case declares (criterion 8); which cause actually dominates which is specialists' knowledge that no criterion here consumes."
---

## What it is
The published case as a constructed value in the target source, holding exactly what the case declares and nothing derived.
The case's identity and publication metadata alongside its investigative content, since the node declares both and neither is derived from the other.
The hypothesis as the case's part, carrying its name, its criterion, what it collects and what follows when it holds.
The resolution and the referral as the case declares them — one following each hypothesis and the two fallbacks for none confirming — each readable back from the case that declared them.

## Notes
The order in which hypotheses are listed is load-bearing here rather than incidental, because the base states that the listed order is the order in which their causes dominate one another.
The two fallbacks are structure here and selection elsewhere: no criterion of this task chooses between them, because choosing reads what the collection returned and that reading is another task's one outcome.
This task states nothing about a case whose hypotheses share a name, because the uniqueness of the name is decided where publication is validated and the published value this task builds is one that already holds.
No criterion here states what the structure is written in or where it sits, because no language, toolchain or module layout has been chosen for this project.
UNDERDETERMINED, from the binding — the bound case definition's resolving behaviour, answering with the first confirmed hypothesis in declared order or the fallback when none confirmed, reaches no criterion of this task, which tests construction and read-back only; what passes is an implementation that reads every part back unchanged but, given evaluations, answers with anything at all, which the case's declared behaviour and the outcome invariant refuse — the resolving is the outcome-resolution task's demonstration.
UNDERDETERMINED, from the binding — the content-hash rule requires the hash computed over the whole file, curator prose included, and criterion 5 only reads a declared hash back; what passes is a construction accepting any string as the hash, computed over only the structured part or never computed, which the base refuses of a published case — the computation belongs to the publication act, outside this plan.
UNDERDETERMINED, from the binding — the curator-prose rule forbids the notes from changing what is collected and criterion 6 only tests that notes read back; what passes is an implementation deriving what the case collects from the notes as well as from the structured hypotheses, precisely what the rule refuses — the inertness is demonstrated by the collection-plan task's body-indifference criterion.
UNDERDETERMINED, from the binding — the bound definitions' structural minima and uniqueness reach no criterion, a case declaring at least one hypothesis, a hypothesis collecting at least one concept, and two hypotheses never sharing a name; what passes is a construction accepting a case with zero hypotheses, an empty collects list or a shared name, all three refused by the base — the refusals are the validator epic's checks.
UNDERDETERMINED, from the binding — the glossary membership and acceptance clauses reach no criterion, a named term existing in the glossary, a collected concept accepting the subject type or having a read-only capability, and the aggregate's contract checks over the whole at publication; what passes is a construction admitting any names whatsoever, each such case refused by the base as unpublishable — those refusals are the validator epic's checks over the case under edit.
REMAINDER, from the binding — the precedence rule's clause that the order must be the precedence the specialists affirm reaches no criterion, the rule's own body stating no validator can check it; it belongs to human review in the case-authoring act, outside any construct this plan builds.
REMAINDER, from the binding — the case's clause that the curator notes never reach any prompt reaches no criterion of this task, which composes no prompt; it belongs to the investigation act's judging and writing, where the base restates the same fact on the assessment's narrowed input, outside this plan.
From the binding — the fallback-selection and outcome rules, the investigation constructs and the observation-field node are left unbound as neighbours, each governing which declared resolution answers or an investigation-time act rather than any construction-and-read-back criterion here.
The pin was restated deliberately rather than re-bound: the base moved by the five decision nodes, the capability's new output_schema attribute and the corrected citation prose, and none of this task's bound nodes changed its declared gaps or anything a criterion here reads — the lines added to their Rules sections point at rules bound elsewhere in this plan. The validator's totality check over every bound node's open gaps holds that judgment, and it refuses this task if the reading is wrong.
