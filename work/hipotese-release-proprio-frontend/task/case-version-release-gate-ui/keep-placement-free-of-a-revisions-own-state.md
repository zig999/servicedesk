---
title: Keep manifest composition free of the revision's own state
summary: The manifest placement and repin surface, held to not restricting anything for a referenced revision's own state.
rationale: I cut this as its own task because it delivers a non-refusal rather than a behaviour, over the manifest composition surface rather than the release dialog; it depends on the state task because that is what puts the revision's own state within reach of the revision selector, which is where a restriction would otherwise appear.
sources:
  - intake/scope.md
objective: Composing a draft case version's manifest is not restricted by this frontend for the own state of the hypothesis-revision an entry references.
criteria:
  - A manifest row's revision selector offers every revision the listing answers, including those whose own state is draft.
  - Choosing a revision whose own state is draft issues the place request rather than being stopped before it.
  - A manifest entry pinning a revision in draft state offers the same removal and repin controls as one pinning a revision in released state — a difference in the entry's own disclosed state is never read as a difference in what the curator may do with the entry.
  - Removing a manifest entry is offered on the same terms whatever the referenced revision's own state is.
  - The passing case here is only that this frontend does not itself refuse the placement; whether the request is accepted is the server's answer and is not asserted by this task.
depends_on:
  - task/hypothesis-revision-own-state-ui/show-each-revisions-own-state
implements:
  - rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  - scenarios/knowledge/placing-a-manifest-entry-is-never-refused-for-a-drafts-revision-state
---
## What it is

The revision selector and the manifest row controls, unchanged in what they offer once the item type carries a state field.
The one thing this task delivers is that nothing came to read that field as a gate.

## Notes

The revision selector consumes the same listing hook the state task widens, which is why the widening reaches this surface at all.
