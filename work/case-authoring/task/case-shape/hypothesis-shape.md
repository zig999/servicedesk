---
title: The shape of a hypothesis
summary: One falsifiable claim as a case declares it — its name, what it collects, what confirms it, and what follows when it holds.
objective: A hypothesis is a declared shape holding a name, the concepts it collects, the criterion that confirms it, and the resolution that follows when it holds.
rationale: The decomposition cut the hypothesis apart from the case because the base registers each as its own definition and a case holds a list of the other, so the two change for different reasons.
sources:
- intake/scope.md
- intake/scope-2026-08-07.md
criteria:
- A hypothesis value carries a name.
- A hypothesis value carries the concepts it collects, as a list.
- A hypothesis value carries the criterion that confirms it, as prose.
- A hypothesis value carries the resolution that follows when it holds.
- A hypothesis missing its criterion does not parse.
- A hypothesis missing its resolution does not parse.
depends_on:
- task/case-shape/resolution-and-referral
nodes:
- node: context/knowledge
  digest: sha256:58667e68e3c2c8d2702a225c28fe5342ca40fd5afe01abce4d0359fc194c6efd
- node: definition/knowledge/hypothesis
  digest: sha256:690eee99a05f5f75e890b6f1f06c278656b0fabd56ab9f6aac158dfdce3b065d
- node: definition/knowledge/resolution
  digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
- node: definition/knowledge/referral
  digest: sha256:7d74b30fc7b7813597b165588a4f8f5b7652235ebac9e320fa49a573f7eb9261
- node: rule/knowledge/the-frontmatter-holds-everything-the-case-declares
  digest: sha256:af27062ec0659e5923df7cee3e5e76546189d4f9cd525766a9cdf42588c7bdda
unresolved:
- question: 'A hypothesis that declares no criterion, or no resolution, answers with what — a read failure naming where the parse broke, or a refusal naming a rule? Criteria 5 and 6 require the failure and no candidate node says which of the two it is. The base records the lacuna itself: definition/knowledge/refusal carries the open gap attributes.rule.structural-checks, whose why states that two of the material''s thirteen validation checks — that a hypothesis criterion is present, and that an outcome and a referral are present — are held as required attributes rather than as rule nodes, and that the material does not say what identifier a refusal names when one of those refuses. Those two checks are criteria 5 and 6 exactly.'
---
## What it is

One hypothesis as a value, with the four parts a case declares for it.

## Notes

Whether a hypothesis collects at least one concept and whether its name is unique in its case are checks, and they are cut in the validation epic.
That the criterion is prose the case declares and therefore sits in the file's frontmatter rather than in its body is a fact of the file, and it is cut with the reading task.
UNDERDETERMINED, from the binding — criteria 5 and 6 say the hypothesis does not parse, but the base reserves not-parsing for the structured part of the case file, while the presence of a criterion and of an outcome and a referral are counted among the validation checks, which run only over a file whose structured part did parse.
UNDERDETERMINED passes — a reader that answers a hypothesis missing its criterion with a read failure carrying a line and a column, and runs no further check over that file.
UNDERDETERMINED, from the binding — nothing in criteria 5 and 6 says what the failure they require carries for the curator, and the rule fixing the language of what a curator reads is left unbound here because binding it would presuppose which of the two answers applies.
UNDERDETERMINED passes — a shape whose missing-criterion and missing-resolution failures carry an English message.
UNDERDETERMINED, from the binding — criterion 4 names the resolution and no criterion decomposes it, yet the binding is of an embedded chain in which a resolution declares an outcome and a referral and a referral declares an action and a recipient, all required.
UNDERDETERMINED passes — a hypothesis whose resolution field is an unstructured string, or one that parses carrying an outcome and no referral.
UNDERDETERMINED, from the binding — criterion 2 says the concepts collected are carried as a list and states neither how many nor of what, while the bound node declares a minimum of one.
UNDERDETERMINED passes — a hypothesis value that parses with an empty collects list.
UNDERDETERMINED, from the binding — no criterion says where the four fields are read from, so the second clause of `rule/knowledge/the-frontmatter-holds-everything-the-case-declares` reaches nothing here.
UNDERDETERMINED passes — a reader that accepts the confirming criterion written as prose in the body below the frontmatter.
UNDERDETERMINED, from the binding — criterion 1 says only that a hypothesis carries a name, and no candidate states how a name compares.
UNDERDETERMINED passes — a shape that normalizes the name while parsing it, making two names the base holds to be two into one.
REMAINDER, from the binding — two rules of the bound `context/knowledge` reach no criterion, being checks over a case being validated rather than conditions on the shape of one hypothesis.
REMAINDER belongs — the validation work over `definition/knowledge/draft-case`, in `epic/case-validation`.
REMAINDER, from the binding — `context/knowledge`'s precedence rule and the candidate `rule/knowledge/hypotheses-are-ordered-by-precedence` are conditions over a case's list of hypotheses, not over the shape of one.
REMAINDER belongs — `task/case-shape/draft-case-shape`, whose hypotheses list holds the order.
REMAINDER, from the binding — `definition/knowledge/resolution`'s other consumer, the case's two fallbacks, reaches no criterion here, since this task holds a resolution only where a hypothesis confirms.
REMAINDER belongs — `task/case-shape/draft-case-shape`, which builds both fallback attributes.
REMAINDER, from the binding — three clauses of bound nodes describe the investigation side and reach no criterion: the evaluation citing a concept and a field, a resolution never being produced during an investigation, and a referral not being seen before the investigation has a record.
REMAINDER belongs — work over the investigation context, outside `epic/case-shape` altogether.
REMAINDER, from the binding — `definition/knowledge/hypothesis`'s rule that a criterion states exactly one falsifiable claim reaches no criterion here, and nothing this task delivers can reach it, because the base states no validator can check it.
REMAINDER belongs — human review of the case a specialist writes, which the base itself names as the only place it is settled.
Decision, beyond the covers — stand: `definition/knowledge/refusal`, `rule/knowledge/hypothesis-name-is-unique-in-its-case`, `rule/knowledge/concept-accepts-the-declared-subject-type`, `rule/knowledge/case-terms-exist-in-the-glossary`, `rule/knowledge/one-falsifiable-claim-per-criterion` and the five glossary definitions are `epic/case-validation`'s and `epic/published-language-ports`' claims, each bound by a task of the epic that owns it or declared uncovered there, so a shape task naming them records where the unreached clauses land rather than claiming validation work.
From the binding — the by-identity targets of the shape all sit outside the candidates, so no bound node says what a by-identity reference to one of them carries; the reader can carry the declared name as read, and if a typed identity is meant instead, the epic's claim grew.
