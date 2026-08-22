---
type: value-object
attributes:
  - name: current_state
    type: case-version-state
    required: true
  - name: version_count
    type: integer
    required: true
  - name: last_updated
    type: datetime
    required: true
---

## Description

A case's own identity declares only its slug and the counter that assigns its next draft's number; everything a curator reads about which state a case is in, how many versions it has accumulated, and when it was last touched is read off its versions, never carried by the identity itself. This is that read: one summary, held by no aggregate and stored nowhere, computed fresh from a case's own case-versions.

## Responsibility

Hold the three facts a listing of cases needs about one case — current_state, version_count and last_updated — each derived from that case's own existing case-versions rather than declared by the case's own identity.
