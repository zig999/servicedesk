---
target: frontend
title: Land the operator on the capabilities listing after a successful capability
  removal
summary: The capability-detail delete mutation now invalidates the capabilities listing
  cache and navigates unconditionally to /capabilities on a 204 answer, never falling
  back through navigation history the way onCancel does.
task: sha256:31b8ce5d98cf65447fb0ebf7d7ba904d4b15bbb3fda6e720b7eee567625cb27c
files:
- path: src/hooks/use-capability-detail.ts
  effect: 'Added an onSuccess handler to deleteMutation that invalidates the ["capabilities"]
    query key and calls navigate({ to: "/capabilities" }) unconditionally.'
criteria:
- criterion: After a removal answered with HTTP 204, the operator is at /capabilities.
  met: true
  how: 'deleteMutation''s onSuccess calls navigate({ to: "/capabilities" }).'
- criterion: After a removal answered with HTTP 204, the operator is at /capabilities
    even when navigation history holds an earlier entry.
  met: true
  how: The navigate call is unconditional, unlike onCancel's history-aware branch.
- criterion: After a removal answered with HTTP 204, the capabilities listing shows
    no row for the removed name and version.
  met: true
  how: onSuccess invalidates ["capabilities"], the same key useCapabilities() reads.
- criterion: After a removal answered with HTTP 204, the refusal of a read of the
    removed name and version is never shown.
  met: true
  how: Navigation happens synchronously inside onSuccess; CapabilityDetailScreen unmounts,
    so the removed identity's own query is never refetched.
nodes:
- node: rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: The capability clause (land on the capabilities listing, never the removed
    identity's own surface) is encoded by the unconditional navigate. The concept
    and connector-configuration clauses are left to their sibling tasks.
- node: constraints/a-successful-capability-removal-answers-with-no-content
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: Consumed only as the trigger this task reacts to; the route-side HTTP mechanics
    belong to the backend.
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  encoded_at:
  - src/hooks/use-capability-detail.ts
  how: Consumed only as the refusal criterion 4 requires never be shown after a 204;
    honored by navigating away before any refetch could reach that refusal.
inferences:
- inferred: The destination is the existing route path /capabilities.
  from: The ADVISORY note plus route-tree.tsx's capabilitiesRoute at path "/capabilities".
- inferred: Criterion 3 is achieved by invalidating the ["capabilities"] query key.
  from: The same hook's existing PUT-mutation onSuccess, which already invalidates
    the same key.
preserved:
- onCancel's existing history-aware navigation is unchanged.
- The PUT-mutation (save) flow and every other phase are untouched.
deferred:
- what: Disclosing the success/refusal outcome to the operator.
  why: Owned by the sibling task capability-removal-outcome-disclosure.
- what: Landing concept and connector-configuration removals on their own listings.
  why: Owned by the sibling landing tasks.
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/capability-removal-capability-removal-landing-build
---

## What it is
Navigates to /capabilities and invalidates the capabilities listing cache on a successful capability removal.

## Notes
None.
