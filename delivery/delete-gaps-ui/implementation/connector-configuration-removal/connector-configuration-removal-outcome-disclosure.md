---
target: frontend
title: Connector configuration removal states its answered outcome
summary: use-connector-configuration-detail.ts now discloses remove-connector's answered
  outcome through a success toast naming the connector and a generic failure toast
  for every refusal.
task: sha256:1a3004e51b8e2c0a96915d8deda28c5411c60592d46c7ff0a6ed49a8651be260
files:
- path: src/hooks/use-connector-configuration-detail.ts
  effect: Adds a removalFailureMessage(error) helper (empty kind-map, falling back
    to a fixed message) and wires removeMutation.onSuccess to toast.success and onError
    to toast.error(removalFailureMessage(error)).
criteria:
- criterion: A removal answered with HTTP 204 is stated as success naming the removed
    connector's name.
  met: true
  how: onSuccess calls toast.success interpolating the connector name.
- criterion: A removal refused with HTTP 400 VALIDATION_ERROR states that nothing
    was removed.
  met: true
  how: VALIDATION_ERROR resolves to generic-error, falling back to the fixed message.
- criterion: A removal refused with HTTP 500 INTERNAL_ERROR states that nothing was
    removed.
  met: true
  how: Same generic-error fallback path.
- criterion: A removal refused with an error code the surface does not recognise states
    that nothing was removed.
  met: true
  how: Any unrecognised code classifies as generic-error and takes the same fallback.
- criterion: While the removal has not been answered, the surface states neither success
    nor refusal.
  met: true
  how: Both toasts fire only from onSuccess/onError, invoked strictly after the DELETE
    settles.
nodes:
- node: rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: States success naming the connector, refusal (undifferentiated, per the task's
    own UNDERDETERMINED reading) stating nothing was removed, and silence while unanswered.
- node: domain/integration/connector-configuration
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: The disclosure is keyed to this element's own identity, its connector name.
- node: constraints/a-successful-connector-configuration-removal-answers-with-no-content
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: onSuccess treats the 204 resolution as success.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: VALIDATION_ERROR routes through the generic fallback.
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: INTERNAL_ERROR takes the same generic fallback path.
inferences:
- inferred: The three refusal cases all display the identical fixed message.
  from: The task's own Notes name this reading as passing every criterion; remove-connector
    raises no domain error a kind-specific entry could fill.
- inferred: Exact wording, "Nothing was removed." and "Connector configuration {connector}
    removed."
  from: No node states literal copy; mirrors this codebase's existing convention in
    use-connector-configuration-form.ts.
- inferred: Structured with an (empty) kind-map lookup rather than an always-generic
    function.
  from: API-02 in the standard and the established saveFailureMessage shape in use-connector-configuration-form.ts.
preserved:
- The existing removeMutation query-invalidation behavior is untouched.
- 'The existing navigate({ to: "/connectors" }) call added by the concurrently-run
  landing task is left exactly as found.'
- The save mutation's own onSuccess/onError behavior is untouched.
deferred:
- what: Stating "no longer registered" on success, and distinguishing the three refusal
    conditions.
  why: UNDERDETERMINED per the task's own Notes; not asked for by any criterion.
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-removal-connector-configuration-removal-outcome-disclosure-build
---

## What it is
States a connector configuration removal's outcome to the operator via toast — success, or a generic refusal message.

## Notes
None.
