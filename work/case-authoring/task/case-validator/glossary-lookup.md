---
title: "Reading the published glossary"
summary: "One reading of the published glossary that answers whether a term is published under the kind it is looked up as, and yields the published concept when it is one."
rationale: "Five of this epic's checks read the glossary rather than the case alone, and a check that also decided how the glossary is read would put an interface and its consumers in one task, so the reading is cut out and the checks consume it."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A lookup over a published glossary answers, for a term and the kind it is looked up as, whether the glossary publishes that term under that kind, and yields the published concept when the term is a published concept."
criteria:
  - "A term the glossary publishes as a concept is answered as published when looked up as a concept."
  - "A term the glossary publishes no entry for is answered as not published under any kind."
  - "A term the glossary publishes as an outcome is answered as not published when looked up as an action."
  - "A term the glossary publishes as a concept is yielded as the glossary records it when looked up as a concept."
  - "The lookup answers from the glossary it was given and holds no term of its own."
nodes:
  - definition/glossary/concept
  - definition/glossary/observation-field
  - definition/glossary/subject-type
  - definition/glossary/outcome
  - definition/glossary/action
  - definition/glossary/recipient
  - rule/glossary/recipient-is-a-role
base: sha256:992232efc4c5444049969a8ae991757bdc82865a72e1ba1deb144660cfb7251f
unresolved:
  - question: "How a looked-up term is compared to a published name — the base decided exact character comparison for hypothesis names inside a case, and states nothing for a glossary lookup, so whether a name differing only in letter case from a published entry is answered as published is a fact no node holds."
waived:
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "The lookup yields the concept exactly as the glossary records it, ttl value included, and never interprets the ttl; the unit bears on publication checks and staleness judgments, not on whether a term is published or on what is yielded."
  - gap: definition/glossary/subject-type#attributes.name.values
    why: "The lookup answers from whatever glossary it is given; which subject-type names the vocabulary will eventually hold changes the glossary's content, never how membership under the kind is answered."
  - gap: definition/glossary/outcome#attributes.name.values.[]
    why: "Outcomes beyond the two of non-conclusion are contributed by future cases and arrive in the given glossary; the lookup needs no enumeration of them to answer whether a given term is published as an outcome."
  - gap: definition/glossary/action#attributes.name.values
    why: "The first case's actions are content of the glossary the lookup is given, not part of how the lookup answers; membership is answered the same whatever the names turn out to be."
  - gap: definition/glossary/recipient#attributes.name.values
    why: "The real operational queues are content of the glossary the lookup is given; the lookup answers existence under the kind and needs no enumeration of the queues."
---

## What it is

The one place the validator's checks read the published language from.
An answer per term and kind, so a name published as one kind is not taken for another.
The yielding of a published concept as the glossary records it, so a check reads a concept's declared facts rather than a copy of them.

## Notes

The last criterion is what keeps the vocabularies out of the source, since a lookup holding terms of its own would state in code what only the glossary decides.
No criterion here enumerates a member of any vocabulary, because the members are the glossary's to publish and not this plan's to write down.
From the binding — the terms-exist rule is the consumer of this lookup and the one place the base enumerates the five kinds a case names; it constrains the case and is left unbound here, and the validation that enforces it reads through the lookup this task delivers.
REMAINDER, from the binding — the enforcement clauses of the bound glossary definitions' rules, that a named term must exist, that a concept declares a ttl and its fields and accepts the subject type, and that a concept with no registered read-only capability makes the case unpublishable, constrain a case at publication and not the reading; they belong to the case-validation tasks of this plan.
REMAINDER, from the binding — the observation-field rule, that a field a citation names must be one the cited concept declares, reaches no criterion here since citation checking happens when an evaluation is judged; the node is bound only because the concept the lookup yields embeds its fields, and the check belongs to the citations task.
REMAINDER, from the binding — the recipient-is-a-role statement holds over registering glossary entries and the node itself says nothing verifies it; it is bound because it tells the reading that role-ness is already guaranteed and never the lookup's to check, and the assertion belongs to whoever registers entries, outside this plan.
UNDERDETERMINED, from the binding — no criterion tests whether an observation field's name answers a lookup, and the base states the fields are the concept's own rather than a vocabulary of their own; what passes is a lookup answering a field's name as published under an observation-field kind of its own, which the base refuses.
UNDERDETERMINED, from the binding — the criteria positively exercise only concept, outcome and action, and criterion 2 is satisfiable without ever consulting subject types or recipients; what passes is a lookup implementing only the kinds the criteria name, leaving a subject-type or recipient lookup unanswerable, which the five published kinds refuse.
