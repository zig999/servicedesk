---
entries:
- field: then
  unstated: Whether list-case-versions, when a case currently holds no version at all, reports that fact explicitly or simply returns an empty listing with nothing said about why.
  decided: The read states explicitly that the case currently holds no version, never presenting an unexplained empty listing.
  why: only-a-draft-case-version-may-be-discarded plus a-case-version-number-is-never-reused make zero-versions a real, standing state a case can reach (its sole draft discarded) rather than a transient one — the case's slug and next_version counter persist, so the case a curator names still resolves. An empty array is indistinguishable from a stalled read, a misnamed slug, or a case that legitimately holds nothing yet; only an explicit statement removes that ambiguity, and it costs the read no new field the case-query contract does not already have room to state through a scenario's own concrete case.
---
