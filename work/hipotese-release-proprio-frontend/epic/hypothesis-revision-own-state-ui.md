---
title: The hypothesis-revision's own state, shown and moved
summary: Everything the frontend needs so a curator can see whether a hypothesis-revision is draft or released and release one directly, answering to no case version and no manifest.
rationale: I grouped these three tasks together because they all turn on one fact the backend newly gives the revision to carry — its own state — read on one screen and written by one action; the case-version release gate reads that same fact from the other side and changes for a different reason, so it is its own epic.
sources:
  - intake/scope.md
covers:
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/hypothesis-revision-state
  - rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  - rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  - scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  - contracts/knowledge/case-lifecycle
  - rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  - constraints/listings-are-paged
  - constraints/no-route-enforces-authentication
  - scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so
---
## What it is

The revisions listing screen states each listed revision's own state, draft or released.
A curator releases a draft revision directly from that screen, without touching a case version.
The refusal a release of an already-released revision meets is named in the frontend's own error vocabulary rather than falling to the generic one.

## Notes

The listing screen already renders a per-row status badge derived from the case's current pin (current/frozen); the revision's own state is a second, independent fact and neither replaces the other.
None.
