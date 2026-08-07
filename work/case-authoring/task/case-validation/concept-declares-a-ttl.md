---
title: Every collected concept declares a ttl
summary: The check that each concept a case collects and the glossary publishes declares a ttl there.
objective: A validation refuses a case that collects a concept the glossary publishes whose entry declares no ttl, once at the position of each such collected concept.
rationale: The decomposition cut one task per rule the base registers, so each check can be shown met on its own. Criterion five was added after commit a50f278 stated in this rule's own example that it refuses nothing over a concept the glossary does not publish, which the plan carried as a seam between two checks with two readings; the criteria on position, count and text were re-cut from the same commit's changes to the refusal.
sources:
- intake/scope.md
- intake/scope-2026-08-07.md
criteria:
- A case collecting a concept the glossary publishes whose entry declares no ttl is answered with a refusal naming this rule.
- That refusal carries the text this rule declares, with the concept named in place.
- That refusal's position is the path at which the concept was collected.
- A case whose two hypotheses each collect a concept whose entry declares no ttl is answered with two refusals, one at the position of each.
- A case collecting a concept the glossary does not publish is not refused by this rule.
- A case every collected concept of which declares a ttl is not refused by this rule.
depends_on:
- task/case-validation/refusal-and-accumulation
- task/published-language-ports/glossary-read-port
nodes:
- node: definition/glossary/concept
  digest: sha256:f1a19eb16df7d560ae3a7e56ce39d44f83ee650bdde061efd75d566193716567
- node: definition/knowledge/draft-case
  digest: sha256:9c3360b04b1eb11db3c2d54299b2909173b3ec7bfdfb6a4e5d47e69acbc668e9
- node: definition/knowledge/hypothesis
  digest: sha256:690eee99a05f5f75e890b6f1f06c278656b0fabd56ab9f6aac158dfdce3b065d
- node: definition/knowledge/refusal
  digest: sha256:309393768aaec5c1fa69a62da0f18443ca25d3f2bb49ed1da901c923e3132270
- node: rule/glossary/a-lookup-matches-a-published-name-exactly
  digest: sha256:2ea8ba89149becd1179fe9623d09227d5dafbcdb1534a29a57f1f9951b2dbbc5
- node: rule/knowledge/a-position-indexes-a-hypothesis-by-name
  digest: sha256:1a4f8f4ed0c2e4add012cd0f3132a2bb8b4323a4a3b0bf9f082e5c5506ade131
- node: rule/knowledge/a-validation-answers-with-every-refusal
  digest: sha256:b467b515e8551ff4f6f914376608842fce28cf02545031f8c2aab4b369898886
- node: rule/knowledge/every-collected-concept-declares-a-ttl
  digest: sha256:805427aa4ede6ab9f3707f22bf916249756b87ffcd4de80f85646f6433aa2a51
- node: rule/knowledge/the-refusal-text-comes-from-the-rule
  digest: sha256:15184e294ecccd91ebb234000ad37b37de3ec57bf30afa06e5d842175afbcbdd
- node: rule/knowledge/two-positions-are-two-refusals
  digest: sha256:430c295bf94b5e207717a04222a0cf91c54397a1701adc77d674e36d0546833a
- node: rule/knowledge/what-the-curator-reads-is-written-in-portuguese
  digest: sha256:46716746cab8ff38b085f7267455aa6ea6b4ec1fa354479227cff3f2ec68cae9
unresolved:
- question: No node states the notation a refusal's position is written in. definition/knowledge/refusal says the position is a path into the case written in the vocabulary the case itself uses, and rule/knowledge/a-position-indexes-a-hypothesis-by-name gives the segments — the hypothesis by name, then the collected concept by name — but nothing states the field names a case file's frontmatter carries in the curator's own vocabulary, nor how the segments join into one string. The base's attribute names are English while the text rule/knowledge/hypothesis-collects-at-least-one-concept declares names the field to the curator in Portuguese, so the two readings give two different positions. Criteria 3 and 4 both assert a position, and a delivery must write one literal string.
waived:
- gap: definition/glossary/concept#attributes.ttl.unit
  why: 'This check reads only whether the glossary entry declares a ttl at all, never the value or how long it stands for: criterion 1 refuses on its absence and criterion 6 passes on its presence, and neither compares a duration. The unit bears on whoever consumes a ttl to decide staleness, which is the investigation context''s act and no part of this task.'
