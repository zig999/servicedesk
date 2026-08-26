One wrong behavior in code already delivered, found by
siegard-reconcile/backend-post-corrections-code-drift.md's judgment over
src/investigation/evidence-collection-stage.ts against
rules/integration/an-unresolvable-observation-ends-unavailable.

The rule states: "An observation of a concept no registered capability currently answers... issues
no call and ends unavailable, with a result detail reporting a CapabilityNotResolvedForObservationError..."
— naming the exact error class the result_detail must carry for this scenario.

evidence-collection-stage.ts's unavailableEvidence() function currently composes a free-text
sentence instead: `no capability is currently registered for concept "${concept}"` — rather than
the reported error name the rule requires. The parallel path that reaches the identical scenario
through observe-concept itself (http-declarative-observation-source.adapter.ts's resolveCapability,
via unavailableFor(error)) already reports it correctly as the literal string
`CapabilityNotResolvedForObservationError`, matching the rule exactly. This is the same domain
condition, reached two different ways, reported two different ways — one of them wrong.

Scope: evidence-collection-stage.ts's unavailableEvidence() must report the same result_detail the
rule requires — the reported error's own class name, CapabilityNotResolvedForObservationError —
for this scenario, instead of the free-text sentence it composes today. No other behavior in this
file changes.
