---
entries:
- field: statement
  unstated: Whether a simulate-hypothesis call's returned record carries the run's own cost totals (calls, input tokens, output tokens) and its stage durations, the same as a simulate-case call's record does — contracts/investigation/case-simulation narrows simulate-hypothesis only in what it collects and judges and in resolving no outcome, without saying whether the run's own totals travel with it too.
  decided: A simulate-hypothesis call's returned record carries that run's own cost and its stage durations, each covering the narrowed run alone, the same as a simulate-case call's record carries the whole run's.
  why: domain/investigation/usage already defines cost as the total across every call an investigation or a simulation made, and a simulate-hypothesis call is a simulation under that same contract; domain/investigation/durations already measures total to the moment the record is assembled and, for a simulation, before the answer leaves, and already holds writing absent for a run that never reaches consolidation — which no run but this one ever is. The reading was already carried in three nodes' own prose; this rule is where it becomes addressable rather than inferred from a narrowing's silence.
---
