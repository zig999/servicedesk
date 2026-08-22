---
type: policy
statement: A case's summary is computed from its own existing versions — current_state is the state of the case's highest-numbered version, version_count is the number of versions the case currently holds, and last_updated is that same highest-numbered version's authored_at.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-summary
consistency: eventual
---

## Description

every-case-version-remains-readable keeps every version a case has released, and a-case-version-number-is-never-reused already says a discarded draft leaves no version behind to read — so "the versions a case currently holds" is never anything but the rows still there, with nothing set aside for one discarded along the way, and version_count needs no rule of its own beyond this to say so.
A case's next_version counter assigns each version's number once, always higher than every number the case has ever held, and a new version is only ever created after every version that came before it — so among the versions a case currently holds, the highest-numbered one is always the most recently authored, whichever of draft or released its own state happens to be. That version's state is current_state, and its own authored_at is last_updated: the same version answers both, because nothing about being released makes a version any less the newest one a case holds.
