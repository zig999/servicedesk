---
target: frontend
title: payload_notes declared in the capability form schema and read type
summary: Adds payload_notes as an optional free-text field to capabilityFormSchema and to the Capability
  read type, so a form value or a read answer may each carry or omit it.
task: sha256:70a131f0f9158e1ed0763cd19e2a6069a50f66807f7ad93bce602d81fcde105a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/capability-payload-notes-surface-payload-notes-declared-in-the-frontend-capability-contract-build
files:
- path: src/services/capability-form-schema.ts
  effect: 'capabilityFormSchema now declares payload_notes as z.string().optional(), so CapabilityFormValues
    carries payload_notes?: string alongside the existing fields.'
- path: src/hooks/use-capabilities.ts
  effect: 'The Capability read type now declares readonly payload_notes?: string, alongside its other
    read-only fields.'
criteria:
- criterion: capabilityFormSchema parses a form value object carrying a payload_notes string and yields
    that same string on the parsed result.
  met: true
  how: payload_notes is declared z.string().optional() with no transform, so a supplied string value passes
    through unchanged into the parsed result, the same way every other declared string field does.
- criterion: capabilityFormSchema parses a form value object carrying no payload_notes and reports no
    validation issue for that field.
  met: true
  how: .optional() makes the key's absence a valid parse for that field; Zod raises no issue for an optional
    field that is undefined.
- criterion: capabilityFormSchema reports no validation issue for a payload_notes value that is an empty
    string.
  met: true
  how: The declaration carries no .min(1) or other length constraint (unlike name/version/connector/concept),
    so any string, including "", satisfies z.string().optional().
- criterion: The Capability read type declares payload_notes, and a read answer carrying a payload_notes
    string typechecks against it.
  met: true
  how: 'readonly payload_notes?: string is added to the Capability type; an object literal supplying a
    string for that key is assignable to it like any other declared field.'
- criterion: A read answer carrying no payload_notes typechecks against the Capability read type.
  met: true
  how: The field is declared optional (?:), so an object literal omitting the key remains assignable to
    Capability.
nodes:
- node: domain/integration/capability
  encoded_at:
  - src/services/capability-form-schema.ts
  - src/hooks/use-capabilities.ts
  how: The node declares payload_notes with required false, as the one attribute so declared; both the
    form schema and the read type carry it as optional (.optional() / `?:`) rather than as a required
    field, matching that declaration exactly.
- node: rules/integration/a-capability-declares-its-contract
  how: This task's own Notes mark the rule's clauses on required-attribute declaration, the timeout default/positive-integer
    bound, and the HTTP 422 refusal as REMAINDER, reaching no criterion here; only the read-type/form-schema
    declarations that make payload_notes expressible are this task's, and both are in place. No source
    line here encodes the refusal or the timeout-default clause — those remain the register-capability
    task's.
inferences:
- inferred: payload_notes carries no minimum-length constraint in capabilityFormSchema, unlike name/version/connector/concept
    which all use .min(1).
  from: Criterion 3 requires an empty string to raise no validation issue, and domain/integration/capability's
    Description states an absent declaration (which the sibling rule treats as equivalent to an empty
    string) is simply "a capability that simply has none" rather than incomplete — so no non-emptiness
    is required of this field the way it is of the required attributes.
- inferred: The Capability read type's payload_notes field is declared with the TypeScript optional-property
    marker (`?:`) rather than as `string | undefined`.
  from: The existing convention in the same type (no field uses `| undefined`) mirrors how a reader would
    extend the type for any other optional attribute.
preserved:
- Every existing field and validation rule in capabilityFormSchema (name, version, nature, timeout, connector,
  concept) is unchanged.
- Every existing field in the Capability read type, and the CapabilitiesResult/CapabilitiesPage types
  built from it, are unchanged.
deferred:
- what: Rendering payload_notes in capability-form-fields.tsx (a bare Textarea, since json-textarea-field.tsx
    is JSON-specific), and reading/forwarding it in use-capability-form.ts and use-capability-detail.ts's
    defaultValues and PUT bodies.
  why: Outside this task's criteria, which cover only the shared schema and read-type declarations; the
    inventory names these as separate touched modules and the task's own rationale states the type/schema
    are cut ahead of their consumers rather than inside this task.
- what: Presenting payload_notes on a capability read by identity and returning it on discard.
  why: The task's own Notes mark both ADVISORY, as neighbouring obligations for sibling tasks; no criterion
    here covers either.
---
## What it is

capabilityFormSchema now declares payload_notes as an optional Zod string, with no minimum-length constraint, so a form value may carry or omit it.
The Capability read type now declares payload_notes as an optional readonly string, so a read answer may carry or omit it.
Both declarations follow the timeout precedent for an optional scalar attribute.

## Notes

The rule's clauses on required-attribute declaration, the timeout default and the HTTP 422 refusal are not reached here — the task's own Notes mark them REMAINDER, belonging to the register-capability work.
Rendering the field, and reading/forwarding it through the two form hooks, is deferred to the sibling tasks the plan already cuts for them.
