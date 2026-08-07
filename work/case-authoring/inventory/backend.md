---
title: Backend service root
summary: "The area the case-authoring scope lands in: backend/, which exists as an empty tree holding no source, no manifest and no configuration."
area:
  - backend/
sources:
  - intake/scope.md
  - intake/backend-node-service.yaml
---
## What it is

The target source root named by the scope, walked in full at backend/.
The tree holds no files at all, including dotfiles, so there is no existing module, no observed convention, no helper to reuse and no consumer that a change here could break.
The three artifacts the project's standard registry declares under `presupposes` — package.json, tsconfig.json and eslint.config.js — are absent from it, matching what the scope recorded from `deliver.py --standard ... --against backend`.

## Notes

The registry's rules name scopes such as `src` and `src/__tests__/`, and neither directory exists yet, so every rule scoped below them applies to nothing in the tree as surveyed.
`modules`, `conventions`, `must_not_duplicate` and `risks` are omitted rather than filled, because a tree with no files evidences none of them.
Everything this initiative builds under backend/ is new, so no prior arrangement constrains where the plan's tasks put things beyond what the standard registry and the base state.
