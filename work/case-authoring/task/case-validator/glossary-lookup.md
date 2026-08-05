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
  - definition/glossary/subject-type
  - definition/glossary/outcome
  - definition/glossary/action
  - definition/glossary/recipient
  - rule/knowledge/case-terms-exist-in-the-glossary
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
waived:
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "The lookup yields the concept as the glossary records it and never interprets the ttl, so the integer is carried through whatever its unit means."
  - gap: definition/glossary/subject-type#attributes.name.values
    why: "The lookup answers from the glossary it was given and holds no term of its own, so which names populate the vocabulary is data supplied to it rather than a fact it encodes."
  - gap: definition/glossary/outcome#attributes.name.values.[]
    why: "Criterion 3 needs an outcome entry to exist in the glossary under test, not the closed enumeration of every outcome the business will contribute."
  - gap: definition/glossary/action#attributes.name.values
    why: "The lookup asks the given glossary whether it holds an action entry for the term, and the members of the vocabulary are never held by the lookup."
  - gap: definition/glossary/recipient#attributes.name.values
    why: "Recipient membership is answered from the given glossary, and the names of the real operational queues bear on whoever registers them rather than on the read."
---

## What it is

The one place the validator's checks read the published language from.
An answer per term and kind, so a name published as one kind is not taken for another.
The yielding of a published concept as the glossary records it, so a check reads a concept's declared facts rather than a copy of them.

## Notes

The last criterion is what keeps the vocabularies out of the source, since a lookup holding terms of its own would state in code what only the glossary decides.
No criterion here enumerates a member of any vocabulary, because the members are the glossary's to publish and not this plan's to write down.
BLOCKING, from the binding — the objective ranges over every kind a term may be looked up as, but only the concept kind reaches a positive criterion, so a lookup answering not-published for every subject type, outcome, action and recipient the glossary does publish satisfies all five criteria as written.
From the binding — this task answers only the per-term existence question, and the clauses about walking a case and refusing on absence belong to the sibling checks.
From the binding — no bound node gives a glossary entry a publication state of its own, so publishes must be read as holds an entry for; any draft-versus-published distinction over glossary terms would be a fact no node holds.
The pin was restated deliberately rather than re-bound: the base moved by three nodes and this task binds none of them — the case under edit closed its own gap, the published case gained three, and the capability's output-schema gap kept its field name and changed only its why. The validator's totality check over every bound node's open gaps is what holds that judgment, and it refuses this task if the reading is wrong.
