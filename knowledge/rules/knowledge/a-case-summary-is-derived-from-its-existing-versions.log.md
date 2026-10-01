---
entries:
- field: statement
  unstated: Whether a case has any derived "current state," "version count" or "last updated" concept, and if so how each is computed from the case's own case-versions — the case aggregate declares only slug and next_version, and each case-version separately declares its own state and authored_at.
  decided: A case's summary is computed from its own existing versions — current_state is the state of the case's highest-numbered version, version_count is the number of versions the case currently holds, and last_updated is that same highest-numbered version's authored_at.
  why: A discarded draft already leaves no version behind to read (a-case-version-number-is-never-reused), so version_count needs no separate policy on what to include or exclude — it counts exactly the rows the store still holds. Version numbers are assigned once, strictly increasing, and a version is only ever created after every version before it, so the highest-numbered version a case holds is always its most recently authored one regardless of whether it is draft or released — making that single version the natural source of both current_state and last_updated, rather than two independently-computed facts that could disagree.
- field: statement
  unstated: What the rule's own derivation answers for a case currently holding no version, since it is stated only in terms of "the case's highest-numbered version."
  decided: version_count is zero and neither current_state nor last_updated is derived; both are absent.
  why: Same material and reasoning as the case-summary.md entry above — the rule's statement and description now say explicitly what was previously left to be inferred from a node that presumed a version always exists.
- field: statement
  unstated: Same fact as the case-summary.md entry above — which of a case's own versions supplies title, when_to_use and released_version once its highest-numbered version is a draft still ahead of its last release.
  decided: title, when_to_use and released_version are read from the case's highest-numbered version in released state, distinct from current_state's own highest-numbered version of either state; a case with no released version has none of the three.
  why: Same material and reasoning as the case-summary.md entry above.
---
