---
type: value-object
attributes:
  - name: registered
    type: string
    required: true
  - name: operation
    type: string
    required: true
---

## Description

Present on a connector configuration draft only where a connector configuration is already registered under the same connector name, its own text declares a method, and the chosen operation's own HTTP method differs from it — the two methods named side by side, never one silently replacing the other.

## Responsibility

Name the method a currently registered connector configuration declares and the method the drafted operation declares, where the two disagree.
