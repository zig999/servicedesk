---
title: "Proof for field-semantics.ts importing citation-validation.ts's shared JSON guards"
summary: "Corrects the one pre-existing test that asserted field-semantics.ts imports nothing from citation-validation.ts — the opposite of this task's own third criterion — splitting it into tests that prove the intentional import and tests that keep proving the design fact it used to protect."
implementation: sha256:0958269bc44d29daed8878b6990ff58146d0277f510fabeebe88fc76c1678703
run: run/arc01-mnt03-suite
tests:
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: "declares no local parseJsonOrUndefined of its own — as a function or as a const — importing the binding from citation-validation.ts instead"
    proves: "field-semantics.ts no longer declares its own parseJsonOrUndefined function."
    fails_when: "field-semantics.ts declares a local parseJsonOrUndefined again, whether as a function declaration or as a const/let binding, rather than relying solely on the imported name."
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: "declares no local isPlainObject of its own — as a function or as a const — importing the binding from citation-validation.ts instead"
    proves: "field-semantics.ts no longer declares its own isPlainObject function."
    fails_when: "field-semantics.ts declares a local isPlainObject again, whether as a function declaration or as a const/let binding, rather than relying solely on the imported name."
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: "imports parseJsonOrUndefined and isPlainObject from citation-validation.ts, per this task's own third criterion"
    proves: "field-semantics.ts imports parseJsonOrUndefined and isPlainObject from citation-validation.ts."
    fails_when: "the file's import from citation-validation.ts stops naming parseJsonOrUndefined, stops naming isPlainObject, or the import is removed altogether — this is exactly the pre-existing test this task's own third criterion required correcting: it used to assert the opposite of this fact and is replaced here by an assertion of it."
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: "imports nothing from capability-input-schema-shape.ts, keeping fieldSemanticsOf's own structural reading of a capability's output schema independent of declaredInputSchemaShape"
    proves: "the design fact the retired test protected, half one: fieldSemanticsOf's and fieldSemanticsFrom's own structural reading of a capability's output schema stays a third, independent implementation, never importing capability-input-schema-shape.ts's declaredInputSchemaShape — unaffected by, and separate from, the JSON-guard-helper import this task's own criteria require."
    fails_when: "field-semantics.ts begins importing anything at all from capability-input-schema-shape.ts."
  - file: src/__tests__/unit/investigation/field-semantics.spec.ts
    name: "does not import declaredFieldsOf from citation-validation.ts, keeping fieldSemanticsOf's and fieldSemanticsFrom's own structural reading of a capability's output schema independent of it even though the file now shares citation-validation.ts's own JSON-guard helpers"
    proves: "the design fact the retired test protected, half two: sharing citation-validation.ts's parseJsonOrUndefined and isPlainObject does not also pull in its declaredFieldsOf — fieldSemanticsOf and fieldSemanticsFrom keep answering their own, third, narrower question rather than becoming a caller of that function."
    fails_when: "field-semantics.ts's own import from citation-validation.ts begins naming declaredFieldsOf."
untested:
  - "Criterion 4 (the header comment and the isPlainObject-adjacent docstring no longer describing a deliberate independence) is a fact about the wording of a comment, not about any behavior a test can trigger and observe: no assertion over the comment's literal text would do more than restate a chosen phrase as a pattern, which breaks the moment the comment is reworded again without changing what it means. This criterion stays verified by reading — as the implementation record's own \"how\" for it already does — rather than by an automated test, and no test here stands in for that reading."
not_applicable:
  - edge_case: "a dependency that is unavailable, slow, or answers in an unexpected shape"
    why: "fieldSemanticsOf and fieldSemanticsFrom, and the parseJsonOrUndefined/isPlainObject helpers they now call by import rather than by local declaration, are synchronous, pure functions with no I/O, network call or external service of their own; this task changes which module declares two already-pure helpers, not whether either function reaches outside the process."
  - edge_case: "two operations against one subject at once"
    why: "there is no shared mutable state for two callers to race over — fieldSemanticsOf takes a schema string and returns a fresh array each call, exactly as it did before this task moved where its two guard helpers are declared."
  - edge_case: "a duplicate where uniqueness is claimed"
    why: "no criterion of this task claims any uniqueness the file must enforce; the task is about which file declares two guard functions, not about a collection this code deduplicates."
  - edge_case: "an operation against state that forbids it"
    why: "fieldSemanticsOf and fieldSemanticsFrom hold no state of their own to forbid an operation against; every existing test already exercises them as pure functions of their arguments, unaffected by this task's own import change."
---

## What it is
Fixes the one pre-existing test in field-semantics.spec.ts that asserted field-semantics.ts imports nothing from citation-validation.ts — the literal opposite of this task's own third criterion — by splitting it into a test proving the intentional import (parseJsonOrUndefined and isPlainObject) and two tests proving the design fact the retired assertion used to protect (fieldSemanticsOf's and fieldSemanticsFrom's own structural reading still answers a third, independent question, never importing declaredFieldsOf or declaredInputSchemaShape). Also adds two small structural tests directly proving criteria 1 and 2 (no local redeclaration of either guard).

## Notes
Criterion 5 (the whole file passing) and criterion 6 (`npm run typecheck` exiting 0) — both left unconfirmed at authoring time since this proof-authoring session held no shell — are confirmed by run/arc01-mnt03-suite, captured over the whole tree after all six of this increment's tasks were implemented and proven: typecheck, lint, secret-scan and the full 1680-test suite all passed.
