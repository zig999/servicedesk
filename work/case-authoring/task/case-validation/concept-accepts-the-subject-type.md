---
title: A collected concept accepts the case's subject type
summary: The check that each concept a case collects accepts the subject type that case declares.
rationale: The decomposition cut one task per rule the base registers, so each check can be shown met on its own.
sources:
  - intake/scope.md
objective: A validation refuses a case that collects a concept which does not accept the subject type the case declares.
criteria:
  - A case collecting a concept that does not accept the case's declared subject type is answered with a refusal naming this rule.
  - That refusal names the position where the concept was collected.
  - A case every collected concept of which accepts the declared subject type is not refused by this rule.
depends_on:
  - task/case-validation/refusal-and-accumulation
  - task/published-language-ports/glossary-read-port
nodes:
  - node: definition/glossary/concept
    digest: sha256:078ee8a3f41d7cbe9cfc248e92b98a3460df2c3249b2a945466a40ad02cca3b7
  - node: definition/glossary/subject-type
    digest: sha256:a2b480065c98dc6b15f228f1e05fb84e2729cd075f9c14579970db5efe45bb89
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/knowledge/refusal
    digest: sha256:d0458e6eb99c1d11d6255524ceb9ca0f756d02c24001130643a58a71f16ac2d2
  - node: rule/knowledge/concept-accepts-the-declared-subject-type
    digest: sha256:b34df55dd4731914fe21cc0b8be6110b85b53548258aab68f080ba7da0b29e81
  - node: rule/knowledge/two-positions-are-two-refusals
    digest: sha256:8b64fd982e3ecc3ff92302f478f813f6215204358fc9947fc720f499819b15d3
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    digest: sha256:889848c729ee77b4fd4e51b6a436b0080eeaf208532749a45126011704fe21fa
  - node: rule/glossary/a-lookup-matches-a-published-name-exactly
    digest: sha256:2ea8ba89149becd1179fe9623d09227d5dafbcdb1534a29a57f1f9951b2dbbc5
unresolved:
  - question: Whether this rule refuses at all over a case that collects a concept the glossary does not publish, or over a case whose declared subject type the glossary does not publish. No accepts list can be read in either situation, and no node says whether this check answers a refusal there or refuses nothing and leaves the refusal to the terms check, which decides whether the curator gets one refusal or two for the same mistake.
  - question: What counts as one position for this rule when a single hypothesis collects two concepts that both fail to accept the declared subject type. definition/knowledge/refusal makes both position parts optional and describes the position as the hypothesis by name and the term or field offended, without saying which of the two, or the pair, constitutes a position.
  - question: What text a refusal produced by this rule carries for the curator, and in which language. definition/knowledge/refusal requires the text and states only that it is written for the curator, so prose invented in code here would read exactly like wording the business chose.
waived:
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: This check reads only the concept's accepts list. The ttl's unit decides staleness tolerance and bears on the ttl rule and on collection at investigation time; no unit, and no value of one, changes whether a collected concept accepts the subject type the case declares.
  - gap: definition/glossary/subject-type#attributes.name.values
    why: The check compares the name the case declares against the names the concept's accepts lists and never enumerates the vocabulary. The objective and all three criteria are demonstrable over any two distinct names, so the open vocabulary neither blocks the check nor obliges a fixture to assert that any illustrative name is published.
---
## What it is

One check that compares the case's declared subject type against what each collected concept accepts.

## Notes

UNDERDETERMINED, from the binding — nothing in the criteria fixes how many refusals a case with two offending collected concepts produces, while `rule/knowledge/two-positions-are-two-refusals` requires one per position.
UNDERDETERMINED passes — a check that answers a single refusal for a case whose two hypotheses each collect a concept not accepting the declared subject type, naming one of the two positions or naming both inside one refusal.
UNDERDETERMINED, from the binding — all three criteria speak of cases that declare hypotheses and collect concepts, so nothing requires this check to survive the malformed case that `rule/knowledge/a-validation-answers-with-every-refusal` obliges every check to walk.
UNDERDETERMINED passes — a check that raises, aborts the validation, or is skipped when the case declares no hypothesis at all or when a hypothesis's collects list is empty.
UNDERDETERMINED, from the binding — no criterion says how the collected concept's name is resolved in the glossary or how the declared subject type is compared to that concept's accepts entries, while `rule/glossary/a-lookup-matches-a-published-name-exactly` decides that comparison is character for character.
UNDERDETERMINED passes — a check that resolves the concept's glossary entry, or matches the declared subject type against that entry's accepts, case-insensitively or after normalisation, so a case declaring Customer is not refused against a concept accepting only customer.
REMAINDER, from the binding — the second clause of `rule/knowledge/a-validation-answers-with-every-refusal` is a totality over all of a validation's checks and reaches no criterion of this task, which delivers one check.
REMAINDER belongs — `task/case-validation/refusal-and-accumulation`, which assembles a validation's whole answer across every check.
REMAINDER, from the binding — the application of `rule/glossary/a-lookup-matches-a-published-name-exactly` to outcome, action and recipient lookups reaches no criterion of this task, which resolves only concepts and subject types.
REMAINDER belongs — `task/case-validation/terms-exist-in-the-glossary`, where outcome, action and recipient names are looked up.
From the binding — `rule/knowledge/concept-accepts-the-declared-subject-type` declares `definition/knowledge/case` in `constrains`, and this binding reads `definition/knowledge/draft-case` instead, on that node's own statement that a case under edit is what a publication check refuses.
Decision, beyond the covers — stand: `definition/knowledge/case` is `epic/case-publication`'s claim, and this epic checks the case under edit deliberately, because that is what a curator can still fix.
From the binding — the bound rule's example ties this refusal to publication, and the act itself lives in a node outside the candidates, though the check as specified by the three criteria does not need it.
Decision, beyond the covers — stand: `lifecycle/knowledge/case-publication` is `epic/case-publication`'s claim and is bound by `task/case-publication/publish-transition`, which is where every check is invoked from.
From the binding — criterion two's position is the hypothesis by name, which identifies one place in the case only because `rule/knowledge/hypothesis-name-is-unique-in-its-case` holds, and that rule is left to its own task.
