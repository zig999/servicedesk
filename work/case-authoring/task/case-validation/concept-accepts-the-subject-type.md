---
title: A collected concept accepts the case's subject type
summary: The check that each concept a case collects accepts the subject type that case declares, where the glossary publishes both.
objective: A validation refuses a case that collects a concept which does not accept the subject type the case declares, once at the position of each such collected concept.
rationale: The decomposition cut one task per rule the base registers, so each check can be shown met on its own. Criteria five and six were added after commit a50f278 answered, in this rule's own examples, the question this task carried about whether it refuses at all over a term the glossary does not publish; the criteria on position, count and text were re-cut from the same commit's changes to the refusal.
sources:
- intake/scope.md
- intake/scope-2026-08-07.md
criteria:
- A case collecting a concept that does not accept the case's declared subject type is answered with a refusal naming this rule.
- That refusal carries the text this rule declares, with the concept and the subject type in place.
- That refusal's position is the path at which the concept was collected.
- A case whose two hypotheses each collect a concept that does not accept the declared subject type is answered with two refusals, one at the position of each.
- A case collecting a concept the glossary does not publish is not refused by this rule.
- A case declaring a subject type the glossary does not publish is not refused by this rule.
- A case every collected concept of which accepts the declared subject type is not refused by this rule.
depends_on:
- task/case-validation/refusal-and-accumulation
- task/published-language-ports/glossary-read-port
nodes:
- node: definition/glossary/concept
  digest: sha256:f1a19eb16df7d560ae3a7e56ce39d44f83ee650bdde061efd75d566193716567
- node: definition/glossary/subject-type
  digest: sha256:a2b480065c98dc6b15f228f1e05fb84e2729cd075f9c14579970db5efe45bb89
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
- node: rule/knowledge/concept-accepts-the-declared-subject-type
  digest: sha256:c37dd5b0f5e1af435a7fb3387aa4a89d697759d983cc4697fa0659308b0669ae
- node: rule/knowledge/the-refusal-text-comes-from-the-rule
  digest: sha256:15184e294ecccd91ebb234000ad37b37de3ec57bf30afa06e5d842175afbcbdd
- node: rule/knowledge/two-positions-are-two-refusals
  digest: sha256:430c295bf94b5e207717a04222a0cf91c54397a1701adc77d674e36d0546833a
- node: rule/knowledge/what-the-curator-reads-is-written-in-portuguese
  digest: sha256:46716746cab8ff38b085f7267455aa6ea6b4ec1fa354479227cff3f2ec68cae9
unresolved:
- question: No node states the notation or the segment names a refusal's position is written in. definition/knowledge/refusal says only that the position is a path into the case written in the vocabulary the case itself uses, and rule/knowledge/a-position-indexes-a-hypothesis-by-name says the position reaches that hypothesis by that name and then the collected concept by its name, without giving how that path is spelled. The attribute names the base holds are English while the one refusal text that mentions a case field spells it in Portuguese. Criterion 3 asserts an exact position and criterion 4 asserts two distinct ones, and neither can be proved without the path's vocabulary and notation.
waived:
- gap: definition/glossary/concept#attributes.ttl.unit
  why: This check reads a concept's accepts and nothing else of its glossary entry. How stale a fact may be, and the unit that measures it, is what rule/knowledge/every-collected-concept-declares-a-ttl refuses over, and that rule is neither bound here nor reachable by any criterion of this task.
- gap: definition/glossary/subject-type#attributes.name.values
  why: This check compares the subject type a case declares against the types a concept's glossary entry publishes as accepted; it never enumerates the vocabulary. Criteria 6 and 7 turn on the published/unpublished distinction that rule/glossary/a-lookup-matches-a-published-name-exactly decides rather than on any member of the list.
- gap: definition/knowledge/refusal#attributes.rule.structural-checks
  why: The gap is open over the two checks the base holds as required attributes rather than as rule nodes. This task's refusal names rule/knowledge/concept-accepts-the-declared-subject-type, which is a rule node and has the identifier the gap's own why presupposes for such rules, so criterion 1 is decided without the open fact.
---
## What it is

The check that a case does not ask for a fact that does not apply to the kind of thing it investigates.

## Notes

Criteria five and six close the question the plan carried over whether a curator gets one refusal or two for one unpublished term: the term check owns that absence, and this check refuses nothing there.
Criterion four states what counts as one position for this rule, which the plan carried as a question and the base now answers by making a position a path.
UNDERDETERMINED, from the binding — the criteria say a case, and the base holds two models of that term; this rule names `definition/knowledge/case` in `constrains` while the binding uses `definition/knowledge/draft-case` because that is what the check reads, and nothing in the task text says so.
UNDERDETERMINED passes — a check that takes a published case value, with its version and content hash, and refuses it; every criterion as written is met, and `definition/knowledge/draft-case` refuses it.
UNDERDETERMINED, from the binding — the ordinal clause of `rule/knowledge/a-position-indexes-a-hypothesis-by-name` reaches no criterion, and it is live here because every check runs whatever an earlier one decided.
UNDERDETERMINED passes — a position that always spells the hypothesis segment as the hypothesis name and never falls to the ordinal, so criterion 4 is met while both refusals carry the same position string when two hypotheses share a name.
UNDERDETERMINED, from the binding — `definition/knowledge/refusal` and `rule/knowledge/the-refusal-text-comes-from-the-rule` both require the text instantiated with the position it names, while the text this rule declares holds only the concept and the subject type as placeholders; what instantiating with the position means for a text holding no position placeholder is reconciled nowhere in the base.
UNDERDETERMINED passes — a refusal whose text is the declared sentence with the position substituted into it or appended to it, which meets criterion 2 while `rule/knowledge/the-refusal-text-comes-from-the-rule` requires the declared text and no other.
REMAINDER, from the binding — the first clause of `rule/knowledge/a-validation-answers-with-every-refusal` and its rule about an unparseable case reach no criterion here; the node is bound for its second clause and for its rules that a check is safe over a malformed case and leaves what it cannot read to the check that owns it.
REMAINDER belongs — `task/case-validation/refusal-and-accumulation` for the composition, and the read-failure behaviour to the task binding `definition/knowledge/read-failure`.
REMAINDER, from the binding — only the refusal clause of `rule/knowledge/what-the-curator-reads-is-written-in-portuguese` reaches criterion 2.
REMAINDER belongs — the tasks over `definition/knowledge/read-failure` and `definition/knowledge/check-unavailable`.
Decision, beyond the covers — stand: `definition/knowledge/case` and `definition/knowledge/check-unavailable` are `epic/case-publication`'s claim and `definition/knowledge/read-failure` is `epic/case-shape`'s, each bound by a task of the epic that owns it, so the unreached clauses land there rather than growing this epic's claim.
