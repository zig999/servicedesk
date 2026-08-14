---
type: api
direction: consumed
upstream: contracts/system/corporate-records
operations:
  - read-observation
---

## Description

The consumption of the external systems' supply, confined to this context so no source-system vocabulary crosses further in.
One generic read per registered capability, never a fixed operation against one named system: which system a call reaches is resolved by the capability's own connector, and the set of systems reachable this way changes over time.
