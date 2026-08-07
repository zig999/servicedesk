---
title: Two hypotheses of one case never share a name
summary: The check that no two hypotheses of a case carry the same name, compared character for character.
objective: A validation refuses a case in which two hypotheses carry names equal character for character.
rationale: The decomposition cut one task per rule the base registers, so each check can be shown met on its own. The criterion on position was re-cut after commit a50f278 stated that this is the one case where a position cannot reach a hypothesis by name and falls to the ordinal, and the criterion on exact comparison was added from the rule's own second example.
sources:
- intake/scope.md
- intake/scope-2026-08-07.md
criteria:
- A case whose two hypotheses carry names equal character for character is answered with a refusal naming this rule.
- That refusal carries the text this rule declares, with the repeated name in place.
- That refusal's position reaches the repeated hypothesis by its ordinal, because the name does not tell the two apart.
- A case with one hypothesis named onu-offline and another named ONU-Offline is not refused by this rule, because the comparison is exact.
- A case whose hypothesis names are all distinct is not refused by this rule.
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
- node: rule/knowledge/hypothesis-name-is-unique-in-its-case
  digest: sha256:a54c619c909406004ba191479c21c862f5a69f717595f54e42aeec6b67335adb
- node: rule/knowledge/the-refusal-text-comes-from-the-rule
  digest: sha256:15184e294ecccd91ebb234000ad37b37de3ec57bf30afa06e5d842175afbcbdd
- node: rule/knowledge/two-positions-are-two-refusals
  digest: sha256:430c295bf94b5e207717a04222a0cf91c54397a1701adc77d674e36d0546833a
- node: rule/knowledge/what-the-curator-reads-is-written-in-portuguese
  digest: sha256:46716746cab8ff38b085f7267455aa6ea6b4ec1fa354479227cff3f2ec68cae9
unresolved:
- question: No node states, for one name repeated in one case, whether this check produces one refusal for the repeated name or one refusal per hypothesis carrying it, nor which of the same-named hypotheses the position's ordinal names. rule/knowledge/hypothesis-name-is-unique-in-its-case and rule/knowledge/a-position-indexes-a-hypothesis-by-name both say the position in the singular, rule/knowledge/two-positions-are-two-refusals counts one refusal per position, and the text the rule declares addresses both hypotheses in one sentence. Criterion 3 cannot be written or proved until this is settled.
- question: 'No node gives a refusal''s position as a literal, so the concrete form criterion 3 must produce is unstated: which segment names the hypotheses list in the case''s own vocabulary — the declared refusal texts show the case''s own keys are Portuguese, while definition/knowledge/draft-case names its attributes in English — how an ordinal is written into that path, and whether it counts from zero or from one.'
waived:
- gap: definition/knowledge/refusal#attributes.rule.structural-checks
  why: The gap is open only over the two checks held as required attributes rather than as rule nodes, and neither is this task's check. The refusal this task produces names rule/knowledge/hypothesis-name-is-unique-in-its-case, which is a rule node and has that identifier.
---
## What it is

The check that keeps two hypotheses of one case from colliding in silence, since evaluations are indexed by the name.

## Notes

Criterion three is new and is the only place in the plan where a position is an ordinal, because it is the only case the base admits one.
Criterion four is new: the base states that two names differing in letter case are two names and that nothing here refuses them, which a check comparing loosely would have got wrong while meeting every criterion this task carried before.
UNDERDETERMINED, from the binding — no criterion reaches `rule/knowledge/two-positions-are-two-refusals` for this check, because criteria 1-5 exercise a case carrying a single repeated name only.
UNDERDETERMINED passes — a check that answers exactly one refusal for the first repeated name it finds and leaves a second, unrelated repeated name in the same case unrefused.
UNDERDETERMINED, from the binding — no criterion reaches the clause of `rule/knowledge/a-validation-answers-with-every-refusal` that every check runs whatever an earlier check decided.
UNDERDETERMINED passes — a check that answers its refusal and stops the validation, so a case that both repeats a hypothesis name and names an unpublished term is answered with the repeated-name refusal alone.
REMAINDER, from the binding — `rule/knowledge/a-position-indexes-a-hypothesis-by-name` states two clauses and this task reaches only the second; the by-name clause and its third example, the case declaring no hypothesis at all, reach nothing here.
REMAINDER belongs — `task/case-validation/hypothesis-collects-a-concept` for the by-name clause, and `task/case-validation/at-least-one-hypothesis` for the empty-list position.
REMAINDER, from the binding — only the refusal clause of `rule/knowledge/what-the-curator-reads-is-written-in-portuguese` reaches a criterion here.
REMAINDER belongs — the tasks over `definition/knowledge/read-failure` and `definition/knowledge/check-unavailable`.
REMAINDER, from the binding — this rule's first example states that publication is refused over a case whose two hypotheses share a name, and no criterion here reaches publication.
REMAINDER belongs — `lifecycle/knowledge/case-publication`, through `task/case-publication/publish-transition`.
Decision, beyond the covers — stand: `definition/knowledge/read-failure` is `epic/case-shape`'s claim, and `definition/knowledge/check-unavailable` and `lifecycle/knowledge/case-publication` are `epic/case-publication`'s, each bound by a task of the epic that owns it, so the unreached clauses land there rather than growing this epic's claim.
From the binding — `rule/knowledge/the-refusal-text-comes-from-the-rule` requires a refusal to carry its rule's text instantiated with the position it names, while criterion 2 puts the repeated name in place, which is what this rule declares in its own example; this is the one rule where the two differ, because its position falls to an ordinal exactly when the name does not identify the hypothesis.
From the binding — within the candidates the ordinal criterion 3 names rests only on `definition/knowledge/draft-case` declaring `hypotheses` a list, and the nodes stating that a case's hypotheses are ordered and what that order means sit outside this epic's candidates.
Decision, beyond the covers — stand: `rule/knowledge/hypotheses-are-ordered-by-precedence` is `epic/case-shape`'s claim and `definition/knowledge/case` is `epic/case-publication`'s, and the ordering this criterion needs is delivered by `task/case-shape/draft-case-shape`, which this epic's checks read rather than restate.
