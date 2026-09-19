---
type: invariant
statement: A simulate-hypothesis call's returned record carries that run's own cost and its stage durations, each covering the narrowed run alone, the same as a simulate-case call's record carries the whole run's.
constrains:
  - domain/investigation/cost
  - domain/investigation/durations
---

## Description

contracts/investigation/case-simulation states what `simulate-case` hands back — evidence per concept, evaluation per hypothesis, the resolved outcome, the assessment, cost and durations — and narrows `simulate-hypothesis` in two named respects only: what is collected and judged, and that no outcome is resolved. The run's own totals are not among the narrowings, and this rule is where that reading is addressable rather than inferred from a narrowing's silence.
Nothing here is new. domain/investigation/usage already defines cost as the total across every call an investigation or a simulation made, and a `simulate-hypothesis` call is a simulation under that same contract; domain/investigation/durations already measures total to the moment the record is assembled and, for a simulation, before the answer leaves, and already holds writing absent for a run that never reaches consolidation — which no run but this one ever is.
Covering the narrowed run alone is what the two value-objects mean here: the cost totals the judgment call that one named hypothesis revision provoked and no consolidation call, since none is made, and the durations carry collection, judgment and total, with writing absent by domain/investigation/durations' own conditional presence rather than by anything this rule adds.
rules/investigation/a-simulation-session-retains-its-runs-and-shows-one presents every part of a shown run, cost and durations alike, from that run's own returned record; a hypothesis run whose record carried neither would leave that surface nothing to present and nothing honest to say instead.
