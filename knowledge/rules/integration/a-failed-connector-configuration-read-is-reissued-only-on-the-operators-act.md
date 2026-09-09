---
type: invariant
statement: >-
  The read a-presented-connector-configuration-states-an-outstanding-or-failed-read offers again
  on a failed window is the operator's own act: the screen re-issues a failed read on no
  initiative of its own.
constrains:
  - domain/integration/connector-configuration
---

## Description

The read is issued again only on the operator's act, so that a far end already failing is never called repeatedly by a screen nobody is watching, and so that what the operator sees after a failure stays what they last asked for.
