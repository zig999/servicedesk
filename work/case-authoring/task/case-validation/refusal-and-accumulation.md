---
title: A refusal, and a validation that answers with every one
summary: What one refusal carries, where its position points, and a validation that runs every check it holds and answers with all of the refusals.
objective: Validating a case runs every check it carries whatever an earlier one decided, and answers with one refusal per position refused, each naming its rule, its position and the text that rule declares.
rationale: The decomposition put the refusal shape and the accumulation of refusals in one task because what a refusal carries and how refusals collect are one decision, and one refusal per position is a condition on that same shape rather than a separate outcome. The criteria on the position and on the text were re-cut after commit a50f278 replaced the two optional position parts with one required path, gave the path a case with no hypothesis is refused at, and moved the text a refusal carries into the rule that refused.
sources:
- intake/scope.md
- intake/scope-2026-08-07.md
criteria:
- A refusal carries the identifier of the rule that refused.
- A refusal carries a position.
- A refusal's position is a path into the case written in the vocabulary the case itself uses.
- A refusal carries the text the rule it names declares, instantiated with the position it names.
- The text a refusal carries is written in Portuguese.
- A position reaches a hypothesis by the name the curator gave it.
- A position reaches a hypothesis by its ordinal where two hypotheses of the case carry that same name.
- A refusal over a case that declares no hypothesis carries the position naming the hypothesis list.
- A case that two rules refuse is answered with a refusal from each.
- A case that one rule refuses at two positions is answered with one refusal per position, never one covering both.
- A check that refused does not prevent a later check from running.
- Validating a case whose hypotheses list is empty runs every check the validation carries and none of them fails.
- A case that no check refuses is answered with no refusal.
depends_on:
- task/case-shape/draft-case-shape
nodes:
- node: definition/knowledge/refusal
  digest: sha256:309393768aaec5c1fa69a62da0f18443ca25d3f2bb49ed1da901c923e3132270
- node: definition/knowledge/draft-case
  digest: sha256:9c3360b04b1eb11db3c2d54299b2909173b3ec7bfdfb6a4e5d47e69acbc668e9
- node: definition/knowledge/hypothesis
  digest: sha256:690eee99a05f5f75e890b6f1f06c278656b0fabd56ab9f6aac158dfdce3b065d
- node: definition/knowledge/resolution
  digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
- node: definition/knowledge/referral
  digest: sha256:7d74b30fc7b7813597b165588a4f8f5b7652235ebac9e320fa49a573f7eb9261
- node: rule/knowledge/a-validation-answers-with-every-refusal
  digest: sha256:b467b515e8551ff4f6f914376608842fce28cf02545031f8c2aab4b369898886
- node: rule/knowledge/two-positions-are-two-refusals
  digest: sha256:430c295bf94b5e207717a04222a0cf91c54397a1701adc77d674e36d0546833a
- node: rule/knowledge/a-position-indexes-a-hypothesis-by-name
  digest: sha256:1a4f8f4ed0c2e4add012cd0f3132a2bb8b4323a4a3b0bf9f082e5c5506ade131
- node: rule/knowledge/the-refusal-text-comes-from-the-rule
  digest: sha256:15184e294ecccd91ebb234000ad37b37de3ec57bf30afa06e5d842175afbcbdd
- node: rule/knowledge/what-the-curator-reads-is-written-in-portuguese
  digest: sha256:46716746cab8ff38b085f7267455aa6ea6b4ec1fa354479227cff3f2ec68cae9
- node: rule/knowledge/case-has-at-least-one-hypothesis
  digest: sha256:f7befee14a6e210ba336e3361a8be1ee3dfd58e4e8380875e3381752279e04b6
- node: rule/knowledge/hypothesis-name-is-unique-in-its-case
  digest: sha256:a54c619c909406004ba191479c21c862f5a69f717595f54e42aeec6b67335adb
unresolved:
- gap: definition/knowledge/refusal#attributes.rule.structural-checks
- question: 'How a position is spelled as a path — its separator, how an element of a list is named, and whether its segments use the field names definition/knowledge/draft-case records or the field names the case file itself carries. Criterion 3 requires the position to be written in the vocabulary the case itself uses, and no base node states what that vocabulary is: draft-case records the case''s attributes in English, while the refusal texts the rules declare address the curator in Portuguese and name coletas and hipoteses as the case''s own words. Nothing in rule/knowledge/what-the-curator-reads-is-written-in-portuguese reaches the position, which carries no language requirement at all.'
- question: 'Where the ordinal a position falls to counts from, and how it appears in the segment. rule/knowledge/a-position-indexes-a-hypothesis-by-name states that the segment is an ordinal where two hypotheses share a name, and no node says whether the first hypothesis is 0 or 1, nor how the ordinal is written. Criterion 7 is not falsifiable without it: two implementations, one 0-based and one 1-based, both satisfy it and hand the curator different cursors.'
---
## What it is

