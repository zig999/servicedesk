---
type: value-object
attributes:
  - name: current_state
    type: case-version-state
  - name: version_count
    type: integer
    required: true
  - name: last_updated
    type: datetime
  - name: title
    type: string
  - name: when_to_use
    type: string
  - name: released_version
    type: integer
---

## Description

A case's own identity declares only its slug and the counter that assigns its next draft's number; everything a curator reads about which state a case is in, how many versions it has accumulated, and when it was last touched is read off its versions, never carried by the identity itself. This is that read: one summary, held by no aggregate and stored nowhere, computed fresh from a case's own case-versions.
current_state and last_updated are present only where the case currently holds at least one version; a case whose every version was ever discarded before release holds none to derive either from, and both are absent rather than invented.
title, when_to_use and released_version are present only where the case currently holds at least one released version; a case still only in draft, never yet released, holds none to derive any of the three from, and all three are absent rather than read from a draft.

## Responsibility

Hold the facts a listing of cases needs about one case — current_state, version_count and last_updated derived from the case's own most recently authored version, and title, when_to_use and released_version derived from its own most recently released one — each read off the case's existing case-versions rather than declared by the case's own identity.
