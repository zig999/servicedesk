---
title: Capability output_schema field guidance
summary: Both compositions of the capability form guide the operator to declare per-field type and description inside the output_schema JSON, as hints the platform reads and never enforces.
rationale: The meaning-never-policy rule is claimed here rather than in the glossary epic because the scope's only authored guidance about writing descriptions sits on the capability form.
sources:
- intake/scope.md
- intake/material.md
covers:
- domain/integration/capability
- domain/investigation/field-semantics
- contracts/integration/capability-registry
- rules/glossary/a-description-states-meaning-never-policy
uncovered:
- node: contracts/integration/capability-registry
  why: The registry's operations are delivered end to end by the backend initiative and this plan changes no request or response that contract states, only the guidance beside the editor.
---

## What it is
Operator guidance at the output_schema editor: which per-field keys the platform reads as semantics, and what a description is for.

## Notes
None.
