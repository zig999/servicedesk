---
target: frontend
title: Disclose the answered outcome of a capability removal
summary: use-capability-detail.ts's delete mutation now tells the operator, through
  toast, the outcome remove-capability answered — success naming the capability, or
  a refusal distinguishing CapabilityCitedByEvidenceError from every other and unrecognised
  code — and stays silent while the DELETE is pending.
task: sha256:1fb947b786b1358126cd0a90ef6c327b575549bdb8482b20b80fcf6fe6efe761
files:
- path: src/hooks/use-capability-detail.ts
  effect: Added removeFailureMessage (mirroring saveFailureMessage), built on uiStateForApiError,
    mapping capability-cited-by-evidence to a distinct message and every other kind
    to a generic one. Wired deleteMutation's onSuccess to toast.success and onError
    to toast.error(removeFailureMessage(error)).
criteria:
- criterion: A removal answered with HTTP 204 is stated as success naming the removed
    capability's name and version.
  met: true
  how: onSuccess calls toast.success naming name and version, and that the identity
    is no longer registered.
- criterion: A removal refused with CapabilityCitedByEvidenceError states that nothing
    was removed.
  met: true
  how: The capability-cited-by-evidence branch opens "Nothing was removed".
- criterion: A removal refused with CapabilityCitedByEvidenceError states that collected
    evidence names the capability.
  met: true
  how: Same message states collected evidence names this capability.
- criterion: The statement for a CapabilityCitedByEvidenceError refusal differs from
    the statement for a refusal answered with HTTP 400 VALIDATION_ERROR.
  met: true
  how: VALIDATION_ERROR falls to the generic fallback message, textually distinct.
- criterion: The statement for a CapabilityCitedByEvidenceError refusal differs from
    the statement for a refusal answered with HTTP 500 INTERNAL_ERROR.
  met: true
  how: INTERNAL_ERROR likewise resolves to the generic fallback.
- criterion: A removal refused with HTTP 400 VALIDATION_ERROR states that nothing
    was removed.
  met: true
  how: Resolves to GENERIC_REMOVE_FAILURE_MESSAGE.
- criterion: A removal refused with HTTP 500 INTERNAL_ERROR states that nothing was
    removed.
  met: true
  how: Resolves to the same generic message.
- criterion: A removal refused with an error code the surface does not recognise states
    that nothing was removed.
  met: true
  how: Falls through to GENERIC_ERROR_STATE, mapped to the generic message.
- criterion: The statement for a refusal with an error code the surface does not recognise
    differs from the statement for a CapabilityCitedByEvidenceError refusal.
  met: true
  how: Both unrecognised and VALIDATION_ERROR/INTERNAL_ERROR share the generic message,
    distinct from cited-by-evidence.
- criterion: While the removal has not been answered, the surface states neither success
    nor refusal.
  met: true
  how: Both toasts sit inside onSuccess/onError, invoked only once settled.
nodes:
- node: rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: Carries the rule's capability-only slice through onSuccess/onError toasts.
    Concept/connector-configuration clauses and the control/landing are left to sibling
    tasks.
- node: domain/integration/capability
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: The success statement names the two identity attributes (name, version).
- node: rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: Reads the HTTP 409 CapabilityCitedByEvidenceError refusal through the existing
    state kind and states it apart from every other refusal.
- node: constraints/a-successful-capability-removal-answers-with-no-content
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: Treats apiFetch's 204-to-void resolution as the success trigger.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: VALIDATION_ERROR resolves through the generic fallback to a distinct message.
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: INTERNAL_ERROR resolves through the same generic fallback.
inferences:
- inferred: The success message states both name/version and that the identity is
    "no longer registered".
  from: The rule's own statement; satisfying it costs nothing against the narrower
    criterion.
- inferred: Exact copy for both messages is this task's own wording.
  from: No node states exact copy; the standard leaves wording to the project's own
    copy source.
- inferred: The failure-message helper is defined locally rather than in a shared
    module.
  from: The existing saveFailureMessage convention in use-capability-form.ts.
preserved:
- The pre-existing cache invalidation and navigation to /capabilities inside onSuccess,
  found already on disk.
- The save mutation's own onSuccess/onError handling.
- The isDeleting/onDelete surface and confirmation dialog delivered by the sibling
  control task.
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/capability-removal-capability-removal-outcome-disclosure-build
---

## What it is
States a capability removal's outcome to the operator via toast — success, or the CapabilityCitedByEvidenceError refusal distinguished from every other.

## Notes
None.
