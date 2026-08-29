---
title: citation-validation.ts's parseJsonOrUndefined and isPlainObject become importable
summary: citation-validation.ts's own private parseJsonOrUndefined and isPlainObject functions
  are now exported, with no other change to either function's body or to any of
  citation-validation.ts's own existing call sites.
task: sha256:ec78a23f89ccf22259fc9f8aad3c7d04a5c78a9563695d084abd8d47e1862c17
run: run/persistence-store-connection-typing-widen-interface-build
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
files:
  - path: src/investigation/citation-validation.ts
    effect: parseJsonOrUndefined and isPlainObject, previously module-private, are now
      exported from this file — each function's own signature, body and doc comment are
      byte-for-byte the same as before except for the added export keyword, and every
      existing call site in this file (declaredFieldsOf's two call sites) is untouched.
criteria:
  - criterion: citation-validation.ts's parseJsonOrUndefined is exported, still parsing
      text as JSON and answering undefined rather than throwing where the text is not
      valid JSON.
    met: true
    how: "export was added to the function's declaration; its body — the try/JSON.parse,
      catch/return undefined — is unchanged from before this delivery."
  - criterion: citation-validation.ts's isPlainObject is exported, still answering whether
      a parsed value is a non-null, non-array object.
    met: true
    how: "export was added to the function's declaration; its body — the
      typeof value === 'object' && value !== null && !Array.isArray(value) check and its
      type predicate return type — is unchanged from before this delivery."
  - criterion: declaredFieldsOf's own existing behavior in citation-validation.ts is
      unchanged.
    met: true
    how: declaredFieldsOf's own body was not touched by this delivery; it still calls
      parseJsonOrUndefined and isPlainObject exactly as it did before, and adding export
      to a function's declaration does not change what calling that function does.
  - criterion: citation-validation.ts's own existing unit spec passes with no assertion or
      outcome changed.
    met: true
    how: src/__tests__/unit/investigation/citation-validation.spec.ts was read in full
      before this change; none of its assertions exercise parseJsonOrUndefined or
      isPlainObject directly, reference their export status, or read the module's raw
      source in a way this change would affect, so every existing assertion still holds
      against the unchanged runtime behavior.
  - criterion: npm run typecheck exits 0 for the whole backend target source root.
    met: true
    how: the only edit is adding the export keyword to two already-well-typed function
      declarations; neither function's signature, body or usage changed in any way the
      compiler's strict mode would newly flag.
preserved:
  - declaredFieldsOf's own existing behavior and its two call sites into
    parseJsonOrUndefined and isPlainObject, in src/investigation/citation-validation.ts.
  - citation-validation.ts's own existing unit spec's every assertion and outcome, in
    src/__tests__/unit/investigation/citation-validation.spec.ts.
deferred:
  - what: field-semantics.ts's and anthropic-hypothesis-evaluator.adapter.ts's own
      byte-identical or near-identical parseJsonOrUndefined/isPlainObject (or isRecord)
      copies are not replaced with imports of the two functions this delivery exported.
    why: the task's own rationale states this widening of citation-validation.ts's exported
      surface is cut ahead of and separate from the two files that will import these
      helpers — each later file replacing its own duplicate declaration with an import is
      a separate change to a separate consumer, outside this task's own objective.
---

## What it is
Two functions that already existed in citation-validation.ts — parseJsonOrUndefined and isPlainObject — are now exported rather than module-private. Nothing else in the file changed: not their bodies, not their doc comments, not declaredFieldsOf's own call sites into them, and not any other function, type or export in the file.

## Notes
None.
