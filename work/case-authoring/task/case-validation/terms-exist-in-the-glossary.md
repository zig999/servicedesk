---
title: Every term a case names exists in the glossary
summary: The check that every subject type, concept, outcome, action and recipient a case names matches a published name in the glossary exactly.
objective: A validation refuses a case that names a subject type, a concept, an outcome, an action or a recipient that does not match a published glossary name exactly, once at the position of each such term.
rationale: The decomposition kept the five vocabularies in one task because the base registers them as one rule over the whole of what a case names, and splitting them would produce five tasks that change together and refuse through the same rule. The criteria on position and count were re-cut after commit a50f278 made a position a path — which answers, with its own example over the two fallbacks, the question this task carried about how a refusal tells one fallback from the other — and after the same commit moved the refusal's text into this rule's examples.
sources:
- intake/scope.md
- intake/scope-2026-08-07.md
criteria:
- A case declaring a subject type the glossary does not publish is answered with a refusal naming this rule.
- A case whose hypothesis collects a concept the glossary does not publish is answered with a refusal naming this rule.
- A case whose resolution names an outcome the glossary does not publish is answered with a refusal naming this rule.
- A case whose referral names an action the glossary does not publish is answered with a refusal naming this rule.
- A case whose referral names a recipient the glossary does not publish is answered with a refusal naming this rule.
- A term differing from a published name only in letter case is answered with a refusal naming this rule.
- A term differing from a published name only in surrounding whitespace is answered with a refusal naming this rule.
- Each such refusal carries the text this rule declares, with the offending term and the kind it was looked up as in place.
- Each such refusal's position is the path at which the term was named.
- One hypothesis collecting two concepts the glossary does not publish is answered with two refusals, one at the path of each collected concept.
- A case whose two fallbacks each name a recipient the glossary does not publish is answered with two refusals, one at the path of each fallback's referral.
- A case every term of which matches a published name exactly is not refused by this rule.
depends_on:
- task/case-validation/refusal-and-accumulation
- task/published-language-ports/glossary-read-port
nodes:
- node: definition/glossary/action
  digest: sha256:f77670004b9b0aa3d01b7010e239c57c98609cb837b6f7fb64a11d51b85b43cb
- node: definition/glossary/concept
  digest: sha256:f1a19eb16df7d560ae3a7e56ce39d44f83ee650bdde061efd75d566193716567
- node: definition/glossary/outcome
  digest: sha256:40fad9d974f611796cc3974eeb6b311ac0ef6c6de39c5615f3eba4681eedaf2d
- node: definition/glossary/recipient
  digest: sha256:a5bc8e2e81ed13dfdf8b8ceabffab526153b6380b623c1cec46bc50d5e3e1654
- node: definition/glossary/subject-type
  digest: sha256:a2b480065c98dc6b15f228f1e05fb84e2729cd075f9c14579970db5efe45bb89
- node: definition/knowledge/draft-case
  digest: sha256:9c3360b04b1eb11db3c2d54299b2909173b3ec7bfdfb6a4e5d47e69acbc668e9
- node: definition/knowledge/hypothesis
  digest: sha256:690eee99a05f5f75e890b6f1f06c278656b0fabd56ab9f6aac158dfdce3b065d
- node: definition/knowledge/referral
  digest: sha256:7d74b30fc7b7813597b165588a4f8f5b7652235ebac9e320fa49a573f7eb9261
- node: definition/knowledge/refusal
  digest: sha256:309393768aaec5c1fa69a62da0f18443ca25d3f2bb49ed1da901c923e3132270
- node: definition/knowledge/resolution
  digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
- node: rule/glossary/a-lookup-matches-a-published-name-exactly
  digest: sha256:2ea8ba89149becd1179fe9623d09227d5dafbcdb1534a29a57f1f9951b2dbbc5
- node: rule/knowledge/a-position-indexes-a-hypothesis-by-name
  digest: sha256:1a4f8f4ed0c2e4add012cd0f3132a2bb8b4323a4a3b0bf9f082e5c5506ade131
- node: rule/knowledge/a-validation-answers-with-every-refusal
  digest: sha256:b467b515e8551ff4f6f914376608842fce28cf02545031f8c2aab4b369898886
