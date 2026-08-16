---
type: state-machine
statement: A case version moves only along its declared lifecycle.
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
