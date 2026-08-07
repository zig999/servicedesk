---
title: The shape of a case under edit
summary: A case while a curator is still writing it — everything the case declares, its hypotheses in declaration order, both fallbacks, and neither a version nor a hash.
rationale: The decomposition put the declaration order of the hypotheses and both fallbacks in this task because both are what the case itself holds; what walks that order and selects between those fallbacks when an investigation runs is not this plan's to build.
sources:
  - intake/scope.md
objective: A case under edit is a declared shape holding its slug, the subject type it investigates, its hypotheses in declaration order, and both fallbacks, and holding neither a version nor a hash.
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
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/knowledge/resolution
    digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
  - node: definition/knowledge/referral
    digest: sha256:7d74b30fc7b7813597b165588a4f8f5b7652235ebac9e320fa49a573f7eb9261
  - node: rule/knowledge/hypotheses-are-ordered-by-precedence
    digest: sha256:c5c1b66cff9265e8aa17c2be46f42bd4377e73801e215d95379cae6d60458fcb
  - node: rule/knowledge/the-fallback-follows-what-the-collection-returned
    digest: sha256:82526f2f2b1f34a5335cf16b85806777f8c196e7e86e834837b4eba6196d3412
waived:
  - gap: rule/knowledge/hypotheses-are-ordered-by-precedence#examples
    why: The gap withholds which cause dominates which, the precedence the specialists have not yet affirmed. This task builds a shape that preserves whatever order a curator declares; it neither chooses an order nor checks one, so criterion three is falsifiable against any declared order and the absent example orders cannot change what is written or how it is proven.
---
## What it is

The whole of what a curator writes, as one shape.
It holds the hypotheses in a form that preserves the order they were written in.
It holds two fallbacks rather than one, because the base registers two.

## Notes

The version and the hash are absent here on purpose: the base registers them as what publication assigns.
UNDERDETERMINED, from the binding — `definition/knowledge/draft-case` declares `title` and `when_to_use` as required and `curator_notes` as optional, and no criterion of this task reaches any of the three.
UNDERDETERMINED passes — a shape holding exactly the slug, the subject type, the hypotheses and the two fallbacks and nothing else, which meets every criterion while the bound node refuses it.
UNDERDETERMINED, from the binding — criterion three requires the hypotheses to be an ordered list and is silent on how many there must be, while the bound node declares a minimum of one.
UNDERDETERMINED passes — a shape that accepts a case under edit whose hypotheses list is empty, which trivially returns the declared elements in declaration order.
UNDERDETERMINED, from the binding — no criterion reaches the required attributes of the values this shape embeds, namely a hypothesis's name, collects, criterion and resolution, a resolution's outcome and referral, and a referral's action and recipient.
UNDERDETERMINED passes — a shape whose hypotheses elements and whose two fallbacks are opaque values, ordered and present and typed in name only, carrying none of those attributes.
REMAINDER, from the binding — the statement of `rule/knowledge/the-fallback-follows-what-the-collection-returned` selects between the two fallbacks over the evidence of an investigation, and nothing here selects; what this task answers for is that node's other clause, that both fallbacks are declared by the case.
REMAINDER belongs — the task that gives a case its answering behaviour, over `definition/investigation/evidence` in the investigation act.
Decision, beyond the covers — stand: `definition/investigation/evidence` belongs to the investigation context, which no epic of this plan claims.
REMAINDER, from the binding — clauses of the bound nodes that state publication and its checks reach no criterion here, since this task declares a shape and nothing in it publishes, validates or refuses.
REMAINDER belongs — the publication act at `lifecycle/knowledge/case-publication` and `definition/knowledge/case`, and the checks at `rule/knowledge/concept-accepts-the-declared-subject-type`, `rule/knowledge/case-terms-exist-in-the-glossary`, `rule/knowledge/one-falsifiable-claim-per-criterion` and `rule/knowledge/hypothesis-name-is-unique-in-its-case`.
Decision, beyond the covers — stand: `lifecycle/knowledge/case-publication` and `definition/knowledge/case` are `epic/case-publication`'s claim, answered by its own tasks.
Decision, beyond the covers — stand: `rule/knowledge/concept-accepts-the-declared-subject-type`, `rule/knowledge/case-terms-exist-in-the-glossary`, `rule/knowledge/one-falsifiable-claim-per-criterion` and `rule/knowledge/hypothesis-name-is-unique-in-its-case` are `epic/case-validation`'s claim, each answered by a task of that epic or declared uncovered there.
REMAINDER, from the binding — clauses stating that resolving the precedence is the case's own behaviour, that every hypothesis is judged even after one has confirmed, and that an evaluation must cite a concept and a field reach no criterion, because this shape carries the order and the declarations and resolves, judges and cites nothing.
REMAINDER belongs — the case's resolving behaviour and the evaluation of hypotheses, in the investigation act.
From the binding — every by-identity reference this shape carries points at `definition/glossary/subject-type`, `definition/glossary/concept`, `definition/glossary/outcome`, `definition/glossary/action` or `definition/glossary/recipient`, and `definition/glossary/outcome` is the sharpest of the five, because its name is an enum whose value list the base declares incomplete, so a shape that closed the enum would encode a vocabulary the base says is still open.
Decision, beyond the covers — stand: `definition/glossary/subject-type`, `definition/glossary/concept`, `definition/glossary/outcome`, `definition/glossary/action` and `definition/glossary/recipient` are claimed by `epic/published-language-ports` and `epic/case-validation`, and this cut keeps this task at the reference and never at what identifies the referent.
From the binding — all three candidate rules declare `definition/knowledge/case` in `constrains` and none names `definition/knowledge/draft-case`, and this binding reads the ordering and fallback rules as reaching the case under edit because the bound node states it holds everything the case declares.
From the binding — were the base to mean those rules to bind only the published value, criterion three's declaration order would rest on the attribute's list type alone, and correcting that reading belongs in the base through `/analyse-domain` rather than in the plan.
From the binding — criteria six and seven assert absences whose backing is inside the candidates, and `definition/knowledge/case#attributes.version.derivation` does not bear on them, because a case under edit carries no version to derive.
