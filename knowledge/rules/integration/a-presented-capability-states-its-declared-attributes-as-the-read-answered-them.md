---
type: policy
statement: >-
  Where the identity-keyed read of the capability registered at a name and version an
  operator named has answered, the surface presenting that capability to the operator
  states its name and version and every attribute a capability declares — its nature, its
  input schema, its output schema, its timeout, its connector and the concept it answers —
  exactly as that answer carried each of them, states no value for any of them that the
  answer did not carry, and carries all of them from the moment that presentation begins:
  at no point in that presentation does an attribute of that identity stand absent, stand
  empty, or stand at a value drawn from anything but that read's own answer, unless the
  operator has themselves changed it.
expression: >-
  For a name n and a version v an operator named, and a surface presenting the capability
  registered at (n, v) through read-capability-by-identity of
  contracts/integration/capability-registry: where that read has answered, the surface
  states name, version, nature, input_schema, output_schema, timeout, connector and
  concept as that answer carries each of them, and states no value for any of them that
  that answer did not carry. Each of them is stated from the first moment this
  presentation stands, and not from some later moment inside it: while this presentation
  holds, and until the operator changes a field themselves, no attribute of (n, v) is
  presented as absent, as empty, or as a value drawn from any answer other than that
  read's own — not a page of list-capabilities the caller already held, not the answer of
  read-capability for the concept this capability answers, and not the content a
  register-capability submission carried. An edit the operator makes to a field is theirs
  and is no statement of this reading; what this states is what the presentation carries
  before and apart from any such edit. Nothing here turns on how the operator reached the
  surface.
constrains:
  - domain/integration/capability
consistency: eventual
---

## Description

`read-capability-by-identity` of `contracts/integration/capability-registry` is the read this presentation stands on, and `a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` already states the two windows in which that read has not answered, holds the three presentations of this one surface apart from one another, and forbids any capability attribute being presented as this identity's content in either unsettled window — while saying nothing at all of what the third presentation, the capability read and shown, carries.
So the whole of what an operator learns about a capability they opened by its own name and version fell to whatever a surface happened to render, in a specification that had already decided every neighbouring half of the same question.

The sibling registry's answer is the answer taken here.
`a-presented-connector-configuration-states-an-outstanding-or-failed-read` decides this same third window for the connector configuration screen in these very terms: the screen presents the connector name and the configuration exactly as the read answered them, and states no value that answer did not carry.
These two registries' surfaces are already governed together, deliberately and on the record — `a-submitted-registration-states-its-outcome-to-the-operator` and `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` each decide one fact for both, the second recording why: one write each, a create-or-replace keyed on an identity the operator supplies, authored directly by an operator on surfaces this specification reads as a pair.
Answering the read-and-shown window differently for a capability than for a connector configuration would give one specification two answers to one question.

Every declared attribute is stated, rather than some of them.
`a-capability-declares-its-contract` and `domain/integration/capability` between them make nature, both schemas, timeout, connector and concept all required of a registration, and the neighbouring surface rule's own reasoning is that a registration answers whole or is refused — so a reading showing part of what the read answered states as this identity's content a contract narrower than the one the registry holds.
`a-presented-case-version-states-its-own-declared-attributes` took exactly this answer for the other keyed reading in this specification: the reader is shown that record's own declared attributes, each read from that record itself.

No value the answer did not carry, because the source of what is shown is fixed rather than opportunistic.
`a-manifest-entrys-pinned-revision-is-always-shown` fixes what a reader is shown to the record's own reference rather than to whatever neighbouring answer happened to arrive beside it, and `a-draft-versions-content-is-presented-only-from-its-own-record` refuses the content of a creating request as the created record's own.
The neighbouring answers within reach here are a page of `list-capabilities`, whose key is the listing and not this identity; `read-capability`, whose key is a concept and which answers the capability currently registered for that concept, not necessarily the one standing at this name and version; and the content an operator submitted through `register-capability`, which is a request until the identity read answers it back.

The values hold from the moment the presentation begins, because the presentation is entered only on the strength of an answer that already carried them.
An attribute that arrives later leaves this presentation reading, for as long as that interval lasts, exactly like the outstanding window its neighbour states in its own right — the operator is looking at the capability read and shown while learning from it what a read still in flight would have told them, which is the one confusion those three presentations are held apart to prevent.
An empty schema is the worst of the available blanks: `a-capability-declares-well-formed-schemas` records that a malformed schema silently read as no fields at all wherever it was checked, and an input or output schema shown empty is that same silence carried into the reading an operator inspects and edits — `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` returns every field to the content the surface last read, and `register-capability` replaces whatever stood at the identity whole, so an operator submitting over an attribute that read empty replaces a declared schema with something nobody ever answered.

Nothing here is moved.
The two unsettled windows and the reattempt offered in the failed one stay `a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed`'s own; the refusal of an identity no capability is registered at stays `constraints/the-capability-identity-read-refuses-an-unregistered-identity`'s and the refusal past the limit stays `constraints/the-capability-identity-read-is-rate-limited`'s; no attribute is added to `domain/integration/capability`, no operation is published, and no call is refused.
The operator's own edit is untouched: what may be changed on this surface and what putting an edit down costs stay `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface`'s, this stating only what the reading carries before any edit is made.
Which control carries each attribute, its label, its order and its placement are form and belong to the interface, exactly as this specification's other surface rules leave them.

Consistency is eventual for the reason its neighbour over this same surface already states: the surface never holds the capability it presents, and everything it states is drawn from a read issued separately to the registry.
