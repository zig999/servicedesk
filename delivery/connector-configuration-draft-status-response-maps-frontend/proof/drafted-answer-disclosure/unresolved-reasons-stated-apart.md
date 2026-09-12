---
target: frontend
title: Unresolved-item reason vocabulary closed to exactly three, distinguishably -- proof
summary: Proves that each unresolved item's name and reason are carried through unmodified, the three
  closed-vocabulary reasons render pairwise-distinct labels, a reason outside that vocabulary -- including
  the one this task's fix removed from the dictionary -- is never given an invented label, and no
  unresolved item the answer did not carry is stated.
implementation: sha256:ae47c751dce40302d79bf5b3234d2e9957122592ac67a4f8c8ba0ed2b9ac51d8
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/drafted-answer-disclosure-unresolved-reasons-stated-apart-suite
tests:
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: copies the item's name unmodified and pairs it with a non-empty reason label
  proves: Criteria 1 and 2 -- each unresolved item stated with the name and the reason the answer gave
    it.
  fails_when: the mapping stops copying an item's own name unmodified, stops carrying its own reason
    through, or produces an empty reasonLabel.
  demonstrates: domain/integration/connector-configuration-draft-unresolved-item
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: carries through an empty array rather than inventing an item
  proves: Criterion 5, the empty case -- no unresolved name the answer did not carry is stated.
  fails_when: the projection synthesizes an unresolved item despite an empty unresolved list.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: produces three pairwise-distinct labels for the three closed-set reason values
  proves: Criterion 3, whole -- each of no-capability-registered, security-scheme-not-reducible-to-a-credential
    and drafted-key-occupied-by-another-security-scheme is stated distinguishably from the other two.
  fails_when: two or more of the three reasons collapse onto the same label, so one is presented as
    another.
  demonstrates: domain/integration/connector-configuration-draft-unresolved-reason
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: falls back to its own raw reason string for a reason outside the three-value vocabulary,
    including the reason this dictionary no longer names
  proves: Criterion 4 -- no reason outside the closed three-value vocabulary is named by the surface;
    specifically, "no-matching-input-schema-property" (the key this task's fix removed) is no longer
    given an invented label.
  fails_when: the dictionary still maps "no-matching-input-schema-property", or any other reason outside
    the three-value vocabulary, to a label other than its own raw string.
not_applicable:
- edge_case: Two unresolved items sharing the same reason.
  why: No criterion or node states uniqueness of reason within one draft's unresolved list; each item
    is treated positionally, and the three-reason test already covers one item per real reason.
- edge_case: Two unresolved items sharing the same name.
  why: Name uniqueness is not stated by any criterion or node this task implements; it belongs to the
    sibling task that established name carry-through (draft-answer-parts-reach-the-surface).
- edge_case: A reason value differing from one of the three literals only by case or whitespace.
  why: No criterion treats a near-miss specially; the dictionary is an exact-key lookup and any
    non-exact match is already the same "outside the vocabulary" class the fallback test covers.
- edge_case: Concurrent or overlapping draft requests changing the unresolved list mid-render.
  why: No criterion or node of this task addresses concurrency; the outcome state machine's own
    stale-disclosure clearing is already covered by pre-existing tests this task does not touch.
untested:
- domain/integration/connector-configuration-draft's fact spans connector, configuration,
  generated_credentials, method_mismatch, status_readings, response_fields and reading_notes as well
  as unresolved; this task only consumes the already-existing unresolved attribute, and only its reason
  vocabulary changed.
- rules/integration/an-answered-draft-request-states-its-draft-to-the-operator is a single invariant
  spanning configuration text, unresolved items, generated credentials, status readings, response
  fields, reading notes and method mismatch together; this task's tests reach only its
  unresolved-name-and-reason clause, so no test here decides that compound invariant whole, and none is
  claimed to.
- The implementation's inference that ConnectorConfigurationDraftUnresolvedItem.reason stays typed as
  a loose string rather than narrowed to the closed three-literal union (kept permissive so two other
  already-delivered spec files that construct out-of-vocabulary reason values to exercise the fallback
  keep compiling) -- an inference about the type's arrangement, not a fact any criterion or node states;
  not pinned by a test.
- use-draft-connector-configuration-from-openapi.spec.ts's own describe title still reads "the closed
  set of four reason literals" -- a wording leftover from before this task's fix, in a file outside this
  task's target (the hooks layer, not the disclosure service) and not named by any of this task's
  criteria; left uncorrected here since fixing it is not this task's obligation, and its own assertion
  (that the type stays a plain, unnarrowed string) does not depend on the reason count and was confirmed
  unaffected by this task's edit.
---

## What it is
The proof of the corrected reason vocabulary -- name and reason carried through, the three reasons kept apart, and the fourth reason's removal made to hold.

## Notes
None.
