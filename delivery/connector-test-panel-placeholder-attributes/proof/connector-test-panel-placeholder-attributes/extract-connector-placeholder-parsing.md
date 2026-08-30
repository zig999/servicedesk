---
title: Placeholder-token grammar primitives proven at their new module
summary: Proves the three grammar primitives extracted into shared/services/connector-placeholder-token.ts
  (the regex, the kind/argument split at the first ':', and the subject-kind filter) directly against
  their own exports, covering the token-grammar edge cases the extraction's own criterion raises, while
  leaving simulation-subject-derivation.ts's two pre-existing spec files untouched as the proof that its
  own observable behavior did not change.
implementation: sha256:b19ceb9e0dc5aed6849e40778bc780772579e76019c2db3fe263e42b7a26a9cd
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-placeholder-attributes-extract-connector-placeholder-parsing-suite
tests:
- file: src/shared/services/connector-placeholder-token.spec.ts
  name: finds every placeholder occurring anywhere inside one string value, in the order they occur
  proves: Criterion 1 -- the module exports the placeholder regex that simulation-subject-derivation.ts
    used to declare directly.
  fails_when: PLACEHOLDER_PATTERN fails to match one or more '${...}' tokens present in a string, matches
    in the wrong order, or fails to capture the token text between the braces.
- file: src/shared/services/connector-placeholder-token.spec.ts
  name: finds no match inside a string that carries no '${...}' token at all
  proves: Criterion 1, the negative case -- the regex does not manufacture a match where the input holds
    none.
  fails_when: PLACEHOLDER_PATTERN reports any match against a string containing no '${...}' substring.
- file: src/shared/services/connector-placeholder-token.spec.ts
  name: splits an ordinary '${subject:attribute-name}' token into its kind and its argument
  proves: Criterion 1 -- the exported kind/argument split, on the grammar's own central case.
  fails_when: splitPlaceholderToken("subject:account-id") returns anything other than ["subject", "account-id"].
- file: src/shared/services/connector-placeholder-token.spec.ts
  name: splits a bare token with no argument, such as '${subject}' with no ':' at all, to that whole token
    as its kind and no argument
  proves: Criterion 1's split, at the edge case of a token carrying no separator at all.
  fails_when: splitPlaceholderToken("subject") returns anything other than ["subject", undefined] -- e.g.
    throwing, or returning an empty-string argument instead of undefined.
- file: src/shared/services/connector-placeholder-token.spec.ts
  name: splits a token whose argument is empty, such as '${subject:}', to an empty-string argument rather
    than undefined
  proves: Criterion 1's split, at the edge case of a present but empty argument -- distinguishing it from
    the no-separator case.
  fails_when: splitPlaceholderToken("subject:") returns anything other than ["subject", ""], in particular
    if it collapses to the same [kind, undefined] shape as a bare token.
- file: src/shared/services/connector-placeholder-token.spec.ts
  name: splits a token carrying more than one ':' at the first one only, keeping every later ':' as part
    of the argument
  proves: Criterion 1's split at exactly the first ':', per the criterion's own wording, not at the last
    or at every occurrence.
  fails_when: splitPlaceholderToken("subject:a:b") returns anything other than ["subject", "a:b"] -- e.g.
    splitting at the last ':' or dropping the second segment.
- file: src/shared/services/connector-placeholder-token.spec.ts
  name: accepts a split token naming the subject kind with a non-empty argument
  proves: Criterion 1 -- the exported filter keeping kind === "subject", on its own accepting case.
  fails_when: isSubjectPlaceholderToken(["subject", "account-id"]) returns false.
- file: src/shared/services/connector-placeholder-token.spec.ts
  name: rejects a bare '${subject}' token that names no argument at all
  proves: Criterion 1's filter excludes a subject-kind token that names no attribute, matching the module's
    own documented behavior for a bare '${subject}'.
  fails_when: isSubjectPlaceholderToken(["subject", undefined]) returns true.
- file: src/shared/services/connector-placeholder-token.spec.ts
  name: rejects a '${subject:}' token whose argument is present but empty
  proves: Criterion 1's filter treats an empty-string argument the same as no argument, rather than accepting
    any defined value.
  fails_when: isSubjectPlaceholderToken(["subject", ""]) returns true.
- file: src/shared/services/connector-placeholder-token.spec.ts
  name: rejects a non-subject kind such as a bare '${requester}' token
  proves: Criterion 1's filter keeps only kind === "subject", rejecting a different recognized kind with
    no argument.
  fails_when: isSubjectPlaceholderToken(["requester", undefined]) returns true.
- file: src/shared/services/connector-placeholder-token.spec.ts
  name: rejects a non-subject kind that does carry an argument, such as '${credential:x}'
  proves: Criterion 1's filter rejects a non-subject kind even where it does carry a non-empty argument,
    confirming the check is on the kind and not merely on argument presence.
  fails_when: isSubjectPlaceholderToken(["credential", "x"]) returns true.
untested:
- 'Criterion 2 (simulation-subject-derivation.ts imports these primitives from the new module rather than
  declaring them itself) is a fact about the file''s own source shape -- which statement declares a constant
  versus which imports it -- not a difference in anything the module returns. Confirmed by reading simulation-subject-derivation.ts
  directly (the import at its top, and subjectAttributeNameOf composing splitPlaceholderToken/isSubjectPlaceholderToken
  rather than inlining the split and kind check), but not asserted as a test: a test asserting which import
  statement a file carries binds to the file''s internal shape rather than its observable behavior.'
- Criterion 3 (simulation-subject-derivation.spec.ts and use-simulation-subject.spec.ts pass unchanged)
  is proven by those two pre-existing files themselves, left untouched by this delivery, and confirmed
  passing in the captured suite run rather than by a new assertion duplicating what they already assert.
- 'Criterion 4 (configuration text that is not valid JSON, or not a plain object, still resolves to no
  placeholders through the extracted primitives) is not testable at the new module: connector-placeholder-token.ts
  holds no JSON-parsing or configuration-shape logic at all, so there is nothing in it to exercise for
  this criterion. The defensive JSON.parse/isPlainRecord read stays in simulation-subject-derivation.ts''s
  own subjectPlaceholderNamesInConfiguration, and the existing, untouched simulation-subject-derivation.spec.ts
  already asserts the not-valid-JSON case.'
---

## What it is
Tests proving the placeholder-token grammar primitives (PLACEHOLDER_PATTERN, splitPlaceholderToken, isSubjectPlaceholderToken) exported by the new frontend/app/src/shared/services/connector-placeholder-token.ts module, written directly against that module's own exports, plus the grammar's own edge cases (a bare token with no argument, an empty argument, a non-subject kind, a token carrying more than one ':'). simulation-subject-derivation.ts's own two pre-existing spec files (simulation-subject-derivation.spec.ts, use-simulation-subject.spec.ts) are left untouched and are what proves the extraction did not change that file's own observable behavior -- both ran unchanged in the same captured suite.

## Notes
None.
