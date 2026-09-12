---
target: frontend
title: Unresolved-reason label dictionary corrected to the closed three-value vocabulary
summary: Removes the orphaned "no-matching-input-schema-property" entry from UNRESOLVED_REASON_LABEL in
  the draft disclosure service, so the surface's reason vocabulary matches the domain's closed
  three-reason enumeration exactly.
task: sha256:b5968044e56c53177a330ed9c30dbc67d83edac65787149eb8f6ddb3b5de57ed
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/drafted-answer-disclosure-unresolved-reasons-stated-apart-build
files:
- path: src/services/connector-configuration-draft-disclosure.ts
  effect: Removes the "no-matching-input-schema-property" key/value pair from the UNRESOLVED_REASON_LABEL
    dictionary. The dictionary now holds exactly the three keys domain/integration/connector-configuration-draft-unresolved-reason
    declares -- no-capability-registered, security-scheme-not-reducible-to-a-credential,
    drafted-key-occupied-by-another-security-scheme -- each still paired with its own distinguishable
    sentence, unchanged. No other line of the file is touched -- the unresolvedReasonLabel fallback
    (`?? reason`), the draftDisclosureFrom mapping of each unresolved item's name/reason/reasonLabel, and
    the Status readings, Response fields and Reading notes sections all stand as they were.
criteria:
- criterion: Each unresolved item the answer carries is stated with the name that answer gave it.
  met: true
  how: draftDisclosureFrom's `unresolved` mapping copies each item's name unmodified; this line was not
    touched by this task.
- criterion: Each unresolved item is stated with the reason that answer named for it.
  met: true
  how: the same mapping carries `reason` verbatim alongside the computed `reasonLabel`; neither the raw
    reason nor the pairing logic was touched.
- criterion: Each of no-capability-registered, security-scheme-not-reducible-to-a-credential and
    drafted-key-occupied-by-another-security-scheme is stated distinguishably from the other two, none
    presented as another.
  met: true
  how: the three remaining UNRESOLVED_REASON_LABEL entries hold three distinct, non-overlapping sentences,
    left unreworded per the task's instruction.
- criterion: No reason outside those three is named by the surface for any unresolved item.
  met: true
  how: removing the "no-matching-input-schema-property" key means UNRESOLVED_REASON_LABEL now names
    exactly the three reasons the enumeration holds -- no fourth, translated label for a reason outside
    that vocabulary can be produced by this dictionary again.
- criterion: No unresolved name the answer did not carry is stated.
  met: true
  how: draft.unresolved.map(...) iterates exactly the items the answer's unresolved array carries and
    produces one disclosure entry per item, adding none; this loop was not touched.
nodes:
- node: rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  how: This invariant requires every unresolved item stated by name and by reason, each reason apart
    from every other the draft's own reason vocabulary holds. The fourth dictionary key stated a reason
    outside that vocabulary; removing it closes that gap without touching how name/reason pairing or the
    three legitimate labels work.
- node: domain/integration/connector-configuration-draft
  how: Honored as already implemented -- the draft's unresolved collection is read and disclosed
    item-for-item by draftDisclosureFrom; this task changed only the label dictionary the disclosure
    consults, not how the draft's shape is read.
- node: domain/integration/connector-configuration-draft-unresolved-item
  how: Each item's one name and one reason are carried through unmodified by the pre-existing mapping;
    unaffected by this task's edit.
- node: domain/integration/connector-configuration-draft-unresolved-reason
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  how: This enumeration declares exactly three values. UNRESOLVED_REASON_LABEL now holds exactly those
    three keys and no other, matching the enumeration's closed vocabulary.
inferences:
- inferred: ConnectorConfigurationDraftUnresolvedItem.reason stays typed as the loose `string` it already
    was, rather than narrowed to the closed three-literal union.
  from: Two already-delivered spec files (use-draft-connector-configuration-from-openapi.spec.ts and
    connector-configuration-draft-disclosure.spec.ts) deliberately construct an unresolved item with a
    reason value outside the three-value vocabulary to exercise the surface's documented fallback for an
    unrecognized reason. Narrowing the type to a closed literal union would turn those already-passing
    assignments into a compile error, breaking already-delivered, in-scope-elsewhere behavior this task
    does not reach. The type stays permissive; the closed vocabulary is enforced solely by the label
    dictionary this task fixed.
preserved:
- The Status readings, Response fields and Reading notes sections of connector-configuration-draft-disclosure.ts,
  untouched.
- The unresolvedReasonLabel fallback behavior (raw reason string surfaces when no dictionary entry
  matches), unchanged.
- ConnectorConfigurationDraft and ConnectorConfigurationDraftUnresolvedItem in
  use-draft-connector-configuration-from-openapi.ts, unchanged (see inferences).
deferred:
- what: A pre-existing test in connector-configuration-draft-disclosure.spec.ts (titled around "each of
    the four named unresolved reasons gets its own distinct label") still names
    "no-matching-input-schema-property" as one of "the four named unresolved reasons," a premise this
    task's fix no longer matches, though the test stays green (the removed key now falls back to its own
    raw string as a label, still pairwise-distinct from the three real labels).
  why: Tests are not this task's to write or rewrite; flagged for the proof step to correct.
---

## What it is
The correction of the surface's reason dictionary to the closed set of three the specification holds.

## Notes
Build round 1 green on the first attempt.
