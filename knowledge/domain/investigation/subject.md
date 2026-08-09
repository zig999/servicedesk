---
type: value-object
attributes:
  - name: type
    type: domain/glossary/subject-type
    required: true
  - name: id
    type: string
    required: true
---

## Description

The one thing this investigation examines: a subject type from the glossary and the identifier of the instance.
The entry point is not the subject: the interface resolves the customer on the line to the identifier the chosen case requires, asking which when there is more than one.

## Responsibility

Identify what is under investigation, in the case's declared subject type.
