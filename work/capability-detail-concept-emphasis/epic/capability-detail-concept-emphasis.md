---
title: Capability detail concept emphasis
summary: The capability create/edit form's shared field markup is revised so concept
  reads with clear visual priority over the form's other attributes.
rationale: The scope names one screen and one visual outcome with no interface change,
  so one epic holds it; the full caller-supplied impact set is claimed here (this
  is the only epic this plan cuts) and every node in it is marked uncovered because
  the change alters no domain fact, no registration or resolution behavior, and no
  API surface -- it only rearranges how an already-declared field renders, so no task
  in this epic implements any of them.
covers:
- domain/integration/capability
- domain/integration/capability-nature
- domain/integration/capability-registry
- domain/glossary/concept
- rules/integration/a-capability-declares-its-contract
- rules/integration/a-capability-declares-well-formed-schemas
- rules/integration/a-capability-input-schema-holds-a-well-formed-object
- rules/integration/a-capability-is-read-only
- rules/integration/one-capability-answers-one-concept
- contracts/integration/capability-registry
- contracts/knowledge/capability-check
uncovered:
- node: domain/integration/capability
  why: States the capability aggregate's own attributes, including that it answers
    exactly one concept; this plan adds no attribute and changes none, only how the
    concept attribute already renders inside an existing form.
- node: domain/integration/capability-nature
  why: Defines the read-only/mutating enumeration bounding a capability's own nature;
    a change to the concept field's visual weight leaves this untouched.
- node: domain/integration/capability-registry
  why: Governs registration refusal and concept-to-capability resolution; this plan
    changes no registry behavior, only the client-side layout of a field the registry
    already accepts.
- node: domain/glossary/concept
  why: Defines what a concept itself is (name, accepts, ttl, description); this plan
    neither adds nor changes a concept, only how the form's existing concept selector
    visually reads.
- node: rules/integration/a-capability-declares-its-contract
  why: Governs which attributes a registration must declare and the refusal for an
    incomplete one; this plan changes no field's requiredness or refusal behavior.
- node: rules/integration/a-capability-declares-well-formed-schemas
  why: Governs schema validity at registration; the input/output schema editors are
    untouched by this layout change.
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  why: Governs the input schema's own required shape at registration; untouched by
    a change to a different field's visual weight.
- node: rules/integration/a-capability-is-read-only
  why: Governs the registry's refusal of a non-read-only nature; untouched by a layout
    change to the concept field.
- node: rules/integration/one-capability-answers-one-concept
  why: States the one-to-one enforcement the registry applies over which capability
    answers a concept; the scope cites this as why concept deserves visual weight,
    but the rule itself governs registration and resolution, neither of which this
    plan touches.
- node: contracts/integration/capability-registry
  why: The registry's published read/list/register API surface; unaffected by a client-side
    layout change to an already-rendered field.
- node: contracts/knowledge/capability-check
  why: What the contract check reads from integration to validate a case's concepts;
    unaffected by this form's layout.
sources:
- intake/scope.md
---

## What it is
The capability detail/edit form's shared field markup, where concept currently sits as an equal-weight third field beside timeout and connector.
The routed detail screen and the create/edit dialog that both compose that same markup unchanged.
The TUI component system and this app's own token wiring the visual change must draw from.

## Notes
None.
