---
title: A hypothesis that collects nothing is refused
summary: The check that every hypothesis of a case collects at least one concept.
objective: A validation refuses a hypothesis that collects no concept, once per hypothesis that collects none.
rationale: The decomposition cut one task per rule the base registers, so each check can be shown met on its own. The criteria on the position, on the text and on the empty hypothesis list were re-cut after commit a50f278 made a refusal's position a required path, moved the refusal's text into this rule's own examples, and named this exact check as the one that must walk a case with no hypothesis and refuse nothing.
sources:
- intake/scope.md
- intake/scope-2026-08-07.md
criteria:
- A hypothesis collecting no concept is answered with a refusal naming this rule.
- That refusal's position reaches the hypothesis it refused at by its name.
- That refusal carries the text this rule declares, with the hypothesis named in place.
- A case whose two hypotheses each collect nothing is answered with two refusals, one at the position of each.
- Validating a case whose hypotheses list is empty runs this check, which completes and refuses nothing.
- A hypothesis collecting at least one concept is not refused by this rule.
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
- node: rule/knowledge/hypothesis-collects-at-least-one-concept
  digest: sha256:84c1a852159d8ec23ee73787e52737274532ff2a137f31d6e7e9152bcb8f862e
- node: rule/knowledge/the-refusal-text-comes-from-the-rule
  digest: sha256:15184e294ecccd91ebb234000ad37b37de3ec57bf30afa06e5d842175afbcbdd
- node: rule/knowledge/two-positions-are-two-refusals
  digest: sha256:430c295bf94b5e207717a04222a0cf91c54397a1701adc77d674e36d0546833a
- node: rule/knowledge/what-the-curator-reads-is-written-in-portuguese
  digest: sha256:46716746cab8ff38b085f7267455aa6ea6b4ec1fa354479227cff3f2ec68cae9
unresolved:
- question: No node states the vocabulary or the form of a refusal's position, so the path this check emits cannot be written. definition/knowledge/refusal says only that the position is a path into the case written in the vocabulary the case itself uses; rule/knowledge/a-position-indexes-a-hypothesis-by-name states only that the hypothesis segment is the name and, on collision, the ordinal; definition/knowledge/draft-case declares the containing attribute as hypotheses while the curator-facing text this rule declares is Portuguese and calls the collected list coletas. Criteria 2 and 4 need the segment naming the hypotheses list, the separator between segments, and the form the ordinal takes.
waived:
- gap: definition/knowledge/refusal#attributes.rule.structural-checks
  why: The gap is open only for the two validation checks the base holds as required attributes of a construct rather than as rule nodes, where no rule identifier exists for a refusal to name. This task's refusal names rule/knowledge/hypothesis-collects-at-least-one-concept, which is a rule node and has that identifier, so criterion 1 is decided without the open fact.
---
## What it is

The check that a hypothesis has something to collect, and so something it could later cite.

## Notes

Criterion four is what holds this check to one refusal per position rather than one per case.
Criterion five states in this task what the base states about this task: it is the example the validation rule uses for a check that must be safe over a malformed case.
UNDERDETERMINED, from the binding — `rule/knowledge/a-position-indexes-a-hypothesis-by-name` states that a position falls to the ordinal where two hypotheses carry the same name, and no criterion reaches that clause; the scenario is this task's own, because every check runs whatever an earlier one decided.
UNDERDETERMINED passes — a validation that builds every position for this rule from the hypothesis name alone, answering two refusals carrying one identical path over a case whose two same-named hypotheses each collect nothing.
REMAINDER, from the binding — the second clause of `rule/knowledge/a-validation-answers-with-every-refusal`, that a validation answers with every refusal those checks produced, reaches no criterion here.
REMAINDER belongs — `task/case-validation/refusal-and-accumulation`, which assembles the validation and answers with the refusals of all its checks together.
REMAINDER, from the binding — only the refusal clause of `rule/knowledge/what-the-curator-reads-is-written-in-portuguese` reaches this task, through criterion 3.
REMAINDER belongs — the work covering `definition/knowledge/read-failure` and `definition/knowledge/check-unavailable`.
Decision, beyond the covers — stand: `definition/knowledge/read-failure` is `epic/case-shape`'s claim and `definition/knowledge/check-unavailable` is `epic/case-publication`'s, each bound by a task of the epic that owns it.
REMAINDER, from the binding — the first example of `rule/knowledge/hypothesis-collects-at-least-one-concept` states that an empty collects list makes its case's publication refused, and no criterion here reaches publication.
REMAINDER belongs — the work covering case publication, over `lifecycle/knowledge/case-publication`.
Decision, beyond the covers — stand: `lifecycle/knowledge/case-publication` is `epic/case-publication`'s claim, bound by `task/case-publication/publish-transition`.
From the binding — fourteen candidates are deliberately unbound because a count over `collects` consults none of them; criterion 6 is decided by the presence of an entry and never by dereferencing it, since a check leaves what it cannot read to the check that owns it.
From the binding — criteria 4 and 5 need well-formed case and hypothesis fixtures whose shapes live in nodes this rule never reads, so if the fixture shape is to be governed by this task rather than taken from a task it depends on, the binding must grow.
From the binding — criterion 5's fixture is a case the base refuses elsewhere and this task must stay silent over, so the executor needs a representation of a case under edit that can hold an empty hypotheses list despite the declared minimum.
From the binding — a seam between two bound nodes over what fills the hypothesis placeholder: this rule instantiates with the hypothesis named in place, while `rule/knowledge/the-refusal-text-comes-from-the-rule` instantiates with the position, and the two coincide everywhere except where the position falls to the ordinal.
