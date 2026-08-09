---
title: Build substrate
summary: The manifest, compiler configuration and lint configuration the project's standard presupposes and the empty target tree does not hold.
rationale: No specification node holds a manifest and none should — the specification is what the business decided, and how this project is built is not; the standard's rules presuppose these three artifacts, the surveyed tree is empty, and one task builds all three because the manifest, the compiler configuration and the lint configuration are one decision about how this project is built, falsified by the same criteria.
objective: The project can be built and its suite run — npm ci installs, and the declared typecheck, lint, secret-scan and test steps execute against the tree as produced.
criteria:
  - 'package.json declares "type": "module" at its top level.'
  - package.json declares the test, lint, typecheck and secret-scan scripts the standard's tool-decided rules run as.
  - package.json declares every dependency the project uses, each drawn from the standard's authorized list.
  - package.json declares the secretlint configuration the secret-scan step reads.
  - tsconfig.json declares the strict compiler configuration STK-01 and TYP-01 require and states its module resolution mode.
  - eslint.config.js is a flat config declaring the TypeScript parser and a non-empty rule set, so the lint step decides something rather than nothing.
  - npm ci followed by each of the declared typecheck, lint, secret-scan and test steps completes on the tree as produced.
produces:
  - package.json
  - tsconfig.json
  - eslint.config.js
implements:
  - constraints/the-mvp-persists-to-no-database
sources:
  - intake/scope.md
---
## What it is
The one task the scope never asked about: the three artifacts the standard's registry states it presupposes, absent because the target tree does not exist.
It takes no dependency edges from the other tasks; every task waits on it through the implement-task refusal over an absent substrate.

## Notes
UNDERDETERMINED, from the specification — criterion 3 admits any dependency the standard's authorized list holds, but constraints/the-mvp-persists-to-no-database refuses a dependency manifest that declares a database driver; the criteria as written do not exclude one. Passes as written: a package.json declaring a database driver the authorized list happens to include, with every other criterion met, which the constraint's fitness refuses.
REMAINDER, from the specification — the clause of constraints/the-mvp-persists-to-no-database's statement that everything the system records persists as plain JSON files reaches no criterion of this task, which produces only the manifest, compiler and lint configuration and records nothing. Belongs: the tasks of this plan that author the recording and persistence source.
REMAINDER, from the specification — the fitness clause of constraints/the-mvp-persists-to-no-database that the deployment provisions no database service reaches no criterion of this task, which provisions nothing. Belongs: the act of deployment provisioning, wherever this plan or a later initiative performs it.
REMAINDER, from the specification — no clause of rules/glossary/the-non-conclusion-outcomes-precede-the-first-case reaches a criterion of this task; the substrate seeds no vocabulary. Belongs: the task of this epic that seeds the glossary's pre-case vocabularies and the case-validation act that reads them.
REMAINDER, from the specification — no clause of rules/knowledge/a-collected-concept-declares-a-ttl reaches a criterion of this task; the substrate registers no concept. Belongs: the task of this epic that implements concept registration and the glossary's ttl defaulting.
Advisory — constraints/the-domain-depends-on-no-infrastructure conditions the imports of domain modules this task does not write; the constraint binds the tasks that author domain source, and any lint rule enforcing that boundary arrives through them, not through criterion 6's non-empty rule set.
Advisory — domain/glossary/subject-type, domain/glossary/outcome, domain/glossary/action, domain/glossary/recipient, domain/glossary/concept and contracts/glossary/glossary-query neighbor this task without governing it; each binds the tasks that author that source.