One refusal — a rule, a position and a text — and the validation that answers with every one its checks produced.

## Notes

Each check is cut as its own task and registers with this harness; none of them decides whether a later one runs.
Criteria one through eight replace the three conditional criteria the plan carried over an optional position: the base now makes the position one required path, so a refusal carrying none is no longer representable and the case with no hypothesis is refused at the hypothesis list rather than at nothing.
Criterion twelve is new, and it states the half of the base's rule the plan carried as a seam — a check must be safe over a case that does not hold together, rather than only not stop a later one.
Which text each rule declares is stated by that rule, so the check tasks carry it and this task carries only that a refusal carries the one its rule declared.
UNDERDETERMINED, from the binding — the statements of the two check rules bound here reach no criterion, because criteria 7, 8, 12 and 13 are each conditional on a refusal having been produced rather than requiring one.
UNDERDETERMINED passes — a validation carrying no check for either bound rule, answering no refusal over a case whose hypotheses list is empty and over a case with two hypotheses named alike.
UNDERDETERMINED, from the binding — the clause that a check leaves what it cannot read to the check that owns it reaches no criterion, because criteria 9 and 10 state a floor on how many refusals are answered and no ceiling.
UNDERDETERMINED passes — a validation answering three refusals at one position for a single unpublished concept, one from each of the term, ttl and subject-type checks.
UNDERDETERMINED, from the binding — `rule/knowledge/a-position-indexes-a-hypothesis-by-name` makes the ordinal the whole of the segment where a name collides, and criterion 7 states the where-clause without the exclusivity.
UNDERDETERMINED passes — a position whose hypothesis segment always carries both the name and the ordinal.
UNDERDETERMINED, from the binding — no criterion says what a validation answers that is not a refusal, so nothing keeps the answer from being a list of refusals alone, while the base holds that an unparseable file answers with a read failure and an unconsultable registry with an unavailable check.
UNDERDETERMINED passes — a validation whose answer type holds refusals only, so an unparseable case file and an unreachable capability registry each arrive as a refusal naming some rule.
UNDERDETERMINED, from the binding — the first clause of `rule/knowledge/the-refusal-text-comes-from-the-rule` reaches no criterion, and the base does not hold for one candidate: `rule/knowledge/the-slug-matches-the-file-name` declares no text and says so with its open gap.
UNDERDETERMINED passes — a harness where each check supplies its own refusal-text literal, so a check authors a Portuguese sentence of its own that no base node holds.
REMAINDER, from the binding — only the refusal clause of `rule/knowledge/what-the-curator-reads-is-written-in-portuguese` reaches criterion 5.
REMAINDER belongs — the task that builds the read failure and the unavailable-check answer, over `definition/knowledge/read-failure` and `definition/knowledge/check-unavailable`.
Decision, beyond the covers — stand: `definition/knowledge/read-failure` and `rule/knowledge/an-unreadable-case-is-not-validated` are `epic/case-shape`'s claim and `definition/knowledge/check-unavailable` and `rule/knowledge/an-unavailable-check-is-not-a-refusal` are `epic/case-publication`'s, each bound by a task of the epic that owns it; this epic builds the refusal and reads the other two answers rather than producing them.
REMAINDER, from the binding — `definition/knowledge/resolution` and `definition/knowledge/referral` are bound for their attribute names, which are the segments a position takes into a fallback; their other clauses reach no criterion here.
REMAINDER belongs — the investigation act for the first, and `task/case-validation/terms-exist-in-the-glossary` for the second.
From the binding — criteria 9 through 12 quantify over the checks the validation carries and this task binds two of them, so criterion 12's totality is demonstrable only over the checks registered when this task delivers, and preserving it is an obligation on every check added later.
From the binding — `definition/knowledge/refusal`'s gap puts the count of checks at thirteen, while the candidates hold seven rules that can refuse plus the two structural checks that gap names, so four of the thirteen are named by no node in this list.
