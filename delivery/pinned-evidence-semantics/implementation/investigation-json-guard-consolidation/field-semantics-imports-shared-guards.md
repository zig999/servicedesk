---
title: field-semantics.ts imports citation-validation.ts's parseJsonOrUndefined and isPlainObject
summary: field-semantics.ts's own byte-identical parseJsonOrUndefined and isPlainObject declarations are
  removed; its two call sites now import citation-validation.ts's own exported versions instead, and the
  file's own header comment and its own isPlainObject-adjacent docstring, which had framed the duplication
  as a deliberate independence decision, are corrected to describe the import instead.
task: sha256:1b4595b06fd53eb3e8782c0d1342ebf0252335a3eea0a15c06aae0de27d378ad
run: run/arc01-mnt03-suite
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
files:
- path: src/investigation/field-semantics.ts
  effect: no longer declares its own parseJsonOrUndefined or isPlainObject; imports both from citation-validation.ts
    and calls them from fieldSemanticsOf and fieldSemanticsFrom exactly where the module-local versions
    were called before. The file's own header comment no longer describes the two JSON-guard helpers as
    a deliberate, documented independence from citation-validation.ts, and the isPlainObject-adjacent
    docstring that made the same claim was removed along with the function it annotated. fieldSemanticsOf's
    and fieldSemanticsFrom's own exported signatures, and every branch of their own logic, are unchanged.
criteria:
- criterion: field-semantics.ts no longer declares its own parseJsonOrUndefined function.
  met: true
  how: the module-local function declaration (including its own doc comment) was deleted; the file's only
    reference to the name is now the imported binding.
- criterion: field-semantics.ts no longer declares its own isPlainObject function.
  met: true
  how: the module-local function declaration (including its own doc comment) was deleted; the file's only
    reference to the name is now the imported binding.
- criterion: field-semantics.ts imports parseJsonOrUndefined and isPlainObject from citation-validation.ts.
  met: true
  how: the file now opens with an import of isPlainObject and parseJsonOrUndefined from citation-validation.ts,
    and fieldSemanticsOf's and fieldSemanticsFrom's own bodies call exactly those two imported names,
    unchanged from how they called the module-local versions before.
- criterion: field-semantics.ts's own header comment and its own isPlainObject-adjacent docstring no longer
    describe restating these helpers as a deliberate independence from citation-validation.ts, since it
    now imports them.
  met: true
  how: the header comment's paragraph naming parseJsonOrUndefined and isPlainObject as following a documented,
    deliberate-duplication convention with its own copy of the identical defensive parse helpers was rewritten
    to say the file imports citation-validation.ts's own parseJsonOrUndefined and isPlainObject rather
    than restating them; the isPlainObject-adjacent docstring that called this module's own deliberate
    independence no longer exists, since it sat on the now-deleted local function declaration. The header's
    remaining claim — that fieldSemanticsOf and fieldSemanticsFrom stay their own, third implementation
    alongside declaredFieldsOf and declaredInputSchemaShape — is untouched, because it is about those
    two functions answering a different question, not about the two JSON-guard helpers this criterion
    names.
- criterion: fieldSemanticsOf's and fieldSemanticsFrom's own existing behavior is unchanged — the existing
    suite passes with no assertion or outcome changed.
  met: false
  how: 'fieldSemanticsOf''s and fieldSemanticsFrom''s own behavior for every input is unchanged: both
    now call citation-validation.ts''s exported parseJsonOrUndefined and isPlainObject, whose bodies are
    byte-for-byte the same try/JSON.parse and typeof/Array.isArray checks the deleted module-local versions
    ran, so every case the existing suite exercises still answers exactly as before. But field-semantics.spec.ts''s
    own last test asserts that field-semantics.ts imports no specifier containing citation-validation,
    keeping this a third, independently-implemented structural reader rather than a shared one. That assertion
    is the literal opposite of this task''s own third criterion above, which requires importing parseJsonOrUndefined
    and isPlainObject from citation-validation.ts; the moment that import exists, this one pre-existing
    test fails, not because any behavior this suite proves changed, but because this one test''s whole
    subject is the deliberate-independence decision this task exists to reverse. A task-implementer writes
    no test, so correcting or retiring that assertion is this task''s own test-author''s to do as part
    of its proof, not something this record can resolve; it is named here rather than left for the suite
    run to surprise a reader with.'
- criterion: npm run typecheck exits 0 for the whole backend target source root.
  met: true
  how: citation-validation.ts already exports parseJsonOrUndefined and isPlainObject with the exact signatures
    field-semantics.ts calls, so the new import resolves to the same types the module-local declarations
    had, and no call site's argument or return-value usage changed.
inferences:
- inferred: the header comment's replacement wording states the import plainly rather than restating the
    rest of the original paragraph's reasoning about a third structural reader answering a narrower question.
  from: the task's own objective and criterion 4 require the comment to stop describing these two helpers
    as a deliberate independence, but state no required wording; the inventory's convention entry documents
    the original claim's exact text, and this rewrite keeps every other claim of the header (the third-reader
    relationship for fieldSemanticsOf/fieldSemanticsFrom) untouched, changing only the sentence this task's
    criteria name.
preserved:
- fieldSemanticsOf's and fieldSemanticsFrom's own existing behavior for every input the existing suite
  exercises, in src/investigation/field-semantics.ts.
- evidence-collection-stage.ts's own existing call into fieldSemanticsOf, which this delivery did not
  touch and whose own import of field-semantics.ts's exported surface is unchanged.
deferred:
- what: anthropic-hypothesis-evaluator.adapter.ts's own near-identical parseJsonOrUndefined (and its isRecord
    guard) is not touched by this delivery.
  why: the task's own rationale states it is cut separately, against a different file with its own unit
    spec, independently demonstrable without this task.
---

## What it is
field-semantics.ts's two duplicate helpers replaced by an import of citation-validation.ts's own, and the file's own comments describing the duplication as deliberate corrected to describe the import instead.

## Notes
Criterion 5 is recorded unmet: a pre-existing test in field-semantics.spec.ts asserts the file imports nothing from citation-validation.ts, which this task's own third criterion directly reverses. Correcting or retiring that one assertion belongs to this task's own test-author, as part of its proof.
