---
title: Capability detail layout adjustment
summary: The row rearrangement of Name, Version and Nature and the height increase of the two schema editors
  on the capability detail screen.
rationale: The scope's impact set names the capability domain model and its nature enumeration because
  the fields being rearranged belong to them, but the change itself asserts nothing about either node
  -- no field's existence, meaning or value changes, only position and editor height -- so this epic covers
  both and declares both uncovered rather than routing either task's `implements` at them.
sources:
- work/capability-detail-layout-adjustment/intake/scope.md
covers:
- domain/integration/capability
- domain/integration/capability-nature
uncovered:
- node: domain/integration/capability
  why: The plan rearranges where Name, Version and Nature render and how tall the schema editors are;
    it does not add, remove or redefine any attribute the capability aggregate declares, so no task implements
    this node.
- node: domain/integration/capability-nature
  why: The plan only relocates the Nature field within the row; it does not change which values the enumeration
    holds or what nature is assigned to any capability, so no task implements this node.
---

## What it is

This epic holds the capability detail screen's presentational layout change.
It covers the two domain nodes the rearranged fields belong to, without either task asserting a domain fact about them.

## Notes

None.
