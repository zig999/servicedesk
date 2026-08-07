---
title: The capability registry read port
summary: The interface through which the authoring context asks which capability answers a concept, what that capability declares, and whether the registry could be consulted at all.
objective: The authoring context reads the integration registry through one declared interface that answers, for a concept named exactly, the at most one capability registered for it and what that capability declares, or that the registry could not be consulted.
rationale: The decomposition cut this port apart from the glossary port because the two are interfaces of two different contexts and each changes for its own reason. The criteria asking the interface to distinguish an absent capability from one declaring no output schema or no timeout were removed after a binder found that the base holds neither declaration as omissible. Criteria two, three and four were added after commit a50f278 fixed the registry's comparison character for character and stated the registry holds at most one capability for a concept, both of which this port carried as underdetermined seams; criteria nine and eleven were added because the base now distinguishes a registry that cannot be consulted from one that holds nothing, and a port that collapsed the two would make that distinction unbuildable in its consumer.
sources:
- intake/scope.md
- intake/scope-2026-08-07.md
criteria:
- The interface answers whether a named concept has a registered capability.
- The interface answers a registered capability only where that capability's concept name equals the term character for character.
- A term differing from a registered capability's concept name in letter case is answered as having no registered capability.
- The interface answers at most one capability for a concept.
- The interface answers, for a registered capability, its declared output schema.
- The interface answers, for a registered capability, its declared timeout.
- The output schema the interface answers with for a registered capability holds at least one entry.
- A concept with no registered capability is answered as having none, and never as a capability carrying an empty output schema.
- A registry that could not be consulted is answered as not consulted, and never as a concept having no registered capability.
- A stand-in implementation of the interface is exercisable without an integration registry.
- A stand-in implementation can be made to answer that the registry could not be consulted.
- Every capability a stand-in holds declares an output schema of at least one entry.
- Every capability a stand-in holds declares a timeout.
nodes:
- node: context/integration
  digest: sha256:25ed4daf2dbc481af88c5a5d10bcfddc54da78188b6b7a564aefdaa1dfe82021
- node: definition/glossary/concept
  digest: sha256:f1a19eb16df7d560ae3a7e56ce39d44f83ee650bdde061efd75d566193716567
- node: definition/integration/capability
  digest: sha256:d1cab846d7f441726474619d6dc845204f1da20b84a23db0ad3dcf22fd9cbab3
- node: rule/integration/a-registry-lookup-names-a-concept-exactly
  digest: sha256:bbea533af3fba878ef1c5ab2a27dac666f465c3a6e747334cc4bba2f1959a379
- node: rule/integration/one-capability-answers-one-concept
  digest: sha256:1659cf3eb0efc33de6dce312125e63049789b9a0a2835ef42ed8a69ccab34105
- node: rule/integration/a-capability-is-read-only
  digest: sha256:6f1b47c0c28b725ee3e78d38e96521c2be925bb60ab09c06340f944a6f269dfa
unresolved:
- question: 'No node states what the capability registry read port answers when the registry cannot be consulted, or that it surfaces that condition at all. The base gives the not-consulted outcome only as what publication answers with — definition/knowledge/check-unavailable and rule/knowledge/an-unavailable-check-is-not-a-refusal, both in the knowledge context — and it holds no interface node for the integration side of this read: interface/integration/capability-query is the collection port the investigation context calls, not this one. Criteria 9 and 11 assert the port itself distinguishes not-consulted from no-registered-capability; whether it does is a decision for /analyse-domain.'
waived:
- gap: definition/glossary/concept#attributes.ttl.unit
  why: The concept enters this task only as the name the registry is looked up by. This interface answers the capability's declarations — output schema and timeout — and no criterion reads, carries or compares the concept's ttl, so the unit of that ttl cannot change any answer this interface gives.
- gap: definition/integration/capability#attributes.timeout.unit
  why: 'Criteria 6 and 13 require the declared timeout to be answered and to be declared, never interpreted: this port carries the registry''s integer through unchanged and never compares it to a clock, so no answer of this interface differs by the unit. The waiver holds only for a pass-through; a port naming a unit in a field, a type or a conversion would un-waive it.'
