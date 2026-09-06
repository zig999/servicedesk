---
title: Shared action footer
summary: The reusable ButtonFooter component that pins a screen's primary action buttons to the bottom of the AppShell's scrollable content area, and the system-scoped constraints standing over every screen it appears on.
rationale: I cut the shared component away from every screen that consumes it, because a component consumed by four screen families is an interface and the families are its consumers, and because the system-scoped constraints in the impact set stand over the shell region this component pins itself inside rather than over any one family's screens.
sources:
- intake/scope.md
covers:
- constraints/no-route-enforces-authentication
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/consolidation-runs-behind-a-port
- constraints/diagnosis-answers-synchronously
- constraints/evidence-normalization-is-an-anticorruption-layer
- constraints/hypotheses-are-judged-in-isolated-parallel-calls
- constraints/judgment-runs-behind-a-port
- constraints/the-capability-identity-read-is-rate-limited
- constraints/the-consolidation-prompt-is-closed
- constraints/the-database-is-externally-provisioned
- constraints/the-deadline-is-an-absolute-propagated-instant
- constraints/the-domain-depends-on-no-infrastructure
- constraints/the-evidence-cache-admits-only-ok-results
- constraints/the-judgment-prompt-is-closed
- constraints/the-schema-replays-from-its-scripts
- constraints/the-stored-schema-mirrors-the-declared-model
- constraints/the-system-persists-to-one-relational-database
uncovered:
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  why: The generic refusal is the backend status map's own answer, and no task in this plan writes backend source or changes what any route answers.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  why: The shape refusal belongs to each route, and this plan moves controls on screens without sending any new request.
- node: constraints/consolidation-runs-behind-a-port
  why: Consolidation is invoked inside the investigation context, which no task here opens.
- node: constraints/diagnosis-answers-synchronously
  why: No screen this plan edits runs a diagnosis.
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  why: Normalization sits at the integration edge, and no task here reads or writes an observation.
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  why: The call pattern of judgment is the investigation context's, and nothing in this plan reaches it.
- node: constraints/judgment-runs-behind-a-port
  why: The evaluator port belongs to the investigation domain, and no task here imports or implements it.
- node: constraints/the-capability-identity-read-is-rate-limited
  why: The per-caller limit is enforced on the registry's own route, and no footer or link changes how often a screen reads.
- node: constraints/the-consolidation-prompt-is-closed
  why: Prompt assembly is backend work no task here performs.
- node: constraints/the-database-is-externally-provisioned
  why: The deployment's database posture is untouched by a frontend component.
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  why: Recording and propagating the deadline is the backend's, and no task here changes a request.
- node: constraints/the-domain-depends-on-no-infrastructure
  why: The domain layer's imports are backend source no task here writes.
- node: constraints/the-evidence-cache-admits-only-ok-results
  why: The cache adapter is backend source no task here writes.
- node: constraints/the-judgment-prompt-is-closed
  why: Prompt assembly for judgment is backend work no task here performs.
- node: constraints/the-schema-replays-from-its-scripts
  why: The migration scripts lie outside the frontend target tree this plan writes in.
- node: constraints/the-stored-schema-mirrors-the-declared-model
  why: No relation and no column is created or changed by this plan.
- node: constraints/the-system-persists-to-one-relational-database
  why: No task here records anything, and every screen keeps the calls it already makes.
---

## What it is
The shared ButtonFooter component, its pinned placement inside the AppShell's one scrollable region, and the system-scoped constraints that must still hold on a screen once a pinned footer sits over that region.
It holds the one task that defines the component every other epic's screens consume.
It also holds this plan's declaration that the backend-facing constraints in the impact set are read and left untouched, because this plan writes frontend surface source only.

## Notes
AppShell renders the disclosure that this build enforces no authentication in its topbar, outside the `<main>` element the footer pins itself inside, so the footer cannot cover it.
The scope forbids editing app-shell.tsx, so the footer's placement inside `<main className="relative flex-1 overflow-y-auto p-4">` has to work against that element's existing padding from the screen side.
The surveyor records that a shared component under shared/components ships with a co-located spec file beside it.
