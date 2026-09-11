---
type: value-object
attributes:
  - name: path
    type: string
    required: true
  - name: method
    type: string
    required: true
---

## Description

One operation a fetched OpenAPI document declares, disclosed as the path it is declared under and its HTTP method upper-cased, offered to an operator choosing which of a document's operations a connector configuration draft is generated from.

## Responsibility

Disclose one path and one HTTP method a fetched OpenAPI document declares an operation for.
