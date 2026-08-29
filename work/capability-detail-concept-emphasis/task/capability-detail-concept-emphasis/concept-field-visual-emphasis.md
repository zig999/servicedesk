---
title: Give the concept field visual priority in the capability form
summary: The capability create/edit form's shared field markup renders concept with
  a visual weight the form's other seven fields do not carry.
rationale: The scope states one outcome -- concept reads as most prominent -- achieved
  inside capability-form-fields.tsx's own markup with no change to CapabilityFormFieldsProps
  or to either caller composing it, so splitting the container styling from the field's
  positioning would produce two tasks neither independently demonstrable without the
  other; this is cut as one task. The scope leaves the exact visual mechanism (which
  existing TUI primitive, which token) open, so the criteria state the falsifiable
  outcome and its constraints rather than prescribing one specific technique.
objective: The concept field in the capability create/edit form renders with a visual
  weight distinct from the form's other seven fields, built only from the existing
  TUI component system and this app's own semantic tokens, with no change to the field's
  own control identity or to either of its callers.
criteria:
- Concept's field container carries at least one visual property (border, background,
  or typography weight/size) that none of the form's other seven field containers
  carry, so it reads as visually set apart rather than equal weight.
- Concept no longer shares that undistinguished visual weight with timeout and connector,
  the two fields it previously sat beside in one grid-cols-3 row with no distinguishing
  style.
- Every value used to build that visual distinction resolves to a semantic token already
  declared in frontend/tui/frontend/src/theme.css or frontend/app/src/design-system/tokens.css;
  no literal px, hex, or other raw value is introduced.
- The emphasis is built only from components already exported under frontend/tui/frontend/src/shared/components/ui
  plus this app's own typography utilities; no new component library is added and
  no existing TUI component's own source is copied or forked.
- 'The concept Select''s own identity is unchanged: it still resolves its options
  from conceptOptions, stays driven by the same Controller field.value/field.onChange
  wiring, keeps its aria-invalid/aria-describedby wiring, and stays disabled exactly
  while isSubmitting is true.'
- Neither capability-form-dialog.tsx nor capability-detail-ready-view.tsx requires
  a prop or call-site change for the new layout to render, since both compose CapabilityFormFields
  unmodified today.
- None of the form's other seven fields (name, version, nature, input_schema, output_schema,
  timeout, connector) changes position, meaning, or validation behavior as a result
  of this change.
sources:
- intake/scope.md
---

## What it is
The concept Select field inside capability-form-fields.tsx, currently an equal-weight third field beside timeout and connector.
Its container, given a visual treatment none of the form's other fields carry, built from an existing TUI primitive and this app's own semantic tokens.

## Notes
Advisory, from the execution-contract-binder -- independently re-read all 11 candidate nodes (domain/integration/capability, domain/integration/capability-nature, domain/integration/capability-registry, domain/glossary/concept, rules/integration/a-capability-declares-its-contract, rules/integration/a-capability-declares-well-formed-schemas, rules/integration/a-capability-input-schema-holds-a-well-formed-object, rules/integration/a-capability-is-read-only, rules/integration/one-capability-answers-one-concept, contracts/integration/capability-registry, contracts/knowledge/capability-check) in full, frontmatter and Description.
None states or implies anything about field rendering, visual weight, layout grouping, typography, borders, or backgrounds in a form -- they govern registration invariants, resolution policy, and the registry's API surface.
The epic's own judgment that all 11 are uncovered by this visual-only task is confirmed rather than merely trusted.
