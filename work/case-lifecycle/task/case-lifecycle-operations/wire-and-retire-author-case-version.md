---
title: Wire the case-lifecycle operations and retire author-case-version
summary: Wires create-draft, revise-hypothesis, place-hypothesis, remove-hypothesis, release and discard into one composition root, and retires AuthorCaseVersionService, IAuthorCaseVersion and author-case-version.factory.ts.
rationale: The inventory names AuthorCaseVersionService/IAuthorCaseVersion/author-case-version.factory.ts as broken once the six granular operations replace the one command they wired; the scope itself never states this retirement as its own task, so I cut it separately from any one operation, since composing five already-delivered operations into a reachable root is a different reason to change than any operation's own business rule.
sources:
- work/case-lifecycle/intake/scope.md
objective: The six case-lifecycle operations are each reachable from one composition root, and no factory or caller still constructs or references the retired author-case-version command.
criteria:
- create-draft, revise-hypothesis, place-hypothesis, remove-hypothesis, release and discard are each reachable as one callable operation from a single composition root, the way author-case-version.factory.ts once exposed the one retired command.
- No file still constructs AuthorCaseVersionService, references IAuthorCaseVersion, or imports author-case-version.factory.ts.
depends_on:
- task/case-lifecycle-operations/create-draft-operation
- task/case-lifecycle-operations/revise-hypothesis-operation
- task/case-lifecycle-operations/manifest-composition-operations
- task/case-lifecycle-operations/release-operation
- task/case-lifecycle-operations/discard-operation
implements:
- contracts/knowledge/case-lifecycle
---

## What it is

The composition root that makes the five operation tasks a reachable surface rather than five unconnected classes.
No HTTP route is required of it — the scope explicitly excludes one.

## Notes

None.
