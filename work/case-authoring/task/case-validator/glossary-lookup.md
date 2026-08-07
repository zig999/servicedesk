---
title: "Reading the published glossary"
summary: "One reading of the published glossary that answers whether a term is published under the kind it is looked up as, and yields the published concept when it is one."
rationale: "Five of this epic's checks read the glossary rather than the case alone, and a check that also decided how the glossary is read would put an interface and its consumers in one task, so the reading is cut out and the checks consume it."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
  - intake/escopo-revinculacao-cinco-decisoes.md
objective: "A lookup over a published glossary answers, for a term and the kind it is looked up as, whether the glossary publishes that term under that kind, and yields the published concept when the term is a published concept."
criteria:
  - "A term the glossary publishes as a concept is answered as published when looked up as a concept."
  - "A term the glossary publishes no entry for is answered as not published under any kind."
  - "A term the glossary publishes as an outcome is answered as not published when looked up as an action."
  - "A term the glossary publishes as a concept is yielded as the glossary records it when looked up as a concept."
  - "The lookup answers from the glossary it was given and holds no term of its own."
nodes:
  - node: rule/glossary/a-lookup-matches-a-published-name-exactly
    digest: sha256:2ea8ba89149becd1179fe9623d09227d5dafbcdb1534a29a57f1f9951b2dbbc5
  - node: definition/glossary/concept
    digest: sha256:078ee8a3f41d7cbe9cfc248e92b98a3460df2c3249b2a945466a40ad02cca3b7
  - node: definition/glossary/subject-type
    digest: sha256:a2b480065c98dc6b15f228f1e05fb84e2729cd075f9c14579970db5efe45bb89
  - node: definition/glossary/outcome
    digest: sha256:40fad9d974f611796cc3974eeb6b311ac0ef6c6de39c5615f3eba4681eedaf2d
  - node: definition/glossary/action
    digest: sha256:f77670004b9b0aa3d01b7010e239c57c98609cb837b6f7fb64a11d51b85b43cb
  - node: definition/glossary/recipient
    digest: sha256:a5bc8e2e81ed13dfdf8b8ceabffab526153b6380b623c1cec46bc50d5e3e1654
  - node: definition/glossary/observation-field
    digest: sha256:1b428e198555ff415ae67598961e884fcd34c7d2f97d5cac7ec3a93678dd7015
waived:
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "The lookup yields the concept exactly as the glossary records it and never interprets the ttl value; whether the integer means seconds or minutes changes nothing about whether a term is answered as published or what record is yielded."
  - gap: definition/glossary/subject-type#attributes.name.values
    why: "Which subject-type names exist is the content of the glossary the lookup is given, and the lookup holds no term of its own; an open enumeration is exactly the condition under which answering from the given glossary is the only correct behaviour."
  - gap: definition/glossary/outcome#attributes.name.values.[]
    why: "The outcomes beyond the two of non-conclusion are contributed by cases and live in the given glossary's content; the lookup compares whatever names that glossary publishes and needs no enumeration of them."
  - gap: definition/glossary/action#attributes.name.values
    why: "The action names are the given glossary's content, not the lookup's; the lookup compares against whatever is published and holds no term of its own, so the open enumeration does not bear."
  - gap: definition/glossary/recipient#attributes.name.values
    why: "The recipient names are the given glossary's content, not the lookup's; the lookup compares against whatever is published and holds no term of its own, so the open enumeration does not bear."
---

## What it is

The one place the validator's checks read the published language from.
An answer per term and kind, so a name published as one kind is not taken for another.
The yielding of a published concept as the glossary records it, so a check reads a concept's declared facts rather than a copy of them.

## Notes

The last criterion is what keeps the vocabularies out of the source, since a lookup holding terms of its own would state in code what only the glossary decides.
No criterion here enumerates a member of any vocabulary, because the members are the glossary's to publish and not this plan's to write down.
The comparison the lookup uses is now the base's to state, and it states it exactly — character for character, the same comparison hypothesis names get.
UNDERDETERMINED, from the binding — no criterion pins the comparison as exact character comparison, since criteria 1 and 2 test presence and total absence and criterion 3 tests kind scoping; what passes is a lookup that normalises letter case before comparing, answering ONU-Offline as published against a published onu-offline, which the exact-lookup rule refuses by its own example.
REMAINDER, from the binding — the bound glossary definitions each carry a rule sentence about what a case names, existence, the ttl, the declared fields, the accepted subject type and the unpublishable-without-a-capability clause, and none reaches a criterion of this task, which only reads the glossary and refuses nothing; they belong to the sibling validation checks that consume this lookup's answers.
REMAINDER, from the binding — the observation-field rule, that a field a citation names must be one the cited concept declares, reaches no criterion here, observation fields mattering only as part of the concept record criterion 4 yields; it belongs to the citation check of the answering epic.
REMAINDER, from the binding — the outcome node states the two non-conclusion outcomes exist before any case does, a fact about what the published glossary must contain, and criterion 5 forbids this lookup from holding any term of its own; seeding those entries belongs to whatever populates the published glossary this lookup is given, which this plan does not hold.
From the binding — the recipient-is-a-role rule is left unbound although it constrains the bound recipient, because it holds over the glossary's own registration and states itself that a check over a case tests only existence; it shapes no answer this lookup gives.
