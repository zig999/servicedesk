---
title: A case with no hypothesis is refused
summary: The check that a case declares at least one hypothesis, and the refusal it answers at the hypothesis list.
objective: A validation refuses a case that declares no hypothesis, with a refusal positioned at the case's hypothesis list.
rationale: The decomposition cut one task per rule the base registers, so each check can be shown met on its own. The criterion on position was re-cut after commit a50f278 made a refusal's position required and gave this very check as the reason the hypothesis list is nameable while it is empty, which reverses the reading the plan carried.
sources:
- intake/scope.md
- intake/scope-2026-08-07.md
criteria:
- A case declaring no hypothesis is answered with a refusal naming this rule.
- That refusal's position is the case's hypothesis list.
- That refusal carries the text this rule declares for the curator.
- A case declaring at least one hypothesis is not refused by this rule.
depends_on:
- task/case-validation/refusal-and-accumulation
nodes:
- node: definition/knowledge/draft-case
  digest: sha256:9c3360b04b1eb11db3c2d54299b2909173b3ec7bfdfb6a4e5d47e69acbc668e9
- node: definition/knowledge/hypothesis
  digest: sha256:690eee99a05f5f75e890b6f1f06c278656b0fabd56ab9f6aac158dfdce3b065d
- node: definition/knowledge/refusal
  digest: sha256:309393768aaec5c1fa69a62da0f18443ca25d3f2bb49ed1da901c923e3132270
- node: rule/knowledge/a-position-indexes-a-hypothesis-by-name
  digest: sha256:1a4f8f4ed0c2e4add012cd0f3132a2bb8b4323a4a3b0bf9f082e5c5506ade131
- node: rule/knowledge/a-validation-answers-with-every-refusal
  digest: sha256:b467b515e8551ff4f6f914376608842fce28cf02545031f8c2aab4b369898886
- node: rule/knowledge/case-has-at-least-one-hypothesis
  digest: sha256:f7befee14a6e210ba336e3361a8be1ee3dfd58e4e8380875e3381752279e04b6
- node: rule/knowledge/the-refusal-text-comes-from-the-rule
  digest: sha256:15184e294ecccd91ebb234000ad37b37de3ec57bf30afa06e5d842175afbcbdd
- node: rule/knowledge/what-the-curator-reads-is-written-in-portuguese
  digest: sha256:46716746cab8ff38b085f7267455aa6ea6b4ec1fa354479227cff3f2ec68cae9
unresolved:
- question: Criterion 2 needs the literal value of the position naming the hypothesis list, and no node holds it. definition/knowledge/refusal states a position is a path into the case written in the vocabulary the case itself uses; rule/knowledge/a-position-indexes-a-hypothesis-by-name states that for a case declaring no hypothesis the position is the hypothesis list itself; and rule/knowledge/case-has-at-least-one-hypothesis states the refusal sits at the hypothesis list. None of the three states the path syntax, and none states what that segment is called in the case's own vocabulary — definition/knowledge/draft-case names the attribute hypotheses, while the text rule/knowledge/hypothesis-collects-at-least-one-concept declares addresses the curator's field in Portuguese, so the base's attribute names and the case file's own are not the same names.
- question: Whether a case file whose structured part parses but omits the hypothesis list entirely is refused by rule/knowledge/case-has-at-least-one-hypothesis at that same position, or answered some other way. The rule's expression counts case.hypotheses and definition/knowledge/draft-case declares that attribute required with a minimum of one, but rule/knowledge/a-position-indexes-a-hypothesis-by-name names the position as the hypothesis list while it is empty, which does not decide the absent case.
waived:
- gap: definition/knowledge/refusal#attributes.rule.structural-checks
  why: 'The gap is bounded by its own why to the two of the material''s thirteen checks that definition/knowledge/refusal holds as required attributes rather than as rule nodes. This task''s check is neither: rule/knowledge/case-has-at-least-one-hypothesis is a rule node and therefore has the identifier the refusal names, so what a refusal names when a structural check refuses does not bear on criterion 1.'
