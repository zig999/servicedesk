---
title: anthropic-hypothesis-evaluator.adapter.ts imports citation-validation.ts's isPlainObject in place
  of its own isRecord
summary: anthropic-hypothesis-evaluator.adapter.ts's own isRecord function is removed and both of its
  former call sites now use citation-validation.ts's exported isPlainObject instead, with the adapter's
  own fence-stripping parseJsonOrUndefined left declared locally, unchanged.
task: sha256:c2375aec3ea1764772f16e919bdd21952ba48bb70ea66b569bc6f75ea80b1976
run: run/arc01-mnt03-suite
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
files:
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  effect: no longer declares its own isRecord function; imports isPlainObject from citation-validation.ts
    and calls it at both of the two sites that previously called isRecord (inside parseJudgment's own
    type-narrowing check and inside isCitation's own shape check) — every other function, including this
    file's own parseJsonOrUndefined, unwrapCodeFence, isVerdict, isCitationArray and isNonEmpty, is untouched.
criteria:
- criterion: anthropic-hypothesis-evaluator.adapter.ts no longer declares its own isRecord function.
  met: true
  how: the isRecord function declaration and its doc comment were deleted from the file; grep over the
    file confirms no remaining declaration or reference to that name.
- criterion: anthropic-hypothesis-evaluator.adapter.ts imports isPlainObject from citation-validation.ts
    and uses it at every site that called isRecord.
  met: true
  how: an import of isPlainObject from citation-validation.ts was added beside the file's other local
    imports, and both former call sites of isRecord — the negated check inside parseJudgment, and the
    check inside isCitation — now call isPlainObject in its place, unchanged otherwise.
- criterion: anthropic-hypothesis-evaluator.adapter.ts's own parseJsonOrUndefined is unchanged — still
    declared locally, still stripping a wrapping markdown code fence before JSON.parse.
  met: true
  how: parseJsonOrUndefined, unwrapCodeFence and the code-fence constant were not opened by any edit;
    the function still calls JSON.parse over the unwrapped text inside its own try/catch, byte-for-byte
    as before this delivery.
- criterion: parseJudgment's and isCitation's own existing behavior is unchanged — the existing suite
    passes with no assertion or outcome changed.
  met: true
  how: citation-validation.ts's isPlainObject and the deleted isRecord share one body — checking for a
    non-null, non-array object — and the same type predicate return type, so substituting the import for
    the local declaration changes no return value for any input either function could ever receive; the
    adapter's own unit spec was read in full before this change (it exercises the adapter only through
    the mocked Anthropic SDK boundary and never references isRecord, isPlainObject or any other unexported
    helper by name), so none of its assertions can observe the substitution.
- criterion: npm run typecheck exits 0 for the whole backend target source root.
  met: true
  how: isPlainObject's exported signature in citation-validation.ts is identical to isRecord's own deleted
    signature, so every call site that previously narrowed on isRecord narrows identically on isPlainObject;
    the only other edit is one added import line, which resolves against citation-validation.ts's own
    already-exported isPlainObject (added by the sibling task export-shared-json-guards) using this file's
    own established relative-import convention.
preserved:
- parseJudgment's and isCitation's own existing behavior (both still narrow a parsed JSON value the same
  way isRecord did), in src/investigation/anthropic-hypothesis-evaluator.adapter.ts.
- anthropic-hypothesis-evaluator.adapter.ts's own parseJsonOrUndefined, unwrapCodeFence and code-fence
  constant — the fence-stripping JSON parser this task's own criteria required to stay untouched.
- anthropic-hypothesis-evaluator.adapter.ts's own existing unit spec's assertions and outcomes, in src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts.
---

## What it is
anthropic-hypothesis-evaluator.adapter.ts's own isRecord replaced by an import of citation-validation.ts's isPlainObject, at both call sites; the adapter's own fence-stripping JSON parser is left exactly as it is.

## Notes
None.