- gap: definition/knowledge/refusal#attributes.rule.structural-checks
  why: The gap is open only over the two checks held as required attributes rather than as rule nodes. The check this task builds is a rule node, so the identifier its refusal names is settled, and the open part of the gap reaches no criterion here.
---
## What it is

The check that how stale a fact may be is stated by the concept rather than assumed by whoever reads it.

## Notes

Criterion five is the settlement of a seam this task shared with the terms check: an unpublished concept is one refusal and not three at the same position.
Criterion four states the count the plan left to one refusal per case, which the base decides per position.
UNDERDETERMINED, from the binding — criterion 1 says the refusal names this rule without saying in what form, while `definition/knowledge/refusal` states a refusal names the rule that refused by its identifier.
UNDERDETERMINED passes — a refusal whose rule attribute carries the rule's title or an internal check name rather than the identifier.
UNDERDETERMINED, from the binding — criteria 3 and 4 say only that the position is the path at which the concept was collected, which an ordinal-only path satisfies, while `rule/knowledge/a-position-indexes-a-hypothesis-by-name` requires the hypothesis segment to be the name.
UNDERDETERMINED passes — an implementation that writes every position's hypothesis segment as the hypothesis's ordinal in the case's list.
UNDERDETERMINED, from the binding — the converse clause is equally unreached, because this check runs over a case whose two hypotheses share a name and there the ordinal is required, and no criterion states that scenario.
UNDERDETERMINED passes — an implementation that always indexes the hypothesis by name, emitting two refusals carrying one and the same position when two hypotheses of the case share a name.
UNDERDETERMINED, from the binding — criterion 4 fixes the count at one ttl-less concept per hypothesis, so it never exercises one hypothesis collecting two of them, which is `rule/knowledge/two-positions-are-two-refusals`' second example exactly.
UNDERDETERMINED passes — an implementation that emits at most one ttl refusal per hypothesis, collapsing two ttl-less concepts collected by the same hypothesis into a single refusal.
UNDERDETERMINED, from the binding — criterion 5 is satisfied vacuously by a validation that never reaches this check, while the bound rule states the stronger thing, that this check runs over an unpublished concept and refuses nothing there.
UNDERDETERMINED passes — an implementation that runs the ttl check only over a case no earlier check refused, so an unpublished concept short-circuits it instead of being read and passed over.
REMAINDER, from the binding — only the refusal clause of `rule/knowledge/what-the-curator-reads-is-written-in-portuguese` reaches a criterion of this task.
REMAINDER belongs — the read-failure clause to the act over `definition/knowledge/read-failure` and `rule/knowledge/an-unreadable-case-is-not-validated`, and the unavailable-check clause to the act over `definition/knowledge/check-unavailable` and `rule/knowledge/an-unavailable-check-is-not-a-refusal`.
REMAINDER, from the binding — `rule/glossary/a-lookup-matches-a-published-name-exactly` constrains the lookup of all five published vocabularies and only the concept lookup reaches a criterion here.
REMAINDER belongs — `task/case-validation/terms-exist-in-the-glossary` for the other four kinds, and `task/case-validation/concept-accepts-the-subject-type` for the subject-type lookup.
Decision, beyond the covers — stand: `definition/knowledge/read-failure` and `rule/knowledge/an-unreadable-case-is-not-validated` are `epic/case-shape`'s claim, and `definition/knowledge/check-unavailable` and `rule/knowledge/an-unavailable-check-is-not-a-refusal` are `epic/case-publication`'s, each bound by a task of the epic that owns it.
From the binding — `rule/knowledge/case-terms-exist-in-the-glossary` is left unbound although criterion 5 is the complement of what it owns, because the non-refusal criterion 5 states is declared by this task's own rule in its third example and its body; the seam is real and belongs to that rule's own task, which must show the same case yields exactly one refusal.
From the binding — this task binds `definition/knowledge/draft-case` as the construct the validation walks, while three sibling rules of this epic declare `constrains: definition/knowledge/case`, the published value; this task's rule constrains neither case node, so nothing here is contradicted, but the epic's tasks will disagree about which case construct they validate unless the base settles it.
Decision, beyond the covers — stand: `definition/knowledge/case` is `epic/case-publication`'s claim, so the disagreement is recorded here and settled where the published value is bound rather than by growing this epic.
From the binding — `definition/glossary/concept` declares `ttl` required while the scenario criteria 1 to 4 rest on is a published glossary entry that declares none, which the rule admits in two of its examples; a representation making the ttl structurally mandatory on the entry the check reads leaves criterion 1 undemonstrable.
