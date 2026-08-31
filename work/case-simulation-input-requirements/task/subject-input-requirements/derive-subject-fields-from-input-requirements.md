---
title: Derive the subject's fields from the input-requirements read
summary: One editable subject field per case-input-requirement, each carrying that requirement's own required
  flag, and the connector and input-schema hint of a capability that asks for it wherever that capability
  is among the ones already composed.
rationale: 'Cut on the state side of the seam so the shape the Subject region is passed changes once,
  before any component reads it; the scope''s items 2 and 4 are merged into this one task because a field''s
  attribute, its required flag and its capability annotation are one construction of one value, and a
  task delivering the field without the annotation would have to leave that annotation empty for a sibling
  task to fill in. Retiring the superseded placeholder-scan derivation sits here rather than in a task
  of its own because its only reason to happen is this replacement landing, and splitting it would leave
  two authorities for one derivation standing in the tree between two deliveries. Narrowed once already:
  the connector/input-schema annotation is conditioned on the capability actually being among those useCapabilities()
  has composed, since domain/knowledge/case-input-requirement states the connector reaches the interface
  only through the referenced capability, and a field the read names can still render with no capability
  in hand.'
sources:
- work/case-simulation-input-requirements/intake/scope.md
objective: For the pinned case version, useSimulationSubject exposes one editable field per case-input-requirement
  the read names, each carrying that requirement's own required flag, and each carrying the connector
  and input-schema hint of a capability asking for it wherever that capability is among the ones useCapabilities()
  has already composed.
criteria:
- One editable field is exposed per requirement the read names, required and optional alike.
- Each exposed field carries its own requirement's required flag through unchanged.
- An exposed field whose requirement names a capability present in the capabilities useCapabilities()
  has already composed, matched by that capability's own name-and-version identity, names that capability's
  connector.
- An exposed field that resolves to a capability among those useCapabilities() has already composed carries
  that same capability's input_schema through as free text, never parsed or validated as structured data.
- A requirement naming a capability the capabilities useCapabilities() has already composed do not currently
  hold is exposed as a field all the same.
- No connector value and no input-schema hint is invented for an exposed field whose requirement resolves
  to no capability among those useCapabilities() has already composed.
- An attribute the read names required that no connector configuration's own call embeds as a placeholder
  is exposed as a field.
- No field in the exposed set is derived from a ${subject:<name>} placeholder read out of connector configuration
  text.
- The field set is derived for the case slug and version the cockpit pins, and a change to that pinned
  identity changes the set derived.
- The hook's own loading and error state reports the reads it now composes and no longer the connector-configuration
  read.
- deriveRequiredFields and collectionPlanFromManifest are gone from the tree rather than left as exports
  with no caller.
- subjectPlaceholderNamesInConfiguration remains in place for use-test-connector-panel.ts, its other consumer.
- No comment left in this path states the connector-placeholder scan as the basis of this hook's field
  set.
depends_on:
- task/subject-input-requirements/read-case-input-requirements-hook
implements:
- domain/knowledge/case-input-requirement
- domain/integration/capability
- contracts/knowledge/case-input-requirements
- rules/investigation/a-composed-subject-presents-every-case-input-requirement
- scenarios/investigation/a-simulate-screen-presents-an-undetected-required-attribute
---

## What it is
The replacement of the Subject region's derivation source: the field set now comes from the case version's own derived requirements, and the capability registry read is kept only for the annotation the response deliberately does not repeat.
Each field carries its requirement's required flag from here on, which is the fact everything downstream reads instead of inferring requiredness from a field's mere presence.

## Notes
useSimulationSubject's returned state is read by the cockpit's dispatch gate and, whole, by the Subject panel as one `state` prop; a field type gaining a required flag is additive for both, and the loading and error state those branches read verbatim now answers for different reads.
The pinned slug and version this derivation needs are already held by use-case-simulation-cockpit.ts, which is the one place SimulationSubjectSource is constructed.
UNDERDETERMINED, from the specification -- rules/investigation/a-composed-subject-presents-every-case-input-requirement requires every asking capability to be named alongside an input, never only one where more than one currently-registered capability asks for the same attribute, and domain/knowledge/case-input-requirement holds that set at cardinality 1..*; a passing implementation must expose every asking capability's own name, version and connector for a multiply-asked attribute, not the first match alone.
UNDERDETERMINED, from the specification -- the same rule requires each asking capability to be named by its own name and version together with its connector; a field exposing a connector with no accompanying capability identity does not satisfy it.
REMAINDER, from the specification -- the clause of rules/investigation/a-composed-subject-presents-every-case-input-requirement stating that only a required flag, never an attribute's mere presence, gates whether an input blocks the call reaches no criterion of this task: this hook exposes fields and dispatches nothing.
Belongs: the task that gates the simulate-case and simulate-hypothesis dispatch on the composed fields.
REMAINDER, from the specification -- the same rule's opening clause, over the interface assembling the subject "before a diagnose ... call", reaches no criterion of this task, whose criteria address only the simulation cockpit's pinned case version.
Belongs: the diagnose entry point's own subject-assembly interface.
REMAINDER, from the specification -- rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability and its scenario reach no criterion of this task: the field set derived here is per attribute, and the separately-named malformed capabilities are not fields.
Belongs: the sibling task that discloses the malformed-schema capabilities on the same cockpit.
REMAINDER, from the specification -- rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses's own collection-degradation clause, rules/investigation/a-simulation-carries-its-requester and rules/investigation/a-pending-simulation-call-is-not-dispatched-again each state a condition over the call itself; this hook dispatches nothing.
Belongs: the task that composes and dispatches the simulate-case / simulate-hypothesis call, and the engine's own collection.
REMAINDER, from the specification -- rules/investigation/a-subject-attribute-is-drawn-from-the-glossary, rules/investigation/a-subject-carries-at-least-one-attribute and rules/investigation/a-subject-holds-one-value-per-attribute each state a condition over an assembled subject's attribute-values; this task derives an editable field set and holds no values.
Belongs: the task that assembles the subject's attribute-values from the exposed fields.
Advisory: a requirement resolving to no capability among those useCapabilities() has already composed is a seam between two client-side reads composed at different moments rather than a domain state the specification names; nothing here says whether the composer should be told the two reads disagreed.
Advisory: the input-schema hint criterion is form, not specification conformance -- the decision log records the per-attribute schema hint as presentation guidance rather than a domain fact, so no record can be held to this criterion against a specification node; the value passed through is domain/integration/capability's own input_schema attribute, reached by identity, and passing it unparsed states no fact of its own.
