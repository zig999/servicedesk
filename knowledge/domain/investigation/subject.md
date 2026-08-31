---
type: value-object
attributes:
  - name: type
    type: domain/glossary/subject-type
    required: true
  - name: attributes
    type: subject-attribute-value
    required: true
    many: true
---

## Description

The one thing this investigation examines: a subject type from the glossary and the set of attribute-values that identify the instance — an id, a phone number, whatever the case's chosen subject type is reached by.
The entry point is not the subject: the interface resolves the customer on the line to the set of attribute-values the chosen case requires, asking which instance when there is more than one, and assembles that whole set before a diagnose, simulate-case, or simulate-hypothesis call — the case itself declares only the subject type, never the attribute-values.
No attribute is filtered out for any one concept: every capability's connector receives the whole set and resolves, on its own, which of the attributes it needs and how to derive its call from them — the same responsibility the capability already holds for deriving what one concept's own contract requires.

## Responsibility

Identify what is under investigation, in the case's declared subject type, by the whole set of attribute-values the entry point assembled.
