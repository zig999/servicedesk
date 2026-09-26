---
target: frontend
title: Disclose remove-concept's answered outcome on the concepts listing
summary: useRemoveGlossaryConcept now tells the operator, via toast, what the DELETE
  answered — success naming the removed concept, or a refusal distinguishing ConceptInUseError
  from every other refused or unrecognised condition — and says nothing while the
  request is still pending.
task: sha256:536b6e0a46765e8e948c9fbe2b3fcd85c2e56998a70b2a224c6c2b062cfde030
files:
- path: src/hooks/use-glossary-concepts.ts
  effect: useRemoveGlossaryConcept's mutation now carries onSuccess/onError; onSuccess
    toasts success naming the concept, onError calls removalFailureMessage(error,
    name), distinguishing concept-in-use from a shared generic message.
criteria:
- criterion: A removal answered with HTTP 204 is stated as success naming the removed
    concept's name.
  met: true
  how: onSuccess toasts "Concept ${name} removed."
- criterion: A removal refused with ConceptInUseError states that nothing was removed.
  met: true
  how: The concept-in-use branch opens "Nothing was removed".
- criterion: A removal refused with ConceptInUseError states that something still
    names the concept.
  met: true
  how: Same branch continues stating something still names the concept.
- criterion: The statement for a ConceptInUseError refusal differs from the statement
    for a refusal answered with HTTP 400 VALIDATION_ERROR.
  met: true
  how: VALIDATION_ERROR falls to the generic message.
- criterion: The statement for a ConceptInUseError refusal differs from the statement
    for a refusal answered with HTTP 500 INTERNAL_ERROR.
  met: true
  how: INTERNAL_ERROR falls to the same generic message.
- criterion: A removal refused with HTTP 400 VALIDATION_ERROR states that nothing
    was removed.
  met: true
  how: Falls through to the generic message.
- criterion: A removal refused with HTTP 500 INTERNAL_ERROR states that nothing was
    removed.
  met: true
  how: Same generic message applies.
- criterion: A removal refused with an error code the surface does not recognise states
    that nothing was removed.
  met: true
  how: Resolves to GENERIC_ERROR_STATE, mapped to the generic message.
- criterion: The statement for a refusal with an error code the surface does not recognise
    differs from the statement for a ConceptInUseError refusal.
  met: true
  how: An unrecognised code's kind is never "concept-in-use".
- criterion: While the removal has not been answered, the surface states neither success
    nor refusal.
  met: true
  how: Both toasts sit in onSuccess/onError, invoked only once settled.
nodes:
- node: domain/glossary/concept
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
  how: The concept's own name is what both messages name.
- node: rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
  how: 'Implements the concept-removal slice: success, refusal naming the condition
    apart from others, silence while pending. Capability/connector-configuration clauses
    out of reach.'
- node: rules/glossary/a-registered-concept-is-never-removed
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
  how: Only the ConceptInUseError code and that something still names the concept
    are read here.
- node: constraints/a-successful-concept-removal-answers-with-no-content
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
  how: onSuccess fires exactly on the resolved 204.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
  how: VALIDATION_ERROR is kept apart from concept-in-use via the generic fallback.
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
  how: INTERNAL_ERROR takes the same generic fallback path.
inferences:
- inferred: The ConceptInUseError message names the concept by name.
  from: The success message already names the concept; naming it here stays inside
    the accepted UNDERDETERMINED reading.
- inferred: VALIDATION_ERROR, INTERNAL_ERROR and an unrecognised code share one identical
    generic message.
  from: The task's own Notes name this exact reading as passing every criterion.
- inferred: The generic failure message's exact wording, "Nothing was removed. Try
    again."
  from: Existing GENERIC_SAVE_FAILURE_MESSAGE conventions elsewhere in the codebase,
    adapted to a removal.
preserved:
- The existing invalidateQueries call over ["glossary","concepts-with-ttl"] added
  by the concurrently-run concept-removal-landing task — left in place and built around.
- useGlossaryConcepts and every other export are unchanged.
deferred:
- what: Whether the listing stops showing the removed concept and where the operator
    lands.
  why: Assigned to concept-removal-landing.
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/concept-removal-concept-removal-outcome-disclosure-build
---

## What it is
States a concept removal's outcome to the operator via toast — success, or the ConceptInUseError refusal distinguished from every other.

## Notes
None.