- node: rule/knowledge/case-terms-exist-in-the-glossary
  digest: sha256:4484608fca5ec597d761e581cc2f78d3c516d0c8f25912ecd408ae7874718958
- node: rule/knowledge/the-refusal-text-comes-from-the-rule
  digest: sha256:15184e294ecccd91ebb234000ad37b37de3ec57bf30afa06e5d842175afbcbdd
- node: rule/knowledge/two-positions-are-two-refusals
  digest: sha256:430c295bf94b5e207717a04222a0cf91c54397a1701adc77d674e36d0546833a
- node: rule/knowledge/what-the-curator-reads-is-written-in-portuguese
  digest: sha256:46716746cab8ff38b085f7267455aa6ea6b4ec1fa354479227cff3f2ec68cae9
unresolved:
- question: 'No bound node states the segment names a refusal''s position path is written with, and criteria 9, 10 and 11 each require a concrete path. definition/knowledge/refusal says only that the position is a path into the case written in the vocabulary the case itself uses, and rule/knowledge/a-position-indexes-a-hypothesis-by-name fixes only the hypothesis segment as the hypothesis name. Unstated are the segments this task must emit: the one naming the declared subject type, the one naming a hypothesis''s collected concept, the one naming a hypothesis''s own resolution and its outcome and referral, and the ones naming the no-data fallback and the hypotheses-exhausted fallback and their referral''s action and recipient.'
- question: rule/knowledge/case-terms-exist-in-the-glossary declares its refusal text with a placeholder standing for the kind the term was looked up as, and criterion 8 requires that kind in place, but no node states the five words that fill it for a subject type, a concept, an outcome, an action and a recipient. rule/knowledge/what-the-curator-reads-is-written-in-portuguese requires the whole text to be Portuguese, and the English titles the five vocabulary definitions carry are not those words.
waived:
- gap: definition/glossary/subject-type#attributes.name.values
  why: This check compares a case's declared subject type against whatever the glossary publishes at lookup time — rule/glossary/a-lookup-matches-a-published-name-exactly states the lookup as some published entry of that kind, never as a fixed list in the base. Criterion 1 is exercised with any glossary content, and the eventual member names never become a literal of this check.
- gap: definition/glossary/action#attributes.name.values
  why: 'Same reason as the subject-type vocabulary: criterion 4 asks whether a named action matches a published entry, and the check reads the published set rather than an enumeration the base holds. Which actions the first case needs is data the glossary carries and this check never encodes.'
- gap: definition/glossary/recipient#attributes.name.values
  why: 'Same reason: criteria 5 and 11 ask whether a named recipient matches a published entry, and the check reads the published set. Which operational queues exist is data the glossary carries.'
- gap: definition/glossary/outcome#attributes.name.values.[]
  why: The gap concerns which further outcomes exist beyond the two of non-conclusion, and the node itself says each is contributed by a confirmable hypothesis of some case — so the vocabulary is a published set that grows. Criterion 3 asks only whether a named outcome matches a published entry, which is decidable without the enumeration.
- gap: definition/glossary/concept#attributes.ttl.unit
  why: This task looks a concept up by name and never reads its ttl. The node's own example puts the unpublished concept on this rule alone, with the ttl check refusing nothing over it, so the unit bears on rule/knowledge/every-collected-concept-declares-a-ttl and on no criterion here.
- gap: definition/knowledge/refusal#attributes.rule.structural-checks
  why: The gap asks which identifier a refusal names when one of the two checks held as required attributes rather than as rule nodes refuses. Every refusal this task produces names rule/knowledge/case-terms-exist-in-the-glossary, which is a rule node with an identifier, so criteria 1-7 and 12 are unaffected.
---
## What it is

The check that a case speaks only the published language, over every one of the five vocabularies it names terms from.

## Notes

