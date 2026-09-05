---
type: state-machine
statement: A case version moves only along its declared lifecycle; a lifecycle operation other than release asked of a version not in draft state is refused with an HTTP 409 response reporting a CaseVersionNotDraftError, and release asked of a version not in draft state is refused with an HTTP 409 response reporting a CaseVersionNotDraftAtReleaseError, whose refusal carries the version's own slug, version number and the state it stood in.
subject: domain/knowledge/case-version
status: domain/knowledge/case-version-state
initial: draft
terminal:
  - released
transitions:
  - from: draft
    trigger: release
    to: released
---

## Description

Draft is where a version's manifest may still be composed; release is the one trigger that ever leaves it, and released is terminal because nothing transitions a case version any further once it has answered for an investigation.
