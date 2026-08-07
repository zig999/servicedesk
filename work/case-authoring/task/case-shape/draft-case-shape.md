---
title: The shape of a case under edit
summary: A case while a curator is still writing it — everything the case declares, its hypotheses in declaration order, both fallbacks, and neither a version nor a hash.
objective: A case under edit is a declared shape holding its slug, the subject type it investigates, its hypotheses in declaration order, and both fallbacks, and holding neither a version nor a hash.
rationale: The decomposition put the declaration order of the hypotheses and both fallbacks in this task because both are what the case itself holds; what walks that order and selects between those fallbacks when an investigation runs is not this plan's to build.
sources:
- intake/scope.md
- intake/scope-2026-08-07.md
criteria:
- A case under edit carries its slug.
- A case under edit carries the subject type it investigates.
- A case under edit carries its hypotheses as an ordered list, and reading it back returns them in the order they were declared.
- A case under edit carries the no-data fallback, as a resolution.
- A case under edit carries the exhausted fallback, as a resolution.
- A case under edit carries no version.
- A case under edit carries no hash.
depends_on:
- task/case-shape/hypothesis-shape
nodes:
- node: context/knowledge
  digest: sha256:58667e68e3c2c8d2702a225c28fe5342ca40fd5afe01abce4d0359fc194c6efd
- node: definition/knowledge/draft-case
  digest: sha256:9c3360b04b1eb11db3c2d54299b2909173b3ec7bfdfb6a4e5d47e69acbc668e9
- node: definition/knowledge/hypothesis
  digest: sha256:690eee99a05f5f75e890b6f1f06c278656b0fabd56ab9f6aac158dfdce3b065d
- node: definition/knowledge/referral
  digest: sha256:7d74b30fc7b7813597b165588a4f8f5b7652235ebac9e320fa49a573f7eb9261
- node: definition/knowledge/resolution
  digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
- node: rule/knowledge/hypotheses-are-ordered-by-precedence
  digest: sha256:c5c1b66cff9265e8aa17c2be46f42bd4377e73801e215d95379cae6d60458fcb
waived:
- gap: rule/knowledge/hypotheses-are-ordered-by-precedence#examples
  why: The absent examples would name a concrete precedence — which cause dominates which — and this task carries the hypotheses in whatever order the curator declared them, asserting nothing about which order is right. No field of the shape and no criterion reads the precedence itself, and the node states that no validator can check it and that it is left to human review, so the shape is identical whichever order the specialists later affirm.
---
## What it is

The case a curator is still writing, as a shape source can hold.

## Notes

The version and the hash are absent here on purpose: the base registers them as what publication assigns.
Commit a50f278 left every attribute of `definition/knowledge/draft-case` where it was, and what it added about the file that holds the case reaches the reading task rather than this shape.
UNDERDETERMINED, from the binding — the summary says the shape holds everything the case declares, while the objective and criteria enumerate five of the eight attributes the bound node declares; `title`, `when_to_use` and `curator_notes` reach no criterion, so nothing falsifies their absence.
UNDERDETERMINED passes — a case-under-edit shape declaring only slug, subject type, hypotheses and the two fallbacks, with no title, no when-to-use and no curator notes.
UNDERDETERMINED, from the binding — no criterion states that the hypotheses list holds at least one hypothesis, while the bound node declares a minimum of one; it is undecided here whether emptiness is refused by this shape or by a validation check that answers the curator.
UNDERDETERMINED passes — a case-under-edit shape whose hypotheses list accepts zero elements.
REMAINDER, from the binding — bound clauses stating what a check refuses rather than what the shape holds reach no criterion here: that every collected concept accepts the declared type, that every term names an existing glossary entry, that a criterion states exactly one falsifiable claim, that a hypothesis collects at least one concept, that two hypotheses never share a name, and that a case under edit is what a publication check refuses.
REMAINDER belongs — the tasks of `epic/case-validation` that bind those rule nodes.
REMAINDER, from the binding — the bound node's clauses that a case under edit is one markdown file whose slug matches that file's name, that a file whose structured part does not parse is no case under edit at all, and that the frontmatter holds everything the case declares, reach no criterion here, because nothing in this task reads or writes a file.
REMAINDER belongs — `task/case-shape/case-file-reader`, which binds those candidates.
REMAINDER, from the binding — the bound clauses that a case under edit becomes published only through publication, that nothing approves its publication, and that the contract is verified in the act of publishing reach no criterion; criteria 6 and 7 use only the node's statement that publication is what adds the version and the hash.
REMAINDER belongs — `task/case-publication/publish-transition` and its siblings.
REMAINDER, from the binding — that resolving precedence is the case's own behaviour, that a referral may not be seen before the investigation has a record, and that an evaluation must cite a concept and a field reach no criterion: this shape declares and never runs.
REMAINDER belongs — the investigation act, over `process/investigation/diagnose` and the rules of `context/investigation`.
Decision, beyond the covers — stand: the five validation rule nodes and `definition/knowledge/case`, `lifecycle/knowledge/case-publication`, `rule/knowledge/nothing-approves-a-publication`, `rule/knowledge/a-case-does-not-publish-without-the-contract-check`, the four glossary definitions `process/investigation/diagnose` and `context/investigation` are other epics' claims or outside this plan entirely, each bound where it is owned, so naming them here records where the unreached clauses land rather than growing `epic/case-shape`.
From the binding — the by-identity targets of this shape all sit outside the candidates, so what a by-identity reference carries is a fact this binding may not reach; the epic's claim grows to include them, or this task sits under an epic that does not cover what its shape references.
From the binding — `rule/knowledge/hypotheses-are-ordered-by-precedence` names only `definition/knowledge/case` in `constrains`, so the base does not state the ordering rule over the case under edit; it is bound here because `context/knowledge` states without qualification that the order of a case's hypotheses is the precedence its specialists affirm, and if the rule is meant to reach the case under edit, `constrains` says so in the base through `/analyse-domain`.
From the binding — whether the curator's note is a declared field of the shape, body prose, or both is a reading a reviewer should settle before the shape fixes one answer.
From the binding — three candidates are left unbound because no criterion reaches them: the fallback-selection rule, which is about resolve time, and the two rules governing the body of the file and the text answered to a curator, since this shape answers no text.
