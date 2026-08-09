---
type: value-object
attributes:
  - name: calls
    type: integer
    required: true
  - name: input_tokens
    type: integer
    required: true
  - name: output_tokens
    type: integer
    required: true
---

## Description

What this investigation cost at the LLM provider: N hypotheses cost N judgment calls plus one writing call, linear in hypotheses.
Recorded so the projections answer which cases are expensive with data, not with opinion.

## Responsibility

None.
