---
title: The glossary read port
summary: The interface through which the authoring context asks the glossary whether a term is registered and what a concept declares, matching names exactly.
rationale: The decomposition cut one port over the whole glossary rather than one per vocabulary because the base registers the four vocabularies and the concept registry in one context, and an interface split five ways would change five times for one reason. The criteria on matching were added after a binder read the rule on exact lookup as this port's contract almost verbatim.
sources:
  - intake/scope.md
objective: The authoring context reads the glossary through one declared interface that answers whether a named term matches a published name exactly and what a registered concept declares.
criteria:
  - The interface answers whether a named subject type is registered.
  - The interface answers whether a named outcome is registered.
  - The interface answers whether a named action is registered.
  - The interface answers whether a named recipient is registered.
  - The interface answers whether a named concept is registered.
  - The interface answers, for a registered concept, the subject types it accepts.
  - The interface answers, for a registered concept, the ttl it declares.
  - The interface answers that a name differing from a published name in letter case is not registered.
  - The interface answers that a name differing from a published name in surrounding whitespace is not registered.
  - The interface applies no normalisation to a name before comparing it.
  - A stand-in implementation of the interface is exercisable without a glossary store.
nodes:
  - node: context/glossary
    digest: sha256:589b61d969b2a6eacefcef2a43b5ecb4e9f38e7558522f76c9b77a86943a38d0
  - node: definition/glossary/subject-type
    digest: sha256:a2b480065c98dc6b15f228f1e05fb84e2729cd075f9c14579970db5efe45bb89
  - node: definition/glossary/outcome
    digest: sha256:40fad9d974f611796cc3974eeb6b311ac0ef6c6de39c5615f3eba4681eedaf2d
  - node: definition/glossary/action
    digest: sha256:f77670004b9b0aa3d01b7010e239c57c98609cb837b6f7fb64a11d51b85b43cb
  - node: definition/glossary/recipient
    digest: sha256:a5bc8e2e81ed13dfdf8b8ceabffab526153b6380b623c1cec46bc50d5e3e1654
  - node: definition/glossary/concept
    digest: sha256:078ee8a3f41d7cbe9cfc248e92b98a3460df2c3249b2a945466a40ad02cca3b7
  - node: rule/glossary/a-lookup-matches-a-published-name-exactly
    digest: sha256:2ea8ba89149becd1179fe9623d09227d5dafbcdb1534a29a57f1f9951b2dbbc5
waived:
  - gap: context/glossary#strategic
    why: The gap asks which of the three subdomains the glossary sits in. This task builds a read interface over vocabularies the same node already enumerates; no criterion turns on the strategic classification, and the classification changes neither what the interface answers nor how it compares a name.
  - gap: definition/glossary/subject-type#attributes.name.values
    why: The interface is given a name and answers whether it is registered; it never enumerates the vocabulary and never validates a name against a fixed list. The node itself says this vocabulary is discovered with the first cases, so its members are the glossary's data rather than anything this interface must know.
  - gap: definition/glossary/outcome#attributes.name.values.[]
    why: Criterion two asks the interface whether a given name is registered, not which outcomes exist. The node says every outcome beyond the two of non-conclusion is contributed by a confirmable hypothesis of some case, so the membership is data the interface reads and never a list it carries.
  - gap: definition/glossary/action#attributes.name.values
    why: Criterion three asks whether a given name is registered. The unnamed members of the action vocabulary are the glossary's data; the interface neither enumerates them nor holds them.
  - gap: definition/glossary/recipient#attributes.name.values
    why: Criterion four asks whether a given name is registered. The unnamed operational queues are the glossary's data; the interface neither enumerates them nor holds them.
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: Criterion seven has the interface answer the ttl a concept declares, and the node already types that value as a required integer. This task returns the declared value and interprets, converts or compares it nowhere — the unit becomes load-bearing where a fact's staleness is measured against the ttl, which no criterion of this task states.
---
## What it is

One read-only interface, and no implementation over a store.
It is what the checks against the published language call, so none of them reaches a glossary directly.
It compares a name character for character and normalises nothing, which is what keeps every check that calls it exact.

## Notes

The checks that consume this interface are cut in the validation epic and depend on this task.
UNDERDETERMINED, from the binding — the statement of `rule/glossary/a-lookup-matches-a-published-name-exactly` binds the match to a published name of the kind it is looked up as, and no criterion carries that clause.
UNDERDETERMINED passes — an interface backed by one flat set of published names answering all five questions from that one set, which satisfies every criterion as written yet answers a registered recipient name as a registered outcome.
UNDERDETERMINED, from the binding — `definition/glossary/concept` declares four attributes of a registered concept and criteria six and seven reach only two of them, while the node also states that the fields a concept declares are what a citation is checked against and that the check needs nothing outside the glossary.
UNDERDETERMINED passes — an interface whose concept answer carries the accepts list and the ttl and nothing else, which leaves that stated authority unreachable through the one declared interface.
Decision, beyond the covers — stand: `definition/glossary/observation-field` holds what such a field is and no epic of this plan claims it, because the citation check it serves belongs to the investigation act rather than to case authoring.
REMAINDER, from the binding — `definition/glossary/concept` states that a concept named by a case with no registered read-only capability makes the case unpublishable, which no criterion of this task reaches.
REMAINDER belongs — `task/published-language-ports/capability-read-port` for the registry read, and `task/case-publication/capability-contract-check` for the check that applies the clause.
REMAINDER, from the binding — `context/glossary` declares itself upstream by open-host-service to knowledge, investigation and integration alike, and this task's objective names only the authoring context.
REMAINDER belongs — the acts that build the investigation context's and the integration context's own reads of the glossary, which this plan does not build.
REMAINDER, from the binding — the body of the bound lookup rule says the comparison is the one the base already decided for hypothesis names, so the whole system compares names one way, and no criterion holds the two comparisons to one implementation.
REMAINDER belongs — `task/case-validation/unique-hypothesis-name`, which delivers `rule/knowledge/hypothesis-name-is-unique-in-its-case`.
Decision, beyond the covers — stand: `rule/knowledge/hypothesis-name-is-unique-in-its-case` is `epic/case-validation`'s claim, and a delivery may satisfy every criterion here with a comparison written twice, which is the seam this note names rather than a hole in either claim.
From the binding — three candidates governing the capability registry are left unbound, and this epic reconciles them through its other task.
From the binding — criterion eleven states a delivery shape rather than a domain fact, backed by no bound node and contradicted by none.
From the binding — the waiver of the ttl unit commits this task to surfacing the ttl as the required integer the node declares, since typing it as a duration would state a domain fact the base does not hold.
From the binding — the criteria say registered where the bound rule says answered as published, and no bound node gives a glossary term any state, so the two words are read here as one thing.
From the binding — the consumer-side rule that makes this port necessary is `rule/knowledge/case-terms-exist-in-the-glossary`, and each of the five bound definitions states its own must-exist rule, so nothing was reached for outside the candidates.
Decision, beyond the covers — stand: `rule/knowledge/case-terms-exist-in-the-glossary` is `epic/case-validation`'s claim, where the check that consumes this port is cut.