---
## What it is

The check that a case names at least one thing that might be wrong.

## Notes

Criterion two is the inversion of what this task carried: the plan said the refusal carries no hypothesis because the case declares none, and the base now says the refusal sits at the path naming the hypothesis list, so no refusal exists with no position to name.
Criterion three is now reachable, because the rule this check delivers declares the sentence the curator reads.
UNDERDETERMINED, from the binding — `rule/knowledge/case-has-at-least-one-hypothesis` declares `constrains: definition/knowledge/case`, the published case, while the node the check walks is `definition/knowledge/draft-case`, and the four criteria say only a case.
UNDERDETERMINED passes — a check that walks the published case value rather than the case under edit, refusing a published case with an empty hypothesis list and leaving the curator's editing path unchecked.
Decision, beyond the covers — stand: `definition/knowledge/case` is `epic/case-publication`'s claim and is bound by that epic's tasks, so naming it here records the seam without this epic claiming the published value.
UNDERDETERMINED, from the binding — the criteria are silent on what the validation does after this refusal, so nothing in them forces the rest of the validation to run.
UNDERDETERMINED passes — a validation that produces this rule's refusal and returns immediately, running none of its remaining checks.
UNDERDETERMINED, from the binding — criterion 2 says the position is the case's hypothesis list, which a prose phrase satisfies, while `definition/knowledge/refusal` requires a path into the case in the case's own vocabulary.
UNDERDETERMINED passes — a refusal whose position carries a human phrase such as the hypothesis list rather than a path.
UNDERDETERMINED, from the binding — criterion 1 says the refusal names this rule, which the rule's human title satisfies, while `definition/knowledge/refusal` requires the identifier.
UNDERDETERMINED passes — a refusal whose rule attribute carries the title or the bare slug rather than the identifier.
REMAINDER, from the binding — the first example of `rule/knowledge/case-has-at-least-one-hypothesis` states that a case whose hypothesis list is empty is refused at publication, and no criterion of this task reaches publication.
REMAINDER belongs — the publication act, over `lifecycle/knowledge/case-publication`.
Decision, beyond the covers — stand: `lifecycle/knowledge/case-publication` is `epic/case-publication`'s claim and is bound by `task/case-publication/publish-transition`, so the unreached clause lands there rather than growing this epic.
REMAINDER, from the binding — the statement of `rule/knowledge/a-validation-answers-with-every-refusal` reaches no criterion of this task, which states four criteria over one check and one refusal.
REMAINDER belongs — `task/case-validation/refusal-and-accumulation`, which assembles the checks into one answer.
REMAINDER, from the binding — the statement of `rule/knowledge/a-position-indexes-a-hypothesis-by-name` reaches no criterion here, whose refusal names the hypothesis list and never a hypothesis inside it; it is bound for its third example alone.
REMAINDER belongs — the tasks whose refusals sit inside a hypothesis, `task/case-validation/hypothesis-collects-a-concept` and `task/case-validation/unique-hypothesis-name`.
REMAINDER, from the binding — only the refusal clause of `rule/knowledge/what-the-curator-reads-is-written-in-portuguese` reaches criterion 3; its read-failure and unavailable-check clauses reach none.
REMAINDER belongs — the tasks that build `definition/knowledge/read-failure` and `definition/knowledge/check-unavailable`.
Decision, beyond the covers — stand: `definition/knowledge/read-failure` is `epic/case-shape`'s claim and `definition/knowledge/check-unavailable` is `epic/case-publication`'s, each bound by a task of the epic that owns it.
From the binding — criteria 1 and 4 are demonstrated over a case under edit whose other required attributes this task does not invent, so it needs whichever task builds the case construct; four of those constructs carry open gaps over their value vocabularies, which is that task's triage and not this one's.
From the binding — `rule/knowledge/two-positions-are-two-refusals` is a candidate deliberately not bound, because a case declares one hypothesis list and this check refuses at exactly one position.
