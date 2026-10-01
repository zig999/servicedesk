---
entries:
- field: attributes.hypothesis.type
  unstated: The material indexes evaluations by hypothesis name but does not say how the record points at the hypothesis.
  decided: string
  why: A hypothesis is an entity inside the case aggregate and is reached only through its root; the name within the pinned case is the reference that respects the boundary.
- field: attributes
  unstated: The material asks that each judgment call's token usage, duration and materialized prompt be captured and exposed per hypothesis, but leaves open whether these are evaluation's own attributes or a separate value-object, and explicitly defers that choice to this analysis.
  decided: A new value-object domain/investigation/usage (input_tokens, output_tokens) carries the call's token spend, referenced from evaluation's own optional usage attribute; elapsed_ms and prompt stay flat on evaluation itself, alongside reason and citations, none of them required — present exactly when a judgment call happened, absent on reason no-data.
  why: usage mirrors domain/investigation/cost's own token shape at single-call granularity, so a future call site measuring one provider call reuses the same value-object rather than inventing a second one; elapsed_ms and prompt describe the evaluation event itself, not a quantity shared across calls, so they follow the precedent reason and citations already set by staying evaluation's own attributes instead of a wrapper with one member.
---
