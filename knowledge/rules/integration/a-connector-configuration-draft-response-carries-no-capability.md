---
type: invariant
statement: >-
  The answer draft-connector-configuration-from-openapi returns for a generated connector
  configuration draft carries that draft's own declared attributes and nothing besides: the
  capability reference domain/integration/connector-configuration-draft declares is read to
  resolve the draft and never handed back, so no name, no version and no count of the
  capabilities currently registered naming that connector appears in the answer, whether none,
  one or several are registered.
expression: >-
  For a connector name c and a draft generated for it, the successful answer of
  draft-connector-configuration-from-openapi holds one field per attribute
  domain/integration/connector-configuration-draft declares, on the presence terms that element
  declares for each, and no other field. Neither the answer nor any member of any of its fields
  names, versions or counts a capability currently registered naming c, and the set of fields
  the answer holds is the same for a c no capability is registered against as for one several
  are registered against. What the draft could not resolve for want of a registered capability
  reaches the answer only as an unresolved item with reason no-capability-registered.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

The capability reference a draft holds serves one purpose in this specification: `a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability` reads every capability currently registered naming the draft's connector to decide whether a parameter or request-body field name is one all of them declare among their own input schema properties.
No rule, scenario or surface anywhere has an operator act on that set.
What an operator does with a draft is read its configuration text, read what it left unresolved and why, and apply it to the Configuration field they are already editing — `applying-a-drafted-configuration-changes-only-the-local-edit` and `a-connector-configuration-draft-registers-nothing` bound the whole of that act — and none of those steps is taken against a capability.
Leaving a generation-time input out of the answer withholds nothing from the operator: the capabilities registered against a connector are a fact `contracts/integration/capability-registry` answers for, on its own reads and under the terms its own nodes state, and a draft answer enumerating them would answer for that registry from a route those nodes do not reach.

The draft already discloses each thing it read as the derived fact the operator acts on, never as the record it read.
The connector configuration currently registered under the same name is the other input generating a draft reads, and it reaches the answer only as `domain/integration/connector-configuration-draft-method-mismatch` — two method names side by side — never as the registration itself.
A security scheme reaches the answer only as `domain/integration/connector-configuration-draft-generated-credential` — the generated name and the scheme's own name — never as the value that credential resolves to, the same restraint `a-diagnostic-response-masks-a-resolved-credential` already holds over the other diagnostic read this context publishes.
The capability set is disclosed on exactly that pattern: as a `${subject:<name>}` placeholder where every registered capability declared the name, and as an unresolved item naming that name where they did not.

Nothing an operator could learn from the set is lost by it.
Whether any capability is registered against that connector at all is stated by reason `no-capability-registered`, which the placeholder rule puts on every candidate name where none is; whether what they declare covered the operation's names is stated name by name with reason `no-matching-input-schema-property`.
That is what `domain/integration/connector-configuration-draft`'s own Responsibility already bounds the draft's disclosure to — hold what could honestly be resolved, and "disclose by name and by reason everything it could not."
The answer's shape is therefore the same whichever of the three registration states holds, so a reader never reads registration state off the answer's shape rather than off the reason that states it.

An invariant over `domain/integration/connector-configuration-draft`, immediate and inside that one element: the condition is decidable from one answer alone, with no capability read needed to falsify it.
A new rule rather than `contracts/integration/connector-configuration-draft`, which as an api declares the operations it publishes and can declare no shape of an answer at all, and rather than the domain element, whose declaration leaves this open by construction — a declared reference says what the draft holds while it is generated, not what the operation hands back.
It decides nothing about how many capabilities the draft reads, nothing about how a name is matched, and nothing about the draft's refusals, each of which stays its own rule's.
