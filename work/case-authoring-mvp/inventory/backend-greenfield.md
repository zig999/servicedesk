---
title: Backend target, greenfield
summary: The target source root src is absent from disk, so the case-authoring scope lands on an empty tree with nothing to touch, reuse or break.
area:
  - src
sources:
  - intake/scope.md
---
## What it is
The survey looked for the target source root src at the repository top level and found no such directory.
No modules, conventions, reuse points or risks exist because no source file exists where the change would land.
Everything the scope names — the case document model, the knowledge validator, the glossary and registry readers, the file persistence — is first-build work with no prior code to accommodate.

## Notes
None.
