---
title: The capability registry read port
summary: The interface through which the authoring context asks which capability answers a concept and what that registered capability declares.
rationale: The decomposition cut this port apart from the glossary port because the two are interfaces of two different contexts and each changes for its own reason. The criteria asking the interface to distinguish an absent capability from one declaring no output schema or no timeout were removed after a binder found that the base holds neither declaration as omissible; what the base does admit is narrower and is now criteria four and five — an output schema is never empty, so absence is not encodable as an empty one.
sources:
  - intake/scope.md
objective: The authoring context reads the integration registry through one declared interface that answers whether a named concept has a registered capability and what that registered capability declares.
criteria:
  - The interface answers whether a named concept has a registered capability.
  - The interface answers, for a registered capability, its declared output schema.
  - The interface answers, for a registered capability, its declared timeout.
  - The output schema the interface answers with for a registered capability holds at least one entry.
  - A concept with no registered capability is answered as having none, and never as a capability carrying an empty output schema.
  - A stand-in implementation of the interface is exercisable without an integration registry.
  - Every capability a stand-in holds declares an output schema of at least one entry.
  - Every capability a stand-in holds declares a timeout.
nodes:
  - node: definition/integration/capability
    digest: sha256:80676c92ef8286fcfba04996c1672bef02ef9ec1426f7baa9ec4b2a79ed95a3b
  - node: definition/glossary/concept
    digest: sha256:078ee8a3f41d7cbe9cfc248e92b98a3460df2c3249b2a945466a40ad02cca3b7
  - node: context/integration
    digest: sha256:25ed4daf2dbc481af88c5a5d10bcfddc54da78188b6b7a564aefdaa1dfe82021
  - node: rule/integration/a-capability-is-read-only
    digest: sha256:6f1b47c0c28b725ee3e78d38e96521c2be925bb60ab09c06340f944a6f269dfa
  - node: rule/glossary/a-lookup-matches-a-published-name-exactly
    digest: sha256:2ea8ba89149becd1179fe9623d09227d5dafbcdb1534a29a57f1f9951b2dbbc5
waived:
  - gap: definition/integration/capability#attributes.timeout.unit
    why: Every criterion of this task turns on the timeout being declared and relayed, never on what it measures. The base gives the attribute as a required integer, criterion three has the interface answer that integer unchanged, and criterion eight asks a stand-in only that a timeout be present; nothing here compares the value to a clock or converts it, and the node states outright that the publication check reads that the declaration is present while invoking nothing. The unit becomes load-bearing where a deadline is enforced, which is the investigation act and not this port. Reject this waiver if the caller intends the stand-in fixture value itself to be read as a stated business figure.
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: The concept reaches this task only as the name the registry is keyed by, through the by-identity reference the capability declares. No criterion has the interface read, answer or interpret a concept's ttl; the staleness tolerance the ttl carries is consumed where a fact is collected, not where the registry is read.
---
## What it is

One read-only interface onto the registry of capabilities, and no implementation over a store.
It is what the contract check at publication calls.
It does not answer a capability's nature, because a registered capability has only one, and it does not answer whether a registered capability declares an output schema or a timeout, because the base holds that one declaring neither is not a capability.
What it does answer is the distinction that is real — a concept with no capability, against a capability whose schema is never empty.

## Notes

The last three criteria hold the stand-in to the same shape as the registry, so the place a test builds its world is not the place a refused value gets written.
The check that consumes this interface is cut in the publication epic and depends on this task.
UNDERDETERMINED, from the binding — no criterion requires the capability this interface answers about to be read-only, so the bound statement of `rule/integration/a-capability-is-read-only` reaches nothing this task can be held to, while what the authoring context needs answered is a registered read-only capability.
UNDERDETERMINED passes — a stand-in registry holding a capability whose nature is not read-only, and a port answering it as present, which reads true on every criterion.
UNDERDETERMINED, from the binding — criteria one and five turn on matching a named concept against what the registry holds, and no criterion states how that name is compared, while the bound lookup rule fixes the comparison for the published language and its body extends the decision to the whole system.
UNDERDETERMINED passes — a port matching concept names case-insensitively or after trimming whitespace, answering ONU-Offline with the capability registered for the published name onu-offline.
UNDERDETERMINED, from the binding — criteria two, four and seven speak of the output schema and its entries, and what an entry is, a field carrying a required name, is stated only by `definition/glossary/observation-field`.
UNDERDETERMINED passes — an interface answering the output schema as unnamed entries, opaque values or a count of at least one, while the base holds each entry to be a named observation field.
Decision, beyond the covers — stand: `definition/glossary/observation-field` is claimed by no epic of this plan, because what a citation points at is checked in the investigation act, and this port answers the schema as the list the capability declares.
UNDERDETERMINED, from the binding — the bound capability node gives a capability the identity of name plus version while the criteria speak throughout of a registered capability in the singular, which is what the base admits today.
UNDERDETERMINED passes — a port answering a set of capabilities for one concept, or selecting among several registered versions by a precedence rule of its own choosing, where the base describes neither multiplicity nor any selection or fallback plan.
REMAINDER, from the binding — the bound lookup rule is a glossary lookup answering a term as published over five kinds, and this task looks up the integration registry keyed by a concept name and answers no term as published.
REMAINDER belongs — `task/published-language-ports/glossary-read-port`, the sibling that reads the four closed vocabularies and answers a term as published.
REMAINDER, from the binding — `definition/integration/capability` states that a capability runs in the authorization scope of the requester and never that of the service, and this port reads declarations and invokes nothing.
REMAINDER belongs — the collection act in the investigation context, at `rule/investigation/collection-runs-in-the-requester-scope`.
Decision, beyond the covers — stand: `rule/investigation/collection-runs-in-the-requester-scope` belongs to the investigation context, which no epic of this plan claims, and an implementer must not build scope propagation into a registry read.
From the binding — five candidates govern nothing this task asserts and are left unbound, each reconciled by the sibling glossary port.
From the binding — the objective names the authoring context as the reader, and the sentence the criteria were cut from lives in `rule/knowledge/every-collected-concept-has-a-read-only-capability` together with `context/knowledge`, while every criterion is met from the integration side alone.
Decision, beyond the covers — stand: `rule/knowledge/every-collected-concept-has-a-read-only-capability` is `epic/case-publication`'s claim and `context/knowledge` is `epic/case-shape`'s, so the consumer's need is stated where the consumer is built rather than duplicated onto this port.
From the binding — the base already holds `interface/integration/capability-query` in this context and it is a different port, what the investigation context calls to have one concept answered about one subject, so this task must not extend or restate it.
Decision, beyond the covers — stand: `interface/integration/capability-query` is claimed by no epic of this plan, because invoking a capability belongs to the investigation act and this port answers declarations.
