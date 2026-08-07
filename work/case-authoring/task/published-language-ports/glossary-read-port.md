---
title: The glossary read port
summary: The interface through which the authoring context asks the glossary whether a term is registered and what a concept declares, matching names exactly.
objective: The authoring context reads the glossary through one declared interface that answers whether a named term matches a published name exactly and what a registered concept declares.
rationale: The decomposition cut one port over the whole glossary rather than one per vocabulary because the base registers the four vocabularies and the concept registry in one context, and an interface split five ways would change five times for one reason. The criteria on matching were added after a binder read the rule on exact lookup as this port's contract almost verbatim.
sources:
- intake/scope.md
- intake/scope-2026-08-07.md
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
- node: rule/glossary/a-lookup-matches-a-published-name-exactly
  digest: sha256:2ea8ba89149becd1179fe9623d09227d5dafbcdb1534a29a57f1f9951b2dbbc5
waived:
- gap: context/glossary#strategic
  why: 'The gap names which of the three subdomains the glossary sits in. Nothing in the objective or in criteria 1-11 turns on it: the port answers whether a name is published and what a published concept declares, and that answer is identical whichever subdomain classification the material eventually gives.'
- gap: definition/glossary/subject-type#attributes.name.values
  why: Criterion 1 asks that the interface answer whether a named subject type is registered, never which subject types are. Which names the glossary publishes is data the store holds and the exercise seeds; neither the port's shape nor its exact comparison changes when the enumeration is settled.
- gap: definition/glossary/action#attributes.name.values
  why: Criterion 3 asks that the interface answer whether a named action is registered, not which actions are published. The port is defined over whatever the glossary publishes, so the membership of the vocabulary reaches neither the interface nor its comparison.
- gap: definition/glossary/recipient#attributes.name.values
  why: Criterion 4 asks that the interface answer whether a named recipient is registered, not which operational queues are published. The port is defined over whatever the glossary publishes.
- gap: definition/glossary/outcome#attributes.name.values.[]
  why: The gap names the outcomes each confirmable hypothesis of some case will contribute. Criterion 2 asks only that the interface answer whether a named outcome is registered, and the node already states the two outcomes of non-conclusion that exist before any case does.
- gap: definition/glossary/concept#attributes.ttl.unit
  why: Criterion 7 asks that the interface answer the ttl a registered concept declares. The node states that ttl is an integer, and this task carries that declared integer across the interface unchanged — it neither compares it to elapsed time nor renders it — so the port is writable in full without a unit and without stating one.
---
## What it is

One interface over the published language, answering what is registered and what a registered concept declares.

## Notes

The checks that consume this interface are cut in the validation epic and depend on this task.
Nothing commit a50f278 added reaches this port, and the changes it made to `definition/glossary/concept` falsify no criterion here; the cut stands as it was, and only the digests it binds have moved.
UNDERDETERMINED, from the binding — the bound lookup rule binds the match to a published name of the kind it is looked up as, and no criterion excludes a cross-kind match.
UNDERDETERMINED passes — one set holding every published name of every kind behind five per-kind methods, so a name published only as an outcome answers registered when looked up as a subject type.
UNDERDETERMINED, from the binding — the criteria say registered throughout, while the base says published of the glossary and registered of the capability registry, so criterion 5 reads on the registry as easily as on the glossary.
UNDERDETERMINED passes — a glossary port whose concept answer consults the capability registry, registered iff some capability is registered for that name.
UNDERDETERMINED, from the binding — criterion 7 asks for the ttl while `definition/glossary/concept` leaves its unit open, and nothing keeps the implementation from supplying the unit the base withholds.
UNDERDETERMINED passes — a port typing the ttl answer as a unit-bearing duration, or naming a unit in the field, the parameter or the documented contract.
UNDERDETERMINED, from the binding — criterion 11 asks that a stand-in be exercisable without a store, and the stand-in must publish names to be exercised at all, while three of the four vocabularies have their membership open and the fourth names its illustrations only as illustrations.
UNDERDETERMINED passes — a stand-in seeded with the illustrative subject types, or with invented action and recipient names presented as the vocabulary.
UNDERDETERMINED, from the binding — criteria 6 and 7 are scoped to a registered concept, so nothing says what the port answers when asked for the accepts or the ttl of a name it does not publish.
UNDERDETERMINED passes — a port that raises, errors or refuses when asked for the accepts or the ttl of an unpublished name, producing a second refusal where the base says those checks refuse nothing.
REMAINDER, from the binding — the case-side clauses of every bound node reach no criterion here: that a term a case names must exist or the case cannot be published, and that every collected concept must accept the declared subject type. This task builds the lookups those checks call and performs none of them.
REMAINDER belongs — the tasks of `epic/case-validation` binding `rule/knowledge/case-terms-exist-in-the-glossary`, `rule/knowledge/concept-accepts-the-declared-subject-type` and `rule/knowledge/every-collected-concept-declares-a-ttl`.
REMAINDER, from the binding — two clauses of `definition/glossary/concept` speak of the capability registry and reach no criterion here.
REMAINDER belongs — `task/published-language-ports/capability-read-port`, which binds the four integration candidates this task does not.
REMAINDER, from the binding — the observation-fields clause of `definition/glossary/concept` reaches no criterion of this task.
REMAINDER belongs — the citation-check work of the investigation act, over `definition/investigation/citation` and `definition/glossary/observation-field`.
REMAINDER, from the binding — the clauses about how the vocabularies grow reach no criterion, this port reading and registering nothing.
REMAINDER belongs — the act that registers a glossary entry, which no candidate of this epic governs and this plan does not build.
REMAINDER, from the binding — the anticorruption-layer clause of `context/glossary` reaches no criterion here.
REMAINDER belongs — the integration normaliser work, over `rule/integration/evidence-arrives-in-the-glossary-vocabulary`.
Decision, beyond the covers — stand: `rule/knowledge/case-terms-exist-in-the-glossary`, `rule/knowledge/concept-accepts-the-declared-subject-type` and `rule/knowledge/every-collected-concept-declares-a-ttl` are `epic/case-validation`'s claim, each bound by the task of that epic which performs the check; `context/knowledge` is `epic/case-shape`'s, bound by `task/case-shape/draft-case-shape`; and `definition/investigation/citation`, `definition/glossary/observation-field`, `rule/integration/evidence-arrives-in-the-glossary-vocabulary` and `rule/glossary/recipient-is-a-role` are outside this plan entirely, so naming them records where the unreached clauses land rather than growing this epic over work it does not build.
From the binding — five candidates are left unbound, all of them the capability registry's; `task/published-language-ports/capability-read-port` binds them.
From the binding — the objective names the authoring context and the base names no context by that name; the reader is `context/knowledge`, and the seam is declared on the bound `context/glossary` as an open host service.
From the binding — the base holds no interface node for this port, so it is governed by five definitions and one rule and no base node states its published contract.
From the binding — `rule/glossary/recipient-is-a-role` constrains a bound node and is not a candidate; it does not bear on the port, since the node itself says nothing verifies that a registered recipient names a role rather than a person.
