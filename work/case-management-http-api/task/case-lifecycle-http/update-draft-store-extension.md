---
title: ICaseStore gains updateDraft, guarded by draft state
summary: A new store operation that corrects a case version's own declared attributes only while it stands in draft.
objective: ICaseStore gains an updateDraft operation that writes a case version's own declared attributes only while it stands in draft state, the same guard pattern discard.operation.ts already applies.
criteria:
  - updateDraft against a case version in draft state persists the corrected title, when_to_use, subject, fallback and consolidation_register attributes.
  - updateDraft against a case version in released state is refused with a typed error naming the a-case-version-is-written-once rule, before any write reaches the store.
  - updateDraft against a slug or version that does not exist is refused with CaseNotFoundError.
implements:
  - contracts/knowledge/case-lifecycle
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - rules/knowledge/a-case-version-is-written-once
sources:
  - intake/scope.md
---

## What it is

A new ICaseStore method, updateDraft, following the same read-whole-then-guard-then-write pattern as discard.operation.ts.
It is the one piece of new domain logic the update-draft route depends on.

## Notes

REMAINDER, from the specification — rules/knowledge/a-case-version-is-written-once's own manifest clause ("every manifest entry it composes is never altered again") reaches no criterion here, since this task scopes updateDraft to a case version's own declared attributes only, never its manifest; it belongs to the tasks implementing place-hypothesis and remove-hypothesis.
REMAINDER, from the specification — the same rule's "revising a case's content composes the next draft version instead" clause governs how a released case is revised by starting a new draft, which belongs to the task implementing create-draft, not this one.
Criterion 3's CaseNotFoundError refusal is not a specification silence: the standard's own EDG-02 rule ("A resource that does not exist is refused through a typed error raised in the service") already governs this, and CaseNotFoundError is the exact typed error discard.operation.ts and release.operation.ts already raise for this same absence — this task reuses it rather than inventing a second one.