---
## What it is

One interface over the capability registry, answering which capability is registered now for a concept and what it declares.
It also answers the one thing that is not about a concept at all — that the registry could not be reached.

## Notes

The last three criteria hold the stand-in to the same shape as the registry, so the place a test builds its world is not the place a refused value gets written.
Criteria two, three and four settle at this port what two consuming tasks carried as an underdetermined comparison, which is where the comparison belongs: once, at the seam, rather than restated at each consumer.
Criteria nine and eleven exist for a construct this epic does not claim, because the distinction has to be answerable through the interface before the consumer can obey the rule that owns it.
UNDERDETERMINED, from the binding — no criterion holds the capability this interface answers with, or a stand-in's capabilities, to a read-only nature; the registry refuses anything else and the nature enum admits no other value, but the criteria never say so.
UNDERDETERMINED passes — a port answer type, or a stand-in, carrying a capability whose nature is not read-only.
UNDERDETERMINED, from the binding — criterion 4 constrains what the interface answers, not what the registry or a stand-in holds, while `rule/integration/one-capability-answers-one-concept` constrains the holding.
UNDERDETERMINED passes — a stand-in loaded with two capabilities for the same concept name that answers one of them.
UNDERDETERMINED, from the binding — criteria 6 and 13 say nothing about how the timeout is spelled, and the base declares its unit an open gap.
UNDERDETERMINED passes — a port answer or stand-in naming the timeout with a unit, or converting it before answering.
UNDERDETERMINED, from the binding — criteria 5 and 7 pin nothing about what an output-schema entry is, and the node that says an entry is a named field is outside this epic's candidates.
UNDERDETERMINED passes — an output schema whose entries carry no name, a count, an untyped list or a free-form blob.
UNDERDETERMINED, from the binding — the capability's output schema and the concept's declared fields are both lists of observation fields with a minimum of one, so they are indistinguishable by shape, and no criterion says which of the two criterion 5 answers with.
UNDERDETERMINED passes — an interface that answers the concept's declared observation fields as the capability's output schema, collapsing a distinction the base keeps so the citation check's authority stays in the glossary.
UNDERDETERMINED, from the binding — a capability is identified by name and version, and no criterion says which version this interface answers with, nor that its answer identifies the capability at all.
UNDERDETERMINED passes — a port answering a capability version other than the one registered now, or a bare output-schema-and-timeout pair that names no capability.
REMAINDER, from the binding — the normalisation clauses of `context/integration` reach no criterion here; this port reads a registration and never invokes a capability or translates an answer.
REMAINDER belongs — the normaliser and adapter act, over `rule/integration/evidence-arrives-in-the-glossary-vocabulary`.
REMAINDER, from the binding — the clause that a capability runs in the authorization scope of the requester reaches no criterion; this interface runs nothing.
REMAINDER belongs — the collection act, over `rule/investigation/collection-runs-in-the-requester-scope`.
REMAINDER, from the binding — the case-side clauses of `definition/glossary/concept` reach no criterion here; this interface validates no case.
REMAINDER belongs — `task/case-publication/capability-contract-check` and the term and subject-type checks of `epic/case-validation`.
Decision, beyond the covers — stand: `definition/knowledge/check-unavailable` and `rule/knowledge/an-unavailable-check-is-not-a-refusal` are `epic/case-publication`'s claim, bound by `task/case-publication/unavailable-contract-check`, which depends on this port; the construct is claimed where publication answers with it, and this port only has to make the condition answerable, which is why criteria 9 and 11 stand here without this epic claiming those nodes. `definition/glossary/observation-field`, `rule/integration/evidence-arrives-in-the-glossary-vocabulary` and `rule/investigation/collection-runs-in-the-requester-scope` are outside this plan entirely.
From the binding — six candidates are left unbound because they govern the glossary's published-name lookup rather than the registry's; `task/published-language-ports/glossary-read-port` binds them.
