---
title: Fix the new-draft cache seed so Manifest never crashes on it
summary: The shared case-version cache entry a new draft seeds is missing manifest/state,
  and crashes the Manifest screen when opened first.
objective: A newly created draft's shared case-version cache entry never appears loaded
  to any consumer — including the Manifest screen and the new-draft editor screen itself —
  until it carries a complete record read back from the knowledge context, manifest and
  state included; until that answer arrives, every consumer states that the draft is
  still being read rather than presenting the curator's just-submitted values as the
  version's content.
criteria:
- Creating a new draft version for a case whose latest released version manifests
  at least one hypothesis, then immediately opening that draft's Manifest screen without
  any prior edit or save on the draft's own editor screen, renders the manifest rows
  drawn from the backend's own manifest array instead of throwing "manifest is not
  iterable".
- Any consumer of the case-version cache entry a draft creation seeds (including one
  requiring state) never observes a resolved value missing manifest or state.
- Immediately after creating a new draft, before that draft's own record has been read
  back from the backend, the new-draft editor screen states that the draft is still
  being read rather than presenting the curator's just-submitted title, when_to_use,
  subject, fallback or consolidation_register as the created version's content.
sources:
- intake/scope.md
implements:
- constraints/a-case-is-read-whole
- contracts/knowledge/case-query
- domain/knowledge/case-version
- domain/knowledge/manifest-entry
- rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
- rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
---

## What it is
The corrective fix for the cache-seeding defect traced in this initiative's scope: a new
draft's seed for cache key ["case-version", slug, version] omits manifest and state, and a
second reader of that same key (the Manifest screen) trusts it as loaded. Criterion 3 was
revised from its original "show the submitted values immediately" framing once
rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record — decided
during this same planning invocation — settled that a surface may never present a
draft's submitted values as its content ahead of a read-back; the original criterion
would have held the fix to a shape the specification now forbids.

## Notes
UNDERDETERMINED, from the specification — rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record scopes its refusal to any surface presenting the created draft's content, the Manifest screen included, but criterion 1 names only the outcome once the manifest array is available and criterion 3 binds the pending statement to the new-draft editor screen alone, so no criterion reaches the Manifest screen's own pending interval. Passes as written: a Manifest screen that renders an empty manifest table (headers, zero rows, no pending statement) while the draft's record has not yet been read back, only filling in rows once the answer arrives, satisfies every criterion while the node refuses presenting an empty content as the version's during that interval.
UNDERDETERMINED, from the specification — criterion 3 forbids presenting the curator's just-submitted values and requires the pending statement, but rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record demands more: it states that no attribute of the version is stated at all while unread, and that neither a partial nor an empty content is presented as the version's. Passes as written: a new-draft editor that shows the "still being read" statement together with its ordinary attribute form rendered with every field blank satisfies criterion 3 because none of the submitted values is shown, while the node refuses it because the surface presents an empty content as the version's.
REMAINDER, from the specification — rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version states both the entry-for-entry copy performed at draft creation and the explicitly-named-source (rollback) branch; criterion 1 only consumes the default branch's outcome as a fixture premise, and no criterion exercises the copy itself or the rollback branch. Belongs: the knowledge context's backend create-draft work, including the task that implements manifest copying and its rollback path.
REMAINDER, from the specification — constraints/a-case-is-read-whole's second clause, that a hypothesis, its revisions and a draft's own manifest entries may otherwise be created, read, revised or removed independently, reaches no criterion of this task, which consumes only the first clause (assembled and validated whole, or not at all). Belongs: the backend authoring tasks over contracts/knowledge/case-lifecycle's independent operations (revise-hypothesis, place-hypothesis, remove-hypothesis).
