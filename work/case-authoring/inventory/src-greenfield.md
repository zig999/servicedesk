---
title: Greenfield source root
summary: "The area the published-case scope lands in is empty \u2014 `src/` does not exist on disk and the repository holds no source tree, toolchain manifest or test harness of its own."
rationale: The survey walked the target root and the repository root; the only populated trees are the framework plugin, the knowledge base, the docs and the work root just opened, none of which is this project's source, so nothing in them is recorded as a module or a convention of the target.
sources:
  - intake/escopo.md
area:
  - src/
---

## What it is

The target source root `src/` named by the scope, which does not exist on disk and contains no files.
The area a published case, its three behaviours and its structural and vocabulary validators would be written into, with nothing written there yet.

## Notes

The repository root holds no package manifest, build configuration, dependency lock or test harness, so the plan's tasks arrive before any language or toolchain has been chosen for this project.
The populated trees at the repository root are the framework plugin at `.claude/`, the knowledge base at `knowledge/`, the source material at `docs/` and the work root at `work/case-authoring/`, all adjacent context rather than source the change lands in.
No standard registry answering `.claude/schemas/standard.json` exists at the repository root, so a standard conformance pass over what this plan delivers would record that it did not run.
The only tracked ignore rules are at `.gitignore` and cover `__pycache__/` and `*:Zone.Identifier`, which is the sole trace of tooling expectation anywhere outside the framework plugin.
No module, convention, reuse point or risk is recorded because the surveyed area contains nothing to observe one at, and no existing consumer exists that a change here could break.