The terms a fallback names are reached the same way, since a fallback carries a resolution like any other.
Criterion eleven answers what this task carried as an open question — two refusals over the same unpublished recipient in both fallbacks were indistinguishable while a position was a hypothesis name, and are two distinct paths now.
Criterion ten replaces the count the plan left unstated, and it is the base's own example.
Whether a registered concept declares a ttl and whether it accepts the case's subject type are two further checks, cut as their own tasks, and this rule is the one that owns a term the glossary does not publish at all.
UNDERDETERMINED, from the binding — criteria 9 and 10 fix the hypothesis segment of a position by name and never exercise the ordinal fallback, which `rule/knowledge/a-position-indexes-a-hypothesis-by-name` requires where two hypotheses of the case carry that same name; `rule/knowledge/a-validation-answers-with-every-refusal` makes that case reachable here, because every check runs even over a case another check has already refused.
UNDERDETERMINED passes — a term check that always writes the hypothesis segment of a position as the hypothesis name and never as an ordinal, which satisfies criteria 1-12 as written while the base refuses it over a case whose two hypotheses are both named onu-offline and one of which collects a concept the glossary does not publish.
UNDERDETERMINED, from the binding — criteria 3, 4 and 5 say a case whose resolution names an outcome and a case whose referral names an action or a recipient without saying which resolution, and criterion 11 exercises only the two fallbacks, while `definition/knowledge/hypothesis` makes a resolution required on every hypothesis and `definition/knowledge/resolution` embeds an outcome and a referral in each.
UNDERDETERMINED passes — a term check that looks outcomes, actions and recipients up only in the two fallbacks and never in each hypothesis's own resolution, which passes all twelve criteria and which `rule/knowledge/case-terms-exist-in-the-glossary` refuses.
UNDERDETERMINED, from the binding — no criterion exercises the of-the-kind-it-is-looked-up-as clause of `rule/glossary/a-lookup-matches-a-published-name-exactly`, because each of criteria 1-5 says only that the glossary does not publish the term.
UNDERDETERMINED passes — a term check that looks a term up against the union of the five vocabularies rather than against the published entries of the kind it was named as, so a recipient name that happens to be a published action is answered as published; criteria 1-12 all pass and the bound lookup rule refuses it.
REMAINDER, from the binding — the statement of `rule/knowledge/what-the-curator-reads-is-written-in-portuguese` has three clauses, and only the refusal clause reaches a criterion here; the read-failure and unavailable-check clauses reach none.
REMAINDER belongs — the tasks that deliver the read failure and the unavailable contract check, which bind `definition/knowledge/read-failure` and `definition/knowledge/check-unavailable`.
Decision, beyond the covers — stand: `definition/knowledge/read-failure` is `epic/case-shape`'s claim, and `definition/knowledge/case` and `definition/knowledge/check-unavailable` are `epic/case-publication`'s, and each is bound by a task of the epic that owns it, so naming them here records where the unreached clauses land without this epic claiming work another epic already holds.
REMAINDER, from the binding — the first clause of `rule/knowledge/the-refusal-text-comes-from-the-rule` is a base-wide obligation, and this task answers it for `rule/knowledge/case-terms-exist-in-the-glossary` alone through criterion 8.
REMAINDER belongs — each sibling check's task in `epic/case-validation`, every one of which declares its own text.
REMAINDER, from the binding — the first clause of `rule/knowledge/a-validation-answers-with-every-refusal` spans the whole check list and cannot be demonstrated by one check; criteria 10 and 11 reach only its second clause, and only for refusals this one rule produced.
REMAINDER belongs — `task/case-validation/refusal-and-accumulation`, which assembles the validation over all of its checks.
REMAINDER, from the binding — the third example of `rule/knowledge/case-terms-exist-in-the-glossary` states that an unpublished concept is refused by this rule alone and that the ttl and subject-type checks refuse nothing over it, and the silence of those two checks reaches no criterion here.
REMAINDER belongs — `task/case-validation/concept-declares-a-ttl` and `task/case-validation/concept-accepts-the-subject-type`, both of whose bound rules carry the mirroring example.
From the binding — `rule/knowledge/case-terms-exist-in-the-glossary` declares `constrains: definition/knowledge/case`, the published case value, while the artifact a validation check reads is `definition/knowledge/draft-case`, which states that the case under edit is what a publication check refuses; this task binds the case under edit on that node's own wording, and the seam is the rule's own edge rather than a fact the task lacks.
From the binding — six candidates are deliberately left unbound so the epic's coverage reconciles through other tasks: the five sibling check rules and `rule/knowledge/the-slug-matches-the-file-name`, each of which governs a different check with its own statement and its own refusal text.
